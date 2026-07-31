/**
 * dev.tsx — developer harness for the local data layer.
 *
 * Exists to prove the Phase 2 gate: CRUD works for every table from a screen, and
 * the app relaunches with data intact. Reachable only from the `__DEV__`-gated
 * entries on the Dashboard and Profile tabs.
 *
 * It goes through the feature query helpers like any other screen — it never imports
 * the Drizzle client (STRUCTURE.md rule 5), so what it exercises is the real read and
 * write path, not a shortcut around it.
 */
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BREW_METHODS, type Bean, type Brew, type Profile, type Recipe } from '@/db/schema';
import { clearAllData, seedDemoData } from '@/db/seed';
import { createBean, softDeleteBean, updateBean, useBeanList } from '@/features/beans/queries';
import { createBrew, softDeleteBrew, updateBrew, useBrewList } from '@/features/brews/queries';
import { createRecipe, softDeleteRecipe, updateRecipe, useRecipeList } from '@/features/recipes/queries';
import { updateProfile, useProfile } from '@/features/profile/queries';
import { nowIso, todayDateOnly } from '@/lib/dates';
import { useTheme } from '@/theme/useTheme';
import {
  BottomSheet,
  Button,
  Card,
  Divider,
  Header,
  Screen,
  SectionTitle,
  StatChip,
} from '@/components/ui';

/** How many of the newest rows each section lists. */
const PREVIEW_ROWS = 3;

type AnyRow = Bean | Brew | Recipe;

function shortId(id: string): string {
  return id.slice(0, 8);
}

function stamp(iso: string | null): string {
  if (!iso) return '—';
  return iso.slice(11, 23);
}

