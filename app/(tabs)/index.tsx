import {
  ScrollView,
  View,
  Text,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductCard, type ProductCardProduct } from '../../components/ProductCard';
import { Truck, ShieldCheck, RefreshCw, Headphones, ArrowRight } from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<ProductCardProduct[]>([]);
  const [newest, setNewest] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [catsRes, featRes, newRes] = await Promise.all([
      supabase
        .from('categories')
        .select('id, name, slug, image_url')
        .is('parent_id', null)
        .order('display_order')
        .limit(8),
      supabase
        .from('products')
        .select(
          'id, name, slug, price, compare_at_price, brand, rating_avg, rating_count, stock_quantity, product_images(url, position)',
        )
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(10),
      supabase
        .from('products')
        .select(
          'id, name, slug, price, compare_at_price, brand, rating_avg, rating_count, stock_quantity, product_images(url, position)',
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(12),
    ]);

    const mapProducts = (rows: any[] | null): ProductCardProduct[] =>
      (rows ?? []).map((r) => ({
        ...r,
        image:
          r.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null,
      }));

    setCategories(catsRes.data ?? []);
    setFeatured(mapProducts(featRes.data));
    setNewest(mapProducts(newRes.data));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#F47B20" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor="#F47B20"
        />
      }
    >
      {/* HERO — salmon gradient with decorative blobs */}
      <View style={{ padding: 16 }}>
        <View style={{ borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
          <LinearGradient
            colors={['#FFF5F0', '#FFE5DD', '#FFD4C0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22, minHeight: 260 }}
          >
            <View
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: 'rgba(244,123,32,0.18)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(30,58,95,0.12)',
              }}
            />

            <Text style={{ fontSize: 11, fontWeight: '800', color: '#B24E0C', letterSpacing: 2 }}>
              NOUVEAU · ÉTÉ 2026
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '900',
                color: '#1E3A5F',
                lineHeight: 32,
                marginTop: 8,
              }}
            >
              Collection tendance{'\n'}
              <Text style={{ color: '#F47B20' }}>Électronique</Text>
            </Text>
            <Text style={{ fontSize: 13, color: '#2F4E80', marginTop: 10, maxWidth: 280 }}>
              Découvrez notre sélection. Livraison offerte dès 150 TND.
            </Text>

            <Pressable
              onPress={() => router.push('/category/electronics' as any)}
              style={({ pressed }) => ({
                alignSelf: 'flex-start',
                marginTop: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#F47B20',
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 10,
                shadowColor: '#F47B20',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 14,
                elevation: 4,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>
                Acheter maintenant
              </Text>
              <ArrowRight size={14} color="white" />
            </Pressable>
          </LinearGradient>
        </View>
      </View>

      {/* FEATURE STRIP */}
      <View style={{ marginHorizontal: 16, marginBottom: 4 }}>
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#E5E5E5',
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Feature icon={<Truck size={16} color="#F47B20" />} title="Livraison" subtitle="Dès 150 TND" />
            <Feature icon={<RefreshCw size={16} color="#F47B20" />} title="Retours" subtitle="7 jours" />
          </View>
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F5F5F5' }}>
            <Feature icon={<ShieldCheck size={16} color="#F47B20" />} title="Paiement" subtitle="À livraison" />
            <Feature icon={<Headphones size={16} color="#F47B20" />} title="Support 24/7" subtitle="Contact" />
          </View>
        </View>
      </View>

      {/* CATEGORIES */}
      <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: '#1E3A5F',
            paddingBottom: 8,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E3A5F' }}>
            Explorez par catégorie
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {categories.map((c, idx) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/category/${c.slug}` as any)}
              style={{ width: '47%' }}
            >
              <View
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#E5E5E5',
                  backgroundColor: idx % 2 === 0 ? '#FFF5F0' : '#FEF5ED',
                  padding: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  minHeight: 80,
                }}
              >
                {c.image_url && (
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 10,
                      backgroundColor: '#FFFFFF',
                      overflow: 'hidden',
                    }}
                  >
                    <Image source={{ uri: c.image_url }} contentFit="cover" style={{ flex: 1 }} />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 9, fontWeight: '800', color: '#B24E0C', letterSpacing: 1 }}>
                    CATÉGORIE
                  </Text>
                  <Text
                    style={{ fontSize: 14, fontWeight: '900', color: '#1E3A5F', marginTop: 2 }}
                    numberOfLines={2}
                  >
                    {c.name}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* DEALS */}
      <View style={{ marginTop: 28, paddingHorizontal: 16 }}>
        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: '#1E3A5F',
            paddingBottom: 8,
            marginBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E3A5F' }}>
              Offres du jour
            </Text>
            <View style={{ backgroundColor: '#E74C3C', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '800' }}>17:21</Text>
            </View>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/search' as any)}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#F47B20' }}>Tout voir →</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {newest.slice(0, 4).map((p) => (
            <View key={p.id} style={{ width: '47%' }}>
              <ProductCard product={p} />
            </View>
          ))}
        </View>
      </View>

      {/* FEATURED RAIL */}
      {featured.length > 0 && (
        <View style={{ marginTop: 28 }}>
          <View
            style={{
              paddingHorizontal: 16,
              borderBottomWidth: 2,
              borderBottomColor: '#1E3A5F',
              paddingBottom: 8,
              marginBottom: 14,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E3A5F' }}>
              Produits phares
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/search' as any)}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#F47B20' }}>Tout voir →</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16 }}>
              {featured.map((p) => (
                <View key={p.id} style={{ width: 160 }}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* PROMO — Navy gradient with orange glow */}
      <View style={{ marginTop: 28, paddingHorizontal: 16 }}>
        <View style={{ borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
          <LinearGradient
            colors={['#0C1826', '#1E3A5F', '#2F4E80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 22 }}
          >
            <View
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(244,123,32,0.3)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(244,123,32,0.15)',
              }}
            />

            <Text style={{ fontSize: 10, fontWeight: '800', color: '#F5A765', letterSpacing: 2 }}>
              OFFRE LIMITÉE
            </Text>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '900',
                color: 'white',
                lineHeight: 30,
                marginTop: 6,
              }}
            >
              Livraison <Text style={{ color: '#F47B20' }}>offerte</Text>
              {'\n'}dès 150 TND
            </Text>
            <Text style={{ color: '#C6D3E4', fontSize: 13, marginTop: 8 }}>
              Un petit cadeau pour votre première commande.
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/search' as any)}
              style={({ pressed }) => ({
                alignSelf: 'flex-start',
                marginTop: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: '#F47B20',
                paddingHorizontal: 18,
                paddingVertical: 11,
                borderRadius: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>J&apos;en profite</Text>
              <ArrowRight size={14} color="white" />
            </Pressable>
          </LinearGradient>
        </View>
      </View>

      {/* RECOMMENDED */}
      <View style={{ marginTop: 28, paddingHorizontal: 16, paddingBottom: 32 }}>
        <View
          style={{
            borderBottomWidth: 2,
            borderBottomColor: '#1E3A5F',
            paddingBottom: 8,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#1E3A5F' }}>
            Recommandé pour vous
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {newest.slice(4, 12).map((p) => (
            <View key={p.id} style={{ width: '47%' }}>
              <ProductCard product={p} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function Feature({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: '#FEF5ED',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E3A5F' }}>{title}</Text>
        <Text style={{ fontSize: 9, color: '#6A7189' }}>{subtitle}</Text>
      </View>
    </View>
  );
}
