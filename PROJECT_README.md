# 📱 Institución App

**React Native + Firebase** - Aplicación moderna con autenticación, notificaciones push y deep linking.

---

## 🚀 Quick Start

### 1. Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar con tus credenciales de Firebase
# Edita el archivo .env con tus valores
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a Configuración del Proyecto → Aplicaciones
4. Descarga el archivo `google-services.json`
5. Colócalo en `android/app/`
6. Copia las credenciales en tu `.env`

### 3. Ejecutar

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

---

## 📁 Estructura del Proyecto

Ver [CLAUDE.md](./CLAUDE.md) para la estructura completa y convenciones de código.

```
src/
├── public/              # Pantallas sin autenticación
│   └── auth/login/      # Módulo de login ✨ EJEMPLO
├── private/             # Pantallas autenticadas
├── components/          # Componentes reutilizables
├── hooks/               # Custom hooks
├── services/            # Servicios y APIs
├── utils/               # Funciones utilitarias
├── types/               # Tipos TypeScript
├── assets/              # Imágenes, fuentes, etc
├── navigation/          # Configuración de navegación
└── App.tsx              # Punto de entrada
```

---

## 🎯 Patrón: Lógica + Renderizado

### ✅ Correcto

```typescript
// LoginScreen.tsx - Solo renderizado
const LoginScreen = () => {
  const { email, password, handleLogin } = useLoginLogic();
  
  return (
    <View>
      <TextInput value={email} />
      <TouchableOpacity onPress={handleLogin}>
        <Text>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// useLoginLogic.ts - Toda la lógica
export const useLoginLogic = () => {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  
  const handleLogin = async () => { /* lógica */ };
  
  return { email, handleLogin };
};
```

---

## 🔐 Autenticación

El proyecto usa **Firebase Auth** con el hook `useAuth`:

```typescript
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Text>Inicia sesión</Text>;
  }
  
  return <Text>Bienvenido {user?.displayName}</Text>;
};
```

---

## 📝 Ejemplo: LoginScreen

Consulta la carpeta `src/public/auth/login/` para ver un ejemplo completo:

- **LoginScreen.tsx** - Componente de UI
- **useLoginLogic.ts** - Hook con lógica
- **styles.ts** - Estilos
- **types.ts** - Tipos TypeScript
- **README.md** - Documentación del módulo

### Características:

✅ Separación lógica-renderizado  
✅ Validación de formulario  
✅ Manejo de errores  
✅ Indicadores de carga  
✅ Accesibilidad  
✅ Estilos limpios  

---

## 🔔 Notificaciones Push

Configuradas con Firebase Cloud Messaging:

```typescript
import { useNotifications } from '@/hooks/useNotifications';

const MyComponent = () => {
  const { requestPermission, sendNotification } = useNotifications();
  
  useEffect(() => {
    requestPermission();
  }, []);
};
```

Ver: `src/services/notifications/`

---

## 🔗 Deep Linking

Navega a pantallas específicas desde URLs externas:

```typescript
// Configuración en navigation/linking.ts
{
  screens: {
    'Profile': 'profile/:userId',
    'Post': 'post/:postId',
  }
}

// Link: myapp://profile/123
```

Ver: `src/services/deeplinks/`

---

## 🛠️ Principales Servicios

### Firebase Auth
```typescript
import { useAuth } from '@/hooks/useAuth';

const { login, signUp, logout, resetPassword } = useAuth();
```

### Validación
```typescript
import { isValidEmail, isValidPassword } from '@/utils/validators';

if (isValidEmail(email)) {
  // Proceder
}
```

### Manejo de Errores
```typescript
import { getErrorMessage } from '@/utils/errorHandler';

try {
  // operación
} catch (error) {
  const message = getErrorMessage(error);
}
```

---

## 📚 Mejores Prácticas

✅ **Separación de responsabilidades**: Hooks para lógica, componentes para UI  
✅ **TypeScript**: Todo tipado  
✅ **Reutilización**: Componentes y hooks modulares  
✅ **Error Handling**: Mensajes amigables  
✅ **Testing**: Estructura preparada  
✅ **Seguridad**: Credenciales en .env  

---

## 🚦 Próximos Pasos

- [ ] Crear SignUp screen
- [ ] Implementar ForgotPassword flow
- [ ] Crear Dashboard principal
- [ ] Configurar notificaciones push
- [ ] Implementar deep linking
- [ ] Agregar unit tests
- [ ] Configurar CI/CD

---

## 📖 Documentación

- **[CLAUDE.md](./CLAUDE.md)** - Convenciones y estructura completa
- **[src/public/auth/login/README.md](./src/public/auth/login/README.md)** - Documentación del módulo Login

---

## 🆘 Troubleshooting

### Error: "Cannot find module '@/...'"

Asegúrate de que tu `tsconfig.json` tiene configurado el path alias:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Error de Firebase

1. Verifica que `.env` tiene todas las variables
2. Descarga `google-services.json` desde Firebase Console
3. Colócalo en `android/app/`

---

**Última actualización**: 2026-09-07  
**Versión**: 1.0.0  
**Responsable**: Proyecto Institución App
