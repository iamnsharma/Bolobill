import React, {ReactNode, useMemo} from 'react';
import {StyleProp, Text, TextStyle} from 'react-native';
import {useThemeStore} from '../../../stores';
import {getStyles} from './style';

type Props = {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
};

export const BaseText = ({children, style}: Props) => {
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);

  return <Text style={[styles.text, style]}>{children}</Text>;
};
