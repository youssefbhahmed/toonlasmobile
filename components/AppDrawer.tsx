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
  Heart,
  ShoppingBag,
  MapPin,
  User,
  LogOut,
  LayoutDashboard,
  HelpCircle,
  ChevronRight,
  Smartphone,
  Shirt,
  Sofa,
  Sparkles,
  ShoppingBasket,
  Gamepad2,
  Dumbbell,
  BookOpen,
  Tag,
  ArrowRight,
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

const CATEGORY_ICONS: Record<string, any> = {
  electronics: Smartphone,
  fashion: Shirt,
  'home-kitchen': Sofa,
  beauty: Sparkles,
  grocery: ShoppingBasket,
  toys: Gamepad2,
  sports: Dumbbell,
  books: BookOpen,
};

export function AppDrawer() {
  const { drawerOpen, closeDrawer } = useUI();
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const drawerWidth = Math.min(330, width * 0.86);
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
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: drawerOpen ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerOpen, drawerWidth, overlayOpacity, translateX]);

  function navigate(path: string) {
    closeDrawer();
    setTimeout(() => router.push(path as any), 200);
  }

  function openAdminWeb() {
    const url = `${extra.webUrl ?? 'https://thedeal.shop'}/admin`;
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
            shadowOpacity: 0.3,
            shadowRadius: 20,
            shadowOffset: { width: 4, height: 0 },
            elevation: 16,
          }}
        >
          {/* TOP — clean white header with logo + close */}
          <View
            style={{
              paddingTop: insets.top + 12,
              paddingHorizontal: 18,
              paddingBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Logo size="sm" color="dark" />
            <Pressable
              onPress={closeDrawer}
              hitSlop={14}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: pressed ? '#F5F6F9' : '#FAFAFA',
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <X size={18} color="#1E3A5F" strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* PROFILE CARD or LOGIN CTA */}
            <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 }}>
              {user ? (
                <Pressable
                  onPress={() => navigate('/profile')}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? '#FCE7D0' : '#FEF5ED',
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  })}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#F47B20',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 17, fontWeight: '900', color: '#FFFFFF' }}>
                      {initials}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E3A5F' }} numberOfLines={1}>
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
                      style={{ color: '#6A7189', fontSize: 11, marginTop: 1 }}
                      numberOfLines={1}
                    >
                      {user.email}
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#9AA0B5" />
                </Pressable>
              ) : (
                <View
                  style={{
                    backgroundColor: '#FEF5ED',
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#1E3A5F' }}>
                    Bienvenue !
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6A7189', marginTop: 2 }}>
                    Connectez-vous pour accéder à toutes les fonctionnalités
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                    <Pressable
                      onPress={() => navigate('/(auth)/login')}
                      style={({ pressed }) => ({
                        flex: 1,
                        backgroundColor: '#F47B20',
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
                        Connexion
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => navigate('/(auth)/register')}
                      style={({ pressed }) => ({
                        flex: 1,
                        backgroundColor: '#FFFFFF',
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                        borderWidth: 1.5,
                        borderColor: '#F47B20',
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text style={{ color: '#F47B20', fontWeight: '800', fontSize: 13 }}>
                        Inscription
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* ADMIN BANNER */}
            {profile?.role === 'admin' && (
              <Pressable
                onPress={openAdminWeb}
                style={({ pressed }) => ({
                  marginHorizontal: 16,
                  marginBottom: 12,
                  backgroundColor: pressed ? '#162B47' : '#1E3A5F',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
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
                  <LayoutDashboard size={18} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                    Tableau de bord
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                    Gérer la boutique
                  </Text>
                </View>
                <ArrowRight size={16} color="#F47B20" strokeWidth={2.4} />
              </Pressable>
            )}

            {/* QUICK ACTIONS — 2 col grid for logged-in users */}
            {user && (
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <SectionLabel label="Mon compte" />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  <QuickTile
                    icon={<ShoppingBag size={18} color="#1E3A5F" strokeWidth={2.2} />}
                    label="Commandes"
                    onPress={() => navigate('/orders')}
                  />
                  <QuickTile
                    icon={<Heart size={18} color="#E07A5F" strokeWidth={2.2} />}
                    label="Favoris"
                    onPress={() => navigate('/wishlist')}
                  />
                  <QuickTile
                    icon={<MapPin size={18} color="#1E3A5F" strokeWidth={2.2} />}
                    label="Adresses"
                    onPress={() => navigate('/addresses')}
                  />
                  <QuickTile
                    icon={<User size={18} color="#1E3A5F" strokeWidth={2.2} />}
                    label="Profil"
                    onPress={() => navigate('/profile')}
                  />
                </View>
              </View>
            )}

            {/* CATEGORIES — 2 col grid */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <SectionLabel label="Catégories" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((c) => {
                  const Icon = CATEGORY_ICONS[c.slug] ?? Tag;
                  return (
                    <CategoryTile
                      key={c.id}
                      icon={<Icon size={20} color="#F47B20" strokeWidth={2.2} />}
                      label={c.name}
                      onPress={() => navigate(`/category/${c.slug}`)}
                    />
                  );
                })}
              </View>
            </View>

            {/* HELP */}
            <View style={{ paddingHorizontal: 16 }}>
              <SectionLabel label="Aide" />
              <SimpleRow
                icon={<HelpCircle size={16} color="#6A7189" strokeWidth={2.2} />}
                label="Centre d'aide"
                onPress={() => {
                  closeDrawer();
                  Linking.openURL(`${extra.webUrl ?? 'https://thedeal.shop'}/help`);
                }}
              />
              <SimpleRow
                icon={<HelpCircle size={16} color="#6A7189" strokeWidth={2.2} />}
                label="Nous contacter"
                onPress={() => {
                  closeDrawer();
                  Linking.openURL('mailto:hello@thedeal.shop');
                }}
              />
            </View>

            {/* SIGN OUT */}
            {user && (
              <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
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
                    backgroundColor: pressed ? '#FEE2E2' : 'transparent',
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

            <View style={{ paddingTop: 18, paddingBottom: 8, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: '#9AA0B5', letterSpacing: 0.5 }}>
                The Deal · v1.0.0
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: '800',
        color: '#9AA0B5',
        letterSpacing: 1.4,
        marginBottom: 8,
      }}
    >
      {label.toUpperCase()}
    </Text>
  );
}

function QuickTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: '48.5%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 11,
        backgroundColor: pressed ? '#F5F6F9' : '#FAFAFA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#F0F0F0',
      })}
    >
      {icon}
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E3A5F', flex: 1 }} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function CategoryTile({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: '48.5%',
        paddingVertical: 14,
        paddingHorizontal: 10,
        backgroundColor: pressed ? '#FCE7D0' : '#FEF5ED',
        borderRadius: 12,
        alignItems: 'center',
        gap: 6,
      })}
    >
      {icon}
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: '#1E3A5F',
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SimpleRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
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
        paddingVertical: 11,
        backgroundColor: pressed ? '#FAFAFA' : 'transparent',
        borderRadius: 8,
      })}
    >
      {icon}
      <Text style={{ fontSize: 13, color: '#4D5370', fontWeight: '500', flex: 1 }}>
        {label}
      </Text>
      <ChevronRight size={14} color="#CBCFDC" />
    </Pressable>
  );
}
