# Plan: panel web de administración y sitio público

Estado: **plan acordado**, sin implementar. Las decisiones confirmadas van en la sección "Decisiones".

## Punto de partida (lo que hay hoy en `web/`)

- Un único panel sin inicio de sesión: `App.tsx` muestra Usuarios y Comunicaciones directamente.
- `usersService.ts` llama a `createManagedUser`, que exige una sesión de Firebase Auth de administración. La web no inicia sesión, así que esa llamada hoy falla.
- `types/index.ts` define 3 roles (`admin`, `familia`, `preceptor`). La app tiene 6 (`admin`, `equipo directivo`, `representante legal`, `preceptor`, `familia`, y `user` en la creación).
- `react-router-dom` está instalado pero no se usa.
- No hay reportes ni salas en la web.
- `src/data/mockUsers.ts` existe pero no se usa en código de producción.

## Riesgos a resolver antes que cualquier funcionalidad

1. **Lectura pública de `users`.** Las reglas permiten leer `users` a cualquiera, así que se exponen DNI, email y tokens de push. Hay que restringir la lectura a usuarios habilitados y a administración, y resolver la búsqueda por DNI/email antes de login con una función. Esto afecta a la app y a la web.
2. **Contraseña por defecto `Pass1234`.** Si todas las cuentas masivas nacen con la misma contraseña, cualquiera que la conozca entra a cualquier cuenta. **[decidir]** Propuesta: contraseña temporal aleatoria por cuenta, impresa o enviada por canal privado, y un indicador `mustChangePassword` que obliga a cambiarla en el primer ingreso. Si igual necesitan `Pass1234`, que sea solo temporal y que el primer ingreso la obligue a cambiarla.
3. **Contraseña mínima de 6 caracteres.** Es el mínimo de Firebase Auth. **[decidir]** Subirla a 8 en la validación de cuentas nuevas y cambios.

## Fase 1: acceso de administración en la web

- Pantalla de inicio de sesión con email y contraseña (Firebase Auth).
- Comprobación de rol: solo `admin`, `equipo directivo` y `representante legal` pasan. Cualquier otro rol ve "Sin permiso".
- Rutas con `react-router-dom`: `/admin/usuarios`, `/admin/reportes`, `/admin/salas`, `/admin/carga`.
- Compatibilidad de roles en `types/index.ts` con los 6 de la app.

## Fase 2: CRUD de usuarios y habilitación

- Listado con filtros por rol y estado (ya existe parte de esto en `UsersList`).
- Crear, editar y eliminar usando las funciones existentes (`createManagedUser`, `setFamilyPassword`, `setUserPassword`, `updateUser`).
- **Habilitar / deshabilitar** en un solo paso: actualiza `isEnabled` en Firestore y la cuenta de Auth (`disabled`). Hoy esas dos cosas se pueden desalinear. Hay que hacerlo en una función del servidor.
- Confirmación antes de deshabilitar o eliminar, y registro de quién lo hizo (ver "Auditoría").

## Fase 3: gestión de reportes de problemas

- Listado de `problemReports` con filtro por estado (pendiente, en revisión, resuelto).
- Ver detalle, imagen adjunta, cambiar estado y comentar, con las mismas reglas que la app (`reportManager`).
- Las consultas usan los mismos índices que la app.

## Fase 4: sitio público

Rutas sin inicio de sesión:

- `/` **Inicio (landing):** presentación de la institución y acceso a la descarga de la app.
- `/nosotros` **Qué es IMEP / KIT IMEP:** descripción de la institución y de la app.
- `/privacidad` **Política de privacidad.**
- `/terminos` **Términos y condiciones.**

Notas:

- Las tiendas de apps exigen una URL pública de política de privacidad. Conviene publicarla antes de publicar la app.
- **Los textos de privacidad y de términos los tiene que redactar o revisar la institución o un abogado.** No los voy a inventar: los dejo como plantilla con marcadores para completar.
- Son páginas estáticas: se pueden alojar en el mismo hosting que el panel, con reglas de ruta distintas.

## Fase 5: carga masiva desde Excel

**Flujo:**

