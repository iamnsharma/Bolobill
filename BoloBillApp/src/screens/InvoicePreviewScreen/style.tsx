import {StyleSheet} from 'react-native';
import {AppTheme} from '../../styling/globalStyles/theme';

export const getStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 8,
      gap: 10,
      paddingBottom: 28,
    },
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
      gap: 6,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    headerTextWrap: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    subTitle: {
      color: theme.colors.textSecondary,
    },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    badgeVerified: {
      backgroundColor: theme.colors.success,
    },
    badgePersonal: {
      backgroundColor: theme.colors.warning,
    },
    badgeText: {
      color: theme.colors.surface,
      fontWeight: '700',
      fontSize: 12,
    },
    inlineActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    iconActionBtn: {
      width: 34,
      height: 34,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIcon: {
      width: 16,
      height: 16,
      tintColor: theme.colors.primary,
    },
    whatsappBtn: {
      fontSize: 10,
      fontWeight: '600',
      color: '#25D366',
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 12,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    transcriptText: {
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    itemCard: {
      gap: 6,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 10,
      padding: 11,
      backgroundColor: theme.colors.background,
    },
    itemTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    itemMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    itemEditRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    itemEditField: {
      flex: 1,
    },
    itemMeta: {
      color: theme.colors.textSecondary,
      fontSize: 13,
    },
    itemPrice: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    totalCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '700',
    },
    totalValue: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.primary,
    },
  });
