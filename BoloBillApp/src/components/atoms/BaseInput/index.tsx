import React, {useMemo} from 'react';
import {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {useThemeStore} from '../../../stores';
import {BaseText} from '../BaseText';
import {getStyles} from './style';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export const BaseInput = ({
  label,
  error,
  containerStyle,
  inputStyle,
  ...props
}: Props) => {
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <BaseText>{label}</BaseText> : null}
      <TextInput
        placeholderTextColor={theme.colors.textSecondary}
        style={[styles.input, inputStyle]}
        {...props}
      />
      {error ? <BaseText style={styles.error}>{error}</BaseText> : null}
    </View>
  );
};
