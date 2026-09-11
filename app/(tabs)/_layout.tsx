import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Home, Laugh, PawPrint, Trophy } from 'lucide-react-native';
import { COLORS, FONTS } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/hooks/useTranslation';

type VisibleTab = 'home' | 'pets' | 'memes' | 'profile';

const TAB_ICONS = {
  home: Home,
  pets: PawPrint,
  memes: Laugh,
  profile: Trophy,
};

function TabIcon({ name, focused }: { name: VisibleTab; focused: boolean }) {
  const { colors } = useTheme();
  const Icon = TAB_ICONS[name] as any;

  return (
    <View
      style={[
        styles.iconWrap,
        focused && styles.iconWrapActive,
        focused && { borderColor: colors.surface },
      ]}
    >
      <Icon
        size={focused ? 24 : 22}
        color={focused ? '#FFFFFF' : colors.textMuted}
        strokeWidth={focused ? 2.8 : 2.3}
      />
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ],
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t.tabs.home,
            tabBarAccessibilityLabel: t.tabs.home,
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="pets"
          options={{
            title: t.tabs.pets,
            tabBarAccessibilityLabel: t.tabs.pets,
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="pets" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="memes"
          options={{
            title: t.tabs.memes,
            tabBarAccessibilityLabel: t.tabs.memes,
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="memes" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t.tabs.profile,
            tabBarAccessibilityLabel: t.tabs.profile,
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon name="profile" focused={focused} />,
          }}
        />

        <Tabs.Screen name="analyzer" options={{ href: null }} />
        <Tabs.Screen name="faq" options={{ href: null }} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    height: 82,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    elevation: 18,
    shadowColor: '#33275A',
    shadowOffset: { width: 0, height: -7 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  tabItem: {
    paddingHorizontal: 2,
  },
  tabLabel: {
    fontFamily: FONTS.family.display,
    fontSize: 11,
    fontWeight: FONTS.weights.black,
    marginTop: 3,
  },
  iconWrap: {
    width: 46,
    height: 38,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  iconWrapActive: {
    backgroundColor: COLORS.primary,
    transform: [{ translateY: -4 }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
