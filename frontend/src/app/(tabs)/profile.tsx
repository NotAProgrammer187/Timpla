/**
 * (tabs)/profile.tsx — My Stats, SCREENS.md §5.1.
 *
 * Profile header, a headline stat strip, and a "Most Brewed" row echoing Ombe's
 * "Most Ordered". The full stats treatment — brews/month bar chart, avg-rating
 * trend, favourite-method donut — is Phase 6; the rows linking to Settings, Stats
 * and Recipes are shown as pending until those routes exist in Phase 3.
 */
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bookmark, ChartNoAxesColumn, Settings, User, Wrench } from 'lucide-react-native';

import { BREW_METHOD_LABELS } from '@/db/schema';
import { useBeanList } from '@/features/beans/queries';
import { useBrewCount, useBrewList } from '@/features/brews/queries';
import { useProfile } from '@/features/profile/queries';
import { useCostPerCup, useFavoriteMethod } from '@/features/stats/queries';
import { formatMoney } from '@/lib/format';
import { useTheme } from '@/theme/useTheme';
import { Card, IconBadge, ListRow, Screen, SectionTitle, StatChip } from '@/components/ui';

/** How many bags to show in the "Most Brewed" strip. */
const MOST_BREWED_LIMIT = 5;

export default function ProfileScreen(): React.JSX.Element {
  const { colors, typography, spacing, layout } = useTheme();
  const router = useRouter();

  const { data: profileRows } = useProfile();
  const { data: brewCount } = useBrewCount();
  const { data: favorite } = useFavoriteMethod();
  const { data: costPerCup } = useCostPerCup();
  const { data: beans } = useBeanList({ withDeleted: true });
  const { data: brews } = useBrewList();

  const profile = profileRows?.[0];

  // Ranks bags by how often they've been brewed. Cheap enough over the loaded rows
  // that it doesn't warrant its own aggregate query.
  const mostBrewed = useMemo(() => {
    const counts = new Map<string, number>();
    for (const brew of brews ?? []) {
      if (brew.beanId) counts.set(brew.beanId, (counts.get(brew.beanId) ?? 0) + 1);
    }

    return (beans ?? [])
      .map((bean) => ({ bean, count: counts.get(bean.id) ?? 0 }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, MOST_BREWED_LIMIT);
  }, [beans, brews]);

  return (
    <Screen scroll contentStyle={{ paddingBottom: spacing.xxxl }}>
      <View style={[styles.header, { paddingVertical: spacing.xl, gap: spacing.lg }]}>
        <IconBadge icon={User} size={64} />
        <View style={styles.headerText}>
          <Text style={[typography.h1, { color: colors.textPrimary }]}>{profile?.displayName ?? 'YENN'}</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {profile?.units === 'imperial' ? 'Imperial units' : 'Metric units'} ·{' '}
            {BREW_METHOD_LABELS[profile?.defaultMethod as keyof typeof BREW_METHOD_LABELS] ?? 'V60'} by default
          </Text>
        </View>
      </View>

      <View style={[styles.statRow, { gap: spacing.md }]}>
        <StatChip value={brewCount ?? 0} label="total brews" />
        <StatChip
          value={
            favorite ? BREW_METHOD_LABELS[favorite.method as keyof typeof BREW_METHOD_LABELS] ?? favorite.method : '—'
          }
          label="favourite"
        />
        <StatChip value={formatMoney(costPerCup) ?? '—'} label="per cup" />
      </View>

      {mostBrewed.length > 0 ? (
        <View style={{ marginTop: layout.sectionGap }}>
          <SectionTitle title="Most Brewed" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.md, paddingRight: layout.screenPaddingX }}
          >
            {mostBrewed.map(({ bean, count }) => (
              <Card key={bean.id} style={styles.beanCard}>
                <Text style={[typography.h2, { color: colors.textPrimary }]} numberOfLines={1}>
                  {bean.name}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={1}>
                  {bean.roaster ?? bean.origin ?? '—'}
                </Text>
                <Text style={[typography.stat, { color: colors.primary, marginTop: spacing.sm }]}>
                  {count}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>
                  {count === 1 ? 'brew' : 'brews'}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={{ marginTop: layout.sectionGap }}>
        <SectionTitle title="More" />
        <ListRow title="Settings" leading={<IconBadge icon={Settings} />} trailing={<Pending />} />
        <ListRow title="Stats" leading={<IconBadge icon={ChartNoAxesColumn} />} trailing={<Pending />} />
        <ListRow title="Mga Timpla Ko" leading={<IconBadge icon={Bookmark} />} trailing={<Pending />} />
        {__DEV__ ? (
          <ListRow
            title="Developer tools"
            caption="Seed, inspect and edit local data"
            leading={<IconBadge icon={Wrench} />}
            chevron
            onPress={() => router.push('/dev')}
          />
        ) : null}
      </View>
    </Screen>
  );
}

/** Marks a row whose destination screen arrives in a later phase. */
function Pending(): React.JSX.Element {
  const { colors, typography } = useTheme();
  return <Text style={[typography.caption, { color: colors.textMuted }]}>Soon</Text>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
  },
  beanCard: {
    width: 150,
  },
});
