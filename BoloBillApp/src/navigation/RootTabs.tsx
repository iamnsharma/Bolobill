import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Image} from 'react-native';
import {useTranslation} from 'react-i18next';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { VoiceInvoiceScreen } from '../screens/VoiceInvoiceScreen';
import { T } from '../lang/constants';
import { useThemeStore } from '../stores';
import homeIcon from '../assets/icons/home.png';
import voiceIcon from '../assets/icons/voice.png';
import settingsIcon from '../assets/icons/settings.png';

const Tab = createBottomTabNavigator();
const TAB_ICON_SIZE = 22;
const tabIconBaseStyle = {width: TAB_ICON_SIZE, height: TAB_ICON_SIZE};

export const RootTabs = () => {
  const {t} = useTranslation();
  const theme = useThemeStore(s => s.theme);
  const activeTintStyle = {tintColor: theme.colors.primary};
  const inactiveTintStyle = {tintColor: theme.colors.textSecondary};

  return (
    <Tab.Navigator
      detachInactiveScreens={false}
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        sceneStyle: {backgroundColor: theme.colors.background},
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarIconStyle: tabIconBaseStyle,
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ focused }) => {
          const iconSource =
            route.name === 'Home'
              ? homeIcon
              : route.name === 'Voice'
              ? voiceIcon
              : settingsIcon;
          return (
            <Image
              source={iconSource}
              style={[
                tabIconBaseStyle,
                focused ? activeTintStyle : inactiveTintStyle,
              ]}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t(T.COMMON_HOME) }}
      />
      <Tab.Screen
        name="Voice"
        component={VoiceInvoiceScreen}
        options={{ title: t(T.VOICE_TITLE) }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t(T.COMMON_SETTINGS) }}
      />
    </Tab.Navigator>
  );
};
