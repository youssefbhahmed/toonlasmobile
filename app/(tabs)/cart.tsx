import { View, Text, Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react-native';
import { useCart } from '../../lib/cart';
import { formatPrice } from '../../lib/utils';

export default function CartScreen() {
  const router = useRouter();
  const { items, update, remove, subtotal } = useCart();
  const sub = subtotal();
  const shipping = sub >= 150 ? 0 : 7;
  const total = sub + shipping;

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-8">
        <ShoppingCart size={64} color="#9CA3AF" />
        <Text className="mt-4 text-xl font-bold">Votre panier est vide</Text>
        <Text className="mt-1 text-center text-sm text-gray-500">
          Découvrez nos meilleures offres et commencez à shopper.
        </Text>
        <Pressable
          onPress={() => router.push('/(tabs)' as any)}
          className="mt-6 rounded-full bg-brand px-6 py-3"
        >
          <Text className="font-bold text-white">Découvrir</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="gap-2 p-3">
          {items.map((i) => (
            <View key={i.product_id} className="flex-row gap-3 rounded-xl bg-white p-3">
              <View className="h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
                {i.image && (
                  <Image source={{ uri: i.image }} contentFit="cover" style={{ flex: 1 }} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium" numberOfLines={2}>
                  {i.name}
                </Text>
                <Text className="mt-1 text-base font-bold">{formatPrice(i.price)}</Text>
                <View className="mt-auto flex-row items-center justify-between">
                  <View className="flex-row items-center overflow-hidden rounded-lg border border-gray-300">
                    <Pressable
                      onPress={() => update(i.product_id, i.quantity - 1)}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Minus size={14} color="#374151" />
                    </Pressable>
                    <Text className="w-8 text-center text-sm font-semibold">{i.quantity}</Text>
                    <Pressable
                      onPress={() => update(i.product_id, i.quantity + 1)}
                      className="h-8 w-8 items-center justify-center"
                    >
                      <Plus size={14} color="#374151" />
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={() => remove(i.product_id)}
                    className="flex-row items-center gap-1"
                  >
                    <Trash2 size={14} color="#DC2626" />
                    <Text className="text-sm text-red-600">Retirer</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom sticky summary */}
      <View className="border-t border-gray-200 bg-white p-4">
        <View className="gap-1">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Sous-total</Text>
            <Text className="text-sm">{formatPrice(sub)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-600">Livraison</Text>
            <Text className="text-sm">{shipping === 0 ? 'GRATUITE' : formatPrice(shipping)}</Text>
          </View>
          <View className="mt-2 flex-row justify-between border-t border-gray-200 pt-2">
            <Text className="text-base font-bold">Total</Text>
            <Text className="text-base font-bold">{formatPrice(total)}</Text>
          </View>
        </View>
        {sub < 150 && (
          <View className="mt-2 rounded-md bg-brand-50 p-2">
            <Text className="text-xs text-brand-800">
              Ajoutez {formatPrice(150 - sub)} pour la livraison gratuite
            </Text>
          </View>
        )}
        <Pressable
          onPress={() => router.push('/checkout' as any)}
          className="mt-3 items-center rounded-full bg-brand py-3"
        >
          <Text className="font-bold text-white">Passer au paiement</Text>
        </Pressable>
      </View>
    </View>
  );
}
