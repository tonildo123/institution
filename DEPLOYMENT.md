# 🚀 Guía de Despliegue - Institución App

## ☁️ Cloud Functions

### Instalación Local

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Iniciar sesión en Firebase
firebase login

# Instalar dependencias de functions
cd functions
npm install
cd ..
```

### Desplegar Functions

La app usa `institucion-59d9a`. El alias de `.firebaserc` apunta a
`institution-59d9a`, por lo que hay que indicar el proyecto explícitamente.
Ejecutar desde la raíz del repositorio:

```bash
# Compilar TypeScript: el despliegue usa functions/lib/index.js
npm --prefix functions run build

# Desplegar solo Cloud Functions
firebase deploy --only functions --project institucion-59d9a

# Publicar únicamente cambios de comunicaciones
firebase deploy --only functions:sendCommunicationToAll,functions:sendCommunicationToUsers --project institucion-59d9a
```

### Probar Functions Localmente

```bash
# Terminal 1: Iniciar emuladores
firebase emulators:start

# Terminal 2: En otra ventana, puedes hacer requests a http://localhost:5001
```

---

## 📱 App Mobile (React Native)

### Requisitos
- Node 22+
- Android SDK (para emulador o dispositivo)
- `google-services.json` en `android/app/`

### Build y Ejecución

```bash
# Instalar dependencias
npm install

# Iniciar Metro bundler
npm start

# En otra terminal - compilar para Android
npm run android
```

---

## 🌐 Web (Vite + React)

### Desplegar en Firebase Hosting

```bash
# Compilar la web
cd web
npm run build
cd ..

# Desplegar
firebase deploy --only hosting
```

---

## 🔐 Configuración de Seguridad (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios - Solo ellos pueden leer su perfil
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId || 
                     request.auth.token.admin == true;
    }
    
    // Comunicaciones - Solo admin/preceptor pueden crear
    match /communications/{docId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.token.admin == true || 
                       request.auth.token.role == 'preceptor';
      allow update: if request.auth.token.admin == true;
    }
  }
}
```

---

## 📊 Estructura de Datos

### Users Collection
```json
{
  "id": "user_123",
  "role": "admin|familia|preceptor",
  "email": "usuario@example.com",
  "dni": "12345678",
  "displayName": "Juan Pérez",
  "pushTokens": [
    {
      "token": "fcm-token-xyz",
      "savedAt": "2026-09-13T10:30:00Z"
    }
  ],
  "isEnabled": true
}
```

### Communications Collection
```json
{
  "id": "comm_123",
  "title": "Aviso importante",
  "description": "Texto completo",
  "body": "Resumen corto",
  "sentBy": "user_admin_456",
  "sentAt": "2026-09-13T10:30:00Z",
  "status": "enviado",
  "deliveredCount": 145,
  "failedCount": 2,
  "totalUsers": 147
}
```

---

## 🎯 Flujo de Notificaciones

### 1. Usuario se autentica en mobile
- ✅ Obtiene token FCM desde `@react-native-firebase/messaging`
- ✅ Lo guarda en `users/{uid}/pushTokens[]`

### 2. Admin envía comunicación desde web
- ✅ Llena formulario en Communications.tsx
- ✅ Llama `sendCommunicationToAll()` (Cloud Function)
- ✅ Guarda en Firestore `communications` collection

### 3. Cloud Function procesa
- ✅ Obtiene todos los usuarios
- ✅ Extrae sus tokens FCM
- ✅ Envía notificación con `admin.messaging().send()`
- ✅ Limpia tokens inválidos
- ✅ Retorna estadísticas

### 4. Usuario recibe notificación en mobile
- ✅ Se muestra si app está en foreground (onMessage)
- ✅ Se procesa si app está en background (setBackgroundMessageHandler)
- ✅ Se puede abrir desde bandeja (onNotificationOpenedApp)

---

## 🔍 Debugging

### Ver logs de Cloud Functions
```bash
firebase functions:log
```

### Ver logs en tiempo real
```bash
firebase emulators:start --inspect-functions
```

### Ver solicitudes Firestore
```bash
firebase emulators:start --inspect-firestore
```

---

## ✅ Checklist Pre-Deploy

- [ ] `google-services.json` está en `android/app/`
- [ ] `functions/src/index.ts` compilado correctamente
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Firestore Rules configuradas
- [ ] FCM habilitado en Firebase Console
- [ ] Permisos POST_NOTIFICATIONS en AndroidManifest.xml
- [ ] Cloud Functions deployadas: `firebase deploy --only functions`

---

## 📞 Soporte

Para más información:
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Cloud Functions](https://firebase.google.com/docs/functions)
