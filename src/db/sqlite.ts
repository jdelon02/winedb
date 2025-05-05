import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

class SQLiteDB {
  private static instance: SQLiteDB;
  private db: Database | null = null;
  private readonly dbPath: string;

  private constructor() {
    this.dbPath = path.join(process.cwd(), 'db', 'wine.sqlite');
  }

  static getInstance(): SQLiteDB {
    if (!SQLiteDB.instance) {
      SQLiteDB.instance = new SQLiteDB();
    }
    return SQLiteDB.instance;
  }

  async initialize(): Promise<void> {
    if (!this.db) {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });
      await this.db.exec('PRAGMA foreign_keys = ON');
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const result = await this.db.all(sql, params);
    return result as T[];
  }

  async exec(sql: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.exec(sql);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const db = SQLiteDB.getInstance();