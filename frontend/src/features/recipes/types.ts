import type { BrewMethod, NewRecipe, Recipe } from '@/db/schema';

export type { BrewMethod, NewRecipe, Recipe };

/** Fields a caller may set when saving a recipe. `id`/timestamps/timesUsed are set by createRecipe. */
export type CreateRecipeInput = Omit<
  NewRecipe,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'timesUsed'
>;

/** Fields a caller may patch. `updatedAt` is stamped by updateRecipe, never passed in. */
export type UpdateRecipeInput = Partial<
  Omit<NewRecipe, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;
