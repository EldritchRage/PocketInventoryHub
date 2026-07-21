import { useState, useEffect, useCallback } from 'react';
import {
    doc,
    onSnapshot,
    updateDoc,
    collection,
    query,
    orderBy,
    writeBatch,
    setDoc,
    deleteDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { auth as firebaseAuth } from '@/lib/firebase';
import { normalizeHomepageForRead } from '@/lib/homepage-contract';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

export default function useHomepageConfig() {
    const [config, setConfig] = useState(null);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Listen to homepage/config
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'homepage', 'config'),
            (snap) => {
                if (snap.exists()) {
                    setConfig(normalizeHomepageForRead(snap.data()));
                } else {
                    // Initialize if doesn't exist
                    const initialConfig = {
                        hero: {
                            headline: 'Discover Your Vibe',
                            subheading: 'Shop unique collections and express yourself',
                            buttonText: 'Shop Now',
                            buttonLink: '/shop.html',
                            image: '',
                        },
                        about: {
                            text: '',
                            image: '',
                        }
                    };
                    // Use setDoc cautiously; if rules fail this might error
                    setDoc(doc(db, 'homepage', 'config'), initialConfig).catch(e => {
                        console.error('Failed to initialize homepage config', e);
                    });
                    setConfig(normalizeHomepageForRead(initialConfig));
                }
                setLoading(false);
            },
            (err) => {
                console.error('Homepage config listener error', err);
                // Important: Even on error, stop the loading state
                setLoading(false);
                toast.error('Permission denied: You might not have Admin access.');
            }
        );
        return unsub;
    }, []);

    // Listen to featured products
    useEffect(() => {
        const q = query(
            collection(db, 'homepage', 'config', 'featured_products'),
            orderBy('displayOrder', 'asc')
        );
        const unsub = onSnapshot(q,
            (snap) => {
                const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setFeaturedProducts(docs);
            },
            (err) => {
                console.error('Featured products listener error', err);
                // We don't set loading false here as the config listener handles it,
                // but we log it for debugging.
            }
        );
        return unsub;
    }, []);

    const uploadImage = async (file, folder = 'homepage') => {
        if (!file) return null;
        const path = `images/${folder}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const r = storageRef(storage, path);
        await uploadBytes(r, file);
        return await getDownloadURL(r);
    };

    const updateHero = useCallback(async (heroData, imageFile) => {
        let imageUrl = heroData.image;
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'hero');
        }
        await updateDoc(doc(db, 'homepage', 'config'), {
            schemaVersion: 2,
            'hero.headline': heroData.headline,
            'hero.subheading': heroData.subheading,
            'hero.buttonText': heroData.buttonText,
            'hero.buttonLink': heroData.buttonLink,
            'hero.image': imageUrl,
            updatedByUid: firebaseAuth.currentUser?.uid || null,
            updatedAt: serverTimestamp(),
        });
    }, []);

    const updateAbout = useCallback(async (aboutData, imageFile) => {
        let imageUrl = aboutData.image;
        if (imageFile) {
            imageUrl = await uploadImage(imageFile, 'about');
        }
        await updateDoc(doc(db, 'homepage', 'config'), {
            schemaVersion: 2,
            'about.text': aboutData.text,
            'about.image': imageUrl,
            updatedByUid: firebaseAuth.currentUser?.uid || null,
            updatedAt: serverTimestamp(),
        });
    }, []);

    const addFeaturedProduct = useCallback(async (productId) => {
        const nextOrder = featuredProducts.length > 0
            ? Math.max(...featuredProducts.map(p => p.displayOrder || 0)) + 1
            : 0;

        await setDoc(doc(db, 'homepage', 'config', 'featured_products', productId), {
            productId,
            displayOrder: nextOrder,
            createdAt: serverTimestamp(),
        });
    }, [featuredProducts]);

    const removeFeaturedProduct = useCallback(async (docId) => {
        await deleteDoc(doc(db, 'homepage', 'config', 'featured_products', docId));
    }, []);

    const reorderFeaturedProducts = useCallback(async (newOrder) => {
        const batch = writeBatch(db);
        newOrder.forEach((item, index) => {
            const ref = doc(db, 'homepage', 'config', 'featured_products', item.id);
            batch.update(ref, { displayOrder: index });
        });
        await batch.commit();
    }, []);

    return {
        config,
        featuredProducts,
        loading,
        updateHero,
        updateAbout,
        addFeaturedProduct,
        removeFeaturedProduct,
        reorderFeaturedProducts,
    };
}
