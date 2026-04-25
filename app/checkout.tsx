import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { formatPrice, generateOrderNumber } from '../lib/utils';
import type { Address } from '../types/database';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [newAddr, setNewAddr] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    city: '',
    emirate: '',
  });

  const sub = subtotal();
  const shipping = sub >= 150 ? 0 : 7;
  const total = sub + shipping;

  useEffect(() => {
    if (!authLoading && !user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter');
      router.replace('/(auth)/login' as any);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      setAddresses(data ?? []);
      const def = (data ?? []).find((a) => a.is_default) ?? (data ?? [])[0];
      if (def) setSelectedId(def.id);
      if ((data ?? []).length === 0) setShowNew(true);
    })();
  }, [user]);

  async function saveAddress() {
    if (!user) return;
    if (!newAddr.full_name || !newAddr.phone || !newAddr.address_line1 || !newAddr.city) {
      Alert.alert('Champs manquants', 'Nom, téléphone, adresse et ville requis');
      return;
    }
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...newAddr, country: 'Tunisie', user_id: user.id })
      .select('*')
      .single();
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    setAddresses((prev) => [data as any, ...prev]);
    setSelectedId((data as any).id);
    setShowNew(false);
    setNewAddr({ full_name: '', phone: '', address_line1: '', city: '', emirate: '' });
  }

  async function placeOrder() {
    if (!user) return;
    if (!selectedId) {
      Alert.alert('Adresse requise', 'Sélectionnez ou ajoutez une adresse');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Panier vide');
      return;
    }

    setPlacing(true);
    const address = addresses.find((a) => a.id === selectedId);
    if (!address) {
      setPlacing(false);
      return;
    }

    // Re-fetch products server-side to avoid trusting client prices
    const ids = items.map((i) => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, product_images(url, position)')
      .in('id', ids)
      .eq('is_active', true);

    if (!products || products.length !== ids.length) {
      setPlacing(false);
      Alert.alert('Erreur', 'Certains produits ne sont plus disponibles');
      return;
    }

    let orderSubtotal = 0;
    const orderItems: any[] = [];
    for (const line of items) {
      const p = products.find((pp: any) => pp.id === line.product_id);
      if (!p) continue;
      if (p.stock_quantity < line.quantity) {
        setPlacing(false);
        Alert.alert('Stock insuffisant', `${p.name} : ${p.stock_quantity} dispo`);
        return;
      }
      const image =
        (p as any).product_images?.sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null;
      const price = Number(p.price);
      orderSubtotal += price * line.quantity;
      orderItems.push({
        product_id: p.id,
        product_name: p.name,
        product_image: image,
        price,
        quantity: line.quantity,
      });
    }

    const orderShipping = orderSubtotal >= 150 ? 0 : 7;
    const orderTotal = orderSubtotal + orderShipping;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: generateOrderNumber(),
        status: 'pending',
        subtotal: orderSubtotal,
        shipping_fee: orderShipping,
        total: orderTotal,
        shipping_address: address as any,
        payment_method: 'cod',
      })
      .select('id')
      .single();

    if (error || !order) {
      setPlacing(false);
      Alert.alert('Erreur', error?.message ?? 'Commande échouée');
      return;
    }

    await supabase
      .from('order_items')
      .insert(orderItems.map((oi) => ({ ...oi, order_id: order.id })));

    for (const oi of orderItems) {
      const { data: curr } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', oi.product_id)
        .single();
      if (curr) {
        await supabase
          .from('products')
          .update({ stock_quantity: Math.max(0, curr.stock_quantity - oi.quantity) })
          .eq('id', oi.product_id);
      }
    }

    clear();
    setPlacing(false);
    router.replace(`/orders/${order.id}` as any);
  }

  if (authLoading || !user) return null;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="gap-4 p-4">
        {/* Shipping address */}
        <View className="rounded-xl bg-white p-4">
          <Text className="mb-3 text-base font-bold">Adresse de livraison</Text>
          {addresses.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => setSelectedId(a.id)}
              className={`mb-2 rounded-lg border p-3 ${
                selectedId === a.id ? 'border-brand bg-brand-50' : 'border-gray-200'
              }`}
            >
              <Text className="font-semibold">
                {a.full_name}
                {a.is_default ? <Text className="text-xs text-brand"> · par défaut</Text> : null}
              </Text>
              <Text className="text-sm text-gray-600">{a.phone}</Text>
              <Text className="text-sm">
                {a.address_line1}, {a.city}
                {a.emirate ? `, ${a.emirate}` : ''}, {a.country}
              </Text>
            </Pressable>
          ))}
          {!showNew ? (
            <Pressable
              onPress={() => setShowNew(true)}
              className="mt-2 items-center rounded-lg border border-dashed border-gray-300 py-3"
            >
              <Text className="text-sm text-brand">+ Ajouter une adresse</Text>
            </Pressable>
          ) : (
            <View className="mt-2 gap-2">
              <TextInput
                placeholder="Nom complet"
                value={newAddr.full_name}
                onChangeText={(t) => setNewAddr({ ...newAddr, full_name: t })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
              <TextInput
                placeholder="Téléphone (+216 ...)"
                value={newAddr.phone}
                onChangeText={(t) => setNewAddr({ ...newAddr, phone: t })}
                keyboardType="phone-pad"
                className="rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
              <TextInput
                placeholder="Adresse"
                value={newAddr.address_line1}
                onChangeText={(t) => setNewAddr({ ...newAddr, address_line1: t })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
              <View className="flex-row gap-2">
                <TextInput
                  placeholder="Ville"
                  value={newAddr.city}
                  onChangeText={(t) => setNewAddr({ ...newAddr, city: t })}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
                />
                <TextInput
                  placeholder="Gouvernorat"
                  value={newAddr.emirate}
                  onChangeText={(t) => setNewAddr({ ...newAddr, emirate: t })}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
                />
              </View>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={saveAddress}
                  className="flex-1 items-center rounded-lg bg-brand py-2"
                >
                  <Text className="font-bold text-white">Enregistrer</Text>
                </Pressable>
                {addresses.length > 0 && (
                  <Pressable
                    onPress={() => setShowNew(false)}
                    className="flex-1 items-center rounded-lg border border-gray-300 py-2"
                  >
                    <Text>Annuler</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Payment */}
        <View className="rounded-xl bg-white p-4">
          <Text className="mb-3 text-base font-bold">Mode de paiement</Text>
          <View className="rounded-lg border border-brand bg-brand-50 p-3">
            <Text className="font-semibold">Paiement à la livraison</Text>
            <Text className="text-xs text-gray-600">
              Payez en espèces à la réception de votre commande
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View className="rounded-xl bg-white p-4">
          <Text className="mb-3 text-base font-bold">Récapitulatif</Text>
          {items.map((i) => (
            <View key={i.product_id} className="mb-2 flex-row justify-between">
              <Text className="flex-1 text-sm" numberOfLines={1}>
                {i.name} × {i.quantity}
              </Text>
              <Text className="text-sm font-medium">
                {formatPrice(Number(i.price) * i.quantity)}
              </Text>
            </View>
          ))}
          <View className="mt-2 border-t border-gray-200 pt-2">
            <View className="flex-row justify-between">
              <Text>Sous-total</Text>
              <Text>{formatPrice(sub)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text>Livraison</Text>
              <Text>{shipping === 0 ? 'GRATUITE' : formatPrice(shipping)}</Text>
            </View>
            <View className="mt-2 flex-row justify-between border-t border-gray-200 pt-2">
              <Text className="font-bold">Total</Text>
              <Text className="font-bold">{formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={placeOrder}
          disabled={placing}
          className="items-center rounded-full bg-brand py-3"
        >
          {placing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Passer la commande</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
