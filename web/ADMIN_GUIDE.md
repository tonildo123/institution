# 📋 Guía del Panel de Administración

## Gestión de Usuarios

### 1. Crear un Nuevo Usuario

#### Pasos:
1. Haz clic en el botón **"➕ Nuevo Usuario"** en la esquina superior derecha
2. Completa el formulario con los datos del usuario:
   - **Nombre Completo**: Nombre del usuario (requerido)
   - **Rol**: Selecciona entre:
     - **Familia**: Acceso con DNI + Contraseña
     - **Administrador**: Acceso con Email + Contraseña
     - **Preceptor**: Acceso con Email + Contraseña
   - **Credenciales**: Según el rol:
     - **Familia**: Ingresa el DNI del usuario
     - **Admin/Preceptor**: Ingresa el email
   - **Contraseña**: Crea una contraseña segura (mínimo 6 caracteres)
   - **Confirmar Contraseña**: Repite la contraseña
   - **Cuenta Habilitada**: Marca la casilla para activar la cuenta inmediatamente

3. Haz clic en **"Crear Usuario"**
4. Verás un mensaje de confirmación ✅

#### Validaciones:
- El nombre no puede estar vacío
- El email debe ser válido (para admin/preceptor)
- El DNI no puede estar vacío (para familia)
- Las contraseñas deben coincidir
- No se pueden registrar dos usuarios con el mismo email o DNI

---

### 2. Ver Lista de Usuarios

#### Filtrado:
En la sección de usuarios, puedes filtrar por rol:
- **Todos**: Muestra todos los usuarios
- **Administrador**: Solo usuarios con rol admin
- **Familia**: Solo usuarios con rol familia
- **Preceptor**: Solo usuarios con rol preceptor

#### Información en la tabla:
- **Nombre**: Nombre del usuario con avatar
- **Credencial**: Email o DNI según el rol
- **Rol**: Tipo de usuario (con código de color)
- **Estado**: ✓ Activo o ✗ Inactivo
- **Creado**: Fecha de creación
- **Actualizado**: Última fecha de actualización
- **Acciones**: Botones para editar (✏️) o eliminar (🗑️)

---

### 3. Editar un Usuario

#### Pasos:
1. Haz clic en el icono **✏️** (editar) o en la fila del usuario
2. El formulario se abrirá con los datos actuales
3. Modifica los campos que desees:
   - Nombre
   - Email/DNI (según el rol)
   - Estado de la cuenta (habilitada/deshabilitada)
4. Haz clic en **"Actualizar Usuario"**
5. Verás un mensaje de confirmación ✅

#### Nota:
- No puedes cambiar el rol de un usuario existente
- No puedes cambiar la contraseña desde este panel (usar Firebase Console si es necesario)

---

### 4. Eliminar un Usuario

#### Pasos:
1. Haz clic en el icono **🗑️** (eliminar) en la fila del usuario
2. Se pedirá confirmación
3. Haz clic en **"Aceptar"** para confirmar
4. El usuario será eliminado y verás un mensaje de confirmación ✅

#### Advertencia:
⚠️ **Esta acción es irreversible**. El usuario será eliminado de la base de datos.

---

## Roles y Credenciales

### Familia
- **Acceso**: DNI + Contraseña
- **Uso**: Padres/tutores de estudiantes
- **Campos**: DNI, Nombre, Contraseña

### Administrador
- **Acceso**: Email + Contraseña
- **Uso**: Personal administrativo del instituto
- **Campos**: Email, Nombre, Contraseña

### Preceptor
- **Acceso**: Email + Contraseña
- **Uso**: Docentes/preceptores
- **Campos**: Email, Nombre, Contraseña

---

## Estadísticas

En la parte inferior del panel verás un resumen con:
- **Total Usuarios**: Cantidad total de usuarios registrados
- **Administradores**: Cantidad de usuarios con rol admin
- **Familias**: Cantidad de usuarios con rol familia
- **Preceptores**: Cantidad de usuarios con rol preceptor
- **Activos**: Cantidad de usuarios habilitados

---

## Mensajes de Error

| Mensaje | Solución |
|---------|----------|
| Email already exists | El email ya está registrado. Usa uno diferente |
| DNI already exists | El DNI ya está registrado. Verifica el DNI |
| Las contraseñas no coinciden | Asegúrate que ambas contraseñas sean idénticas |
| Email inválido | El email debe tener formato válido (ejemplo@mail.com) |
| Mínimo 6 caracteres | La contraseña debe tener al menos 6 caracteres |

---

## Datos Almacenados

Cada usuario tiene la siguiente información:

```
{
  id: string                    // ID único del usuario
  displayName: string           // Nombre del usuario
  role: 'admin' | 'familia' | 'preceptor'  // Rol
  email?: string                // Email (admin/preceptor)
  dni?: string                  // DNI (familia)
  isEnabled: boolean            // Usuario activo/inactivo
  createdAt: Date              // Fecha de creación
  updatedAt: Date              // Última actualización
  enabledAt?: Date             // Fecha de habilitación
  pushTokens: string[]         // Tokens para notificaciones
  lastLogin?: Date             // Último inicio de sesión
}
```

---

## Seguridad

- Las contraseñas se almacenan de forma segura en Firebase Authentication
- Solo los administradores pueden crear/editar/eliminar usuarios
- Los datos sensibles (email, DNI) no se muestran en la tabla por defecto
- Se registran todas las acciones (creación, actualización, eliminación)

---

## Próximas Características

- [ ] Exportar lista de usuarios a Excel/CSV
- [ ] Búsqueda avanzada de usuarios
- [ ] Asignación de roles a estudiantes
- [ ] Historial de cambios de usuario
- [ ] Notificaciones por email al crear usuario
- [ ] Cambio de contraseña desde el panel
