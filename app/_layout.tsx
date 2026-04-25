import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { AppDrawer } from '../components/AppDrawer';

export default function RootLayout() {
  const init = useAuth((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#F47B20" />
        <AppDrawer />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#F47B20' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: '#FFFFFF' },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[slug]" options={{ title: 'Produit', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="category/[slug]" options={{ title: 'Catégorie', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="checkout" options={{ title: 'Paiement', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="(auth)/login" options={{ title: 'Connexion', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="(auth)/register" options={{ title: 'Inscription', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="orders/[id]" options={{ title: 'Commande', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="search" options={{ title: 'Rechercher', headerBackTitle: 'Retour' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
