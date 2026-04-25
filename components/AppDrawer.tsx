import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import {
  X,
  Home,
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  User,
  LogOut,
  LogIn,
  LayoutDashboard,
  Info,
  ChevronRight,
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
  const { width } = Dimensions.get('window');
  const drawerWidth = Math.min(320, width * 0.82);
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
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: drawerOpen ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerOpen, drawerWidth, overlayOpacity, translateX]);

  function navigate(path: string) {
    closeDrawer();
    setTimeout(() => router.push(path as any), 150);
  }

  function openAdminWeb() {
    const url = `${extra.webUrl ?? 'https://toonlas.shop'}/admin`;
    closeDrawer();
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Erreur', `Impossible d'ouvrir ${url}`);
    });
  }

  return (
    <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
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
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 12,
          }}
        >
          {/* Header */}
          <View
            style={{
              backgroundColor: '#F47B20',
              paddingTop: 48,
              paddingBottom: 20,
              paddingHorizontal: 20,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Logo size="md" color="light" />
              <Pressable
                onPress={closeDrawer}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} color="#FFFFFF" />
              </Pressable>
            </View>

            {user ? (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>
                  {profile?.full_name ?? 'Utilisateur'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                  {user.email}
                </Text>
                {profile?.role === 'admin' && (
                  <View
                    style={{
                      marginTop: 8,
                      alignSelf: 'flex-start',
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
                      ADMIN
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ marginTop: 16, flexDirection: 'row', gap: 8 }}>
                <Pressable
                  onPress={() => navigate('/(auth)/login')}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    paddingVertical: 8,
                    borderRadius: 999,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#F47B20', fontWeight: '700', fontSize: 13 }}>
                    Connexion
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => navigate('/(auth)/register')}
                  style={{
                    flex: 1,
                    backgroundColor: '#1E3A5F',
                    paddingVertical: 8,
                    borderRadius: 999,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                    Inscription
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          <ScrollView>
            {/* Admin shortcut (if admin) */}
            {profile?.role === 'admin' && (
              <View>
                <Pressable
                  onPress={openAdminWeb}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    backgroundColor: '#FEF5ED',
                    borderBottomWidth: 1,
                    borderBottomColor: '#FCE7D0',
                  }}
                >
                  <LayoutDashboard size={20} color="#F47B20" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#F47B20' }}>
                      Tableau de bord admin
                    </Text>
                    <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      Ouvre le dashboard dans le navigateur
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#F47B20" />
                </Pressable>
              </View>
            )}

            {/* Account shortcuts */}
            {user && (
              <View style={{ paddingTop: 8 }}>
                <DrawerItem
                  icon={<User size={20} color="#374151" />}
                  label="Mon profil"
                  onPress={() => navigate('/profile')}
                />
                <DrawerItem
                  icon={<ShoppingBag size={20} color="#374151" />}
                  label="Mes commandes"
                  onPress={() => navigate('/orders')}
                />
                <DrawerItem
                  icon={<MapPin size={20} color="#374151" />}
                  label="Mes adresses"
                  onPress={() => navigate('/addresses')}
                />
                <DrawerItem
                  icon={<Heart size={20} color="#374151" />}
                  label="Mes favoris"
                  onPress={() => navigate('/wishlist')}
                />
                <Separator />
              </View>
            )}

            {/* Categories */}
            <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#9CA3AF',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                Catégories
              </Text>
            </View>
            <DrawerItem
              icon={<Home size={20} color="#374151" />}
              label="Accueil"
              onPress={() => navigate('/(tabs)')}
            />
            <DrawerItem
              icon={<Package size={20} color="#374151" />}
              label="Tous les produits"
              onPress={() => navigate('/(tabs)/search')}
            />
            {categories.map((c) => (
              <DrawerItem
                key={c.id}
                thumbnail={c.image_url ?? undefined}
                label={c.name}
                onPress={() => navigate(`/category/${c.slug}`)}
              />
            ))}

            {/* Static links */}
            <Separator />
            <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#9CA3AF',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                Aide
              </Text>
            </View>
            <DrawerItem
              icon={<Info size={20} color="#374151" />}
              label="À propos"
              onPress={() => {
                closeDrawer();
                Linking.openURL(extra.webUrl ?? 'https://toonlas.shop');
              }}
            />

            {/* Sign out */}
            {user && (
              <>
                <Separator />
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
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                  }}
                >
                  <LogOut size={20} color="#DC2626" />
                  <Text style={{ fontSize: 15, color: '#DC2626', fontWeight: '600' }}>
                    Déconnexion
                  </Text>
                </Pressable>
              </>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
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
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: pressed ? '#F9FAFB' : 'transparent',
      })}
    >
      {thumbnail ? (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: '#F3F4F6',
          }}
        >
          <Image source={{ uri: thumbnail }} contentFit="cover" style={{ flex: 1 }} />
        </View>
      ) : (
        <View style={{ width: 28, alignItems: 'center' }}>{icon}</View>
      )}
      <Text style={{ flex: 1, fontSize: 14, color: '#111827' }}>{label}</Text>
      <ChevronRight size={16} color="#9CA3AF" />
    </Pressable>
  );
}

function Separator() {
  return <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 4 }} />;
}
