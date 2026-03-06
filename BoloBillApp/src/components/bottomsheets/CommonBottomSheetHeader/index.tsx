import React, {useMemo} from 'react';
import {Pressable, View} from 'react-native';
import {BaseText} from '../../atoms';
import {useThemeStore} from '../../../stores';
import {getStyles} from './style';
import {t} from '../../../lang';
import {T} from '../../../lang/constants';

type Props = {
  title: string;
  onClose: () => void;
};

export const CommonBottomSheetHeader = ({title, onClose}: Props) => {
  const theme = useThemeStore(s => s.theme);
  const styles = useMemo(() => getStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <BaseText style={styles.title}>{title}</BaseText>
      <Pressable onPress={onClose}>
        <BaseText style={styles.close}>{t(T.COMMON_CLOSE)}</BaseText>
      </Pressable>
    </View>
  );
};
