import { db } from '../src/db/sqlite';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
    try {
        // Initialize DB connection
        await db.initialize();

        // Read and execute migration files
        const migrationsPath = path.join(__dirname, '..', 'db', 'migrations');
        const migrations = fs.readdirSync(migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const migration of migrations) {
            const sql = fs.readFileSync(path.join(migrationsPath, migration), 'utf8');
            await db.exec(sql);
            console.log(`Applied migration: ${migration}`);
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

initializeDatabase();