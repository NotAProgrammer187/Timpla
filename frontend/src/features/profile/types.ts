import type { NewProfile, Profile } from '@/db/schema';

export type { NewProfile, Profile };

/** Fields a caller may patch. `id`/timestamps are managed by the profile queries. */
export type UpdateProfileInput = Partial<
  Omit<NewProfile, 'id' | 'createdAt' | 'updatedAt'>
>;
