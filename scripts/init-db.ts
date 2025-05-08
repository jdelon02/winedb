import { db } from '../src/db/sqlite';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
    try {
        console.log('Initializing database connection...');
        await db.initialize();

        const migrationsPath = path.join(__dirname, '..', 'db', 'migrations');
        console.log(`Looking for migration files in: ${migrationsPath}`);

        if (!fs.existsSync(migrationsPath)) {
            throw new Error(`Migrations directory not found: ${migrationsPath}`);
        }

        const migrations = fs.readdirSync(migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();

        if (migrations.length === 0) {
            console.warn('No migration files found. Skipping migrations.');
        } else {
            for (const migration of migrations) {
                const migrationPath = path.join(migrationsPath, migration);
                console.log(`Applying migration: ${migrationPath}`);

                const sql = fs.readFileSync(migrationPath, 'utf8');
                await db.exec(sql);
                console.log(`Successfully applied migration: ${migration}`);
            }
        }

        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    } finally {
        await db.close();
        console.log('Database connection closed.');
    }
}

initializeDatabase();