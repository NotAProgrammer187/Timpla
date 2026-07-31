/**
 * methodIcon.ts — maps a brew method to its Lucide icon (DESIGN.md §4 tier 1:
 * Lucide for all functional UI). Shared by BrewCard, the dashboard hero and the
 * method picker so a given method always reads the same way.
 */
import { Coffee, CupSoda, Droplet, FlaskConical, Snowflake, Thermometer, Zap } from 'lucide-react-native';

import type { BrewMethod } from '@/db/schema';
import type { IconComponent } from '@/components/ui';

const ICONS: Record<BrewMethod, IconComponent> = {
  v60: Droplet,
  french_press: FlaskConical,
  moka: Thermometer,
  espresso: Zap,
  drip: Coffee,
  aeropress: CupSoda,
  cold_brew: Snowflake,
  other: Coffee,
};

/**
 * `brews.method` is a plain text column (API.md §1.5 keeps the enum in application
 * code, not the schema), so this takes a string and falls back rather than assuming
 * the value is a known method.
 */
export function methodIcon(method: string): IconComponent {
  return ICONS[method as BrewMethod] ?? Coffee;
}
