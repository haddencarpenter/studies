import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL);

async function migrateUserTable() {
  try {
    console.log('Starting User table migration...');

    // Add new columns for Web3Auth integration
    await sql`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "web3auth_id" VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS "provider" VARCHAR(50),
      ADD COLUMN IF NOT EXISTS "email" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "name" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "profile_image" TEXT,
      ADD COLUMN IF NOT EXISTS "auth_method" VARCHAR(20) DEFAULT 'legacy',
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP DEFAULT NOW()
    `;

    console.log('✅ Added new columns to User table');

    // Update existing users to have legacy auth method
    const result = await sql`
      UPDATE "User" 
      SET 
        "auth_method" = 'legacy',
        "created_at" = COALESCE("created_at", NOW()),
        "updated_at" = COALESCE("updated_at", NOW())
      WHERE "auth_method" IS NULL OR "auth_method" = ''
    `;

    console.log(`✅ Updated ${result.count} existing users with legacy auth method`);

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS "idx_user_web3auth_id" ON "User" ("web3auth_id")
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "idx_user_provider" ON "User" ("provider")
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS "idx_user_auth_method" ON "User" ("auth_method")
    `;

    console.log('✅ Created indexes for new columns');

    // Show current user table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Current User table structure:');
    tableInfo.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    console.log('\n🎉 User table migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateUserTable();
}

export default migrateUserTable;