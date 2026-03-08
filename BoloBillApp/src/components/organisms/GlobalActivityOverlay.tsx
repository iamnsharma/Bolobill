import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useIsFetching, useIsMutating} from '@tanstack/react-query';
import {useAuthStore, useThemeStore} from '../../stores';

export const GlobalActivityOverlay = () => {
  const theme = useThemeStore(s => s.theme);
  const isAuthLoading = useAuthStore(s => s.isLoading);
  const fetchingCount = useIsFetching();
  const mutatingCount = useIsMutating();
  const isVisible = isAuthLoading || fetchingCount > 0 || mutatingCount > 0;

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={[styles.loaderCard, {backgroundColor: theme.colors.surface}]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 999,
  },
  loaderCard: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
});
