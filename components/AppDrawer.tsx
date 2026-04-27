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
import { Image } from 'expo-image';
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

export function AppDrawer() {
  const { drawerOpen, closeDrawer } = useUI();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const drawerWidth = Math.min(330, width * 0.85);
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

  // Initials for avatar
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
    <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={closeDrawer} statusBarTranslucent>
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
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

        {/* Drawer panel */}
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
          {/* HEADER — gradient orange */}
          <View
            style={{
              backgroundColor: '#F47B20',
              paddingTop: insets.top + 14,
              paddingBottom: 22,
              paddingHorizontal: 20,
              borderBottomWidth: 0,
            }}
          >
            {/* Top row: logo + close */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: user ? 18 : 14,
              }}
            >
              <Logo size="md" color="light" />
              <Pressable
                onPress={closeDrawer}
                hitSlop={10}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: pressed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <X size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </View>

            {user ? (
              /* Profile pill */
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  borderRadius: 14,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#F47B20' }}>
                    {initials}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }} numberOfLines={1}>
                      {profile?.full_name ?? 'Utilisateur'}
                    </Text>
                    {profile?.role === 'admin' && (
                      <View
                        style={{
                          backgroundColor: '#1E3A5F',
                          paddingHorizontal: 6,
                          paddingVertical: 1,
                          borderRadius: 4,
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>
                          ADMIN
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 }}
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
                    paddingVertical: 11,
                    borderRadius: 10,
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
                    paddingVertical: 11,
                    borderRadius: 10,
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

          {/* SCROLL CONTENT — respects bottom safe area */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Admin shortcut */}
            {profile?.role === 'admin' && (
              <Pressable
                onPress={openAdminWeb}
                style={({ pressed }) => ({
                  marginHorizontal: 12,
                  marginTop: 12,
                  marginBottom: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: pressed ? '#FCE7D0' : '#FEF5ED',
                  borderRadius: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: '#F47B20',
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: '#F47B20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LayoutDashboard size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E3A5F' }}>
                    Tableau de bord admin
                  </Text>
                  <Text style={{ fontSize: 11, color: '#6A7189', marginTop: 1 }}>
                    Ouvre le dashboard web
                  </Text>
                </View>
                <ChevronRight size={16} color="#F47B20" />
              </Pressable>
            )}

            {/* MON COMPTE */}
            {user && (
              <>
                <SectionLabel label="Mon compte" />
                <DrawerItem
                  icon={<User size={18} color="#1E3A5F" />}
                  label="Mon profil"
                  onPress={() => navigate('/profile')}
                />
                <DrawerItem
                  icon={<ShoppingBag size={18} color="#1E3A5F" />}
                  label="Mes commandes"
                  onPress={() => navigate('/orders')}
                />
                <DrawerItem
                  icon={<MapPin size={18} color="#1E3A5F" />}
                  label="Mes adresses"
                  onPress={() => navigate('/addresses')}
                />
                <DrawerItem
                  icon={<Heart size={18} color="#1E3A5F" />}
                  label="Mes favoris"
                  onPress={() => navigate('/wishlist')}
                />
              </>
            )}

            {/* NAVIGATION */}
            <SectionLabel label="Navigation" />
            <DrawerItem
              icon={<Home size={18} color="#1E3A5F" />}
              label="Accueil"
              onPress={() => navigate('/(tabs)')}
            />
            <DrawerItem
              icon={<Package size={18} color="#1E3A5F" />}
              label="Tous les produits"
              onPress={() => navigate('/(tabs)/search')}
            />

            {/* CATÉGORIES */}
            <SectionLabel label="Catégories" />
            {categories.map((c) => (
              <DrawerItem
                key={c.id}
                thumbnail={c.image_url ?? undefined}
                label={c.name}
                onPress={() => navigate(`/category/${c.slug}`)}
              />
            ))}

            {/* AIDE */}
            <SectionLabel label="Aide & infos" />
            <DrawerItem
              icon={<HelpCircle size={18} color="#1E3A5F" />}
              label="Centre d'aide"
              onPress={() => {
                closeDrawer();
                Linking.openURL(`${extra.webUrl ?? 'https://toonlas.shop'}/help`);
              }}
            />
            <DrawerItem
              icon={<Phone size={18} color="#1E3A5F" />}
              label="Nous contacter"
              onPress={() => {
                closeDrawer();
                Linking.openURL('mailto:hello@toonlas.shop');
              }}
            />
            <DrawerItem
              icon={<Info size={18} color="#1E3A5F" />}
              label="À propos"
              onPress={() => {
                closeDrawer();
                Linking.openURL(extra.webUrl ?? 'https://toonlas.shop');
              }}
            />

            {/* DÉCONNEXION */}
            {user && (
              <>
                <View style={{ height: 12 }} />
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
                    marginHorizontal: 16,
                    marginTop: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 12,
                    backgroundColor: pressed ? '#FEE2E2' : '#FEF2F2',
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                  })}
                >
                  <LogOut size={16} color="#DC2626" />
                  <Text style={{ fontSize: 14, color: '#DC2626', fontWeight: '700' }}>
                    Se déconnecter
                  </Text>
                </Pressable>
              </>
            )}

            <View style={{ height: 24 }} />

            {/* Version footer */}
            <View style={{ paddingHorizontal: 20, alignItems: 'center' }}>
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
    <View style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 6 }}>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '800',
          color: '#9AA0B5',
          letterSpacing: 1.4,
        }}
      >
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function DrawerItem({
  icon,
  thumbnail,
  label,
  onPress,
}: {
  icon?: React.ReactNode;
  thumbnail?: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 22,
        paddingVertical: 11,
        backgroundColor: pressed ? '#F5F6F9' : 'transparent',
      })}
    >
      {thumbnail ? (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#F5F6F9',
            borderWidth: 1,
            borderColor: '#E8EAF0',
          }}
        >
          <Image source={{ uri: thumbnail }} contentFit="cover" style={{ flex: 1 }} />
        </View>
      ) : (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: '#F5F6F9',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      )}
      <Text style={{ flex: 1, fontSize: 14, color: '#1E3A5F', fontWeight: '500' }}>
        {label}
      </Text>
      <ChevronRight size={14} color="#9AA0B5" />
    </Pressable>
  );
}
