// Cross-agent contract: `src/app/_layout.tsx` renders <DatabaseProvider>{children}</DatabaseProvider>.
// The data layer must never block the app — migration failures are logged, not thrown, and
// children render regardless of migration outcome.
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { View } from 'react-native';

import { db } from './client';
import migrations from './migrations/migrations';

export interface DatabaseReadyState {
  /** True once migrations have finished running (successfully or not). */
  ready: boolean;
  error: Error | undefined;
}

const DatabaseReadyContext = createContext<DatabaseReadyState | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);
  const ready = success || error != null;

  if (error) {
    // The data layer must never block the app — log and continue.
    console.error('[db] migration failed, continuing without a guaranteed-up-to-date schema', error);
  }

  const state: DatabaseReadyState = { ready, error };

  if (!ready) {
    // Minimal, unstyled placeholder — this file owns no colors/tokens.
    return <View />;
  }

  return <DatabaseReadyContext.Provider value={state}>{children}</DatabaseReadyContext.Provider>;
}

/** Migration status for anyone who wants to react to it (e.g. a dev-only "db not ready" banner). */
export function useDatabaseReady(): DatabaseReadyState {
  const ctx = useContext(DatabaseReadyContext);
  return ctx ?? { ready: false, error: undefined };
}
