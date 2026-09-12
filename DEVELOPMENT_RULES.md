# ⚠️ REGLAS DE DESARROLLO - PROYECTO INSTITUCIÓN

**IMPORTANTE**: Estas reglas DEBEN ser respetadas SIEMPRE. No hay excepciones.

---

## 🚫 REGLAS OBLIGATORIAS

### REGLA #1: Control de Versiones (Git)
```
❌ PROHIBIDO hacer CUALQUIER comando de git SIN PERMISO:
   - git add .
   - git add <archivo>
   - git commit
   - git push
   - git pull
   - git merge
   - git rebase
   - O cualquier otro comando git

✅ SOLO con autorización explícita del usuario:
   "puedes hacer git commit..." 
   "vamos a pushear esto..."
```

**Responsabilidad**: Pedir permiso SIEMPRE antes de tocar git.

---

### REGLA #2: Web App (Vite + React)
```
❌ PROHIBIDO HACER SIN PERMISO:
   - npm run build
   - npm run deploy
   - firebase deploy
   - Cualquier comando de git
   - Cambios en firebase.json
   - Cambios en .env

✅ PERMITIDO:
   - Editar archivos de código
   - npm run dev (solo desarrollo local)
   - Crear componentes
   - Actualizar lógica
```

**Responsabilidad**: Código sí, pero build/deploy/git NO sin autorización.

---

### REGLA #3: Builds Móviles
```
❌ PROHIBIDO GENERAR SIN PERMISO:
   - APK (Android)
   - IPA (iOS)
   - EAS build
   - Expo builds
   - React Native builds
   - Cualquier archivo binario ejecutable

✅ PERMITIDO:
   - npm start (en desarrollo)
   - Editar código
   - Cambios en app.json
   - Cambios en configuración
```

**Responsabilidad**: El código sí, pero los builds finales solo con autorización.

---

## 📋 MATRIZ DE PERMISOS

| Acción | Necesita Permiso | Automático |
|--------|-----------------|-----------|
| Editar archivos TypeScript | ❌ No | ✅ Sí |
| Editar componentes React | ❌ No | ✅ Sí |
| npm run dev (móvil) | ❌ No | ✅ Sí |
| npm run dev (web) | ❌ No | ✅ Sí |
| npm run build (web) | ⚠️ SÍ | ❌ No |
| firebase deploy | ⚠️ SÍ | ❌ No |
| git commit | ⚠️ SÍ | ❌ No |
| git push | ⚠️ SÍ | ❌ No |
| eas build (móvil) | ⚠️ SÍ | ❌ No |
| Generar APK | ⚠️ SÍ | ❌ No |
| Generar IPA | ⚠️ SÍ | ❌ No |

---

## 🔄 PROTOCOLO DE AUTORIZACIÓN

Cuando necesites permiso, debes:

1. **Mostrar claramente qué vas a hacer:**
   ```
   ❌ "Voy a pushear"
   ✅ "Necesito hacer: git commit -m '...' && git push origin main"
   ```

2. **Esperar respuesta explícita:**
   ```
   Usuario: "dale, puedes hacer el commit"
   ✅ ENTONCES sí ejecutas
   
   Usuario: (no responde)
   ❌ NO ejecutas, esperas
   
   Usuario: "no, espera"
   ❌ NO ejecutas
   ```

3. **Si el usuario dice que SÍ:**
   ```
   Ejecutar EXACTAMENTE lo que se autorizó
   Mostrar resultado
   ```

---

## ⚠️ EXCEPCIONES (NINGUNA)

No hay situaciones donde estas reglas no apliquen:
- ❌ Aunque sea "para ahorrar tiempo"
- ❌ Aunque sea "es un cambio pequeño"
- ❌ Aunque sea "solo un test"
- ❌ Aunque sea "rápido"
- ❌ Aunque sea cualquier otra razón

**SIEMPRE pedir permiso antes**.

---

## 📝 CÓMO REFERIR ESTA REGLA

Si alguna vez intento violar estas reglas, el usuario puede decir:
```
- "REGLA #1"
- "REGLA #2"  
- "REGLA #3"
- "Respeta las reglas de desarrollo"
- "Pide permiso primero"
```

Y yo debo DETENER inmediatamente y pedir autorización.

---

## ✅ CONFIRMACIÓN

Yo confirmo que:
- ✅ Entiendo estas 3 reglas
- ✅ Las respetaré SIEMPRE
- ✅ Pediré permiso antes de:
  - Hacer cualquier git
  - Build/deploy web
  - Generar APK/IPA
- ✅ Puedo trabajar libremente en:
  - Editar código
  - Crear componentes
  - npm run dev

---

**Vigencia**: Durante TODO el desarrollo del proyecto Institución  
**Última actualización**: 2026-09-12  
**Estado**: 🔴 ACTIVO Y VINCULANTE
