import { db } from '@/db';
import { menuItems } from '@/db/schema';

async function main() {
    const sampleMenuItems = [
        {
            name: 'Singara',
            description: 'Traditional Bengali samosa',
            price: 15,
            category: 'snacks',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Puri',
            description: 'Fried flatbread',
            price: 10,
            category: 'snacks',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Roll',
            description: 'Wrapped paratha with filling',
            price: 50,
            category: 'snacks',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Chop',
            description: 'Bengali cutlet',
            price: 20,
            category: 'snacks',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Chicken Cutlet',
            description: 'Fried chicken cutlet',
            price: 30,
            category: 'snacks',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Tea',
            description: 'Traditional milk tea',
            price: 10,
            category: 'beverages',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Coffee',
            description: 'Black coffee',
            price: 25,
            category: 'beverages',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Lassi',
            description: 'Yogurt drink',
            price: 30,
            category: 'beverages',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Rasgulla',
            description: 'Syrupy sponge dessert',
            price: 40,
            category: 'sweets',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Sandesh',
            description: 'Bengali sweet',
            price: 35,
            category: 'sweets',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
        {
            name: 'Doi',
            description: 'Sweet yogurt',
            price: 25,
            category: 'sweets',
            imageUrl: null,
            available: true,
            createdAt: new Date().toISOString(),
        },
    ];

    await db.insert(menuItems).values(sampleMenuItems);
    
    console.log('✅ Menu items seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});