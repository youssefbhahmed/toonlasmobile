import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { ProductCard, type ProductCardProduct } from '../components/ProductCard';

export default function WishlistScreen() {
  const user = useAuth((s) => s.user);
  const [items, setItems] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('wishlist_items')
        .select(
          'product_id, products(id, name, slug, price, compare_at_price, brand, rating_avg, rating_count, stock_quantity, product_images(url, position))',
        )
        .eq('user_id', user.id);
      const mapped = (data ?? [])
        .map((w: any) => w.products)
        .filter(Boolean)
        .map((p: any) => ({
          ...p,
          image:
            p.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null,
        }));
      setItems(mapped);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={{ title: 'Mes favoris' }} />
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-8">
        <Stack.Screen options={{ title: 'Mes favoris' }} />
        <Text className="text-lg font-semibold">Aucun favori</Text>
        <Text className="mt-1 text-center text-sm text-gray-500">
          Ajoutez des produits à vos favoris pour les retrouver ici.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Mes favoris' }} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </View>
  );
}
