# 📋 Guía de Estructura y Convenciones - Institución App

## 🎯 Visión General
Proyecto de **React Native + Firebase** con arquitectura limpia, separación clara entre lógica y renderizado, y escalabilidad desde el inicio.

---

## 📁 Estructura de Carpetas

### 📱 Mobile App (React Native)

```
src/
├── public/                    # Pantallas públicas (sin autenticación)
│   ├── auth/
│   │   ├── login/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── useLoginLogic.ts
│   │   │   └── styles.ts
│   │   ├── register/
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── useRegisterLogic.ts
│   │   │   └── styles.ts
│   │   └── forgot-password/
│   │       ├── ForgotPasswordScreen.tsx
│   │       ├── useForgotPasswordLogic.ts
│   │       └── styles.ts
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
│   │   ├── auth.ts           # Autenticación Firebase
│   │   ├── users.ts          # Operaciones CRUD usuarios
│   │   └── storage.ts        # Almacenamiento
│   ├── notifications/        # Push notifications
│   └── deeplinks/            # Deep linking
│
├── utils/                     # Funciones utilitarias
│   ├── validators.ts         # Validación de datos
│   ├── formatters.ts         # Formateo de datos
│   ├── constants.ts          # Constantes de la app
│   └── errorHandler.ts       # Manejo de errores
│
├── types/                     # Tipos TypeScript globales
│   └── index.ts              # User, UserRole, CreateUserCredentials, etc
│
├── navigation/                # Configuración de navegación
│   ├── RootNavigator.tsx     # Navegador raíz (condicional auth)
│   ├── AuthNavigator.tsx     # Pantallas públicas
│   ├── AppNavigator.tsx      # Pantallas privadas
│   └── linking.ts            # Deep linking config
│
├── redux/                     # Estado global con Redux Toolkit
│   ├── store.ts
│   └── slices/
│       └── authSlice.ts      # Estado de autenticación
│
├── assets/                    # Recursos estáticos
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── lottie/
│
└── App.tsx                    # Punto de entrada

.env                          # Variables de entorno (NO incluir en git)
.env.example                  # Plantilla de variables
google-services.json          # Firebase config (NO incluir en git)
```

### 🌐 Web App (Vite + React)

