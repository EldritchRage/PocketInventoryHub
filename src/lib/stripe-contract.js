const valid = (value, prefix) => typeof value === 'string' && value.startsWith(prefix);

export function buildStripeSyncRequest(product = {}, apiKey) {
    const unitAmount = Math.round(Number(product.price) * 100);
    if (!Number.isSafeInteger(unitAmount) || unitAmount < 0) throw new Error('Invalid product price');
    return {
        api_key: apiKey,
        stripeProductId: valid(product.stripe?.productId || product.stripeProductId, 'prod_')
            ? (product.stripe?.productId || product.stripeProductId)
            : null,
        name: String(product.name || '').trim(),
        description: String(product.description || ''),
        imageUrl: typeof product.imageUrl === 'string' && product.imageUrl.startsWith('https://') ? product.imageUrl : null,
        unit_amount: unitAmount,
        currency: product.currency || 'usd',
    };
}

export function normalizeStripeSyncResponse(response = {}) {
    if (!valid(response.stripeProductId, 'prod_') || !valid(response.stripePriceId, 'price_')) {
        throw new Error('Stripe sync returned invalid product or price identifiers');
    }
    return {
        stripeProductId: response.stripeProductId,
        stripePriceId: response.stripePriceId,
        stripe: { productId: response.stripeProductId, priceId: response.stripePriceId },
        variants: response.variants || null,
    };
}
