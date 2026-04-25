import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { formatPrice } from '../../lib/utils';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: '#F59E0B' },
  confirmed: { label: 'Confirmée', color: '#3B82F6' },
  shipped: { label: 'Expédiée', color: '#8B5CF6' },
  delivered: { label: 'Livrée', color: '#10B981' },
  cancelled: { label: 'Annulée', color: '#EF4444' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, order_number, status, total, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={{ title: 'Mes commandes' }} />
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-8">
        <Stack.Screen options={{ title: 'Mes commandes' }} />
        <Text className="text-lg font-semibold">Aucune commande</Text>
        <Text className="mt-1 text-center text-sm text-gray-500">
          Vos futures commandes s&apos;afficheront ici.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Mes commandes' }} />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        renderItem={({ item }) => {
          const status = STATUS_LABELS[item.status] ?? { label: item.status, color: '#6B7280' };
          return (
            <Pressable
              onPress={() => router.push(`/orders/${item.id}` as any)}
              className="flex-row items-center justify-between rounded-xl bg-white p-4"
            >
              <View className="flex-1">
                <Text className="font-semibold">{item.order_number}</Text>
                <Text className="mt-0.5 text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString('fr-FR')}
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-bold">{formatPrice(item.total)}</Text>
                <View
                  className="mt-1 rounded-full px-2 py-0.5"
                  style={{ backgroundColor: `${status.color}20` }}
                >
                  <Text className="text-xs font-semibold" style={{ color: status.color }}>
                    {status.label}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
