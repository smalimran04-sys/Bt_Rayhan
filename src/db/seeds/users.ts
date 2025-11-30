import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
    const sampleUsers = [
        {
            email: 'admin@baust.edu.bd',
            password: bcrypt.hashSync('admin123', 10),
            role: 'admin',
            name: 'Admin',
            department: 'Administration',
            phone: '+880123456789',
            createdAt: new Date().toISOString(),
        },
        {
            email: 'mrittika@baust.edu.bd',
            password: bcrypt.hashSync('customer123', 10),
            role: 'customer',
            name: 'Mrittika',
            department: 'CSE',
            phone: '+880198765432',
            createdAt: new Date().toISOString(),
        },
        {
            email: 'student@baust.edu.bd',
            password: bcrypt.hashSync('student123', 10),
            role: 'customer',
            name: 'Student',
            department: 'EEE',
            phone: '+880187654321',
            createdAt: new Date().toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});