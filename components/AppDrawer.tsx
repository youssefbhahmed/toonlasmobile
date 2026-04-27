import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Modal,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Home,
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  User,
  LogOut,
  LayoutDashboard,
  Info,
  ChevronRight,
  HelpCircle,
  Phone,
  Smartphone,
  Shirt,
  Sofa,
  Sparkles,
  ShoppingBasket,
  Gamepad2,
  Dumbbell,
  BookOpen,
  Tag,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import { useUI } from '../lib/ui';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { Logo } from './Logo';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

const extra = (Constants.expoConfig?.extra ?? {}) as { webUrl?: string };

// Map category slug → lucide icon + tint color (much cleaner than product thumbs)
const CATEGORY_ICONS: Record<string, { Icon: any; tint: string; bg: string }> = {
  electronics: { Icon: Smartphone, tint: '#F47B20', bg: '#FEF5ED' },
  fashion: { Icon: Shirt, tint: '#E07A5F', bg: '#FDF4F1' },
  'home-kitchen': { Icon: Sofa, tint: '#1E3A5F', bg: '#EBF0F7' },
  beauty: { Icon: Sparkles, tint: '#C6593B', bg: '#FAE5DD' },
  grocery: { Icon: ShoppingBasket, tint: '#548268', bg: '#E0EDE6' },
  toys: { Icon: Gamepad2, tint: '#B24E0C', bg: '#FCE7D0' },
  sports: { Icon: Dumbbell, tint: '#2F4E80', bg: '#C6D3E4' },
  books: { Icon: BookOpen, tint: '#9B442D', bg: '#FAE5DD' },
};

