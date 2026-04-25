import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductCard, type ProductCardProduct } from '../../components/ProductCard';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [products, setProducts] = useState<ProductCardProduct[]>([]);
  const [title, setTitle] = useState('Catégorie');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', slug)
        .maybeSingle();
      if (cat) setTitle(cat.name);

      // Get all descendant category IDs
      const { data: allCats } = await supabase.from('categories').select('id, parent_id, slug');
      const rootId = cat?.id;
      const ids = new Set<string>();
      if (rootId) ids.add(rootId);
      let changed = true;
      while (changed) {
        changed = false;
        (allCats ?? []).forEach((c) => {
          if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) {
            ids.add(c.id);
            changed = true;
          }
        });
      }

      const { data } = await supabase
        .from('products')
        .select(
          'id, name, slug, price, compare_at_price, brand, rating_avg, rating_count, stock_quantity, product_images(url, position)',
        )
        .eq('is_active', true)
        .in('category_id', [...ids])
        .limit(100);
      setProducts(
        (data ?? []).map((r: any) => ({
          ...r,
          image:
            r.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null,
        })),
      );
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title }} />
      <View className="border-b border-gray-200 p-3">
        <Text className="text-sm text-gray-500">{products.length} produits</Text>
      </View>
      {products.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-gray-500">Aucun produit dans cette catégorie.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
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
      )}
    </View>
  );
}
