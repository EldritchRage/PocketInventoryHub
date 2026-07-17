import React from 'react';
import { Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function SortSheet({ open, onClose, sortModes, currentSort, onSelect }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-sm mx-auto rounded-t-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base">Sort Products</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-1 -mx-2">
                    {sortModes.map(mode => (
                        <button
                            key={mode.key}
                            onClick={() => {
                                onSelect(mode.key);
                                onClose(false);
                            }}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors duration-150 ${currentSort === mode.key
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'hover:bg-secondary text-foreground'
                                }`}
                        >
                            <span>{mode.label}</span>
                            {currentSort === mode.key && <Check className="h-4 w-4" />}
                        </button>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}