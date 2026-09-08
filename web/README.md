# 🌐 Panel Admin - Institución

Panel de administración web para gestionar usuarios de la aplicación móvil Institución.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 16+ 
- npm o yarn
- Credenciales de Firebase

### Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   - Copiar `.env.example` a `.env`
   - Completar las credenciales de Firebase

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

---

## 📋 Funcionalidades

### Gestión de Usuarios
- ✅ Crear usuario con rol específico
- ✅ Listar usuarios con filtros por rol
- ✅ Editar datos de usuario
- ✅ Eliminar usuarios
- ✅ Estadísticas en tiempo real

---

## 🔧 Estructura del Proyecto

```
web/
├── src/
│   ├── pages/Users.tsx         # Página principal
│   ├── components/             # Componentes UI
│   │   ├── UserForm.tsx
│   │   └── UsersList.tsx
│   ├── hooks/useUsers.ts       # Lógica
│   ├── services/               # Firebase CRUD
│   └── types/index.ts          # Tipos TypeScript
├── .env.example
└── ADMIN_GUIDE.md              # Documentación
```

---

## 📚 Documentación

- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - Guía de uso
- [../IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Detalles técnicos
- [../CLAUDE.md](../CLAUDE.md) - Convenciones

