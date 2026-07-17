import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import useProducts from '@/hooks/useProducts';
import TopBar from '@/components/inventory/TopBar';
import ProductCard from '@/components/inventory/ProductCard';
import EmptyState from '@/components/inventory/EmptyState';
import FAB from '@/components/inventory/FAB';
import SortSheet from '@/components/inventory/SortSheet';
import MenuSheet from '@/components/inventory/MenuSheet';
import ThemeSheet from '@/components/inventory/ThemeSheet';
import SpotlightSheet from '@/components/inventory/SpotlightSheet';

export default function Products() {
    const navigate = useNavigate();
    const { products, rawProducts, loading, sortMode, setSortMode, sortModes, publishInventory, toggleSpotlight } = useProducts();

    const [sortOpen, setSortOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
    const [spotlightOpen, setSpotlightOpen] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const handlePublish = async () => {
        if (!rawProducts.length) {
            toast.error('No products to publish');
            return;
        }

        setPublishing(true);
        try {
            await publishInventory();
            toast.success('Inventory published to Firestore');
        } catch (err) {
            toast.error(err?.message || 'Could not publish inventory');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            <TopBar
                title="Products"
                onSortClick={() => setSortOpen(true)}
                onMenuClick={() => setMenuOpen(true)}
            />

            <main className="max-w-lg mx-auto px-4 pt-4">
                <div className="flex flex-col gap-3 mb-4">
                    <Button
                        className="w-full h-12 rounded-xl text-sm font-semibold"
                        onClick={handlePublish}
                        disabled={publishing || rawProducts.length === 0}
                    >
                        {publishing ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Publish Inventory...</>
                        ) : (
                            'Publish Inventory'
                        )}
                    </Button>
                    <button
                        onClick={() => setSortOpen(true)}
                        className="inline-flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-secondary/80 transition-colors"
                    >
                        Sort: {sortModes.find(m => m.key === sortMode)?.label}
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" />
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="flex flex-col gap-3">
                        <AnimatePresence>
                            {products.map((product, i) => (
                                <ProductCard
                                    key={product.firestoreId}
                                    product={product}
                                    index={i}
                                    onClick={() => navigate(`/edit/${product.firestoreId}`)}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <FAB onClick={() => navigate('/add')} />

            <SortSheet
                open={sortOpen}
                onClose={setSortOpen}
                sortModes={sortModes}
                currentSort={sortMode}
                onSelect={setSortMode}
            />

            <MenuSheet
                open={menuOpen}
                onClose={setMenuOpen}
                onPublish={handlePublish}
                onTheme={() => setThemeOpen(true)}
                onSpotlight={() => setSpotlightOpen(true)}
            />

            <ThemeSheet open={themeOpen} onClose={setThemeOpen} />

            <SpotlightSheet
                open={spotlightOpen}
                onClose={setSpotlightOpen}
                products={rawProducts}
                onToggleSpotlight={toggleSpotlight}
            />
        </div>
    );
}