import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function ProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
  }, [profile]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName || null, phone: phone || null })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    await refreshProfile();
    Alert.alert('Enregistré', 'Votre profil a été mis à jour');
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen options={{ title: 'Mon profil' }} />
      <View className="gap-4">
        <View>
          <Text className="mb-1 text-sm font-medium">Email</Text>
          <TextInput
            value={user?.email ?? ''}
            editable={false}
            className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-3 text-base text-gray-500"
          />
        </View>
        <View>
          <Text className="mb-1 text-sm font-medium">Nom complet</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base"
          />
        </View>
        <View>
          <Text className="mb-1 text-sm font-medium">Téléphone</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base"
          />
        </View>
        <Pressable
          onPress={save}
          disabled={saving}
          className="mt-2 items-center rounded-full bg-brand py-3"
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Enregistrer</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