1. Descargar una plantilla con las columnas exactas.
2. Subir el `.xlsx`. La web lo lee en el navegador (por ejemplo con SheetJS) y **muestra una vista previa** con errores por fila. No se guarda nada hasta confirmar.
3. Confirmar. Las filas válidas se envían al servidor en lotes (por ejemplo de 50), y el servidor vuelve a validar todo.
4. Al final, un resumen: creadas, actualizadas, con error (con el motivo por fila).

**Usuarios:** columnas `rol`, `nombre`, `email` (para docentes y administración, y para familias si se quiere acceso por email), `dni` (para familias), `contraseña`. Si la contraseña está vacía, se usa el mecanismo elegido en el punto de seguridad 2.

**Salas por Excel:** columnas `sala` (nivel y curso, por ejemplo `sec-1`), `dni` (familias) o `email` (docentes). Validaciones:

- El DNI o el email tienen que existir y tener el rol correcto (familia para DNI, docente para email).
- Un docente solo se asigna a cursos de su nivel si la regla lo exige.
- Las filas duplicadas no generan doble asignación.

**Requisitos de la función de carga:**

- Idempotente: volver a subir el mismo archivo no duplica nada (clave: DNI o email).
- Por lotes, con límite de filas por archivo (por ejemplo 500) para no pasar el tiempo límite de la función.
- Solo roles de administración.

## Fase 6: multirrol (app y web)

Hoy cada usuario tiene un único `role`, y muchas reglas y funciones lo comparan con `==` o `in`.

**Propuesta:** campo `roles: string[]`, donde `role` queda como rol principal para compatibilidad.

- Reglas y funciones: reemplazar comparaciones de `role` por `roles` con un helper (`hasRole(...)`).
- App: después del login, si hay más de un rol, mostrar un selector de rol. El rol activo define las pestañas.
- Web: mismo selector para quienes tengan rol administrativo.
- Migración: copiar `role` a `roles` en todos los usuarios existentes, sin tocar lo demás.

**[decidir]** ¿Un docente que también es administrador ve las dos vistas con un selector, o combina permisos sin cambiar de vista?

Este cambio toca reglas, funciones y la navegación de la app. Conviene hacerlo después de las fases 1 a 5 y con pruebas de reglas.

## Auditoría (propuesta)

Registrar en una colección `auditLog` quién creó, editó, habilitó, deshabilitó o eliminó una cuenta, o asignó una sala, con fecha. Es importante para una institución y es barato de agregar desde las funciones.

## Otras cosas pendientes (desde la web y la app)

- **Recuperación de contraseña para familias:** hoy el administrador la vuelve a establecer a mano. La web puede hacerlo con un botón.
- **Exportación de datos:** respaldo o exportación en Excel de usuarios y salas.
- **Notificación al administrador** cuando llega un reporte nuevo.
- **Monitoreo de costos** de Firestore y Storage, para no sorprenderse con la facturación.
- **Mensajes de red en la web** igual que en la app.
- **Verificar la web de comunicaciones:** `communicationsService.ts` llama a las funciones con `fetch` sin token de sesión; con las funciones actuales eso debería fallar.

## Orden sugerido

1. Riesgos 1 a 3 (lectura de `users`, contraseñas, longitud mínima) — afectan a la seguridad de todo lo demás.
2. Fase 1 (login de admin en la web).
3. Fase 2 (CRUD y habilitación).
4. Fase 4 (sitio público), en paralelo con 2 y 3, porque no depende de nada.
5. Fase 3 (reportes).
6. Fase 5 (carga masiva), con plantilla y vista previa.
7. Fase 6 (multirrol), con pruebas de reglas.

## Preguntas abiertas

1. Contraseña inicial: ¿temporal aleatoria con cambio obligatorio, o `Pass1234` temporal con cambio obligatorio?
2. Longitud mínima de contraseña: ¿6 o 8?
3. Multirrol: ¿selector de rol o permisos combinados?
4. Textos de privacidad y términos: ¿quién los provee?
5. ¿Las familias ingresan con DNI siempre, o también con email?

## Decisiones

