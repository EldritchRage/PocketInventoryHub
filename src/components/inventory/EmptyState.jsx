import React from 'react';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
        >
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                <Package className="h-9 w-9 text-muted-foreground/50" />
            </div>
            <h2 className="text-lg font-semibold mb-1">No products yet</h2>
            <p className="text-sm text-muted-foreground max-w-[240px]">
                Tap the <span className="font-semibold text-primary">+</span> button to add your first product.
            </p>
        </motion.div>
    );
}