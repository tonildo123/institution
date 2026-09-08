# 🗺️ Configuración de Navegación

## 📦 Dependencias Necesarias

Ejecuta estos comandos para instalar React Navigation:

```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack

# Dependencias de React Native
npm install react-native-screens react-native-safe-area-context

# Para AsyncStorage (persistencia)
npm install @react-native-async-storage/async-storage

# Para Redux (estado global - opcional pero recomendado)
npm install @reduxjs/toolkit react-redux

# Para Deep Linking
npm install deep-link-handler
```

### Dependencias Recomendadas (en order de instalación):

```bash
# 1. Navegación base
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context

# 2. Navegadores
npm install @react-navigation/native-stack
npm install @react-navigation/bottom-tabs

# 3. Persistencia
npm install @react-native-async-storage/async-storage

# 4. Estado global (Redux)
npm install @reduxjs/toolkit react-redux

# 5. Debugging (optional)
npm install redux-logger
```

---

## 🏗️ Estructura que Vamos a Crear

```
src/
├── navigation/
│   ├── RootNavigator.tsx          # Navigator principal
│   ├── AuthNavigator.tsx          # Pantallas de autenticación
│   ├── AppNavigator.tsx           # Pantallas protegidas
│   ├── linking.ts                 # Configuración Deep Linking
│   └── navigationRef.ts           # Referencia para navegación global
│
├── redux/                         # Estado global
│   ├── store.ts                   # Configuración Redux
│   └── slices/
│       └── authSlice.ts           # Estado de autenticación
│
├── screens/
│   ├── public/
│   │   └── auth/
│   │       └── login/
│   ├── private/
│   │   └── dashboard/
│   └── ...
│
└── App.tsx                        # Punto de entrada con navegación
```

---

## ✨ Lógica de Rutas (IMPORTANTE)

```
┌─────────────────────────────────┐
│     Check User State            │
├─────────────────────────────────┤
│                                 │
│  useAuth() → isAuthenticated    │
│       ↓                         │
│  if (isAuthenticated)           │
│    → AppNavigator              │
│       (Dashboard, Profile, etc) │
│  else                           │
│    → AuthNavigator             │
│       (Login, Signup, etc)      │
│                                 │
└─────────────────────────────────┘
```

---

## 🔄 Persistencia (AsyncStorage)

La sesión se persistirá así:

```
1. App inicia
   ↓
2. Recupera estado de AsyncStorage
   ↓
3. Si hay user guardado → setUser(user)
   ↓
4. Navega a AppNavigator (privado)
   ↓
5. Si no hay user → Navega a AuthNavigator (público)
   ↓
6. Usuario hace login → Guarda en AsyncStorage
   ↓
7. Cierra app, reabre → Mantiene la sesión
```

---

## 🔗 Deep Linking

Soportaremos URLs como:

```
myapp://login
myapp://dashboard
myapp://profile/123
myapp://post/456
```

---

## 📋 Próximos Pasos

1. ✅ Instalar dependencias (comando arriba)
2. ⏳ Crear Redux store
3. ⏳ Crear AuthNavigator
4. ⏳ Crear AppNavigator
5. ⏳ Crear RootNavigator
6. ⏳ Configurar Deep Linking
7. ⏳ Actualizar App.tsx

