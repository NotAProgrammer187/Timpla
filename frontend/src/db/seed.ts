// Dev-only demo fixtures. seedDemoData() is idempotent (no-op if any bean already exists)
// and only ever runs in __DEV__. clearAllData() backs the Settings "erase all data" action
// and is safe to call in any build.
import { sql } from 'drizzle-orm';

import { newId } from '@/lib/uuid';

import { db } from './client';
import { BREW_METHODS, beans, brews, profiles, recipes, type BrewMethod, type NewBean, type NewBrew } from './schema';

function isoDaysAgo(days: number, hour = 7, minute = 30): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, Math.floor(Math.random() * 60), 0);
  return d.toISOString();
}

function dateOnlyDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Inserts realistic Filipino-coffee-scene demo data: beans across all three freshness states
 * (fresh/peak/fading, per SCREENS.md §4.1), ~25 brews spread over the last 8 weeks, and 3
 * recipes. No-op if any bean already exists. Dev builds only.
 */
export async function seedDemoData(): Promise<void> {
  if (!__DEV__) return;

  const existing = await db.select({ count: sql<number>`count(*)` }).from(beans);
  if ((existing[0]?.count ?? 0) > 0) return;

  const now = new Date().toISOString();

  // Ensure the local profile row exists (API.md §1.6 defaults).
  await db
    .insert(profiles)
    .values({
      id: 'local',
      displayName: 'YENN',
      units: 'metric',
      defaultMethod: 'v60',
      theme: 'system',
      onboarded: true,
      lastSyncedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();

  const beanSeeds: (NewBean & { id: string })[] = [
    {
      id: newId(),
      name: 'Sagada Arabica',
      roaster: 'Kalsada Coffee',
      origin: 'Sagada, Mountain Province',
      process: 'washed',
      roastLevel: 'medium_light',
      roastDate: dateOnlyDaysAgo(5), // fresh (0-14d)
      grams: 250,
      price: 480,
      currency: 'PHP',
      boughtAt: 'Baguio City Public Market',
      notes: 'Bright, red apple acidity, honey-sweet finish.',
      isFinished: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId(),
      name: 'Benguet Heirloom',
      roaster: 'Karag Coffee',
      origin: 'Benguet',
      process: 'honey',
      roastLevel: 'medium',
      roastDate: dateOnlyDaysAgo(20), // peak (15-30d)
      grams: 250,
      price: 420,
      currency: 'PHP',
      boughtAt: 'Karag Coffee, Baguio',
      notes: 'Brown sugar, orange zest, medium body.',
      isFinished: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId(),
      name: 'Kalinga Arabica',
      roaster: 'Kalinga Cordillera Coffee',
      origin: 'Kalinga',
      process: 'natural',
      roastLevel: 'medium_dark',
      roastDate: dateOnlyDaysAgo(42), // fading (31d+)
      grams: 200,
      price: 380,
      currency: 'PHP',
      boughtAt: 'Tabuk trade fair',
      notes: 'Dried berries, molasses, low acidity.',
      isFinished: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId(),
      name: 'Mt. Apo Highland',
      roaster: 'Bukid Kape',
      origin: 'Kidapawan, Davao',
      process: 'washed',
      roastLevel: 'light',
      roastDate: dateOnlyDaysAgo(65), // fading + finished bag
      grams: 250,
      price: 460,
      currency: 'PHP',
      boughtAt: 'Davao Coffee Fest',
      notes: 'Jasmine, lemongrass, tea-like body.',
      isFinished: true,
      finishedAt: isoDaysAgo(3),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId(),
      name: 'Cerrado Brazil',
      roaster: 'Yardstick',
      origin: 'Cerrado, Brazil',
      process: 'natural',
      roastLevel: 'medium',
      roastDate: dateOnlyDaysAgo(26), // peak (15-30d)
      grams: 250,
      price: 395,
      currency: 'PHP',
      boughtAt: 'Yardstick Manila',
      notes: 'Chocolate, hazelnut, low-key sweetness — the "contrast" bag.',
      isFinished: false,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.insert(beans).values(beanSeeds);

  const notesBank = [
    'Bloomed a bit too long, still tasty.',
    'Nice and balanced, will repeat this ratio.',
    'A little over-extracted, bitter finish.',
    'Best cup this week.',
    'Tried a coarser grind, smoother body.',
    'Rushed the pour, uneven extraction.',
    '',
    'Great with breakfast.',
    'Needs a finer grind next time.',
    '',
  ];

  const grindBank = ['Comandante 22', '1Zpresso K-Max 2.5', 'Baratza 18', 'Timemore C2 22', 'Fellow Ode 6'];

  const brewSeeds: (NewBrew & { id: string })[] = [];
  const brewCount = 25;

  for (let i = 0; i < brewCount; i += 1) {
    const daysAgo = Math.floor((i / brewCount) * 56) + Math.floor(Math.random() * 2); // spread across ~8 weeks
    const method: BrewMethod = pick(BREW_METHODS);
    const bean = pick(beanSeeds);
    const dose = Math.round((14 + Math.random() * 8) * 10) / 10;
    const ratio = method === 'espresso' ? 2 : 14 + Math.random() * 3;
    const water = Math.round(dose * ratio);
    const rating = Math.round((3 + Math.random() * 4) * 2) / 2; // 3.0 - 5.0 in 0.5 steps

    brewSeeds.push({
      id: newId(),
      beanId: bean.id,
      method,
      doseG: dose,
      waterG: water,
      tempC: method === 'cold_brew' ? 22 : Math.round(88 + Math.random() * 10),
      grind: pick(grindBank),
      timeSeconds: method === 'cold_brew' ? 43200 : Math.round(120 + Math.random() * 180),
      rating,
      notes: pick(notesBank) || null,
      brewedAt: isoDaysAgo(daysAgo, 6 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60)),
      createdAt: now,
      updatedAt: now,
    });
  }

  // A brew logged today so the dashboard hero card has something to show out of the box.
  const todaysBean = beanSeeds[0];
  brewSeeds.push({
    id: newId(),
    beanId: todaysBean.id,
    method: 'v60',
    doseG: 18,
    waterG: 270,
    tempC: 93,
    grind: 'Comandante 22',
    timeSeconds: 195,
    rating: 4.5,
    notes: "Today's cup — clean and sweet.",
    brewedAt: isoDaysAgo(0, new Date().getHours(), new Date().getMinutes()),
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(brews).values(brewSeeds);

  const bestV60 = brewSeeds.find((b) => b.method === 'v60') ?? brewSeeds[0];
  const bestFrenchPress = brewSeeds.find((b) => b.method === 'french_press') ?? brewSeeds[1];
  const bestAeropress = brewSeeds.find((b) => b.method === 'aeropress') ?? brewSeeds[2];

  await db.insert(recipes).values([
    {
      id: newId(),
      name: 'Sunday V60',
      beanId: bestV60.beanId,
      method: 'v60',
      doseG: bestV60.doseG,
      waterG: bestV60.waterG,
      tempC: bestV60.tempC,
      grind: bestV60.grind,
      timeSeconds: bestV60.timeSeconds,
      notes: 'Slow Sunday-morning pour, three pours after bloom.',
      sourceBrewId: bestV60.id,
      timesUsed: 6,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId(),
      name: 'Quick French Press',
      beanId: bestFrenchPress.beanId,
      method: 'french_press',
      doseG: bestFrenchPress.doseG,
      waterG: bestFrenchPress.waterG,
      tempC: bestFrenchPress.tempC,
      grind: bestFrenchPress.grind,
      timeSeconds: bestFrenchPress.timeSeconds,
      notes: 'Weekday go-to, 4 minute steep.',
      sourceBrewId: bestFrenchPress.id,
      timesUsed: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId(),
      name: 'Travel AeroPress',
      beanId: bestAeropress.beanId,
      method: 'aeropress',
      doseG: bestAeropress.doseG,
      waterG: bestAeropress.waterG,
      tempC: bestAeropress.tempC,
      grind: bestAeropress.grind,
      timeSeconds: bestAeropress.timeSeconds,
      notes: 'Inverted method, good in a hurry.',
      sourceBrewId: bestAeropress.id,
      timesUsed: 1,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

/** Hard-clears every local table. Backs the Settings "erase all data" action. */
export async function clearAllData(): Promise<void> {
  await db.delete(recipes);
  await db.delete(brews);
  await db.delete(beans);
  await db.delete(profiles);
}
