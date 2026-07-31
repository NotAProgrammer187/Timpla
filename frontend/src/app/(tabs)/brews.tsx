/**
 * (tabs)/brews.tsx — Brew Log, SCREENS.md §3.1.
 *
 * Reverse-chronological list with a search field and filter chips (method, rating
 * ≥4, this month). Every filter maps to a field `ListBrewsOptions` already supports,
 * so the filtering happens in SQL rather than in the screen.
 *
 * Tapping a card is inert until `brew/[id].tsx` lands in Phase 3.
 */
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { BREW_METHODS, BREW_METHOD_LABELS, type BrewMethod } from '@/db/schema';
import { useBeanList } from '@/features/beans/queries';
import { useBrewList } from '@/features/brews/queries';
import { startOfMonthIso } from '@/lib/dates';
import { useTheme } from '@/theme/useTheme';
import { BottomSheet, Chip, EmptyState, ListRow, Screen, SearchInput } from '@/components/ui';
import { BrewCard } from '@/components/BrewCard';

const MIN_GOOD_RATING = 4;

export default function BrewListScreen(): React.JSX.Element {
  const { spacing, layout } = useTheme();

  const [search, setSearch] = useState('');
  const [method, setMethod] = useState<BrewMethod | undefined>(undefined);
  const [goodOnly, setGoodOnly] = useState(false);
  const [thisMonth, setThisMonth] = useState(false);
  const [methodSheetOpen, setMethodSheetOpen] = useState(false);

  const since = thisMonth ? startOfMonthIso() : undefined;

  const { data: brews } = useBrewList({
    search: search.trim() || undefined,
    method,
    minRating: goodOnly ? MIN_GOOD_RATING : undefined,
    since,
  });
  const { data: beans } = useBeanList({ withDeleted: true });

  // `bean_id` is a plain string, not an FK (API.md §1.3) — resolve names in app code.
  const beanNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const bean of beans ?? []) map.set(bean.id, bean.name);
    return map;
  }, [beans]);

  const hasFilters = Boolean(search.trim() || method || goodOnly || thisMonth);
  const isEmpty = (brews?.length ?? 0) === 0;

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg }}>
        <SearchInput value={search} onChangeText={setSearch} placeholder="Search brews…" />

        <View style={[styles.filterRow, { marginTop: spacing.lg, gap: spacing.sm }]}>
          <Chip
            label={method ? BREW_METHOD_LABELS[method] : 'Method'}
            selected={Boolean(method)}
            onPress={() => setMethodSheetOpen(true)}
          />
          <Chip label="4★ & up" selected={goodOnly} onPress={() => setGoodOnly((v) => !v)} />
          <Chip label="This month" selected={thisMonth} onPress={() => setThisMonth((v) => !v)} />
        </View>
      </View>

      {isEmpty ? (
        <EmptyState message={hasFilters ? 'Walang nahanap' : 'First brew tayo?'} />
      ) : (
        <FlatList
          data={brews}
          keyExtractor={(brew) => brew.id}
          renderItem={({ item }) => (
            <BrewCard brew={item} beanName={item.beanId ? beanNames.get(item.beanId) : undefined} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: layout.sectionGap, paddingBottom: spacing.xxxl, gap: spacing.md }}
        />
      )}

      <BottomSheet visible={methodSheetOpen} onClose={() => setMethodSheetOpen(false)} title="Method">
        <ListRow
          title="All methods"
          onPress={() => {
            setMethod(undefined);
            setMethodSheetOpen(false);
          }}
        />
        {BREW_METHODS.map((value) => (
          <ListRow
            key={value}
            title={BREW_METHOD_LABELS[value]}
            onPress={() => {
              setMethod(value);
              setMethodSheetOpen(false);
            }}
          />
        ))}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
