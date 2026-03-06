import React, {ReactNode, useMemo} from 'react';
import {ActivityIndicator, Pressable, StyleProp, ViewStyle} from 'react-native';
import {BaseText} from '../BaseText';
import {useThemeStore} from '../../../stores';
import {getStyles} from './style';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  rightIcon?: ReactNode;
};

export const BaseButton = ({
  title,
  onPress,
  disabled,
  loading,
  style,
  rightIcon,
}: Props) => {
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, isDisabled && styles.disabled, style]}>
      {loading ? (
        <ActivityIndicator color={theme.colors.surface} />
      ) : (
        <>
          <BaseText style={styles.title}>{title}</BaseText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
};
