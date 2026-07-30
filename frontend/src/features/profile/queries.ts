// The only place that talks to Drizzle for the local profile (STRUCTURE.md rule #5).
// `profiles` is local-only settings (API.md §1.6) — never synced, single row `id = 'local'`.
import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { profiles, type Profile } from '@/db/schema';
import { nowIso } from '@/lib/dates';

import type { UpdateProfileInput } from './types';

export const LOCAL_PROFILE_ID = 'local';

/** Fetches the single local settings row, creating it with API.md §1.6 defaults on first call. */
export async function getProfile(): Promise<Profile> {
  const existing = await db.select().from(profiles).where(eq(profiles.id, LOCAL_PROFILE_ID)).limit(1);
  if (existing[0]) return existing[0];

  const now = nowIso();
  const [row] = await db
    .insert(profiles)
    .values({
      id: LOCAL_PROFILE_ID,
      displayName: 'YENN',
      units: 'metric',
      defaultMethod: 'v60',
      theme: 'system',
      onboarded: false,
      lastSyncedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

export async function updateProfile(patch: UpdateProfileInput): Promise<Profile> {
  await getProfile(); // ensure the row exists before patching
  const [row] = await db
    .update(profiles)
    .set({ ...patch, updatedAt: nowIso() })
    .where(eq(profiles.id, LOCAL_PROFILE_ID))
    .returning();
  return row;
}

/** Stamps the sync cursor — `server_time` from the last successful pull (API.md §5). */
export async function setLastSyncedAt(iso: string): Promise<Profile> {
  return updateProfile({ lastSyncedAt: iso });
}

// ---------------------------------------------------------------------------
// Live-query hook — re-renders on write via drizzle's expo-sqlite change listener.
// ---------------------------------------------------------------------------

export function useProfile() {
  return useLiveQuery(db.select().from(profiles).where(eq(profiles.id, LOCAL_PROFILE_ID)).limit(1));
}
