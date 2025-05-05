import { Database } from 'sqlite';

// Export a dummy interface to make this a module
export interface DbConnection {
  db: Database | null;
}

export const connection: DbConnection = {
  db: null
};