1. **Contraseña inicial de familias:** `Pass` + DNI. **Riesgo a confirmar:** el DNI lo conocen muchas personas, así que la contraseña inicial es adivinable. Propuesta de mitigación: obligar el cambio en el primer ingreso antes de usar la app (`mustChangePassword`), y limitar intentos fallidos del ingreso por DNI.
2. **Contraseña inicial del resto de roles:** `Pass1234`, con cambio obligatorio en el primer ingreso. Mismo riesgo a confirmar que arriba, aunque el rol sea de administración.
3. **Longitud mínima de contraseña:** 8 caracteres en cuentas nuevas y en cambios.
4. **Multirrol:** un usuario puede tener varios roles (por ejemplo `preceptor` + `familia`). Al ingresar, si tiene más de un rol, la app pregunta con cuál entrar. Una familia con más de un curso o sala ve todos sus cursos en su vista de familia.
5. **Textos legales:** por ahora se usa un texto de relleno (lorem) en las pantallas de privacidad y términos. La institución los entregará después.
6. **Ingreso de familias:** siempre con DNI.
7. **Un docente que también es familia:** es un caso válido y se soporta.

## Consecuencias técnicas de las decisiones

- **Ingreso por DNI en el servidor.** Firebase Auth tiene un solo email por cuenta. Para que una misma persona entre por DNI (familia) y por email (docente), el ingreso por DNI pasa a una función: recibe DNI y contraseña, busca el perfil y devuelve un token de sesión. Esa función también permite limitar intentos fallidos.
- **Perfil del usuario:** `roles: string[]` (y `role` como rol principal, por compatibilidad). El selector de rol aparece en la app y en la web.
- **Asociación familia ↔ alumnos:** la familia tiene `assignedCursos` con todas sus salas; los hermanos se muestran como cursos distintos dentro de la misma cuenta.
- **Página de perfil en la app:** una sección "Conocé nuestros términos y condiciones" con enlace a `/terminos`, y otra de `Privacidad` con enlace a `/privacidad` en la web.
- **Web sin mensajes:** el panel web no envía comunicaciones ni publicaciones de Classroom. Solo administra usuarios, salas y reportes.

## Pendientes que aparecen de estas decisiones

- Límite de intentos fallidos en el ingreso por DNI.
- Campo `mustChangePassword` y pantalla de cambio obligatorio en la app y en la web.
- Migración de `role` a `roles` para todos los usuarios existentes.
- Restringir la lectura pública de `users` (riesgo 1 del plan).

## Decisiones confirmadas (segunda ronda)

- **Contraseña inicial de familias `Pass` + DNI:** se mantiene así por decisión de la institución. Queda registrado el riesgo de que el DNI sea adivinable, y el cambio obligatorio en el primer ingreso sigue siendo recomendable.
- **Multirrol con una sola cuenta y un solo email:** `roles: string[]`. Al ingresar, si hay más de un rol, se elige con cuál entrar. En el perfil hay un selector de rol que cambia la vista sin cerrar sesión.
- **Permisos (propuesta confirmada):** lectura por la suma de roles de la cuenta. Escritura (enviar, publicar, entregar, administrar) verifica que el rol activo, que se envía con cada llamada, esté en `roles`. Así una vista no puede hacer por error lo que corresponde a otra.

## Decisiones confirmadas (tercera ronda)

- **Lectura de `users`: solo con sesión iniciada.** Es la única regla que se cambia en este paso.
  - **Bloqueante:** `authenticateFamily` busca el DNI en `users` *antes* de iniciar sesión. Con esta regla, el ingreso por DNI deja de funcionar. Por eso el orden es: (1) función `loginWithDni` en el servidor, (2) la app pasa a usarla, (3) recién después se publica la regla.
- **Sin límite de intentos fallidos** por ahora.
- **`role` puede ser un string o un array de strings:** `role: "docente"` o `role: ["docente", "familia"]`.
  - Las reglas y funciones que comparan `role ==` o `role in [...]` tienen que leer ambos formatos con un helper (`rolesOf(user)` que siempre devuelve una lista). Sin ese helper, un usuario con array queda sin permisos.
