import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  LogIn,
  UserPlus,
} from 'lucide-react-native';
import { useAuth } from '../../lib/auth';

function Row({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-b border-gray-100 bg-white px-4 py-4"
    >
      {icon}
      <Text className={`flex-1 text-base ${danger ? 'text-red-600' : 'text-gray-900'}`}>
        {label}
      </Text>
      <ChevronRight size={18} color="#9CA3AF" />
    </Pressable>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile, signOut, loading } = useAuth();

  if (loading) return <View className="flex-1 bg-white" />;

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-8">
        <User size={56} color="#9CA3AF" />
        <Text className="mt-4 text-xl font-bold">Mon compte</Text>
        <Text className="mt-1 text-center text-sm text-gray-500">
          Connectez-vous pour accéder à vos commandes, vos favoris et vos adresses.
        </Text>
        <View className="mt-6 w-full max-w-xs gap-3">
          <Pressable
            onPress={() => router.push('/(auth)/login' as any)}
            className="flex-row items-center justify-center gap-2 rounded-full bg-brand py-3"
          >
            <LogIn size={18} color="#FFFFFF" />
            <Text className="font-bold text-white">Se connecter</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(auth)/register' as any)}
            className="flex-row items-center justify-center gap-2 rounded-full border border-brand py-3"
          >
            <UserPlus size={18} color="#7C3AED" />
            <Text className="font-bold text-brand">Créer un compte</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="items-center bg-brand p-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <User size={32} color="#FFFFFF" />
        </View>
        <Text className="mt-3 text-xl font-bold text-white">
          {profile?.full_name ?? 'Utilisateur'}
        </Text>
        <Text className="mt-1 text-sm text-white/80">{user.email}</Text>
        {profile?.role === 'admin' && (
          <View className="mt-2 rounded-full bg-white/25 px-3 py-1">
            <Text className="text-xs font-semibold text-white">ADMIN</Text>
          </View>
        )}
      </View>

      <View className="mt-4">
        <Row
          icon={<ShoppingBag size={20} color="#374151" />}
          label="Mes commandes"
          onPress={() => router.push('/orders' as any)}
        />
        <Row
          icon={<MapPin size={20} color="#374151" />}
          label="Mes adresses"
          onPress={() => router.push('/addresses' as any)}
        />
        <Row
          icon={<Heart size={20} color="#374151" />}
          label="Mes favoris"
          onPress={() => router.push('/wishlist' as any)}
        />
        <Row
          icon={<User size={20} color="#374151" />}
          label="Modifier mon profil"
          onPress={() => router.push('/profile' as any)}
        />
      </View>

      <View className="mt-6">
        <Row
          icon={<LogOut size={20} color="#DC2626" />}
          label="Déconnexion"
          danger
          onPress={() => {
            Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Déconnecter', style: 'destructive', onPress: () => signOut() },
            ]);
          }}
        />
      </View>
    </ScrollView>
  );
}
