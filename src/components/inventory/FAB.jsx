import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FAB({ onClick }) {
    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={onClick}
            className="fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full bg-fab text-fab-foreground shadow-lg shadow-fab/30 flex items-center justify-center active:shadow-md transition-shadow duration-200"
            aria-label="Add Product"
        >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
    );
}