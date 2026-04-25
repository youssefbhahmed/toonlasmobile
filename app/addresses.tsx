import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import type { Address } from '../types/database';

export default function AddressesScreen() {
  const user = useAuth((s) => s.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    city: '',
    emirate: '',
  });

  async function refresh() {
    if (!user) return;
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    setAddresses(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function save() {
    if (!user) return;
    if (!form.full_name || !form.phone || !form.address_line1 || !form.city) {
      Alert.alert('Champs manquants');
      return;
    }
    const { error } = await supabase
      .from('addresses')
      .insert({ ...form, country: 'Tunisie', user_id: user.id });
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    setForm({ full_name: '', phone: '', address_line1: '', city: '', emirate: '' });
    setShowForm(false);
    refresh();
  }

  async function del(id: string) {
    Alert.alert('Supprimer', 'Supprimer cette adresse ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('addresses').delete().eq('id', id);
          refresh();
        },
      },
    ]);
  }

  async function setDefault(id: string) {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    refresh();
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Stack.Screen options={{ title: 'Mes adresses' }} />
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: 'Mes adresses' }} />
      <View className="gap-3 p-4">
        {addresses.map((a) => (
          <View key={a.id} className="rounded-xl bg-white p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-bold">{a.full_name}</Text>
              {a.is_default && <Text className="text-xs text-brand">Par défaut</Text>}
            </View>
            <Text className="text-sm text-gray-600">{a.phone}</Text>
            <Text className="text-sm">
              {a.address_line1}
              {a.address_line2 ? `, ${a.address_line2}` : ''}, {a.city}
              {a.emirate ? `, ${a.emirate}` : ''}, {a.country}
            </Text>
            <View className="mt-3 flex-row gap-4">
              {!a.is_default && (
                <Pressable onPress={() => setDefault(a.id)}>
                  <Text className="text-sm text-brand">Définir par défaut</Text>
                </Pressable>
              )}
              <Pressable onPress={() => del(a.id)}>
                <Text className="text-sm text-red-600">Supprimer</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {!showForm ? (
          <Pressable
            onPress={() => setShowForm(true)}
            className="items-center rounded-full bg-brand py-3"
          >
            <Text className="font-bold text-white">+ Ajouter une adresse</Text>
          </Pressable>
        ) : (
          <View className="gap-2 rounded-xl bg-white p-4">
            <TextInput
              placeholder="Nom complet"
              value={form.full_name}
              onChangeText={(t) => setForm({ ...form, full_name: t })}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2"
            />
            <TextInput
              placeholder="Téléphone"
              value={form.phone}
              onChangeText={(t) => setForm({ ...form, phone: t })}
              keyboardType="phone-pad"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2"
            />
            <TextInput
              placeholder="Adresse"
              value={form.address_line1}
              onChangeText={(t) => setForm({ ...form, address_line1: t })}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2"
            />
            <View className="flex-row gap-2">
              <TextInput
                placeholder="Ville"
                value={form.city}
                onChangeText={(t) => setForm({ ...form, city: t })}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
              <TextInput
                placeholder="Gouvernorat"
                value={form.emirate}
                onChangeText={(t) => setForm({ ...form, emirate: t })}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
            </View>
            <View className="mt-2 flex-row gap-2">
              <Pressable
                onPress={save}
                className="flex-1 items-center rounded-lg bg-brand py-2"
              >
                <Text className="font-bold text-white">Enregistrer</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowForm(false)}
                className="flex-1 items-center rounded-lg border border-gray-300 py-2"
              >
                <Text>Annuler</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
