import { View, Text, TextInput, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { ProductCard, type ProductCardProduct } from '../../components/ProductCard';
import { Search as SearchIcon, X } from 'lucide-react-native';

export default function SearchScreen() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ProductCardProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    let qb = supabase
      .from('products')
      .select(
        'id, name, slug, price, compare_at_price, brand, rating_avg, rating_count, stock_quantity, product_images(url, position)',
      )
      .eq('is_active', true)
      .ilike('name', `%${term}%`)
      .limit(50);
    const { data } = await qb;
    setResults(
      (data ?? []).map((r: any) => ({
        ...r,
        image:
          r.product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => run(q), 300);
    return () => clearTimeout(t);
  }, [q, run]);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-2 border-b border-gray-200 bg-white p-3">
        <View className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3">
          <SearchIcon size={18} color="#6B7280" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Que cherchez-vous ?"
            className="flex-1 py-3 text-base"
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
          {q.length > 0 && (
            <Pressable onPress={() => setQ('')}>
              <X size={18} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      )}

      {!loading && q.trim() && results.length === 0 && (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-base text-gray-500">Aucun résultat pour « {q} »</Text>
        </View>
      )}

      {!loading && !q.trim() && (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-base text-gray-500">Tapez pour chercher un produit</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
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
