import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import useProducts from '@/hooks/useProducts';
import ProductForm from '@/components/inventory/ProductForm';

export default function AddProduct() {
    const navigate = useNavigate();
    const { addProduct } = useProducts();
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (data) => {
        setSaving(true);
        try {
            await addProduct(data);
            toast.success('Product added');
            navigate('/');
        } catch (err) {
            toast.error(err?.message || 'Could not add product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="flex items-center gap-3 px-4 h-14 max-w-lg mx-auto">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-bold">Add Product</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-4 py-6 safe-bottom">
                <ProductForm onSubmit={handleSubmit} submitLabel="Save Product" loading={saving} />
            </main>
        </div>
    );
}