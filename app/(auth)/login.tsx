import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const refreshProfile = useAuth((s) => s.refreshProfile);

  async function onSubmit() {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Entrez email et mot de passe');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    await refreshProfile();
    router.replace('/(tabs)' as any);
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24 }}>
      <Text className="text-2xl font-bold">Bon retour</Text>
      <Text className="mt-1 text-sm text-gray-500">
        Connectez-vous pour continuer vos achats
      </Text>

      <View className="mt-6 gap-4">
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
          <Text className="mb-1 text-sm font-medium">Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base"
          />
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          className="mt-2 items-center rounded-full bg-brand py-3"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">Se connecter</Text>
          )}
        </Pressable>

        <View className="mt-4 items-center">
          <Text className="text-sm text-gray-500">
            Nouveau ?{' '}
            <Link href={'/(auth)/register' as any}>
              <Text className="font-semibold text-brand">Créer un compte</Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
