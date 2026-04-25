import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const refreshProfile = useAuth((s) => s.refreshProfile);

  async function onSubmit() {
    if (!email || !password || !fullName) {
      Alert.alert('Champs manquants', 'Nom, email et mot de passe requis');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Mot de passe', 'Minimum 8 caractères');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setLoading(false);
      Alert.alert('Erreur', error.message);
      return;
    }
    if (data.user && phone) {
      await supabase.from('profiles').update({ phone }).eq('id', data.user.id);
    }
    setLoading(false);
    await refreshProfile();
    if (data.session) {
      router.replace('/(tabs)' as any);
    } else {
      Alert.alert(
        'Vérifiez votre email',
        'Nous vous avons envoyé un lien de confirmation à votre adresse.',
      );
      router.replace('/(auth)/login' as any);
    }
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24 }}>
      <Text className="text-2xl font-bold">Créer un compte</Text>
      <Text className="mt-1 text-sm text-gray-500">
        Paiement rapide, suivi de commandes et bien plus
      </Text>

      <View className="mt-6 gap-4">
        <View>
          <Text className="mb-1 text-sm font-medium">Nom complet</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Votre nom"
            className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base"
          />
        </View>
        <View>
          <Text className="mb-1 text-sm font-medium">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="vous@example.com"
            className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base"
          />
        </View>
        <View>
          <Text className="mb-1 text-sm font-medium">Téléphone (optionnel)</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+216 ..."
            className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base"
          />
        </View>
        <View>
          <Text className="mb-1 text-sm font-medium">Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base"
          />
          <Text className="mt-1 text-xs text-gray-500">Au moins 8 caractères</Text>
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className="mt-2 items-center rounded-full bg-brand py-3"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Créer mon compte</Text>
          )}
        </Pressable>

        <View className="mt-4 items-center">
          <Text className="text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link href={'/(auth)/login' as any}>
              <Text className="font-semibold text-brand">Se connecter</Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
