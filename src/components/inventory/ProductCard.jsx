import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { isTShirtProduct, formatVariantPriceRange } from '@/lib/tShirtVariants';

export default function ProductCard({ product, index, onClick }) {
    const { name, price, quantity, imageUrl, published, variants, seasonalSpotlight } = product;

    const initials = (name || 'P').slice(0, 2).toUpperCase();
    const isTShirt = isTShirtProduct(product);
    const priceLabel = isTShirt ? formatVariantPriceRange(product) : `$${Number(price).toFixed(2)}`;

    const variantSummary = isTShirt && variants
        ? Object.values(variants)
            .map((variant) => `${variant.label}: $${Number(variant.price).toFixed(2)} (${variant.quantity ?? 0})`)
            .join(' · ')
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            onClick={onClick}
            className="group bg-card rounded-xl border border-border/60 p-3.5 flex gap-3.5 cursor-pointer active:scale-[0.98] transition-all duration-200 hover:shadow-md hover:border-primary/20"
        >
            <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-secondary flex items-center justify-center relative">
                {imageUrl ? (
                    <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-sm font-semibold text-muted-foreground/70">{initials}</span>
                )}
                {seasonalSpotlight && (
                    <div className="absolute top-0.5 right-0.5 bg-background/80 backdrop-blur-sm rounded-full p-0.5 border border-border/50">
                        <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{name}</p>
                    {published ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">Published</span>
                    ) : (
                        <span className="text-xs text-muted-foreground/70 px-2 py-0.5 rounded-full">Not published</span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                    {priceLabel} <span className="text-muted-foreground/50 mx-1">·</span> Qty: {quantity}
                </p>
                {variantSummary && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-2">{variantSummary}</p>
                )}
            </div>
        </motion.div>
    );
}
