# Afri-pro Project Structure

## ✅ Fixed Issues
1. ✅ Removed duplicate `/src/app` folder (was conflicting with `/app`)
2. ✅ Cleaned up `App.tsx` entry point (now only imports `expo-router/entry`)
3. ✅ Fixed root layout with proper `StatusBar` component
4. ✅ Installed missing `babel-preset-expo` dependency
5. ✅ Cleaned Expo cache and build artifacts

## 📁 Project Structure

```
Afri-pro/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx              # Root layout with navigation
│   ├── (auth)/                  # Auth route group
│   │   ├── _layout.tsx          # Auth layout
│   │   ├── index.tsx            # Redirects to login
│   │   ├── login.tsx            # Login screen ✨ (main entry point)
│   │   └── register.tsx         # Register screen
│   └── (app)/                   # Protected app routes
│       ├── _layout.tsx          # App layout
│       ├── dashboard.tsx        # Dashboard screen
│       └── profile.tsx          # Profile screen
│
├── src/                          # Business logic & reusable code
│   ├── components/              # Reusable UI components
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Header.tsx
│   ├── config/                  # Configuration
│   │   ├── theme.ts            # Colors, spacing, typography
│   │   └── env.ts              # Environment variables
│   ├── hooks/                   # Custom React hooks
│   │   └── useAuth.ts          # Authentication hook
│   ├── services/                # API services
│   │   ├── api/
│   │   │   ├── client.ts       # Axios instance with interceptors
│   │   │   └── endpoints.ts    # API endpoints
│   │   ├── auth.service.ts     # Auth API calls
│   │   └── storage.service.ts  # Storage abstraction
│   ├── store/                   # Zustand state management
│   │   ├── authStore.ts        # Auth state store
│   │   └── index.ts            # Store exports
│   ├── types/                   # TypeScript types
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   └── common.types.ts
│   └── utils/                   # Helper functions
│       ├── constants.ts
│       ├── errors.ts
│       └── validation.ts
│
├── App.tsx                       # Entry point (minimal - imports expo-router)
├── index.ts                      # Root component registration
├── index.html                    # Web entry HTML
├── app.json                      # Expo configuration
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler config
├── tsconfig.json                # TypeScript config
├── .env.local                   # Environment variables
└── package.json                 # Dependencies

```

## 🚀 Navigation Flow

```
App.tsx
  ↓
index.ts (registerRootComponent)
  ↓
app/_layout.tsx (Root layout with StatusBar)
  ↓
  ├─ (auth) group
  │   └─ login.tsx ✨ (User sees this first)
  │   └─ register.tsx
  │
  └─ (app) group (Protected routes)
      ├─ dashboard.tsx
      └─ profile.tsx
```

## 🎨 Design System

Colors from `src/config/theme.ts`:
- **Primary**: Violet (#6B2D8B) dark (#4A1E61)
- **Accent**: Orange (#E8521A) for CTAs
- **Palette**: Complete gray scale (50-800)
- **Status**: Success, Warning, Danger, Info, Teal

## 📦 Key Dependencies

- **expo-router** v6: File-based routing
- **zustand**: State management
- **axios**: HTTP client
- **react-native-reanimated**: Animations
- **expo-secure-store**: Secure storage
- **@react-native-async-storage**: Local storage

## 🔧 Configuration Files

### app.json
- Expo configuration
- Platform-specific settings
- Plugins (expo-router, expo-secure-store)

### babel.config.js
```javascript
presets: ['babel-preset-expo']  // Handles React Native + Web compilation
plugins: ['react-native-reanimated/plugin']
```

### metro.config.js
- Custom Metro bundler config
- Handles Expo runtime for web

### .env.local
```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENV=development
```

## 🚦 To Start Development

```bash
# Install dependencies (if not done)
npm install

# Start development server with cache clear
npm start -- --clear

# Press options:
# w = Web (opens in browser)
# a = Android Emulator
# i = iOS Simulator
```

## ✨ Login Screen First Page

The login screen (`app/(auth)/login.tsx`) is the first page users see:
- Beautiful violet gradient
- Feature showcase (3 items)
- Role selection grid (5 roles)
- Username/password fields
- Demo credentials display
- Error validation

## 🔐 Authentication Flow

1. User enters credentials on login screen
2. `useAuth()` hook calls `authService.login()`
3. API client sends POST to `/auth/login`
4. Token stored in secure store
5. User data stored in AsyncStorage
6. Redirects to dashboard on success

---

**Project is now properly structured and ready for development!** 🎉
