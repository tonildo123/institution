# Habilitar imágenes

El login por email ahora verifica la contraseña con Firebase Auth. El UID debe coincidir con el ID del documento users. Las familias por DNI conservan su flujo actual.

1. Habilitar Email/Password en Firebase Authentication.
2. Con credenciales administrativas y GOOGLE_CLOUD_PROJECT definido, ejecutar desde functions:
   `node scripts/provision-senders.mjs`
   Este comando solo revisa. Reporta cuentas faltantes y conflictos de UID, sin exponer contraseñas.
3. Revisar el resultado; ejecutar con `--apply` para crear las cuentas faltantes. No elimina ni reemplaza cuentas existentes.
4. Enviar a sus titulares un restablecimiento de contraseña desde Firebase Authentication. Las contraseñas anteriores nunca se validaban ni se guardaban al crear usuarios: no pueden migrarse.
5. Comparar storage.rules con las reglas existentes antes de publicar (no sobrescribir otros permisos sin revisión). Publicar con:
   `firebase deploy --only storage --config firebase.storage.json --project PROJECT_ID`
   Puede requerir habilitar el acceso de Storage a Firestore para comprobar roles.
6. Recargar completamente la app, cerrar sesión e ingresar con la contraseña de Firebase Auth. Verificar subida y recepción con dos dispositivos.

Las imágenes usan URLs de descarga de Firebase almacenadas en el mensaje. Esas URLs permiten acceso a quien las tenga; el historial actual no filtra mensajes por destinatario. Este cambio no agrega aislamiento entre destinatarios.

El alta por email desde móvil y web llama a createManagedUser. Publicar esa función después de compilar functions; verificar que el administrador inicial ya esté vinculado en Firebase Auth. El alta de familias por DNI conserva el flujo anterior. Publicado el 25/09/2026: createManagedUser, bucket institucion-59d9a.firebasestorage.app en US-CENTRAL1 y reglas Storage. Cuenta principal tony81191@gmail.com creada en Auth y Firestore con UID laWn1AFHuKTcaY40Y9c5MZxJptl1. El titular debe establecer su contraseña mediante recuperación.

La app usa institucion-59d9a, pero .firebaserc contiene institution-59d9a: especificar siempre --project institucion-59d9a al publicar este cambio.
