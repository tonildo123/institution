# 📋 Guía de Estructura y Convenciones - Institución App

## 🎯 Visión General
Proyecto de **React Native + Firebase** con arquitectura limpia, separación clara entre lógica y renderizado, y escalabilidad desde el inicio.

---

## 📁 Estructura de Carpetas

```
src/
├── public/                    # Pantallas públicas (sin autenticación)
│   ├── auth/
│   │   ├── login/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── useLoginLogic.ts
│   │   │   └── types.ts
│   │   ├── signup/
│   │   └── recovery/
│   └── onboarding/
│
├── private/                   # Pantallas privadas (requieren autenticación)
│   ├── dashboard/
│   ├── profile/
│   └── settings/
│
├── components/                # Componentes reutilizables
│   ├── common/               # Botones, inputs, modales, etc
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Modal.tsx
│   ├── layout/               # Header, Footer, Drawer
│   │   ├── Header.tsx
│   │   └── SafeAreaWrapper.tsx
│   └── ui/                   # Elementos específicos del diseño
│
├── hooks/                     # Custom hooks reutilizables
│   ├── useAuth.ts            # Autenticación y sesión
│   ├── useFirestore.ts       # Operaciones con Firestore
│   ├── useNotifications.ts   # Push notifications
│   ├── useDeepLinks.ts       # Deep linking
│   └── useForm.ts            # Validación de formularios
│
├── services/                  # Servicios y configuración
│   ├── firebase/
│   │   ├── firebaseConfig.ts
│   │   ├── auth.ts           # Funciones de autenticación
│   │   ├── firestore.ts      # Operaciones con Firestore
│   │   └── storage.ts        # Almacenamiento
│   ├── notifications/        # Configuración de push notifications
│   └── deeplinks/            # Configuración de deep links
│
├── utils/                     # Funciones utilitarias
│   ├── validators.ts         # Validación de datos
│   ├── formatters.ts         # Formateo de datos
│   ├── constants.ts          # Constantes de la app
│   └── errorHandler.ts       # Manejo de errores
│
├── types/                     # Tipos TypeScript globales
│   ├── index.ts
│   ├── user.ts
│   └── api.ts
│
├── navigation/                # Configuración de navegación
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── AppNavigator.tsx
│
├── assets/                    # Recursos estáticos
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── lottie/               # Animaciones
│
├── context/                   # Context API para estado global
│   ├── AuthContext.tsx
│   └── AppContext.tsx
│
├── redux/ (opcional)          # O Redux Toolkit si se necesita estado complejo
│   ├── store.ts
│   └── slices/
│
└── App.tsx                    # Punto de entrada principal

.env                          # Variables de entorno (NO incluir en git)
.env.example                  # Plantilla de variables de entorno
google-services.json          # Firebase config (NO incluir en git)
```

---

## 🎨 Patrón de Componentes: Lógica + Renderizado

### ✅ Estructura Correcta

Todos los componentes siguen este patrón:

```typescript
// LoginScreen.tsx
import { useLoginLogic } from './useLoginLogic';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles';

const LoginScreen = () => {
  // 1️⃣ IMPORTS y HOOKS
  const {
    email,
    password,
    loading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
  } = useLoginLogic();

  // 2️⃣ LÓGICA ADICIONAL (si es necesaria en el componente)
  // La mayor parte debe estar en el hook

  // 3️⃣ RENDERIZADO
  return (
    <View style={styles.container}>
      {/* UI */}
    </View>
  );
};

export default LoginScreen;
```

### 📝 Hook de Lógica (useLoginLogic.ts)

```typescript
// useLoginLogic.ts
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useLoginLogic = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleLogin = async () => {
    // Toda la lógica aquí
  };

  return {
    email,
    password,
    loading,
    error,
    handleEmailChange: setEmail,
    handlePasswordChange: setPassword,
    handleLogin,
  };
};
```

---

## 🔐 Configuración de Credenciales

### Variables de Entorno (.env)
```
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx
REACT_APP_FIREBASE_MEASUREMENT_ID=xxx
```

### google-services.json
- Descargar desde Firebase Console
- Ubicar en `android/app/` (no incluir en git)
- Agregar a `.gitignore`

---

## 🔔 Características Especiales

### Notificaciones Push
- `src/services/notifications/pushNotifications.ts`
- Hook: `useNotifications.ts`
- Usar: **Firebase Cloud Messaging (FCM)**

### Deep Linking
- `src/services/deeplinks/deepLinkingConfig.ts`
- Hook: `useDeepLinks.ts`
- Patrones de URL definidos en `src/navigation/linking.ts`

---

## 🛠️ Tecnologías y Dependencias

- **React Native** + **TypeScript**
- **Firebase Auth** - Autenticación
- **Firestore** - Base de datos
- **Firebase Cloud Functions** - Backend
- **Firebase Cloud Messaging** - Push notifications
- **React Navigation** - Navegación
- **Context API / Redux Toolkit** - Estado global
- **React Hook Form** - Formularios

---

## ✨ Mejores Prácticas

1. ✅ **Separación de responsabilidades**: Lógica en hooks, UI en componentes
2. ✅ **Tipos TypeScript**: Todas las funciones y estados tipados
3. ✅ **Reutilización**: Componentes y hooks modulares
4. ✅ **Error Handling**: Manejo consistente de errores
5. ✅ **Performance**: Memoización donde sea necesario
6. ✅ **Testing**: Estructura preparada para tests

---

## 📚 Próximos Pasos

1. Crear estructura de carpetas
2. Configurar Firebase
3. Implementar AuthContext
4. Crear LoginScreen con lógica
5. Configurar navegación

---

**Última actualización**: 2026-09-07
**Responsable**: Proyecto Institucion App
