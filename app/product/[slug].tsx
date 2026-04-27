import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Minus, Plus, Heart, ShoppingCart, Star } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { formatPrice, discountPercent } from '../../lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  brand: string | null;
  sku: string | null;
  rating_avg: number;
  rating_count: number;
  images: { url: string; position: number }[];
}

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  const add = useCart((s) => s.add);
  const user = useAuth((s) => s.user);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select(
          'id, name, slug, description, price, compare_at_price, stock_quantity, brand, sku, rating_avg, rating_count, product_images(url, position)',
        )
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      if (data) {
        setProduct({
          ...data,
          images: ((data as any).product_images ?? []).sort(
            (a: any, b: any) => a.position - b.position,
          ),
        } as any);
      }
      setLoading(false);

      if (user) {
        const { data: wish } = await supabase
          .from('wishlist_items')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', (data as any)?.id)
          .maybeSingle();
        setInWishlist(!!wish);
      }
    })();
  }, [slug, user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-8">
        <Text className="text-lg font-semibold">Produit introuvable</Text>
      </View>
    );
  }

  const discount = discountPercent(
    Number(product.price),
    product.compare_at_price ? Number(product.compare_at_price) : null,
  );
  const images =
    product.images.length > 0
      ? product.images
      : [{ url: 'https://cdn.dummyjson.com/product-images/smartphones/iphone-x/1.webp', position: 0 }];

  async function toggleWishlist() {
    if (!user) {
      Alert.alert('Connexion requise', 'Connectez-vous pour ajouter aux favoris');
      router.push('/(auth)/login' as any);
      return;
    }
    if (!product) return;
    if (inWishlist) {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      setInWishlist(false);
    } else {
      await supabase
        .from('wishlist_items')
        .insert({ user_id: user.id, product_id: product.id });
      setInWishlist(true);
    }
  }

  function handleAdd() {
    if (!product) return;
    add({
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: images[0]?.url ?? null,
      quantity: qty,
      stock: product.stock_quantity,
    });
    Alert.alert('Ajouté au panier', `${qty} × ${product.name}`);
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Image gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setImgIdx(Math.round(e.nativeEvent.contentOffset.x / width))
          }
        >
          {images.map((im, i) => (
            <View key={i} style={{ width, aspectRatio: 1 }} className="bg-gray-50">
              <Image source={{ uri: im.url }} contentFit="cover" style={{ flex: 1 }} />
            </View>
          ))}
        </ScrollView>
        {images.length > 1 && (
          <View className="flex-row justify-center gap-1.5 py-2">
            {images.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === imgIdx ? 'bg-brand' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
        )}

        <View className="gap-3 p-4">
          {product.brand && (
            <Text className="text-sm font-medium text-brand">{product.brand}</Text>
          )}
          <Text className="text-2xl font-bold">{product.name}</Text>

          {Number(product.rating_avg) > 0 && (
            <View className="flex-row items-center gap-1">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className="text-sm text-gray-600">
                {Number(product.rating_avg).toFixed(1)} ({product.rating_count} avis)
              </Text>
            </View>
          )}

          <View className="flex-row items-baseline gap-3">
            <Text className="text-2xl font-bold">{formatPrice(product.price)}</Text>
            {product.compare_at_price &&
              Number(product.compare_at_price) > Number(product.price) && (
                <Text className="text-base text-gray-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </Text>
              )}
            {discount !== null && (
              <View className="rounded bg-red-600 px-2 py-0.5">
                <Text className="text-xs font-bold text-white">-{discount}%</Text>
              </View>
            )}
          </View>

          <Text
            className={`text-sm ${product.stock_quantity > 0 ? 'text-green-700' : 'text-red-600'}`}
          >
            {product.stock_quantity > 0 ? 'En stock' : 'Rupture de stock'}
            {product.sku ? `   ·   SKU : ${product.sku}` : ''}
          </Text>

          {product.description && (
            <Text className="mt-2 text-sm leading-6 text-gray-700">{product.description}</Text>
          )}
        </View>
      </ScrollView>

      {/* Sticky action bar — respects bottom safe area */}
      <View
        className="border-t border-gray-200 bg-white p-3"
        style={{ paddingBottom: 12 + insets.bottom }}
      >
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center overflow-hidden rounded-lg border border-gray-300">
            <Pressable
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              className="h-10 w-10 items-center justify-center"
            >
              <Minus size={16} color="#374151" />
            </Pressable>
            <Text className="w-10 text-center text-base font-semibold">{qty}</Text>
            <Pressable
              onPress={() => setQty((q) => Math.min(product.stock_quantity, q + 1))}
              className="h-10 w-10 items-center justify-center"
            >
              <Plus size={16} color="#374151" />
            </Pressable>
          </View>
          <Pressable
            onPress={toggleWishlist}
            className="h-10 w-10 items-center justify-center rounded-lg border border-gray-300"
          >
            <Heart
              size={18}
              color={inWishlist ? '#EF4444' : '#374151'}
              fill={inWishlist ? '#EF4444' : 'transparent'}
            />
          </Pressable>
          <Pressable
            onPress={handleAdd}
            disabled={product.stock_quantity === 0}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-3 ${
              product.stock_quantity === 0 ? 'bg-gray-300' : 'bg-brand'
            }`}
          >
            <ShoppingCart size={18} color="#FFFFFF" />
            <Text className="font-bold text-white">
              {product.stock_quantity === 0 ? 'Rupture' : 'Ajouter'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
