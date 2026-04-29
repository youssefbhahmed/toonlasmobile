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
  ChevronRight,
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  User,
  LogOut,
  LayoutDashboard,
  HelpCircle,
  Phone,
  FileText,
  ShieldCheck,
  Truck,
  Globe,
  ArrowRight,
} from 'lucide-react-native';
import Constants from 'expo-constants';
import { useUI } from '../lib/ui';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

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
  const drawerWidth = Math.min(340, width * 0.88);
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
    const url = `${extra.webUrl ?? 'https://thedeal.shop'}/admin`;
    closeDrawer();
    Linking.canOpenURL(url).then((supported) => {
      if (supported) Linking.openURL(url);
      else Alert.alert('Erreur', `Impossible d'ouvrir ${url}`);
    });
  }

  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <Modal
      visible={drawerOpen}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <Animated.View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
          {/* HEADER — orange bar with greeting (Amazon style) */}
          <View
            style={{
              backgroundColor: '#F47B20',
              paddingTop: insets.top + 14,
              paddingBottom: 18,
              paddingHorizontal: 18,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                {user ? (
                  <>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' }}>
                      Bonjour,
                    </Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }} numberOfLines={1}>
                      {firstName ?? 'Bienvenue'}
                      {profile?.role === 'admin' && (
                        <Text style={{ fontSize: 13, color: '#1E3A5F' }}> · ADMIN</Text>
                      )}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' }}>
                      Bonjour,
                    </Text>
                    <Pressable onPress={() => navigate('/(auth)/login')}>
                      <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>
                        Connectez-vous
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
              <Pressable
                onPress={closeDrawer}
                hitSlop={14}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: pressed ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <X size={18} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            style={{ flex: 1, backgroundColor: '#FFFFFF' }}
            contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ADMIN BANNER (only for admins) */}
            {profile?.role === 'admin' && (
              <Pressable
                onPress={openAdminWeb}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? '#162B47' : '#1E3A5F',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                })}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#F47B20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LayoutDashboard size={18} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                    Tableau de bord admin
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                    Gérer la boutique sur le web
                  </Text>
                </View>
                <ArrowRight size={16} color="#F47B20" strokeWidth={2.4} />
              </Pressable>
            )}

            {/* SHOP BY CATEGORY — Amazon's signature section */}
            <SectionHeader title="Acheter par catégorie" />
            {categories.map((c) => (
              <ListRow
                key={c.id}
                thumbnail={c.image_url ?? undefined}
                label={c.name}
                onPress={() => navigate(`/category/${c.slug}`)}
              />
            ))}
            <ListRow
              icon={<Package size={20} color="#1E3A5F" strokeWidth={2} />}
              label="Voir tous les produits"
              onPress={() => navigate('/(tabs)/search')}
              emphasized
            />

            {/* SectionDivider — subtle gray gap (Amazon style) */}
            <SectionDivider />

            {/* MES INFORMATIONS / VOUS ET VOTRE COMPTE */}
            {user && (
              <>
                <SectionHeader title="Mon compte" />
                <ListRow
                  icon={<ShoppingBag size={20} color="#1E3A5F" strokeWidth={2} />}
                  label="Mes commandes"
                  onPress={() => navigate('/orders')}
                />
                <ListRow
                  icon={<Heart size={20} color="#1E3A5F" strokeWidth={2} />}
                  label="Mes favoris"
                  onPress={() => navigate('/wishlist')}
                />
                <ListRow
                  icon={<MapPin size={20} color="#1E3A5F" strokeWidth={2} />}
                  label="Mes adresses"
                  onPress={() => navigate('/addresses')}
                />
                <ListRow
                  icon={<User size={20} color="#1E3A5F" strokeWidth={2} />}
                  label="Modifier mon profil"
                  onPress={() => navigate('/profile')}
                />
                <SectionDivider />
              </>
            )}

            {/* PROGRAMMES & SERVICES */}
            <SectionHeader title="Programmes et services" />
            <ListRow
              icon={<Truck size={20} color="#1E3A5F" strokeWidth={2} />}
              label="Suivre une livraison"
              onPress={() => navigate('/orders')}
            />
            <ListRow
              icon={<ShieldCheck size={20} color="#1E3A5F" strokeWidth={2} />}
              label="Garanties & retours"
              onPress={() => {
                closeDrawer();
                Linking.openURL(`${extra.webUrl ?? 'https://thedeal.shop'}/help`);
              }}
            />
            <ListRow
              icon={<Globe size={20} color="#1E3A5F" strokeWidth={2} />}
              label="Visiter le site web"
              onPress={() => {
                closeDrawer();
                Linking.openURL(extra.webUrl ?? 'https://thedeal.shop');
              }}
            />

            <SectionDivider />

            {/* AIDE & SETTINGS */}
            <SectionHeader title="Aide et paramètres" />
            <ListRow
              icon={<HelpCircle size={20} color="#1E3A5F" strokeWidth={2} />}
              label="Centre d'aide"
              onPress={() => {
                closeDrawer();
                Linking.openURL(`${extra.webUrl ?? 'https://thedeal.shop'}/help`);
              }}
            />
            <ListRow
              icon={<Phone size={20} color="#1E3A5F" strokeWidth={2} />}
              label="Nous contacter"
              onPress={() => {
                closeDrawer();
                Linking.openURL('mailto:hello@thedeal.shop');
              }}
            />
            <ListRow
              icon={<FileText size={20} color="#1E3A5F" strokeWidth={2} />}
              label="Conditions d'utilisation"
              onPress={() => {
                closeDrawer();
                Linking.openURL(`${extra.webUrl ?? 'https://thedeal.shop'}/terms`);
              }}
            />

            {user && (
              <>
                <SectionDivider />
                <ListRow
                  icon={<LogOut size={20} color="#DC2626" strokeWidth={2} />}
                  label="Se déconnecter"
                  labelColor="#DC2626"
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
                />
              </>
            )}

            {/* Footer */}
            <View
              style={{
                paddingTop: 22,
                paddingBottom: 8,
                paddingHorizontal: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 11, color: '#9AA0B5', letterSpacing: 0.5 }}>
                The Deal · v1.0.0
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============== INTERNAL COMPONENTS ==============

function SectionHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
      }}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: '900',
          color: '#1E3A5F',
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function SectionDivider() {
  return (
    <View
      style={{
        height: 8,
        backgroundColor: '#F5F6F9',
        marginTop: 8,
      }}
    />
  );
}

/**
 * ListRow — Amazon-style list item
 * [icon/thumb]  Label .................  >
 *
 * IMPORTANT: layout is on an inner View (not on Pressable's style function),
 * because Pressable's function-based style sometimes drops flex props on RN 0.81.
 */
function ListRow({
  icon,
  thumbnail,
  label,
  labelColor,
  emphasized,
  onPress,
}: {
  icon?: React.ReactNode;
  thumbnail?: string;
  label: string;
  labelColor?: string;
  emphasized?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} android_ripple={{ color: '#F5F6F9' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#FFFFFF',
        }}
      >
        {thumbnail ? (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              overflow: 'hidden',
              backgroundColor: '#F5F6F9',
              marginRight: 14,
            }}
          >
            <ThumbnailImage url={thumbnail} />
          </View>
        ) : icon ? (
          <View
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            {icon}
          </View>
        ) : (
          <View style={{ width: 32, marginRight: 14 }} />
        )}
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            color: labelColor ?? '#1E3A5F',
            fontWeight: emphasized ? '700' : '500',
          }}
          numberOfLines={1}
        >
          {label}
        </Text>
        <ChevronRight size={18} color="#9AA0B5" />
      </View>
    </Pressable>
  );
}

function ThumbnailImage({ url }: { url: string }) {
  // Inline import to avoid top-level dep on expo-image when not needed
  const { Image } = require('expo-image');
  return <Image source={{ uri: url }} contentFit="cover" style={{ flex: 1 }} />;
}
