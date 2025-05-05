const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    const dbPath = path.join(__dirname, '..', 'db', 'wine.sqlite');
    const migrationsPath = path.join(__dirname, '..', 'db', 'migrations');

    try {
        // Ensure db directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Initialize database connection
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');

        // Read and execute migration files
        const migrations = fs.readdirSync(migrationsPath)
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const migration of migrations) {
            const sql = fs.readFileSync(path.join(migrationsPath, migration), 'utf8');
            await db.exec(sql);
            console.log(`Applied migration: ${migration}`);
        }

        await db.close();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

initializeDatabase();