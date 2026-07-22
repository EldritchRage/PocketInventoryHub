import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    doc,
    serverTimestamp,
    query,
    orderBy,
} from 'firebase/firestore';
import { db, storage, auth as firebaseAuth } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { CATEGORY_MAP } from '@/lib/categories';
import { appParams } from '@/lib/app-params';
import { buildCompatibleProductWrite, normalizeProductForRead } from '@/lib/product-contract';
import { buildStripeSyncRequest, normalizeStripeSyncResponse } from '@/lib/stripe-contract';

const SORT_KEY = 'pih_sort_mode';

export const SORT_MODES = [
    { key: 'alpha-asc', label: 'A → Z' },
    { key: 'price-asc', label: 'Price: Low → High' },
    { key: 'price-desc', label: 'Price: High → Low' },
    { key: 'date-desc', label: 'Newest First' },
    { key: 'date-asc', label: 'Oldest First' },
];

function sortProducts(products, mode) {
    const sorted = [...products];
    switch (mode) {
        case 'alpha-asc':
            return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        case 'price-asc':
            return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        case 'price-desc':
            return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        case 'date-asc':
            return sorted.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        case 'date-desc':
        default:
            return sorted.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
}

export default function useProducts() {
    const [rawProducts, setRawProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortMode, setSortModeState] = useState(
        () => localStorage.getItem(SORT_KEY) || 'date-desc'
    );

    // Real-time Firestore listener
    useEffect(() => {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            const docs = snap.docs.map(d => normalizeProductForRead({ firestoreId: d.id, ...d.data() }));
            setRawProducts(docs);
            setLoading(false);
        });
        return unsub;
    }, []);

    const setSortMode = useCallback((mode) => {
        setSortModeState(mode);
        localStorage.setItem(SORT_KEY, mode);
    }, []);

    const syncProductWithStripe = useCallback(async (product) => {
        const baseUrl = appParams.appBaseUrl || import.meta.env.VITE_BASE44_APP_BASE_URL;
        const apiKey = import.meta.env.VITE_STRIPE_WORKER_API_KEY;

        if (!baseUrl) {
            throw new Error('Backend URL is not configured in .env.local');
        }

        const response = await fetch(baseUrl, { // Removed /api/stripe-sync as your worker handles all POSTs
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(buildStripeSyncRequest(product, apiKey)),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Stripe sync failed' }));
            throw new Error(err.error || 'Failed to sync with Stripe');
        }

        return normalizeStripeSyncResponse(await response.json());
    }, []);

    const uploadImageIfNeeded = async (imageFile) => {
        if (!imageFile) return '';
        const path = `products/${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const r = storageRef(storage, path);
        await uploadBytes(r, imageFile);
        const url = await getDownloadURL(r);
        return url;
    };

    const uploadImagesIfNeeded = async (imageFiles) => {
        if (!imageFiles || imageFiles.length === 0) return [];

        const uploadPromises = Array.from(imageFiles).map(async (file) => {
            const path = `products/${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name.replace(/\s+/g, '_')}`;
            const r = storageRef(storage, path);
            await uploadBytes(r, file);
            return await getDownloadURL(r);
        });

        return Promise.all(uploadPromises);
    };

    const addProduct = useCallback(async (data) => {
        if (!firebaseAuth.currentUser) {
            throw new Error('You must be signed in to add a product');
        }

        const { imageFile, imageFiles, ...rest } = data || {};
        let imageUrls = rest.imageUrls || [];

        const categoryId = rest.categoryId;
        if (categoryId && !CATEGORY_MAP[categoryId]) {
            throw new Error('Invalid category selected');
        }

        // Handle multiple new images
        if (imageFiles && imageFiles.length > 0) {
            const newUrls = await uploadImagesIfNeeded(imageFiles);
            imageUrls = [...imageUrls, ...newUrls];
        } else if (imageFile) {
            // Fallback for single image upload
            const url = await uploadImageIfNeeded(imageFile);
            if (url) imageUrls = [url, ...imageUrls];
        }

        const toSave = { ...rest };
        delete toSave.weight;
        delete toSave.categoryId;

        const ref = await addDoc(collection(db, 'products'), buildCompatibleProductWrite({
            ...toSave,
            category: categoryId || null,
            categoryId: categoryId || null,
            creatorId: null,
            imageUrl: imageUrls[0] || '', // Primary image
            imageUrls: imageUrls,
            published: false,
            status: 'draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { createdByUid: firebaseAuth.currentUser.uid }));
        return ref.id;
    }, []);

    const updateProduct = useCallback(async (firestoreId, data) => {
        if (!firebaseAuth.currentUser) {
            throw new Error('You must be signed in to update a product');
        }

        const { imageFile, imageFiles, ...rest } = data || {};
        const categoryId = rest.categoryId;
        if (categoryId && !CATEGORY_MAP[categoryId]) {
            throw new Error('Invalid category selected');
        }

        // Get existing images
        const currentProduct = rawProducts.find(p => p.firestoreId === firestoreId);
        const oldImageUrl = currentProduct?.imageUrl || '';
        let existingImageUrls = currentProduct?.imageUrls || (currentProduct?.imageUrl ? [currentProduct.imageUrl] : []);

        let imageUrls = rest.imageUrls || existingImageUrls;

        // Handle multiple new images
        if (imageFiles && imageFiles.length > 0) {
            const newUrls = await uploadImagesIfNeeded(imageFiles);
            imageUrls = [...imageUrls, ...newUrls];
        } else if (imageFile) {
            const url = await uploadImageIfNeeded(imageFile);
            if (url) imageUrls = [url, ...imageUrls];
        }

        const toSave = { ...rest };
        delete toSave.weight;
        delete toSave.categoryId;

        // If product is published, sync with Stripe immediately on update
        if (currentProduct?.published) {
            try {
                const syncRes = await syncProductWithStripe({
                    ...currentProduct,
                    ...toSave,
                    category: categoryId || currentProduct.category,
                    imageUrl: imageUrls[0] || '',
                });
                toSave.stripeProductId = syncRes.stripeProductId;
                toSave.stripePriceId = syncRes.stripePriceId;
                if (syncRes.variants) {
                    toSave.variants = syncRes.variants;
                }
            } catch (err) {
                console.error('Update failed during Stripe sync', err);
                throw new Error(`Failed to update Stripe info: ${err.message}`);
            }
        }

        await updateDoc(doc(db, 'products', firestoreId), buildCompatibleProductWrite({
            published: currentProduct?.published === true,
            status: currentProduct?.status || (currentProduct?.published ? 'published' : 'draft'),
            stripeProductId: toSave.stripeProductId || currentProduct?.stripeProductId || null,
            stripePriceId: toSave.stripePriceId || currentProduct?.stripePriceId || null,
            stripe: {
                productId: toSave.stripeProductId || currentProduct?.stripeProductId || null,
                priceId: toSave.stripePriceId || currentProduct?.stripePriceId || null,
            },
            ...toSave,
            category: categoryId || null,
            categoryId: categoryId || null,
            imageUrl: imageUrls[0] || '',
            imageUrls: imageUrls,
            updatedAt: serverTimestamp(),
        }, { createdByUid: currentProduct?.createdByUid || firebaseAuth.currentUser.uid }));

        // delete old image if it was from Firebase Storage and a new image replaced it
        if ((imageFile || imageFiles?.length) && oldImageUrl && oldImageUrl !== imageUrls[0] && oldImageUrl.startsWith('https://firebasestorage.googleapis.com')) {
            try {
                const parts = oldImageUrl.split('/o/');
                if (parts[1]) {
                    const after = parts[1];
                    const pathEncoded = after.split('?')[0];
                    const path = decodeURIComponent(pathEncoded);
                    const r = storageRef(storage, path);
                    await deleteObject(r);
                }
            } catch (err) {
                console.warn('Failed to delete old storage object', err);
            }
        }
    }, [rawProducts, syncProductWithStripe]);

    const publishProduct = useCallback(async (firestoreId) => {
        if (!firebaseAuth.currentUser) throw new Error('You must be signed in to publish a product');
        const product = rawProducts.find(p => p.firestoreId === firestoreId);
        if (!product) throw new Error('Product not found');
        const syncRes = await syncProductWithStripe(product);
        await updateDoc(doc(db, 'products', firestoreId), {
            schemaVersion: 2,
            stripeProductId: syncRes.stripeProductId,
            stripePriceId: syncRes.stripePriceId,
            stripe: { productId: syncRes.stripeProductId, priceId: syncRes.stripePriceId },
            published: true,
            status: 'published',
            publishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...(syncRes.variants ? { variants: syncRes.variants } : {}),
        });
    }, [rawProducts, syncProductWithStripe]);

    const unpublishProduct = useCallback(async (firestoreId) => {
        if (!firebaseAuth.currentUser) throw new Error('You must be signed in to unpublish a product');
        const product = rawProducts.find(p => p.firestoreId === firestoreId);
        if (!product) throw new Error('Product not found');

        if (product.stripeProductId) {
            const baseUrl = appParams.appBaseUrl || import.meta.env.VITE_BASE44_APP_BASE_URL;
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: import.meta.env.VITE_STRIPE_WORKER_API_KEY,
                    action: 'unpublish',
                    stripeProductId: product.stripeProductId,
                }),
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Stripe unpublish failed' }));
                throw new Error(error.error || 'Could not unpublish Stripe product');
            }
        }

        await updateDoc(doc(db, 'products', firestoreId), {
            published: false,
            status: 'draft',
            unpublishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }, [rawProducts]);

    const deleteProduct = useCallback(async (firestoreId) => {
        if (!firebaseAuth.currentUser) {
            throw new Error('You must be signed in to delete a product');
        }

        try {
            // fetch doc to get imageUrl
            const snap = await getDoc(doc(db, 'products', firestoreId));
            if (snap.exists()) {
                const data = snap.data();
                const imageUrl = data.imageUrl;
                if (imageUrl && imageUrl.startsWith('https://firebasestorage.googleapis.com')) {
                    try {
                        // extract encoded path between /o/ and ?
                        const parts = imageUrl.split('/o/');
                        if (parts[1]) {
                            const after = parts[1];
                            const pathEncoded = after.split('?')[0];
                            const path = decodeURIComponent(pathEncoded);
                            const r = storageRef(storage, path);
                            await deleteObject(r);
                        }
                    } catch (err) {
                        // ignore storage deletion errors
                        console.warn('Failed to delete storage object', err);
                    }
                }
            }
        } catch (err) {
            console.warn('Error fetching product for delete cleanup', err);
        }

        await deleteDoc(doc(db, 'products', firestoreId));
    }, []);

    // Called after Stripe Worker responds; saves stripeProductId + stripePriceId on each doc
    const updateStripeIds = useCallback(async (mappings) => {
        await Promise.all(
            mappings.map(({ firestoreId, stripeProductId, stripePriceId }) =>
                updateDoc(doc(db, 'products', firestoreId), {
                    stripeProductId,
                    stripePriceId,
                    updatedAt: serverTimestamp(),
                })
            )
        );
    }, []);

    const publishInventory = useCallback(async () => {
        if (!rawProducts.length) return;

        // Sync all products with Stripe before marking as published
        const syncResults = await Promise.all(
            rawProducts.map(async (product) => {
                try {
                    // Only sync if not already published or if we want to ensure latest info
                    const syncData = await syncProductWithStripe(product);
                    return { ...syncData, firestoreId: product.firestoreId, success: true };
                } catch (err) {
                    return { firestoreId: product.firestoreId, success: false, error: err.message };
                }
            })
        );

        const failed = syncResults.filter(r => !r.success);
        if (failed.length > 0) {
            throw new Error(`Could not publish to Stripe: ${failed[0].error}`);
        }

        await Promise.all(
            syncResults.map((res) => {
                const updateData = {
                    schemaVersion: 2,
                    stripeProductId: res.stripeProductId,
                    stripePriceId: res.stripePriceId,
                    stripe: { productId: res.stripeProductId, priceId: res.stripePriceId },
                    published: true,
                    status: 'published',
                    publishedAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };
                if (res.variants) {
                    updateData.variants = res.variants;
                }
                return updateDoc(doc(db, 'products', res.firestoreId), updateData);
            })
        );
    }, [rawProducts, syncProductWithStripe]);

    const toggleSpotlight = useCallback(async (firestoreId, isSpotlight) => {
        if (!firebaseAuth.currentUser) {
            throw new Error('You must be signed in to update a product');
        }
        await updateDoc(doc(db, 'products', firestoreId), {
            seasonalSpotlight: isSpotlight,
            updatedAt: serverTimestamp(),
        });
    }, []);

    return {
        products: sortProducts(rawProducts, sortMode),
        rawProducts,
        loading,
        sortMode,
        setSortMode,
        sortModes: SORT_MODES,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStripeIds,
        publishInventory,
        publishProduct,
        unpublishProduct,
        toggleSpotlight,
    };
}