export default function DevScreen(): React.JSX.Element {
  const { colors, typography, spacing, layout } = useTheme();
  const router = useRouter();

  const [busy, setBusy] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string>('—');

  // withDeleted so tombstones stay visible here — that's the point of the harness.
  const { data: beans } = useBeanList({ withDeleted: true });
  const { data: brews } = useBrewList({ withDeleted: true });
  const { data: recipes } = useRecipeList({ withDeleted: true });
  const { data: profileRows } = useProfile();

  const profile: Profile | undefined = profileRows?.[0];

  async function run(label: string, action: () => Promise<unknown>): Promise<void> {
    setBusy(label);
    try {
      await action();
      setLastAction(`${label} ✓`);
    } catch (cause) {
      setLastAction(`${label} ✗ ${cause instanceof Error ? cause.message : String(cause)}`);
    } finally {
      setBusy(null);
    }
  }

  /** Newest non-deleted row, which is what Update and Soft delete act on. */
  function newestLive<T extends AnyRow>(rows: readonly T[] | undefined): T | undefined {
    return rows?.find((row) => row.deletedAt == null);
  }

  const liveCount = (rows: readonly AnyRow[] | undefined): number =>
    (rows ?? []).filter((row) => row.deletedAt == null).length;
  const deletedCount = (rows: readonly AnyRow[] | undefined): number =>
    (rows ?? []).filter((row) => row.deletedAt != null).length;

  return (
    <Screen scroll contentStyle={{ paddingBottom: spacing.xxxl }}>
      <Header title="Dev tools" onBack={() => router.back()} />

      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.lg }]}>
        Last action: {lastAction}
      </Text>

      <View style={[styles.row, { gap: spacing.md }]}>
        <StatChip value={liveCount(beans)} label="beans" />
        <StatChip value={liveCount(brews)} label="brews" />
        <StatChip value={liveCount(recipes)} label="recipes" />
        <StatChip value={profileRows?.length ?? 0} label="profile" />
      </View>
      <View style={[styles.row, { gap: spacing.md, marginTop: spacing.md }]}>
        <StatChip value={deletedCount(beans)} label="del. beans" />
        <StatChip value={deletedCount(brews)} label="del. brews" />
        <StatChip value={deletedCount(recipes)} label="del. recipes" />
      </View>

      <View style={{ marginTop: layout.sectionGap }}>
        <SectionTitle title="Fixtures" />
        <View style={[styles.row, { gap: spacing.md }]}>
          <Button
            title="Seed demo"
            loading={busy === 'Seed demo'}
            onPress={() => void run('Seed demo', seedDemoData)}
          />
          <Button title="Clear all" variant="danger" onPress={() => setConfirmClearOpen(true)} />
        </View>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
          Seeding is manual on purpose — auto-seeding on boot would hide every empty state.
        </Text>
      </View>

      <TableSection
        title="Beans"
        rows={beans}
        describe={(bean) => `${(bean as Bean).name} · ${stamp(bean.updatedAt)}`}
        busy={busy}
        onCreate={() =>
          run('Create bean', () =>
            createBean({
              name: `Test Bag ${shortId(nowIso())}`,
              roaster: 'Dev Roastery',
              origin: 'Localhost',
              roastDate: todayDateOnly(),
              grams: 250,
              price: 400,
            })
          )
        }
        onUpdate={() => {
          const target = newestLive(beans);
          if (!target) return;
          void run('Update bean', () => updateBean(target.id, { notes: `Touched ${nowIso()}` }));
        }}
        onDelete={() => {
          const target = newestLive(beans);
          if (!target) return;
          void run('Delete bean', () => softDeleteBean(target.id));
        }}
      />

      <TableSection
        title="Brews"
        rows={brews}
        describe={(brew) => `${(brew as Brew).method} · ${stamp(brew.updatedAt)}`}
        busy={busy}
        onCreate={() =>
          run('Create brew', () =>
            createBrew({
              beanId: newestLive(beans)?.id ?? null,
              method: BREW_METHODS[0],
              doseG: 18,
              waterG: 270,
              tempC: 93,
              rating: 4,
              notes: 'Created from dev tools',
              brewedAt: nowIso(),
            })
          )
        }
        onUpdate={() => {
          const target = newestLive(brews);
          if (!target) return;
          void run('Update brew', () => updateBrew(target.id, { rating: 5, notes: `Touched ${nowIso()}` }));
        }}
        onDelete={() => {
          const target = newestLive(brews);
          if (!target) return;
          void run('Delete brew', () => softDeleteBrew(target.id));
        }}
      />

      <TableSection
        title="Recipes"
        rows={recipes}
        describe={(recipe) => `${(recipe as Recipe).name} · ${stamp(recipe.updatedAt)}`}
        busy={busy}
        onCreate={() =>
          run('Create recipe', () =>
            createRecipe({
              name: `Test Recipe ${shortId(nowIso())}`,
              beanId: newestLive(beans)?.id ?? null,
              method: BREW_METHODS[0],
              doseG: 18,
              waterG: 270,
            })
          )
        }
        onUpdate={() => {
          const target = newestLive(recipes);
          if (!target) return;
          void run('Update recipe', () => updateRecipe(target.id, { notes: `Touched ${nowIso()}` }));
        }}
        onDelete={() => {
          const target = newestLive(recipes);
          if (!target) return;
          void run('Delete recipe', () => softDeleteRecipe(target.id));
        }}
      />

      <View style={{ marginTop: layout.sectionGap }}>
        <SectionTitle title="Profile (local only)" />
        <Card>
          <Text style={[typography.body, { color: colors.textPrimary }]}>
            {profile ? `${profile.displayName} · ${profile.units} · ${profile.defaultMethod}` : 'No profile row yet'}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
            onboarded={String(profile?.onboarded ?? false)} · lastSyncedAt={profile?.lastSyncedAt ?? 'null'}
          </Text>
          <Divider style={{ marginVertical: spacing.md }} />
          <View style={[styles.row, { gap: spacing.md }]}>
            <Button
              title="Flip units"
              variant="secondary"
              onPress={() =>
                void run('Flip units', () =>
                  updateProfile({ units: profile?.units === 'metric' ? 'imperial' : 'metric' })
                )
              }
            />
            <Button
              title="Cycle method"
              variant="secondary"
              onPress={() => {
                const current = BREW_METHODS.indexOf(
                  (profile?.defaultMethod ?? 'v60') as (typeof BREW_METHODS)[number]
                );
                const next = BREW_METHODS[(current + 1) % BREW_METHODS.length];
                void run('Cycle method', () => updateProfile({ defaultMethod: next }));
              }}
            />
          </View>
        </Card>
      </View>

      <BottomSheet
        visible={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Clear all data?"
      >
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
          Hard-deletes every local row, including tombstones. Sige ba?
        </Text>
        <Button
          title="Clear everything"
          variant="danger"
          fullWidth
          onPress={() => {
            setConfirmClearOpen(false);
            void run('Clear all', clearAllData);
          }}
        />
      </BottomSheet>
    </Screen>
  );
}

interface TableSectionProps {
  title: string;
  rows: readonly AnyRow[] | undefined;
  describe: (row: AnyRow) => string;
  busy: string | null;
  onCreate: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

function TableSection({
  title,
  rows,
  describe,
  busy,
  onCreate,
  onUpdate,
  onDelete,
}: TableSectionProps): React.JSX.Element {
  const { colors, typography, spacing, layout } = useTheme();
  const preview = (rows ?? []).slice(0, PREVIEW_ROWS);

  return (
    <View style={{ marginTop: layout.sectionGap }}>
      <SectionTitle title={title} />
      <View style={[styles.row, { gap: spacing.md, marginBottom: spacing.md }]}>
        <Button title="Create" onPress={onCreate} disabled={busy != null} />
        <Button title="Update" variant="secondary" onPress={onUpdate} disabled={busy != null} />
        <Button title="Delete" variant="ghost" onPress={onDelete} disabled={busy != null} />
      </View>
      <Card>
        {preview.length === 0 ? (
          <Text style={[typography.caption, { color: colors.textMuted }]}>No rows</Text>
        ) : (
          preview.map((row, index) => (
            <View key={row.id}>
              {index > 0 ? <Divider style={{ marginVertical: spacing.sm }} /> : null}
              <Text style={[typography.caption, { color: colors.textPrimary }]} numberOfLines={1}>
                {shortId(row.id)} · {describe(row)}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                deleted_at: {row.deletedAt ?? 'null'}
              </Text>
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
