import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function addDesignationColumn() {
  try {
    console.log('Adding designation column to users table...');
    
    // Check if column exists
    const result = await db.run(sql`
      SELECT COUNT(*) as count 
      FROM pragma_table_info('users') 
      WHERE name='designation'
    `);
    
    if (result.rows[0].count === 0) {
      // Add the column
      await db.run(sql`ALTER TABLE users ADD COLUMN designation TEXT`);
      console.log('✅ Successfully added designation column');
    } else {
      console.log('ℹ️  Designation column already exists');
    }
  } catch (error) {
    console.error('❌ Error adding designation column:', error);
  }
}

addDesignationColumn();
