import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import {
    T_SHIRT_VARIANTS,
    T_SHIRT_CATEGORY,
    variantsFromProduct,
    buildVariantsPayload,
    aggregateFromVariants,
} from '@/lib/tShirtVariants';

export default function ProductForm({ initialData, onSubmit, submitLabel = 'Save Product', loading = false }) {
    const isEditingTShirt =
        initialData?.category === T_SHIRT_CATEGORY || initialData?.categoryId === T_SHIRT_CATEGORY;

    const [form, setForm] = useState({
        name: initialData?.name || '',
        price: initialData?.price ?? '',
        quantity: initialData?.quantity ?? '',
        categoryId: initialData?.category || initialData?.categoryId || '',
        description: initialData?.description || '',
        imageUrl: initialData?.imageUrl || '',
    });
    const [variants, setVariants] = useState(() => variantsFromProduct(initialData));
    const [imageFiles, setImageFiles] = useState([]);
    const [existingImageUrls, setExistingImageUrls] = useState(initialData?.imageUrls || (initialData?.imageUrl ? [initialData.imageUrl] : []));
    const [previews, setPreviews] = useState(existingImageUrls.map(url => ({ url, isExisting: true })));

    const isTShirt = form.categoryId === T_SHIRT_CATEGORY;

    useEffect(() => {
        return () => {
            previews.forEach(p => {
                if (p.url && p.url.startsWith('blob:')) {
                    try { URL.revokeObjectURL(p.url); } catch (e) {}
                }
            });
        };
    }, [previews]);

    const removeImage = (index) => {
        const item = previews[index];
        if (item.isExisting) {
            setExistingImageUrls(prev => prev.filter(url => url !== item.url));
        } else {
            // Find which file to remove
            const blobUrl = item.url;
            setImageFiles(prev => prev.filter(file => URL.createObjectURL(file) !== blobUrl));
        }
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newPreviews = files.map(file => ({
            url: URL.createObjectURL(file),
            isExisting: false
        }));

        setImageFiles(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const [errors, setErrors] = useState({});

    const set = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
    };

    const setVariant = (key, field, value) => {
        setVariants(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value },
        }));
        const errorKey = `variant_${key}_${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: null }));
        }
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.categoryId) e.categoryId = 'Category is required';

        if (isTShirt) {
            T_SHIRT_VARIANTS.forEach(({ key, label }) => {
                const entry = variants[key];
                if (entry.price === '' || isNaN(Number(entry.price)) || Number(entry.price) < 0) {
                    e[`variant_${key}_price`] = `${label} price is required`;
                }
                if (entry.quantity === '' || isNaN(Number(entry.quantity)) || Number(entry.quantity) < 0) {
                    e[`variant_${key}_quantity`] = `${label} quantity is required`;
                }
            });
        } else {
            if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) {
                e.price = 'Valid price required';
            }
            if (form.quantity === '' || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) {
                e.quantity = 'Valid quantity required';
            }
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const basePayload = {
            ...form,
            imageFiles,
            imageUrls: existingImageUrls,
        };

        if (isTShirt) {
            const variantsPayload = buildVariantsPayload(variants);
            const { price, quantity } = aggregateFromVariants(variantsPayload);
            onSubmit({
                ...basePayload,
                price,
                quantity,
                variants: variantsPayload,
            });
            return;
        }

        onSubmit({
            ...basePayload,
            price: Number(form.price),
            quantity: Number(form.quantity),
        });
    };

    const standardFields = [
        { key: 'name', label: 'Product Name *', type: 'text', placeholder: 'e.g. Knight Print Tee' },
        ...(isTShirt
            ? []
            : [
                { key: 'price', label: 'Price *', type: 'number', placeholder: '0.00', step: '0.01' },
                { key: 'quantity', label: 'Quantity *', type: 'number', placeholder: '0' },
            ]),
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {standardFields.map(f => (
                <div key={f.key} className="space-y-1.5">
                    <Label htmlFor={f.key} className="text-sm font-medium">{f.label}</Label>
                    <Input
                        id={f.key}
                        type={f.type}
                        step={f.step}
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => set(f.key, e.target.value)}
                        className={`h-11 rounded-lg ${errors[f.key] ? 'border-destructive ring-destructive/30' : ''}`}
                    />
                    {errors[f.key] && <p className="text-xs text-destructive">{errors[f.key]}</p>}
                </div>
            ))}

            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={form.categoryId} onValueChange={v => set('categoryId', v)}>
                    <SelectTrigger className="h-11 rounded-lg">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            </div>

            {isTShirt && (
                <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-4">
                    <div>
                        <p className="text-sm font-semibold">T-Shirt Styles</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Set price, quantity, and Stripe price ID for each style customers can choose on the website.
                        </p>
                    </div>
                    {T_SHIRT_VARIANTS.map(({ key, label }) => (
                        <div key={key} className="rounded-lg border border-border/50 bg-background p-3 space-y-3">
                            <p className="text-sm font-medium">{label}</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor={`${key}-price`} className="text-xs font-medium">Price *</Label>
                                    <Input
                                        id={`${key}-price`}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={variants[key].price}
                                        onChange={e => setVariant(key, 'price', e.target.value)}
                                        className={`h-10 rounded-lg ${errors[`variant_${key}_price`] ? 'border-destructive' : ''}`}
                                    />
                                    {errors[`variant_${key}_price`] && (
                                        <p className="text-xs text-destructive">{errors[`variant_${key}_price`]}</p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor={`${key}-quantity`} className="text-xs font-medium">Quantity *</Label>
                                    <Input
                                        id={`${key}-quantity`}
                                        type="number"
                                        placeholder="0"
                                        value={variants[key].quantity}
                                        onChange={e => setVariant(key, 'quantity', e.target.value)}
                                        className={`h-10 rounded-lg ${errors[`variant_${key}_quantity`] ? 'border-destructive' : ''}`}
                                    />
                                    {errors[`variant_${key}_quantity`] && (
                                        <p className="text-xs text-destructive">{errors[`variant_${key}_quantity`]}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Describe the product..."
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    className="min-h-[80px] rounded-lg resize-none"
                />
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="imageFile" className="text-sm font-medium">Images</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {previews.map((p, i) => (
                        <div key={i} className="relative w-20 h-20 group">
                            <img
                                src={p.url}
                                alt={`Preview ${i}`}
                                className="w-full h-full object-cover rounded-lg border border-border"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Loader2 className="h-3 w-3 rotate-45" /> {/* Use rotate-45 as X or just a generic icon */}
                            </button>
                        </div>
                    ))}
                    <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <span className="text-2xl text-muted-foreground">+</span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-sm font-semibold" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : submitLabel}
            </Button>
        </form>
    );
}
