/**
 * (tabs)/beans.tsx — Bean Library, SCREENS.md §4.1.
 *
 * A card per bag with its freshness pill, plus the Active / Finished segmented
 * control. Unlike brews, `ListBeansOptions` has no `search` field, so the text filter
 * runs in the screen over the already-loaded rows — a bean library is small enough
 * that this stays cheap, and it avoids widening the query API for one caller.
 *
 * Tapping a card is inert until `bean/[id].tsx` lands in Phase 3.
 */
import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';

import { useBeanList } from '@/features/beans/queries';
import { useTheme } from '@/theme/useTheme';
import { EmptyState, Screen, SearchInput, Segmented } from '@/components/ui';
import { BeanCard } from '@/components/BeanCard';

type BagFilter = 'active' | 'finished';

const FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'finished', label: 'Finished' },
] as const satisfies readonly { value: BagFilter; label: string }[];

export default function BeanListScreen(): React.JSX.Element {
  const { spacing, layout } = useTheme();

  const [filter, setFilter] = useState<BagFilter>('active');
  const [search, setSearch] = useState('');

  const { data: beans } = useBeanList({ finished: filter === 'finished' });

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return beans ?? [];

    return (beans ?? []).filter((bean) =>
      [bean.name, bean.roaster, bean.origin]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term))
    );
  }, [beans, search]);

  const emptyMessage = search.trim()
    ? 'Walang nahanap'
    : filter === 'finished'
      ? 'No finished bags yet'
      : 'Add your first bag';

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg }}>
        <Segmented options={FILTERS} value={filter} onChange={setFilter} />
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search beans…"
          style={{ marginTop: spacing.lg }}
        />
      </View>

      {visible.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(bean) => bean.id}
          renderItem={({ item }) => <BeanCard bean={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: layout.sectionGap, paddingBottom: spacing.xxxl, gap: spacing.md }}
        />
      )}
    </Screen>
  );
}
