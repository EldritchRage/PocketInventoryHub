import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import useProducts from '@/hooks/useProducts';
import ProductForm from '@/components/inventory/ProductForm';

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, updateProduct, deleteProduct } = useProducts();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [saving, setSaving] = useState(false);

    const product = products.find(p => p.firestoreId === id);

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold mb-2">Product not found</p>
                    <Button variant="outline" onClick={() => navigate('/')}>Go back</Button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (data) => {
        setSaving(true);
        try {
            await updateProduct(id, data);
            toast.success('Product updated');
            navigate('/');
        } catch (err) {
            toast.error(err?.message || 'Could not update product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProduct(id);
            toast.success('Product deleted');
            navigate('/');
        } catch (err) {
            toast.error(err?.message || 'Could not delete product');
        }
    };

    const copyStripeId = () => {
        navigator.clipboard.writeText(product.stripePriceId);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold flex-1">Edit Product</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 safe-bottom">
                {product.stripePriceId && !product.variants && (
                    <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Stripe Price ID</p>
                            <p className="text-sm font-mono font-medium mt-0.5 text-accent">{product.stripePriceId}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={copyStripeId}>
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                )}

                {product.variants && (
                    <div className="bg-accent/10 border border-accent/20 rounded-xl px-4 py-3 mb-6 space-y-2">
                        <p className="text-xs text-muted-foreground">T-Shirt Variant Stripe Price IDs</p>
                        {Object.entries(product.variants).map(([key, variant]) => (
                            <div key={key} className="flex items-center justify-between gap-3">
                                <p className="text-sm font-medium">{variant.label}</p>
                                <p className="text-xs font-mono text-accent truncate">{variant.stripePriceId || 'Not set'}</p>
                            </div>
                        ))}
                    </div>
                )}

                <ProductForm
                    initialData={product}
                    onSubmit={handleSubmit}
                    submitLabel="Save Changes"
                    loading={saving}
                />

                <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl text-sm font-semibold mt-4 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setConfirmDelete(true)}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Product
                </Button>
            </main>

            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent className="rounded-2xl max-w-sm mx-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This cannot be undone. The product will be permanently removed from Firestore.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}