// expo-sqlite + drizzle instance. This is the only place the raw db handle is opened.
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'timpla.db';

// enableChangeListener powers drizzle's useLiveQuery hooks (table-change notifications).
export const expoDb = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

// WAL improves concurrent read/write behavior for a local-first app that is read-heavy
// (list screens) while writes happen from a single New Brew / Add Bean form at a time.
// Foreign keys stay off: bean_id / source_brew_id are deliberately unconstrained (API.md §1.3).
expoDb.execSync('PRAGMA journal_mode = WAL;');
expoDb.execSync('PRAGMA foreign_keys = OFF;');

export const db = drizzle(expoDb, { schema });
