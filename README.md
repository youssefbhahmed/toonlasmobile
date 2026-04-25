# toon. — Application mobile (Expo / React Native)

Application mobile native qui partage le backend Supabase du projet web `toonlas`.

**Stack** : Expo 54 · React Native 0.81 · expo-router · Supabase · NativeWind (Tailwind) · Zustand · lucide-react-native

---

## 📦 Installation locale

```bash
git clone https://github.com/youssefbhahmed/toonlas-mobile.git
cd toonlas-mobile
npm install --legacy-peer-deps
```

Les clés Supabase sont déjà dans `app.json` → `extra.supabaseUrl` / `extra.supabaseAnonKey`.

---

## ▶️ Tester sur votre téléphone (pas besoin de Mac)

### 1 · Installez **Expo Go** sur votre téléphone

- iOS : https://apps.apple.com/app/expo-go/id982107779
- Android : https://play.google.com/store/apps/details?id=host.exp.exponent

### 2 · Lancez le serveur dev

```bash
npm start
```

Un QR code apparaît dans le terminal.

### 3 · Scannez le QR code

- **iOS** : avec l'app Appareil photo du téléphone
- **Android** : avec l'app Expo Go (bouton Scan QR Code)

L'app se charge sur votre téléphone en ~30 s. Modifiez un fichier → hot reload instantané sur le téléphone.

**💡 Il faut que votre téléphone et votre PC soient sur le même réseau WiFi.**

---

## 🏗️ Builder pour l'App Store / Google Play

### Prérequis
- Compte **Expo** (gratuit) : https://expo.dev/signup
- Compte **Apple Developer** (99 $/an) pour iOS
- Compte **Google Play Console** (25 $ une fois) pour Android

### Installation de EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Configuration initiale

```bash
cd toonlas-mobile
eas build:configure
```

Ça crée `eas.json` automatiquement.

### Build Android (APK pour tester ou AAB pour le store)

```bash
# APK pour installation directe sur un phone (tester avant publication)
eas build --platform android --profile preview

# AAB pour publication Play Store
eas build --platform android --profile production
```

EAS compile dans le cloud (~15 min). Lien de téléchargement envoyé par email.

### Build iOS (nécessite compte Apple Developer)

```bash
eas build --platform ios --profile production
```

EAS gère les certificats Apple automatiquement (il vous demande vos identifiants Apple Developer une fois).

### Soumettre aux stores

```bash
# Android Play Store
eas submit --platform android

# Apple App Store
eas submit --platform ios
```

**Note Play Store** : la première fois, vous devez remplir manuellement la fiche (description, screenshots, classification) sur **https://play.google.com/console/**. EAS pousse juste le binaire.

**Note App Store** : même chose sur **https://appstoreconnect.apple.com/**.

---

## 📱 Ce qui est implémenté

### Écrans
- ✅ Accueil (hero + catégories + phares + nouveautés)
- ✅ Recherche produit (debouncée)
- ✅ Catégorie (liste avec sous-catégories)
- ✅ Détail produit (galerie swipeable, ajout panier, favoris)
- ✅ Panier (modification qty, suppression, livraison calculée)
- ✅ Checkout (sélection adresse + ajout adresse + commande)
- ✅ Compte (profil, commandes, adresses, favoris, déconnexion)
- ✅ Connexion / Inscription
- ✅ Mes commandes + détail commande
- ✅ Mes adresses (CRUD)
- ✅ Mes favoris
- ✅ Mon profil (édition nom/téléphone)

### Backend partagé
- Même DB Supabase que le site web → **les commandes passées mobile apparaissent sur le web et vice-versa**
- Même RLS, mêmes triggers, mêmes règles de sécurité
- Session persistée via AsyncStorage (auto-reconnexion au lancement)

### UI
- **NativeWind** : classes Tailwind partout (cohérence avec le web)
- **Tabs natives** : Accueil / Rechercher / Panier / Compte
- **Stack navigation** : push/back fluide iOS + Android
- **Thème violet** (#7C3AED) cohérent avec la marque

---

## ⚠️ Ce qui n'est pas dans la v1

- Admin (faire via le site web)
- Avis produit (affichage inclus mais pas l'écriture)
- Notifications push (à ajouter via `expo-notifications`)
- Paiement en ligne (uniquement paiement à la livraison)
- Mode hors ligne

---

## 🔧 Personnalisation rapide

### Changer les couleurs
- `tailwind.config.js` → section `colors.brand`
- `app.json` → `splash.backgroundColor`, `android.adaptiveIcon.backgroundColor`
- `app/_layout.tsx` → `headerStyle.backgroundColor`

### Changer l'icône et le splash
Remplacer dans `assets/` :
- `icon.png` (1024 × 1024)
- `splash-icon.png` (transparent, centré)
- `adaptive-icon.png` (Android, 1024 × 1024)
- `favicon.png` (web)

Puis `eas build --clear-cache`.

### Changer le nom de l'app
`app.json` → `expo.name` et `expo.slug`.

---

## 🐛 Dépannage

| Symptôme | Solution |
|---|---|
| `Metro bundler` affiche une erreur NativeWind | Supprimez `.expo/` et `node_modules/.cache/` puis `npm start -c` |
| Mon téléphone ne scanne pas le QR | Utilisez `npm start --tunnel` (connexion via Ngrok, plus lent mais fonctionne derrière NAT/firewall) |
| Images ne chargent pas | Vérifiez que votre DB Supabase a bien les URLs refreshées (`refresh_images_*.sql`) |
| Connexion échoue avec "Invalid credentials" | Vérifiez que l'email a `email_confirmed_at` non null dans `auth.users` |

---

## 📄 Licence

Projet de démonstration — MIT.
