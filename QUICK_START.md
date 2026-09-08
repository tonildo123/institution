# 🚀 Inicio Rápido - Panel Admin

## ✅ Estado Actual

- ✅ Dependencias instaladas
- ✅ Firebase configurado (.env listo)
- ✅ Servidor web en ejecución
- ✅ Panel admin listo para usar

---

## 📍 URL del Panel

```
http://localhost:5176/
```

**Copia y pega en tu navegador** 👆

---

## 🎯 ¿Qué puedes hacer?

### 1️⃣ Crear Usuario
- Haz clic en botón **"➕ Nuevo Usuario"**
- Selecciona el rol:
  - **Familia** → Usa DNI
  - **Admin** → Usa Email
  - **Preceptor** → Usa Email
- Completa los datos
- ¡Haz clic en "Crear Usuario"!

### 2️⃣ Ver Usuarios
- La tabla mostrará todos los usuarios creados
- Puedes filtrar por rol
- Verás información: nombre, credencial, estado, fechas

### 3️⃣ Editar Usuario
- Haz clic en ✏️ en cualquier fila
- Modifica los datos que quieras
- ¡Haz clic en "Actualizar Usuario"!

### 4️⃣ Eliminar Usuario
- Haz clic en 🗑️ en cualquier fila
- Confirma la eliminación
- ¡Listo!

---

## 📊 Estadísticas

En la parte inferior verás:
- Total de usuarios
- Usuarios por rol
- Usuarios activos

---

## 🐛 Si hay problemas

### Error de Firebase
```
❌ "Firebase not initialized"
```
→ Verifica que el `.env` está completo

### Error de conexión
```
❌ "Cannot connect to Firestore"
```
→ Asegúrate que Firebase Console está accesible

### Los usuarios no se guardan
→ Verifica que Firestore está habilitado en Firebase Console

---

## 📝 Datos de Ejemplo

Para probar, puedes crear:

**Usuario Familia:**
- Nombre: Juan García
- Rol: Familia
- DNI: 12345678A
- Contraseña: password123

**Usuario Admin:**
- Nombre: Ana López
- Rol: Admin
- Email: ana@institucion.com
- Contraseña: password123

**Usuario Preceptor:**
- Nombre: Carlos Pérez
- Rol: Preceptor
- Email: carlos@institucion.com
- Contraseña: password123

---

## 📚 Más Información

- Ver [web/ADMIN_GUIDE.md](./web/ADMIN_GUIDE.md) para guía completa
- Ver [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) para detalles técnicos
- Ver [CLAUDE.md](./CLAUDE.md) para convenciones

---

## 🎉 ¡Listo!

**El panel está 100% funcional. ¡Empieza a crear usuarios!**

Si tienes dudas, revisa la documentación en `web/ADMIN_GUIDE.md`

---

**Última actualización**: 2026-09-08
