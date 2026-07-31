/**
 * (tabs)/index.tsx — Dashboard, SCREENS.md §2.1.
 *
 * Greeting, a hero card for today's brew, a freshness-alert strip, quick-repeat
 * recipes and a "this week" stat row. Routing only (STRUCTURE.md rule 1): every
 * visual comes from `components/ui` and every read goes through a feature's
 * `queries.ts`.
 *
 * Navigation targets that belong to Phase 3 (brew/new, brew/[id], recipes) are not
 * wired yet — expo-router runs with typedRoutes, so a link to a route that doesn't
 * exist wouldn't compile. Those taps are inert until the screens land.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Wrench } from 'lucide-react-native';

import { BREW_METHOD_LABELS } from '@/db/schema';
import { useBeanList } from '@/features/beans/queries';
import { daysOffRoast, freshnessOf } from '@/features/beans/freshness';
import { useBrewsToday } from '@/features/brews/queries';
import { useProfile } from '@/features/profile/queries';
import { useTopRecipes } from '@/features/recipes/queries';
import { useThisWeekSummary } from '@/features/stats/queries';
import { formatRating, formatRatio } from '@/lib/format';
import { useTheme } from '@/theme/useTheme';
import {
  Card,
  EmptyState,
  FreshnessPill,
  IconBadge,
  ListRow,
  Screen,
  SectionTitle,
  StatChip,
} from '@/components/ui';
import { methodIcon } from '@/components/methodIcon';

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardScreen(): React.JSX.Element {
  const { colors, typography, spacing, layout, hitSlop } = useTheme();
  const router = useRouter();

  const { data: profileRows } = useProfile();
  const { data: beans } = useBeanList();
  const { data: todaysBrews } = useBrewsToday();
  const { data: recipes } = useTopRecipes(3);
  const { data: week } = useThisWeekSummary();

  const displayName = profileRows?.[0]?.displayName ?? 'YENN';
  const todaysBrew = todaysBrews?.[0];

  // SCREENS.md §2.1: "Sagada beans — 21 days off roast." Only bags past their prime
  // are worth nagging about, so fresh ones are filtered out.
  const alerts = (beans ?? []).filter((bean) => {
    if (bean.isFinished) return false;
    const state = freshnessOf(bean.roastDate);
    return state === 'peak' || state === 'fading';
  });

  const isEmpty = (beans?.length ?? 0) === 0 && (todaysBrews?.length ?? 0) === 0 && (week?.count ?? 0) === 0;

  return (
    <Screen scroll contentStyle={{ paddingBottom: spacing.xxxl }}>
      <View style={[styles.greetingRow, { paddingVertical: spacing.lg }]}>
        <View style={styles.greetingText}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {greetingFor(new Date().getHours())},
          </Text>
          <Text style={[typography.display, { color: colors.textPrimary }]}>{displayName}</Text>
        </View>
        {__DEV__ ? (
          <Pressable
            onPress={() => router.push('/dev')}
            hitSlop={hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Open developer tools"
          >
            <Wrench size={22} color={colors.textSecondary} strokeWidth={1.8} />
          </Pressable>
        ) : null}
      </View>

      {isEmpty ? (
        <EmptyState message="Your journal is empty. First brew tayo?" />
      ) : (
        <>
          <Card variant="hero">
            <Text style={[typography.caption, { color: colors.onPrimaryMuted }]}>Today&apos;s brew</Text>
            {todaysBrew ? (
              <>
                <Text style={[typography.h1, { color: colors.onPrimary, marginTop: spacing.xs }]}>
                  {BREW_METHOD_LABELS[todaysBrew.method as keyof typeof BREW_METHOD_LABELS] ?? todaysBrew.method}
                </Text>
                <View style={[styles.heroMeta, { marginTop: spacing.sm, gap: spacing.md }]}>
                  {todaysBrew.rating != null ? (
                    <Text style={[typography.stat, { color: colors.onPrimary }]}>
                      {formatRating(todaysBrew.rating)}★
                    </Text>
                  ) : null}
                  {formatRatio(todaysBrew.doseG, todaysBrew.waterG) ? (
                    <Text style={[typography.body, { color: colors.onPrimaryMuted }]}>
                      {formatRatio(todaysBrew.doseG, todaysBrew.waterG)}
                    </Text>
                  ) : null}
                </View>
              </>
            ) : (
              <Text style={[typography.h1, { color: colors.onPrimary, marginTop: spacing.xs }]}>
                Wala ka pang timpla today ☕
              </Text>
            )}
          </Card>

          {week ? (
            <View style={{ marginTop: layout.sectionGap }}>
              <SectionTitle title="This week" />
              <View style={[styles.statRow, { gap: spacing.md }]}>
                <StatChip value={week.count} label="brews" />
                <StatChip value={formatRating(week.avgRating) ?? '—'} label="avg rating" />
                <StatChip value={week.streak} label="day streak" />
              </View>
            </View>
          ) : null}

          {alerts.length > 0 ? (
            <View style={{ marginTop: layout.sectionGap }}>
              <SectionTitle title="Bantay beans" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.md, paddingRight: layout.screenPaddingX }}
              >
                {alerts.map((bean) => {
                  const days = daysOffRoast(bean.roastDate);
                  const state = freshnessOf(bean.roastDate);

                  return (
                    <Card key={bean.id} style={styles.alertCard}>
                      <Text style={[typography.h2, { color: colors.textPrimary }]} numberOfLines={1}>
                        {bean.name}
                      </Text>
                      <Text
                        style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}
                        numberOfLines={1}
                      >
                        {days} days off roast
                      </Text>
                      {state ? <FreshnessPill state={state} style={{ marginTop: spacing.sm }} /> : null}
                    </Card>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {(recipes?.length ?? 0) > 0 ? (
            <View style={{ marginTop: layout.sectionGap }}>
              <SectionTitle title="Mga Timpla Ko" />
              {recipes?.map((recipe) => (
                <ListRow
                  key={recipe.id}
                  title={recipe.name}
                  caption={`${
                    BREW_METHOD_LABELS[recipe.method as keyof typeof BREW_METHOD_LABELS] ?? recipe.method
                  } · used ${recipe.timesUsed}×`}
                  leading={<IconBadge icon={methodIcon(recipe.method)} />}
                  trailing={
                    formatRatio(recipe.doseG, recipe.waterG) ? (
                      <Text style={[typography.body, { color: colors.textMuted }]}>
                        {formatRatio(recipe.doseG, recipe.waterG)}
                      </Text>
                    ) : undefined
                  }
                />
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    flex: 1,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statRow: {
    flexDirection: 'row',
  },
  alertCard: {
    width: 180,
  },
});
