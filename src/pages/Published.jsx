import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProductCard from '@/components/inventory/ProductCard';
import EmptyState from '@/components/inventory/EmptyState';

export default function Published() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(
            collection(db, 'products'),
            where('published', '==', true),
            orderBy('publishedAt', 'desc')
        );
        const unsub = onSnapshot(
            q,
            (snap) => {
                const docs = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
                setProducts(docs);
                setLoading(false);
            },
            (err) => {
                console.error('Published snapshot error', err);
                setError(err?.message || String(err));
                setLoading(false);
            }
        );
        return unsub;
    }, []);

    return (
        <div className="min-h-screen bg-background pb-12">
            <main className="max-w-3xl mx-auto px-4 pt-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-7 h-7 border-4 border-border border-t-primary rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                        <p className="text-sm font-medium text-destructive">Could not load published inventory</p>
                        <p className="text-xs text-muted-foreground mt-2">{error}</p>
                        {(() => {
                            const m = (error || '').match(/https?:\/\/[\w\-./?=%&:,~+#]+/);
                            if (m) {
                                return (
                                    <p className="mt-2">
                                        <a href={m[0]} target="_blank" rel="noreferrer" className="text-primary underline">Create required Firestore index</a>
                                    </p>
                                );
                            }
                            return null;
                        })()}
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.map((p, i) => (
                            <ProductCard key={p.firestoreId} product={p} index={i} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
