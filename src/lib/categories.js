export const CATEGORIES = [
    { id: 'fun-t-shirts', label: 'Fun T Shirts' },
    { id: 'cups', label: 'Cups' },
    { id: 'freshies', label: 'Freshies' },
    { id: 'mini-caffeine', label: 'Loaded Teas > Mini Caffeine' },
    { id: 'mini-uncaffeinated', label: 'Loaded Teas > Mini Uncaffeinated' },
    { id: 'full-sized-caffeine', label: 'Loaded Teas > Full Sized Caffeine' },
    { id: 'body-butter', label: 'Personal Care > Body Butter' },
    { id: 'hair-detangler', label: 'Personal Care > Hair Detangler' },
    { id: 'lotion', label: 'Personal Care > Lotion' },
    { id: 'hand-sanitizer', label: 'Personal Care > Hand Sanitizer' },
    { id: 'all-purpose-cleaner', label: 'Personal Care > All Purpose Cleaner' },
    { id: 'ravewear', label: 'RaveWear' },
    { id: 'handmade-jewelry', label: 'Handmade Jewelry' },
    { id: 'orion-falls-merch', label: 'Orion Falls Merch' },
    { id: 'customs', label: 'Customs' },
];
export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));