```
web/
├── src/
│   ├── pages/                 # Páginas principales
│   │   ├── Users.tsx          # Gestión de usuarios (CRUD)
│   │   ├── Users.css
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.css
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── UserForm.tsx       # Formulario create/edit usuarios
│   │   ├── UserForm.css
│   │   ├── UsersList.tsx      # Tabla de usuarios
│   │   ├── UsersList.css
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Button.tsx
│   │   ├── layout/
│   │   └── ui/
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useUsers.ts        # Lógica CRUD usuarios
│   │   ├── useAuth.ts         # Autenticación
│   │   └── useFetch.ts        # Fetch genérico
│   │
│   ├── services/              # Servicios
│   │   ├── firebaseConfig.ts  # Config Firebase web
│   │   └── usersService.ts    # CRUD usuarios en Firestore
│   │
│   ├── types/                 # Tipos TypeScript
│   │   └── index.ts           # User, UserRole, etc (sincronizado con mobile)
│   │
│   ├── utils/                 # Utilitarios
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   │
│   ├── assets/                # Recursos
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── .env                       # Variables de entorno
├── .env.example               # Plantilla
├── vite.config.ts
├── tsconfig.json
├── ADMIN_GUIDE.md             # Documentación del panel admin
└── public/
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

## 👥 Sistema de Usuarios y Roles

### Tipos de Usuarios (UserRole)

```typescript
type UserRole = 'admin' | 'familia' | 'preceptor';
```

| Rol | Acceso | Descripción |
|-----|--------|-------------|
| **admin** | Email + Contraseña | Personal administrativo del instituto |
| **familia** | DNI + Contraseña | Padres/tutores de estudiantes |
| **preceptor** | Email + Contraseña | Docentes/preceptores |

### Interfaz User

```typescript
interface User {
  id: string;                    // ID único
  role: UserRole;                // admin, familia, preceptor
  email?: string;                // Para admin/preceptor
  dni?: string;                  // Para familia
  displayName: string;           // Nombre completo
  photoURL?: string;             // Foto de perfil
  createdAt: Date;              // Fecha creación
  updatedAt: Date;              // Última actualización
  enabledAt?: Date;             // Fecha habilitación
  pushTokens: string[];         // Tokens FCM (notificaciones)
  isEnabled: boolean;           // Cuenta activa/inactiva
  lastLogin?: Date;             // Último acceso
}
```

### Operaciones CRUD

#### Mobile (`src/services/firebase/users.ts`)
```typescript
createUser(userId, credentials)    // Crear usuario
getUser(userId)                    // Obtener por ID
getAllUsers()                      // Listar todos
getUsersByRole(role)               // Filtrar por rol
getUserByEmail(email)              // Buscar por email
getUserByDNI(dni)                  // Buscar por DNI
updateUser(userId, data)           // Actualizar
deleteUser(userId)                 // Eliminar
addPushToken(userId, token)        // Agregar token FCM
removePushToken(userId, token)     // Remover token FCM
```

#### Web (`web/src/services/usersService.ts`)
- Mismo conjunto de funciones que mobile
- Acceso desde panel admin

### Hook de Usuarios (Web)

```typescript
// web/src/hooks/useUsers.ts
const {
  users,                   // Array de usuarios
  filteredUsers,          // Usuarios filtrados
  selectedUser,           // Usuario seleccionado
  isLoading,              // Estado de carga
  error,                  // Mensaje de error
  success,                // Mensaje de éxito
  filter,                 // Filtro activo
  
  loadUsers(),            // Cargar usuarios
  createUser(),           // Crear nuevo usuario
  updateUserData(),       // Actualizar usuario
  deleteUserData(),       // Eliminar usuario
  selectUser(),           // Seleccionar usuario
  setFilter(),            // Cambiar filtro
} = useUsers();
```

---

## 🔐 Configuración de Credenciales

### Variables de Entorno - Mobile (.env)
```
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx
REACT_APP_FIREBASE_MEASUREMENT_ID=xxx
```

### Variables de Entorno - Web (web/.env)
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Instituto
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
- Los tokens se almacenan en `User.pushTokens[]` en Firestore

### Deep Linking
- `src/services/deeplinks/deepLinkingConfig.ts`
- Hook: `useDeepLinks.ts`
- Patrones de URL definidos en `src/navigation/linking.ts`

### Panel Admin Web
- **Ubicación**: `web/src/pages/Users.tsx`
- **Funcionalidades**: CRUD completo de usuarios
- **Componentes**:
  - `UserForm.tsx` - Formulario crear/editar
  - `UsersList.tsx` - Tabla de usuarios
- **Hook**: `useUsers.ts` - Lógica de usuarios
- **Guía**: `web/ADMIN_GUIDE.md`

#### Características del Panel:
✅ Crear usuario con rol específico
✅ Listar usuarios con filtros
✅ Editar datos de usuario (sin cambiar password)
✅ Eliminar usuarios
✅ Filtrar por rol
✅ Validación de email/DNI únicos
✅ Formulario dinámico según rol
✅ Estadísticas en tiempo real

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

## 📌 Cambios Recientes

### 2026-09-08
- ✅ Implementado panel admin para gestión de usuarios
- ✅ Actualizado sistema de roles (admin, familia, preceptor)
- ✅ Creado CRUD completo en web app
- ✅ Añadidas nuevas estructuras de datos (enabledAt, pushTokens, etc)
- ✅ Formulario dinámico según rol del usuario
- ✅ Tabla con filtros y acciones
- ✅ Documentación completa en ADMIN_GUIDE.md

---

**Última actualización**: 2026-09-08
**Responsable**: Proyecto Institucion App
