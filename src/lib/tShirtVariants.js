export const T_SHIRT_VARIANTS = [
    { key: 'gildan', label: 'Gildan' },
    { key: 'bella-canvas', label: 'Bella Canvas' },
    { key: 'tank-top', label: 'Tank Top' },
];

export const T_SHIRT_CATEGORY = 'fun-t-shirts';

export function isTShirtProduct(product) {
    return product?.category === T_SHIRT_CATEGORY || product?.categoryId === T_SHIRT_CATEGORY;
}

export function emptyVariants() {
    return Object.fromEntries(
        T_SHIRT_VARIANTS.map(({ key, label }) => [
            key,
            { label, price: '', quantity: '', stripePriceId: '' },
        ])
    );
}

export function normalizeVariants(raw) {
    const base = emptyVariants();
    if (!raw || typeof raw !== 'object') {
        return base;
    }
    T_SHIRT_VARIANTS.forEach(({ key, label }) => {
        const entry = raw[key];
        if (!entry) {
            return;
        }
        base[key] = {
            label: entry.label || label,
            price: entry.price ?? '',
            quantity: entry.quantity ?? '',
            stripePriceId: entry.stripePriceId || '',
        };
    });
    return base;
}

export function variantsFromProduct(product) {
    if (product?.variants) {
        return normalizeVariants(product.variants);
    }
    return emptyVariants();
}

export function buildVariantsPayload(formVariants) {
    const variants = {};
    T_SHIRT_VARIANTS.forEach(({ key, label }) => {
        const entry = formVariants[key] || {};
        variants[key] = {
            label,
            price: Number(entry.price),
            quantity: Number(entry.quantity),
            stripePriceId: (entry.stripePriceId || '').trim(),
        };
    });
    return variants;
}

export function aggregateFromVariants(variants) {
    const entries = Object.values(variants || {});
    const prices = entries.map((v) => Number(v.price)).filter((p) => !Number.isNaN(p));
    const quantities = entries.map((v) => Number(v.quantity)).filter((q) => !Number.isNaN(q));
    return {
        price: prices.length ? Math.min(...prices) : 0,
        quantity: quantities.reduce((sum, q) => sum + q, 0),
    };
}

export function formatVariantPriceRange(product) {
    if (!isTShirtProduct(product) || !product.variants) {
        return null;
    }
    const prices = Object.values(product.variants)
        .map((v) => Number(v.price))
        .filter((p) => !Number.isNaN(p));
    if (!prices.length) {
        return null;
    }
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
        return `$${min.toFixed(2)}`;
    }
    return `$${min.toFixed(2)} – $${max.toFixed(2)}`;
}
