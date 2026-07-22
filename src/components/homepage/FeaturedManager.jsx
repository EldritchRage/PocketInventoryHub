import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, Trash2, Search, Loader2, Star, Save } from 'lucide-react';
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

export default function FeaturedManager({ featuredItems, onPublish }) {
    const { products, loading: productsLoading } = useProducts();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [draftIds, setDraftIds] = useState([]);
    const [dirty, setDirty] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const items = Array.isArray(featuredItems) ? featuredItems : [];

    useEffect(() => {
        if (!dirty) setDraftIds(items.map(item => item.productId));
    }, [items, dirty]);

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

        const nextItems = Array.from(draftIds);
        const [reorderedItem] = nextItems.splice(result.source.index, 1);
        nextItems.splice(result.destination.index, 0, reorderedItem);
        setDraftIds(nextItems);
        setDirty(true);
    };

    if (!products) return null;

    const filteredProducts = products.filter(p =>
        p.published === true && p.status === 'published' &&
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.category?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleToggle = (productId) => {
        setDraftIds(current => current.includes(productId)
            ? current.filter(id => id !== productId)
            : [...current, productId]);
        setDirty(true);
    };

    const handlePublish = async () => {
        setPublishing(true);
        try {
            await onPublish(draftIds);
            setDirty(false);
            toast.success('Featured products published to the website');
        } catch (err) {
            toast.error(err?.message || 'Failed to publish featured products');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold">Featured Carousel</h3>
                    <p className="text-xs text-muted-foreground">Rearrange or add products to the homepage slider</p>
                </div>

                <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-9 rounded-lg gap-2" onClick={handlePublish} disabled={publishing || !dirty}>
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span>Publish Featured</span>
                </Button>
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
                                        <input
                                            type="checkbox"
                                            className="h-5 w-5 accent-primary"
                                            checked={draftIds.includes(product.firestoreId)}
                                            onChange={() => handleToggle(product.firestoreId)}
                                            aria-label={`Feature ${product.name}`}
                                        />
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
            </div>

            <p className="text-xs text-muted-foreground">
                {dirty ? 'Selection changed. Tap Publish Featured to update psitsavibe.com.' : 'The list below matches the published homepage selection.'}
            </p>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="featured-list">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                        >
                            {draftIds.map((productId, index) => {
                                const product = products.find(p => p.firestoreId === productId);
                                return (
                                    <Draggable key={productId} draggableId={productId} index={index}>
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
                                                    onClick={() => handleToggle(productId)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </Draggable>
                                );
                            })}
                            {provided.placeholder}

                            {draftIds.length === 0 && (
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