export function AppDrawer() {
  const { drawerOpen, closeDrawer } = useUI();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const drawerWidth = Math.min(320, width * 0.84);
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug, image_url')
        .is('parent_id', null)
        .order('display_order');
      setCategories(data ?? []);
    })();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: drawerOpen ? 0 : -drawerWidth,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: drawerOpen ? 1 : 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerOpen, drawerWidth, overlayOpacity, translateX]);

  function navigate(path: string) {
    closeDrawer();
    setTimeout(() => router.push(path as any), 180);
  }

  function openAdminWeb() {
    const url = `${extra.webUrl ?? 'https://toonlas.shop'}/admin`;
    closeDrawer();
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Erreur', `Impossible d'ouvrir ${url}`);
    });
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0])
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <Modal
      visible={drawerOpen}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <View style={{ flex: 1 }}>
        <Animated.View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            opacity: overlayOpacity,
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={closeDrawer} />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: drawerWidth,
            backgroundColor: '#FFFFFF',
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOpacity: 0.25,
            shadowRadius: 16,
            shadowOffset: { width: 4, height: 0 },
            elevation: 16,
          }}
        >
          {/* HEADER */}
          <View
            style={{
              backgroundColor: '#F47B20',
              paddingTop: insets.top + 12,
              paddingBottom: 16,
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <Logo size="sm" color="light" />
              <Pressable
                onPress={closeDrawer}
                hitSlop={12}
                style={({ pressed }) => ({
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: pressed ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <X size={16} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </View>

            {user ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '900', color: '#F47B20' }}>
                    {initials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text
                      style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}
                      numberOfLines={1}
                    >
                      {profile?.full_name ?? 'Utilisateur'}
                    </Text>
                    {profile?.role === 'admin' && (
                      <View
                        style={{
                          backgroundColor: '#1E3A5F',
                          paddingHorizontal: 5,
                          paddingVertical: 1,
                          borderRadius: 3,
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontSize: 8,
                            fontWeight: '900',
                            letterSpacing: 0.5,
                          }}
                        >
                          ADMIN
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 1 }}
                    numberOfLines={1}
                  >
                    {user.email}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => navigate('/(auth)/login')}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: '#F47B20', fontWeight: '800', fontSize: 13 }}>
                    Connexion
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => navigate('/(auth)/register')}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: '#1E3A5F',
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                    Inscription
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* SCROLL */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 12 }}
            showsVerticalScrollIndicator={false}
          >
            {profile?.role === 'admin' && (
              <Pressable
                onPress={openAdminWeb}
                style={({ pressed }) => ({
                  marginHorizontal: 10,
                  marginTop: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: pressed ? '#FCE7D0' : '#FEF5ED',
                  borderRadius: 10,
                  borderLeftWidth: 3,
                  borderLeftColor: '#F47B20',
                })}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: '#F47B20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LayoutDashboard size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#1E3A5F' }}>
                    Tableau de bord admin
                  </Text>
                </View>
                <ChevronRight size={14} color="#F47B20" />
              </Pressable>
            )}

            {user && (
              <>
                <SectionLabel label="Mon compte" />
                <DrawerItem
                  icon={<User size={16} color="#1E3A5F" strokeWidth={2.2} />}
                  iconBg="#EBF0F7"
                  label="Mon profil"
                  onPress={() => navigate('/profile')}
                />
                <DrawerItem
                  icon={<ShoppingBag size={16} color="#1E3A5F" strokeWidth={2.2} />}
                  iconBg="#EBF0F7"
                  label="Mes commandes"
                  onPress={() => navigate('/orders')}
                />
                <DrawerItem
                  icon={<MapPin size={16} color="#1E3A5F" strokeWidth={2.2} />}
                  iconBg="#EBF0F7"
                  label="Mes adresses"
                  onPress={() => navigate('/addresses')}
                />
                <DrawerItem
                  icon={<Heart size={16} color="#E07A5F" strokeWidth={2.2} />}
                  iconBg="#FDF4F1"
                  label="Mes favoris"
                  onPress={() => navigate('/wishlist')}
                />
              </>
            )}

            <SectionLabel label="Navigation" />
            <DrawerItem
              icon={<Home size={16} color="#F47B20" strokeWidth={2.2} />}
              iconBg="#FEF5ED"
              label="Accueil"
              onPress={() => navigate('/(tabs)')}
            />
            <DrawerItem
              icon={<Package size={16} color="#F47B20" strokeWidth={2.2} />}
              iconBg="#FEF5ED"
              label="Tous les produits"
              onPress={() => navigate('/(tabs)/search')}
            />

            <SectionLabel label="Catégories" />
            {categories.map((c) => {
              const meta = CATEGORY_ICONS[c.slug] ?? {
                Icon: Tag,
                tint: '#1E3A5F',
                bg: '#EBF0F7',
              };
              return (
                <DrawerItem
                  key={c.id}
                  icon={<meta.Icon size={16} color={meta.tint} strokeWidth={2.2} />}
                  iconBg={meta.bg}
                  label={c.name}
                  onPress={() => navigate(`/category/${c.slug}`)}
                />
              );
            })}

            <SectionLabel label="Aide & infos" />
            <DrawerItem
              icon={<HelpCircle size={16} color="#1E3A5F" strokeWidth={2.2} />}
              iconBg="#EBF0F7"
              label="Centre d'aide"
              onPress={() => {
                closeDrawer();
                Linking.openURL(`${extra.webUrl ?? 'https://toonlas.shop'}/help`);
              }}
            />
            <DrawerItem
              icon={<Phone size={16} color="#548268" strokeWidth={2.2} />}
              iconBg="#E0EDE6"
              label="Nous contacter"
              onPress={() => {
                closeDrawer();
                Linking.openURL('mailto:hello@toonlas.shop');
              }}
            />
            <DrawerItem
              icon={<Info size={16} color="#1E3A5F" strokeWidth={2.2} />}
              iconBg="#EBF0F7"
              label="À propos"
              onPress={() => {
                closeDrawer();
                Linking.openURL(extra.webUrl ?? 'https://toonlas.shop');
              }}
            />

            {user && (
              <View style={{ paddingHorizontal: 12, paddingTop: 14 }}>
                <Pressable
                  onPress={() => {
                    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Déconnecter',
                        style: 'destructive',
                        onPress: async () => {
                          await signOut();
                          closeDrawer();
                        },
                      },
                    ]);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 11,
                    backgroundColor: pressed ? '#FEE2E2' : '#FEF2F2',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                  })}
                >
                  <LogOut size={14} color="#DC2626" strokeWidth={2.2} />
                  <Text style={{ fontSize: 13, color: '#DC2626', fontWeight: '700' }}>
                    Se déconnecter
                  </Text>
                </Pressable>
              </View>
            )}

            <View style={{ height: 16 }} />
            <View style={{ paddingHorizontal: 16, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#9AA0B5' }}>toon. — v1.0.0</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '800',
          color: '#9AA0B5',
          letterSpacing: 1.2,
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function DrawerItem({
  icon,
  iconBg,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 7,
        backgroundColor: pressed ? '#F5F6F9' : 'transparent',
      })}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 13,
          color: '#1E3A5F',
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
      <ChevronRight size={12} color="#9AA0B5" />
    </Pressable>
  );
}
