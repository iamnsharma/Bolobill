/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (Component) => Component,
    },
    createAnimatedComponent: (Component) => Component,
    useSharedValue: () => ({value: 0}),
    useAnimatedStyle: () => ({}),
    withTiming: (v) => v,
    Easing: {linear: jest.fn()},
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const {View} = require('react-native');
  const BottomSheet = React.forwardRef(({children}, _ref) => (
    <View>{children}</View>
  ));
  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetView: ({children}) => <View>{children}</View>,
    BottomSheetBackdrop: () => null,
  };
});

jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const {Text} = require('react-native');
  return ({name}) => <Text>{name}</Text>;
});

jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      getString: jest.fn(),
      getBoolean: jest.fn(),
      delete: jest.fn(),
    })),
  };
});
