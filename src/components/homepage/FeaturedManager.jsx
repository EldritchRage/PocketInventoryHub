import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import useProducts from '@/hooks/useProducts';
import { toast } from 'sonner';

export default function FeaturedManager({ featuredItems, onAdd, onRemove, onReorder }) {
    const { products, loading: productsLoading } = useProducts();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    console.log('FeaturedManager render state:', {
        productsLoading,
        hasProducts: !!products,
        productsCount: products?.length,
        featuredItemsCount: featuredItems?.length
    });

    if (productsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-20" />
                <p className="text-xs">Loading inventory...</p>
            </div>
        );
    }

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(featuredItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onReorder(items);
    };

    if (!products) return null;

    const filteredProducts = products.filter(p =>
        !featuredItems.find(f => f.productId === p.firestoreId) &&
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleAdd = async (productId) => {
        try {
            await onAdd(productId);
            toast.success('Product added to featured');
        } catch (err) {
            toast.error('Failed to add product');
        }
    };

    const handleRemove = async (docId) => {
        try {
            await onRemove(docId);
            toast.success('Product removed from featured');
        } catch (err) {
            toast.error('Failed to remove product');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold">Featured Carousel</h3>
                    <p className="text-xs text-muted-foreground">Rearrange or add products to the homepage slider</p>
                </div>

                <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-9 rounded-lg gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Add Product</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl">
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle className="text-base">Select Products to Feature</DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-secondary/20">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-10 rounded-xl border-border/50 bg-background"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="grid gap-1">
                                {filteredProducts.map(product => (
                                    <div
                                        key={product.firestoreId}
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/40 transition-colors"
                                    >
                                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary border border-border/50">
                                            {product.imageUrl && (
                                                <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 rounded-full"
                                            onClick={() => handleAdd(product.firestoreId)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="py-8 text-center text-xs text-muted-foreground">
                                        No available products found
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="featured-list">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                        >
                            {featuredItems.map((item, index) => {
                                const product = products.find(p => p.firestoreId === item.productId);
                                return (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`
                                                    flex items-center gap-3 p-3 rounded-xl border bg-card transition-all duration-200
                                                    ${snapshot.isDragging ? 'shadow-lg border-primary/30 z-50' : 'border-border/60'}
                                                `}
                                            >
                                                <div {...provided.dragHandleProps} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1">
                                                    <GripVertical className="h-5 w-5" />
                                                </div>

                                                <div className="h-10 w-10 rounded-lg overflow-hidden bg-secondary border border-border/40">
                                                    {product?.imageUrl && (
                                                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{product?.name || 'Loading...'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-mono uppercase">Order: {index + 1}</p>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                                    onClick={() => handleRemove(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}

                            {featuredItems.length === 0 && (
                                <div className="py-12 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center px-6 bg-secondary/5">
                                    <Star className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-sm font-medium text-muted-foreground">No featured products yet</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Add items to show them in the homepage carousel</p>
                                </div>
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}
