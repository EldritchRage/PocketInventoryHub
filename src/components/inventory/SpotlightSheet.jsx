import React from 'react';
import { Star } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SpotlightSheet({ open, onClose, products, onToggleSpotlight }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md mx-auto rounded-t-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-base flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        Seasonal Spotlight
                    </DialogTitle>
                </DialogHeader>
                <div className="text-xs text-muted-foreground mb-4">
                    Select the items you want to feature in the Seasonal Spotlight section on your website.
                </div>
                <ScrollArea className="flex-1 -mx-2 pr-4">
                    <div className="flex flex-col gap-1">
                        {products.map(product => (
                            <div
                                key={product.firestoreId}
                                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors duration-150"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded bg-secondary flex-shrink-0 overflow-hidden">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                {product.name.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium truncate">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">${Number(product.price).toFixed(2)}</p>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={!!product.seasonalSpotlight}
                                    onCheckedChange={(checked) => {
                                        onToggleSpotlight(product.firestoreId, !!checked);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
