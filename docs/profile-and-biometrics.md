# Perfil y datos biométricos

## Editar perfil

Todos los roles pueden editar su propio nombre, correo y contraseña con un solo Guardar. Para cambiar correo o contraseña se solicita la contraseña actual y se reautentica la cuenta en Firebase Auth. Una contraseña nueva requiere confirmación; dejarla vacía conserva la actual.

La función `updateOwnProfile` obtiene el UID del token y acepta únicamente nombre, correo y contraseña. No permite modificar DNI, rol, estado ni asignaciones. Comprueba que el perfil esté habilitado y exige autenticación reciente por contraseña para cambios sensibles. Nombre y correo se sincronizan entre Auth y Firestore; la contraseña se guarda exclusivamente en Firebase Auth. Si falla Firestore, se intenta revertir el cambio de nombre/correo de Auth. Si falla solamente la contraseña se informa el resultado parcial y se conserva el formulario para reintentar.

En familias el correo es de contacto: se conserva el acceso por DNI mediante el alias interno estable. En docentes y administradores el nuevo correo también pasa a ser el de acceso. El ingreso por correo resuelve el perfil por el UID autenticado, evitando confundir un correo de contacto familiar con el correo de acceso de otra cuenta.

## Foto y actualización de la pantalla

Al confirmar el método, el perfil actualizado se guarda en Redux y AsyncStorage. El nombre del encabezado, el valor en Información personal y la foto se renderizan desde ese mismo estado; se actualizan antes del aviso de éxito.

Tocar el avatar o Editar perfil permite agregar/cambiar una foto desde la galería o la cámara frontal. La foto se muestra como vista previa y se sube al tocar Guardar, junto con los demás cambios. Cancelar el selector mantiene la foto anterior. Se admiten JPG, PNG y WebP de hasta 5 MB.

La pantalla de perfil delega su estado y acciones en `useProfileLogic.ts`; `ProfileScreen.tsx` se ocupa solo del render.

Las fotos se guardan en `profile-photos/{uid}/{photoId}`. Cada cambio sube un archivo nuevo, así que la función programada `cleanupOrphanFiles` borra cada tres meses (1 de enero, abril, julio y octubre, 03:00 hora de Argentina) los archivos de esa carpeta que ningún perfil referencia y que tienen más de 7 días. Si la URL de un usuario no se puede interpretar, su carpeta no se toca. Las reglas de Storage permiten que cada usuario habilitado, incluidas las familias, cargue y modifique solo sus fotos. La función comprueba la ruta del propietario, el tipo y el tamaño del archivo antes de guardar su URL en Firebase Auth y Firestore. No acepta URLs arbitrarias proporcionadas por el cliente.

## Activar biometría

Abrir Perfil → Datos biométricos. Confirmar la contraseña actual y luego Face ID o huella. El dispositivo debe tener una biometría configurada. Se usa el módulo nativo `react-native-biometrics`; en iOS se agrega el permiso de Face ID y en Android el permiso biométrico. La app debe recompilarse después de instalar la dependencia. Las dos compilaciones nativas se verificaron. El flujo de sensor se validó en un dispositivo real: activación e ingreso con biometría funcionan. El simulador no reemplaza esa comprobación.

Se crea una clave RSA de 2048 bits protegida por la autenticación biométrica del sistema. La clave privada permanece en el almacenamiento seguro nativo. El servidor guarda únicamente la clave pública y su vinculación al UID. La app guarda localmente el UID, el identificador derivado de la clave y la clave pública; no guarda huellas, imágenes de Face ID ni contraseñas.

Se admite una cuenta biométrica vinculada por instalación. Para cambiarla, ingresar con la cuenta anterior y desactivarla primero. Una cuenta puede tener varios dispositivos.

Una vez activada, el inicio de sesión ofrece Face ID/huella cuando el teléfono tiene biometría configurada. La vinculación se conserva al cerrar sesión. Siempre se puede ingresar con contraseña. No se solicita biometría al volver desde segundo plano ni al enviar mensajes. El componente de bloqueo y los métodos antiguos de confirmación se conservan por compatibilidad, sin conectarlos al flujo actual.

Desactivar requiere contraseña actual, pide confirmación y revoca todos los dispositivos de esa cuenta. Los desafíos ya emitidos dejan de funcionar. Si se cambia/restablece la contraseña o el correo de acceso, volver a vincular el teléfono: el servidor rechaza las claves asociadas a la vigencia anterior de la cuenta.

## Servidor y reglas

Funciones: `updateOwnProfile`, `enrollBiometrics`, `disableBiometrics`, `biometricChallenge`, `verifyBiometricLogin`, `verifyBiometricUnlock`. Los endpoints de envío usan la sesión autenticada y no exigen biometría, incluso para cuentas vinculadas anteriormente.

Las colecciones `biometricDevices`, `biometricAccounts` y `biometricChallenges` no admiten lectura ni escritura directa del cliente, incluidos administradores de la app. Las gestionan exclusivamente las funciones. Las reglas actuales ya deniegan esas rutas.

Los desafíos vencen en dos minutos, se consumen en una transacción y se reemplazan por dispositivo/acción para limitar la acumulación de datos. La función del servidor obtiene un token personalizado solo después de verificar la firma y el estado de la cuenta. La cuenta de servicio de Functions tiene permiso de firma limitado a su propia identidad; no se descarga ni se incorpora una clave privada de Firebase al repositorio.

La activación pendiente de la privacidad estricta de lectura de comunicaciones continúa documentada en `message-privacy.md`. Este cambio no activa esas reglas anticipadamente.

## Validación

Pruebas de perfil, reautenticación, firmas reales RSA, modificación de mensajes, repetición de desafíos, expiración, revocación, cancelación, restauración y bloqueo de sesiones. Compilaciones Debug de iOS y Android. Pruebas de reglas contra Firebase Rules API sin publicar nuevas reglas.

La suite general `App.test.tsx` mantiene el problema previo de carga ESM en Jest; las suites de esta funcionalidad pasan. Reportar problema permite enviar título, descripción y una imagen opcional JPG/PNG/WebP de hasta 5 MB. Mis reportes muestra únicamente los reportes propios con estado y comentarios de administración en tiempo real. Admin y equipo directivo ven la bandeja completa, cambian estados y comentan; cada comentario es visible para el reportante. Los adjuntos se guardan en problem-report-images, con carga restringida al propietario y lectura para propietario y gestores. La baja de cuenta ya pide confirmación y llama a `deactivateOwnAccount`: el servidor toma el UID autenticado, actualiza únicamente `isEnabled: false` y `updatedAt`, y la app cierra sesión tras confirmar el guardado. No elimina el perfil ni sus datos. Si falla el guardado conserva la sesión y permite reintentar; para volver a ingresar, la institución debe habilitar la cuenta.
