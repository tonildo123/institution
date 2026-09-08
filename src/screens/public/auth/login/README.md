# Login Module

Módulo de inicio de sesión con separación clara entre lógica y renderizado.

## 📁 Estructura

```
login/
├── LoginScreen.tsx       # Componente de renderizado
├── useLoginLogic.ts      # Hook con toda la lógica
├── styles.ts             # Estilos del componente
├── types.ts              # Tipos TypeScript
└── README.md             # Este archivo
```

## 🎯 Cómo Funciona

### LoginScreen.tsx
- **Responsabilidad**: Renderizado únicamente
- Solo importa el hook `useLoginLogic`
- Desestructura todo del hook
- Retorna JSX

### useLoginLogic.ts
- **Responsabilidad**: Toda la lógica
- Manejo del estado del formulario
- Validación de datos
- Integración con `useAuth` hook
- Retorna objeto con estado y manejadores

## 📝 Ejemplo de Uso

```typescript
import LoginScreen from '@/public/auth/login/LoginScreen';

// En tu navegador
<Stack.Screen name="Login" component={LoginScreen} />
```

## 🔗 Dependencias

- `@/hooks/useAuth` - Hook de autenticación
- `@/utils/validators` - Funciones de validación
- `@/utils/errorHandler` - Manejo de errores
- `@/types` - Tipos globales

## 🚀 Flujo de Login

1. Usuario ingresa email y contraseña
2. Al hacer click en "Iniciar Sesión":
   - Valida los datos
   - Muestra errores si es necesario
   - Llama a `login()` del hook `useAuth`
   - Firebase Auth autentica al usuario
   - Se actualiza el estado de autenticación
   - La navegación cambia automáticamente (ver Navigator)

## 🎨 Validaciones

- **Email**: Formato válido de email
- **Contraseña**: No vacío (validación mínima en login)

## 🔐 Seguridad

- Las credenciales se tratan con Firebase Auth
- Las contraseñas NO se almacenan en el estado local
- Se limpian los errores sensibles después de mostrarlos

## 📱 Accesibilidad

- Labels accesibles para inputs
- Botones con `accessibilityLabel`
- Indicadores visuales de estado de carga

---

**Última actualización**: 2026-09-07
