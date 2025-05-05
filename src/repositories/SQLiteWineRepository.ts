import { Wine, WineRepository } from './types';
import { db } from '../db/sqlite';
import { v4 as uuidv4 } from 'uuid';

export class SQLiteWineRepository implements WineRepository {
    async findById(id: string): Promise<Wine | null> {
        const wines = await db.query<Wine>('SELECT * FROM wines WHERE id = ?', [id]);
        return wines[0] || null;
    }

    async findAll(): Promise<Wine[]> {
        return db.query<Wine>('SELECT * FROM wines ORDER BY created_at DESC');
    }

    async create(wine: Omit<Wine, 'id'>): Promise<Wine> {
        const id = uuidv4();
        const now = new Date().toISOString();
        
        await db.query(
            `INSERT INTO wines (id, barcode, name, vintage, producer_id, type_id, varietal, rating, notes, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, wine.barcode, wine.name, wine.vintage, wine.producer_id, wine.type_id, wine.varietal, wine.rating, wine.notes, now, now]
        );

        return this.findById(id) as Promise<Wine>;
    }

    async update(id: string, wine: Partial<Wine>): Promise<Wine> {
        const current = await this.findById(id);
        if (!current) throw new Error('Wine not found');

        const updates = Object.entries(wine)
            .filter(([key]) => key !== 'id' && key !== 'created_at')
            .map(([key, value]) => `${key} = ?`);

        const values = [...Object.values(wine).filter((_, i) => {
            const key = Object.keys(wine)[i];
            return key !== 'id' && key !== 'created_at';
        }), id];

        await db.query(
            `UPDATE wines SET ${updates.join(', ')}, updated_at = datetime('now')
             WHERE id = ?`,
            values
        );

        return this.findById(id) as Promise<Wine>;
    }

    async delete(id: string): Promise<void> {
        await db.query('DELETE FROM wines WHERE id = ?', [id]);
    }

    async findByBarcode(barcode: string): Promise<Wine | null> {
        const wines = await db.query<Wine>('SELECT * FROM wines WHERE barcode = ?', [barcode]);
        return wines[0] || null;
    }

    async search(query: string): Promise<Wine[]> {
        return db.query<Wine>(
            `SELECT * FROM wines 
             WHERE name LIKE ? OR varietal LIKE ? OR notes LIKE ?
             ORDER BY created_at DESC`,
            [`%${query}%`, `%${query}%`, `%${query}%`]
        );
    }
}