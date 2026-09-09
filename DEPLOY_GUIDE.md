# 🚀 Guía Completa de Deploy - Firebase Hosting

**Fecha**: 2026-09-08  
**Proyecto**: Institución - Panel Admin Web  
**Hosting**: Firebase Hosting (institution-59d9a)

---

## ✅ Estado Actual

- ✅ Build completado en `web/dist/`
- ✅ firebase.json configurado
- ✅ Firebase CLI instalado globalmente

---

## 📋 Requisitos

- ✅ Firebase CLI instalado (`npm install -g firebase-tools`)
- ✅ Cuenta de Google conectada a Firebase
- ✅ Proyecto Firebase creado (institution-59d9a)
- ✅ Hosting habilitado en Firebase Console

---

## 🚀 Pasos para Deploy

### Paso 1: Abre tu terminal/CMD

```bash
cd /Users/xetro/Desktop/Projects/tony/institucion
```

### Paso 2: Login a Firebase

```bash
firebase login
```

**Esto abrirá un navegador para que inicies sesión con tu cuenta Google**

Si usas SSH/Remote, usa:
```bash
firebase login --no-localhost
```

Luego sigue las instrucciones:
1. Copia el URL que aparece
2. Abre en tu navegador
3. Autoriza Firebase CLI
4. Copia el código que te da
5. Ejecuta: `firebase login <authorizationCode>`

### Paso 3: Verificar la configuración

```bash
firebase projects:list
```

Deberías ver: `institution-59d9a`

### Paso 4: Hacer Deploy

```bash
firebase deploy
```

**Output esperado:**
```
✓ Deploy complete!

Project Console: https://console.firebase.google.com/project/institution-59d9a/overview
Hosting URL: https://institution-59d9a.web.app
```

---

## 📊 Estructura del Deploy

```
proyecto/
├── firebase.json          ← Config del hosting
├── web/
│   ├── dist/              ← Build generado (ESTO SE DEPLOYA)
│   │   ├── index.html
│   │   └── assets/
│   └── src/
└── .firebaserc (se crea automáticamente)
```

---

## 🔧 Configuración en firebase.json

```json
{
  "hosting": {
    "public": "web/dist",           // ← Carpeta que se deploya
    "ignore": [...],
    "rewrites": [{                  // ← SPA redirect
      "source": "**",
      "destination": "/index.html"
    }],
    "headers": [{                   // ← Cache assets
      "source": "/assets/**",
      "headers": [{
        "key": "Cache-Control",
        "value": "public, max-age=31536000, immutable"
      }]
    }]
  }
}
```

**¿Qué hace?**
- `public`: Cuál carpeta se sube a hosting
- `rewrites`: Para SPA (React) - todo va a index.html
- `headers`: Cache inteligente para assets

---

## 📝 Build & Deploy (Resumen)

```bash
# 1. Entra en carpeta web
cd web

# 2. Build
npm run build

# 3. Vuelve a la raíz
cd ..

# 4. Deploy
firebase deploy
```

---

## 🌐 URL del Sitio Desplegado

Después del deploy, tu sitio estará en:

```
https://institution-59d9a.web.app
```

También puedes ver:
- Firebase Console: https://console.firebase.google.com/project/institution-59d9a
- Hosting: https://console.firebase.google.com/project/institution-59d9a/hosting/sites

---

## 📊 Monitorizar Deploys

### Ver historial de deploys
```bash
firebase hosting:channel:list
```

### Ver versiones
```bash
firebase hosting:versions:list
```

### Revertir a versión anterior
```bash
firebase hosting:rollback
```

---

## 🔐 Seguridad

### Variables de Entorno en Producción

El archivo `.env` **NO se incluye** en el build (Vite lo stripea).

Valores seguros en producción:
- ✅ API Key (OK, es pública)
- ✅ Auth Domain (OK)
- ✅ Project ID (OK)
- ✅ Storage Bucket (OK)

### Firebase Security Rules

Necesitas configurar en Firebase Console:

**Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Project not found"
```bash
firebase init hosting
# Selecciona tu proyecto
```

### Error: "dist folder not found"
```bash
# Verifica que existe
ls -la web/dist/

# Si no existe, hace build:
cd web && npm run build && cd ..
```

### Error: "Cannot GET /"
Significa que el rewrite a `index.html` no está funcionando.

**Solución**: Verifica `firebase.json` tiene:
```json
"rewrites": [{
  "source": "**",
  "destination": "/index.html"
}]
```

### Lentitud en el sitio
Probablemente es el bundle de Firebase (700KB).

**Mejoras futuras:**
- Code splitting
- Lazy loading
- Tree shaking

---

## 📈 Próximas Mejoras

1. **GitHub Actions**
   - Deploy automático en cada push a main

2. **Preview Channels**
   - Deploy en rama diferente antes de producción

3. **Performance**
   - Reducir tamaño del bundle
   - Comprimir imágenes

4. **SEO**
   - Agregar meta tags
   - Sitemap

---

## 📞 Comandos Útiles

```bash
# Ver status del proyecto
firebase status

# Listar proyectos
firebase projects:list

# Cambiar de proyecto
firebase use --add

# Ver logs
firebase functions:log

# Deploy solo hosting
firebase deploy --only hosting

# Deploy con alias
firebase hosting:channel:deploy preview-v1

# Abrir hosting
firebase open hosting
```

---

## ✅ Checklist Pre-Deploy

- [x] Build completado (`web/dist/` existe)
- [x] firebase.json configurado
- [x] Firebase CLI instalado
- [ ] Conectado a Firebase (next: `firebase login`)
- [ ] Firestore security rules configuradas
- [ ] Variables de entorno correctas
- [ ] Testeado en desarrollo (`npm run dev`)

---

## 🎉 ¡Listo para Deploy!

Cuando ejecutes `firebase deploy`, tu sitio estará en:
```
https://institution-59d9a.web.app
```

**Tiempo aproximado**: 30-60 segundos

---

## 📚 Referencias

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Firebase Console](https://console.firebase.google.com)

---

**Última actualización**: 2026-09-08
