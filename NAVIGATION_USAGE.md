# 🗺️ Guía de Uso de Navegación

## 📚 Índice
1. [Lógica de Rutas](#lógica-de-rutas)
2. [Persistencia con AsyncStorage](#persistencia-con-asyncstorage)
3. [Deep Linking](#deep-linking)
4. [Redux Actions](#redux-actions)
5. [Ejemplos de Código](#ejemplos-de-código)

---

## 🎯 Lógica de Rutas

### Concepto Principal

La app tiene **dos mundos de navegación**:

```
┌─────────────────────────────┐
│   ¿Usuario Autenticado?     │
├─────────────────────────────┤
│                             │
│  SÍ → AppNavigator          │
│       (Protegido)           │
│       - Dashboard           │
│       - Profile             │
│       - Settings            │
│                             │
│  NO → AuthNavigator         │
│       (Público)             │
│       - Login               │
│       - Signup              │
│       - ForgotPassword      │
│                             │
└─────────────────────────────┘
```

### Flujo

```typescript
// En RootNavigator.tsx

const { isAuthenticated } = useSelector((state: RootState) => state.auth);

return (
  <NavigationContainer>
    {isAuthenticated ? (
      <AppNavigator />      // Si está logueado
    ) : (
      <AuthNavigator />     // Si NO está logueado
    )}
  </NavigationContainer>
);
```

---

## 💾 Persistencia con AsyncStorage

### Cómo Funciona

1. **Primera vez que abre la app:**
   ```
   App inicia → RootNavigator.bootstrapAsync()
   → Busca en AsyncStorage
   → No hay nada → isAuthenticated = false
   → Muestra AuthNavigator (Login)
   ```

2. **Usuario hace login:**
   ```
   handleLogin() → useAuth.login()
   → Firebase Auth valida
   → Redux: dispatch(loginSuccess(user))
   → AsyncStorage.setItem('user', user)
   ```

3. **Usuario cierra app y reabre:**
   ```
   App inicia → RootNavigator.bootstrapAsync()
   → Busca en AsyncStorage
   → ¡Encuentra el usuario!
   → Redux: dispatch(setUser(user))
   → isAuthenticated = true
   → Muestra AppNavigator (Dashboard)
   → ¡Sesión restaurada! ✅
   ```

4. **Usuario hace logout:**
   ```
   handleLogout() → useAuth.logout()
   → Firebase Auth: logout()
   → Redux: dispatch(logout())
   → AsyncStorage.removeItem('user')
   → isAuthenticated = false
   → Vuelve a AuthNavigator (Login)
   ```

### Código Relevante

```typescript
// RootNavigator.tsx - Recuperar sesión

const bootstrapAsync = async () => {
  try {
    dispatch(setLoading(true));
    
    // 1. Buscar usuario en AsyncStorage
    const userData = await AsyncStorage.getItem('user');
    
    // 2. Si existe, cargar en Redux
    if (userData) {
      dispatch(setUser(JSON.parse(userData)));
    } else {
      dispatch(setUser(null));
    }
  } finally {
    dispatch(setLoading(false));
    setIsReady(true);
  }
};
```

---

## 🔗 Deep Linking

### URLs Soportadas

```
// Públicas (sin autenticación)
myapp://login
myapp://signup
myapp://forgot-password

// Protegidas (requieren autenticación)
myapp://dashboard
myapp://profile/123
myapp://settings
myapp://post/456
myapp://search/react%20native

// Web
https://myapp.com/login
https://myapp.com/profile/123
```

### Cómo Funciona

```typescript
// linking.ts define qué URL va a qué pantalla

const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  
  config: {
    screens: {
      // Públicas
      Login: 'login',
      Signup: 'signup',
      
      // Protegidas
      Dashboard: 'dashboard',
      Profile: 'profile/:userId',
      Settings: 'settings',
    }
  }
};

// RootNavigator.tsx lo usa
<NavigationContainer linking={linking} ...>
```

### Ejemplo: Link a Perfil

```
1. Usuario recibe: myapp://profile/123
2. Toca el link
3. App abre o se pone en frente
4. RootNavigator procesa la URL
5. Navega a Profile screen con userId=123
6. Si no está logueado → Va a Login primero
```

---

## 🔀 Redux Actions

### Estado Auth

```typescript
// redux/slices/authSlice.ts

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}
```

### Actions Disponibles

```typescript
// Establecer usuario
dispatch(setUser(user))
dispatch(setUser(null))

// Estado de carga
dispatch(setLoading(true))
dispatch(setLoading(false))

// Errores
dispatch(setError(message))
dispatch(clearError())

// Login exitoso
dispatch(loginSuccess(user))

// Login fallido
dispatch(loginFailure(errorMessage))

// Logout
dispatch(logout())
```

### Acceder al Estado

```typescript
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const MyComponent = () => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
  } = useSelector((state: RootState) => state.auth);

  return (
    <View>
      <Text>{user?.displayName}</Text>
      {error && <Text>{error}</Text>}
      {isLoading && <ActivityIndicator />}
    </View>
  );
};
```

---

## 💻 Ejemplos de Código

### Ejemplo 1: Usar useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

const LoginScreen = () => {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({
        email: 'user@example.com',
        password: 'password123'
      });
      // Navegación ocurre automáticamente
      // porque Redux cambia isAuthenticated
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
      <Text>{isLoading ? 'Cargando...' : 'Login'}</Text>
    </TouchableOpacity>
  );
};
```

### Ejemplo 2: Proteger Pantalla

```typescript
import { useAuth } from '@/hooks/useAuth';

const ProtectedScreen = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Text>Acceso denegado</Text>;
  }

  return (
    <View>
      <Text>Bienvenido {user?.displayName}</Text>
    </View>
  );
};
```

### Ejemplo 3: Logout

```typescript
import { useAuth } from '@/hooks/useAuth';

const SettingsScreen = () => {
  const { logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navegación automática a AuthNavigator
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} disabled={isLoading}>
      <Text>{isLoading ? 'Cargando...' : 'Logout'}</Text>
    </TouchableOpacity>
  );
};
```

### Ejemplo 4: Acceder a Parámetros de Deep Link

```typescript
const ProfileScreen = ({ route }: any) => {
  const { userId } = route.params; // Viene de myapp://profile/123

  return (
    <View>
      <Text>Perfil del usuario {userId}</Text>
    </View>
  );
};
```

### Ejemplo 5: Redux Directo

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <TouchableOpacity onPress={() => dispatch(logout())}>
      <Text>Logout</Text>
    </TouchableOpacity>
  );
};
```

---

## 🔍 Debugging

### Ver Estado Redux

```typescript
// En cualquier componente
const auth = useSelector((state: RootState) => state.auth);
console.log('Auth State:', auth);
```

### Ver AsyncStorage

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ver todo lo que hay
const allKeys = await AsyncStorage.getAllKeys();
console.log('AsyncStorage keys:', allKeys);

// Ver usuario guardado
const user = await AsyncStorage.getItem('user');
console.log('Stored user:', user);

// Limpiar todo (para testing)
await AsyncStorage.clear();
```

### Log de Navegación

```typescript
// En RootNavigator.tsx
<NavigationContainer
  onReady={() => console.log('Navigation ready')}
  linking={linking}
  fallback={<SplashScreen />}
>
```

---

## 📋 Checklist

- ✅ Instalar dependencias
- ✅ Redux Store configurado
- ✅ Auth Slice creado
- ✅ RootNavigator con lógica de rutas
- ✅ AuthNavigator con Login
- ✅ AppNavigator con Dashboard
- ✅ Deep Linking configurado
- ✅ AsyncStorage para persistencia
- ✅ useAuth Hook integrado

---

## 🚀 Próximos Pasos

1. Instalar dependencias: `bash INSTALL_NAVIGATION.sh`
2. Ejecutar app: `npm run ios` o `npm run android`
3. Probar Login → Dashboard → Logout
4. Probar cerrar y reabrirla (persistencia)
5. Probar deep linking: `xcrun simctl openurl booted "myapp://profile/123"`

---

**¡Listo para navegar!** 🗺️
