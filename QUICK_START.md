# 🚀 Quick Start Guide

## 📋 Pasos Iniciales

### 1. Leer la Documentación
```bash
cat CLAUDE.md
```
Esto te mostrará:
- Estructura completa del proyecto
- Convenciones de código
- Patrón lógica + renderizado
- Mejores prácticas

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env
```
Luego edita `.env` con tus credenciales de Firebase

### 3. Ver el Ejemplo: LoginScreen
```bash
# Abre estos archivos en tu editor
src/public/auth/login/LoginScreen.tsx
src/public/auth/login/useLoginLogic.ts
src/public/auth/login/styles.ts
```

### 4. Instalar Dependencias
```bash
npm install
```

### 5. Ejecutar la App
```bash
# iOS
npm run ios

# Android
npm run android
```

---

## 📁 Explorar la Estructura

```bash
# Ver la estructura de carpetas
tree src -I 'node_modules'

# Ver todos los archivos TypeScript creados
find src -name "*.ts*" | sort

# Ver documentación
ls -la *.md
```

---

## 🎯 Arquivos Más Importantes

| Archivo | Descripción | Acción |
|---------|------------|--------|
| **CLAUDE.md** | Guía completa | ✅ LEE PRIMERO |
| **src/public/auth/login/LoginScreen.tsx** | Ejemplo de componente | Análisis |
| **src/public/auth/login/useLoginLogic.ts** | Ejemplo de hook con lógica | Análisis |
| **src/hooks/useAuth.ts** | Hook de autenticación | Usar |
| **src/services/firebase/auth.ts** | Servicios Firebase | Referencia |
| **.env.example** | Template variables | Copiar a .env |

---

## 💻 Crear una Nueva Pantalla

Sigue este patrón (basado en LoginScreen):

```bash
# 1. Crear carpeta
mkdir -p src/public/auth/signup

# 2. Crear archivos
touch src/public/auth/signup/{SignupScreen.tsx,useSignupLogic.ts,styles.ts,types.ts,README.md}
```

### Plantilla SignupScreen.tsx
```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useSignupLogic } from './useSignupLogic';
import styles from './styles';

const SignupScreen = ({ navigation }: any) => {
  const {
    // Desestructura aquí todo del hook
  } = useSignupLogic();

  return (
    <View style={styles.container}>
      {/* Renderizar aquí */}
    </View>
  );
};

export default SignupScreen;
```

### Plantilla useSignupLogic.ts
```typescript
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useSignupLogic = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ... más estado
  
  const { signUp } = useAuth();

  const handleSignup = async () => {
    // Lógica aquí
  };

  return {
    email,
    password,
    handleSignup,
    // ... retorna todo lo que necesita el componente
  };
};
```

---

## 🔗 Integración Firebase

### Obtener Credenciales

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un proyecto nuevo
3. Ve a "Project Settings" (engranaje)
4. Copia las credenciales en `.env`

### Ejemplo .env
```
REACT_APP_FIREBASE_API_KEY=AIzaSyD...
REACT_APP_FIREBASE_AUTH_DOMAIN=myproject.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=myproject
REACT_APP_FIREBASE_STORAGE_BUCKET=myproject.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc...
REACT_APP_FIREBASE_MEASUREMENT_ID=G-ABC...
```

---

## 🔑 Usar Autenticación

```typescript
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, error } = useAuth();

  if (!isAuthenticated) {
    return <Text>Por favor inicia sesión</Text>;
  }

  return <Text>Bienvenido {user?.displayName}!</Text>;
};
```

---

## 🛠️ Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android

# Limpiar y reinstalar
npm run clean && npm install

# Ver estructura de carpetas
tree src

# Buscar archivos
find src -name "*.ts" -o -name "*.tsx"

# Contar líneas de código
find src -name "*.ts*" | xargs wc -l
```

---

## 🎨 Estructura de Componentes

Cada componente debe seguir este patrón:

```typescript
// 1. Importar de React Native
import { View, Text, TouchableOpacity } from 'react-native';

// 2. Importar el hook
import { useMyComponentLogic } from './useMyComponentLogic';

// 3. Importar estilos
import styles from './styles';

// 4. Definir componente
const MyComponent = () => {
  // 5. Desestructurar hook (lógica)
  const { state, handler } = useMyComponentLogic();

  // 6. Renderizar (solo JSX)
  return (
    <View style={styles.container}>
      <Text>{state}</Text>
      <TouchableOpacity onPress={handler}>
        <Text>Presiona</Text>
      </TouchableOpacity>
    </View>
  );
};

// 7. Exportar por defecto
export default MyComponent;
```

---

## 🧪 Testing (Próximo)

```bash
# Ejecutar tests
npm test

# Con coverage
npm test -- --coverage
```

---

## 🚀 Próximos Pasos

1. ✅ Leer CLAUDE.md
2. ✅ Entender LoginScreen
3. ⏳ Crear SignupScreen
4. ⏳ Configurar Navegación
5. ⏳ Crear Dashboard
6. ⏳ Implementar Notificaciones Push
7. ⏳ Agregar Deep Linking
8. ⏳ Tests

---

## 📞 Troubleshooting

### Error: "Cannot find module '@/...'"
- Verifica que `tsconfig.json` tiene el path alias configurado
- Reinicia el servidor de desarrollo

### Error de Firebase
- Verifica que `.env` tiene todas las variables
- Descarga `google-services.json` desde Firebase Console
- Colócalo en `android/app/`

### Error de tipos TypeScript
- Asegúrate de tener TypeScript instalado: `npm install --save-dev typescript`
- Regenera los tipos: `npm run types`

---

## 💡 Tips

1. **Siempre usa hooks para lógica** - Los componentes solo deben renderizar
2. **Mantén estilos en archivo separado** - Usa `styles.ts`
3. **Tipos en cada módulo** - Crea `types.ts` en cada carpeta feature
4. **Valida antes de enviar** - Usa `validators.ts` para validar datos
5. **Maneja errores consistentemente** - Usa `errorHandler.ts`
6. **Constantes centralizadas** - Usa `constants.ts`

---

**¡Listo para empezar!** 🎉

Cualquier duda, revisa CLAUDE.md o el ejemplo de LoginScreen.
