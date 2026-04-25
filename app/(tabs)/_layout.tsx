import { Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';
import { useCart } from '../../lib/cart';
import { useUI } from '../../lib/ui';
import { Logo } from '../../components/Logo';

function HeaderLeft() {
  const openDrawer = useUI((s) => s.openDrawer);
  return (
    <Pressable
      onPress={openDrawer}
      hitSlop={10}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        marginLeft: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : 'transparent',
      })}
    >
      <Menu color="#FFFFFF" size={24} />
    </Pressable>
  );
}

function HeaderRight() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/(tabs)/search')}
      hitSlop={10}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        marginRight: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        backgroundColor: pressed ? 'rgba(255,255,255,0.2)' : 'transparent',
      })}
    >
      <Search color="#FFFFFF" size={22} />
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
        tabBarStyle: {
          paddingTop: 6,
          height: 62,
          paddingBottom: 10,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8EAF0',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Rechercher',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          // Hide right search icon on the search tab itself
          headerRight: () => null,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <ShoppingCart color={color} size={size} />
              {count > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: '#EF4444',
                    borderRadius: 9,
                    minWidth: 18,
                    height: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{count}</Text>
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
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
