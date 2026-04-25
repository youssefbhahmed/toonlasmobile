import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: o } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
      setOrder(o);
      if (o) {
        const { data: it } = await supabase.from('order_items').select('*').eq('order_id', o.id);
        setItems(it ?? []);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={{ title: 'Commande' }} />
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-8">
        <Stack.Screen options={{ title: 'Commande' }} />
        <Text>Commande introuvable</Text>
      </View>
    );
  }

  const addr = order.shipping_address;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: order.order_number }} />
      <View className="gap-3 p-4">
        <View className="rounded-xl bg-white p-4">
          <Text className="text-xl font-bold">{order.order_number}</Text>
          <Text className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleString('fr-FR')}
          </Text>
          <View className="mt-2 self-start rounded-full bg-brand-50 px-3 py-1">
            <Text className="text-xs font-semibold text-brand-700">
              {STATUS_LABELS[order.status] ?? order.status}
            </Text>
          </View>
        </View>

        <View className="rounded-xl bg-white p-4">
          <Text className="mb-2 font-bold">Livraison à</Text>
          <Text>{addr?.full_name}</Text>
          <Text className="text-gray-600">{addr?.phone}</Text>
          <Text>
            {addr?.address_line1}
            {addr?.address_line2 ? `, ${addr.address_line2}` : ''}
          </Text>
          <Text>
            {addr?.city}
            {addr?.emirate ? `, ${addr.emirate}` : ''}, {addr?.country}
          </Text>
        </View>

        <View className="rounded-xl bg-white p-4">
          <Text className="mb-2 font-bold">Récapitulatif</Text>
          <View className="gap-1">
            <View className="flex-row justify-between">
              <Text>Sous-total</Text>
              <Text>{formatPrice(order.subtotal)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text>Livraison</Text>
              <Text>
                {Number(order.shipping_fee) === 0 ? 'GRATUITE' : formatPrice(order.shipping_fee)}
              </Text>
            </View>
            <View className="mt-1 flex-row justify-between border-t border-gray-200 pt-2">
              <Text className="font-bold">Total</Text>
              <Text className="font-bold">{formatPrice(order.total)}</Text>
            </View>
            <Text className="mt-2 text-xs text-gray-500">
              Paiement : {order.payment_method.toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="rounded-xl bg-white p-4">
          <Text className="mb-2 font-bold">Articles</Text>
          {items.map((it) => (
            <View key={it.id} className="mb-3 flex-row items-center gap-3">
              <View className="h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                {it.product_image && (
                  <Image source={{ uri: it.product_image }} contentFit="cover" style={{ flex: 1 }} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium" numberOfLines={2}>
                  {it.product_name}
                </Text>
                <Text className="text-xs text-gray-500">Quantité : {it.quantity}</Text>
              </View>
              <Text className="font-semibold">
                {formatPrice(Number(it.price) * it.quantity)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
