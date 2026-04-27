import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react-native';
import { View, Text, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../lib/cart';
import { useUI } from '../../lib/ui';
import { Logo } from '../../components/Logo';

function HeaderLeft() {
  const openDrawer = useUI((s) => s.openDrawer);
  return (
    <Pressable
      onPress={openDrawer}
      hitSlop={12}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        marginLeft: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: pressed ? 'rgba(255,255,255,0.22)' : 'transparent',
      })}
    >
      <Menu color="#FFFFFF" size={24} strokeWidth={2.5} />
    </Pressable>
  );
}

function HeaderRight() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/(tabs)/search')}
      hitSlop={12}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: pressed ? 'rgba(255,255,255,0.22)' : 'transparent',
      })}
    >
      <Search color="#FFFFFF" size={22} strokeWidth={2.5} />
    </Pressable>
  );
}

function HeaderTitle() {
  return (
    <View style={{ alignItems: 'center' }}>
      <Logo size="md" color="light" />
    </View>
  );
}

export default function TabLayout() {
  const count = useCart((s) => s.count());
  const insets = useSafeAreaInsets();

  // Adapt to system navigation bar (gesture-bar on Android, home indicator on iOS)
  const tabBarPaddingBottom = Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + tabBarPaddingBottom;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#F47B20' },
        headerTintColor: '#FFFFFF',
        headerTitleAlign: 'center',
        headerTitle: () => <HeaderTitle />,
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        headerShadowVisible: false,
        tabBarActiveTintColor: '#F47B20',
        tabBarInactiveTintColor: '#6A7189',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: -2,
        },
        tabBarStyle: {
          paddingTop: 8,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8EAF0',
          borderTopWidth: 1,
          // Soft shadow
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOpacity: 0.06,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: -2 },
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Rechercher',
          tabBarIcon: ({ color, focused }) => (
            <Search color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />
          ),
          headerRight: () => null,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ position: 'relative' }}>
              <ShoppingCart color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />
              {count > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -5,
                    right: -9,
                    backgroundColor: '#E74C3C',
                    borderRadius: 10,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{count}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Compte',
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
