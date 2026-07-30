/**
 * BottomSheet.tsx — DESIGN.md §5: "Radius 24 top corners, drag handle 36×4
 * line-200, used for pickers and confirmations." RN `Modal`-based, backdrop tap to
 * dismiss, slide-up animation (native Modal `animationType="slide"`), safe-area aware.
 */
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/useTheme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps): React.JSX.Element {
  const { colors, radius, typography, spacing } = useTheme();

  const sheetStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.container}>
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
        />
        <SafeAreaView edges={['bottom']} style={sheetStyle}>
          <View style={[styles.handleRow, { paddingTop: spacing.sm }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>
          {title ? (
            <Text
              style={[
                typography.h1,
                { color: colors.textPrimary, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
              ]}
            >
              {title}
            </Text>
          ) : null}
          <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>{children}</View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  handleRow: {
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
});
