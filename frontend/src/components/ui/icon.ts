/**
 * Shared prop type for accepting a Lucide icon *component* (not an already-rendered
 * element) so primitives can control size/color/strokeWidth themselves per DESIGN.md §4
 * ("stroke width 1.8, size 22–24 in nav/lists, 18 inline... ink-600 default, green-800
 * active, white on green"). `lucide-react-native` doesn't publicly export its
 * `LucideIcon` component type, so this is a structural stand-in.
 */
import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

export type IconComponent = ComponentType<
  SvgProps & { size?: number | string; strokeWidth?: number | string }
>;
