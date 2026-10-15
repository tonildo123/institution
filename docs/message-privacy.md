# Privacidad de comunicaciones

La app consulta los mensajes cuyo `sentBy` coincide con el UID autenticado y los que incluyen ese UID en `targetUserIds`. Une las dos consultas, elimina duplicados y muestra los últimos 30 o 100 de ese usuario. El detalle comprueba el mismo permiso, incluso al abrir una notificación. Ningún rol tiene una excepción de lectura.

La audiencia se toma del envío original: la pertenencia actual a un curso no concede acceso a mensajes anteriores. Los mensajes antiguos sin `targetUserIds` solo son visibles para su emisor. No se reconstruyen destinatarios históricos a partir de salas actuales.

## Estado y activación

Los índices están publicados. Las reglas de `firestore.rules` están validadas pero deben activarse después de preparar las cuentas y distribuir la app. Se usa `firebase.privacy.json` para evitar publicarlas accidentalmente con un despliegue normal. Los cambios de los endpoints de envío están preparados en el código y necesitan desplegarse al activar.

1. Publicar `createManagedUser`, `setFamilyPassword` y `setUserPassword`. Son compatibles con las cuentas existentes; no cambian sus IDs ni sus asignaciones.
2. En la app actualizada, entrar como administrador y abrir Usuarios → editar familia → **Nueva contraseña → Guardar**, o Salas → curso → editar familia → **Establecer contraseña**. Elegir una contraseña individual y comunicarla a su titular por un canal privado. En Usuarios, Guardar actualiza los datos y la nueva contraseña si se ingresó. En Salas, Establecer contraseña guarda solo la contraseña. Las contraseñas se almacenan en Firebase Auth. Las familias nuevas creadas por Usuarios también requieren contraseña.
3. Verificar el ingreso con DNI y contraseña de las familias preparadas. El alias de Auth depende del ID estable del perfil; cambiar el DNI conserva la identidad y los permisos. Las sesiones antiguas basadas solo en AsyncStorage ya no permiten ingresar.
4. Distribuir la app actualizada a emisores y familias. La versión anterior no envía token en los endpoints de mensajes ni autentica las familias.
5. Activar la protección del servidor:

```sh
npm run build --prefix functions
firebase deploy --only functions:sendCommunicationToAll,functions:sendCommunicationToUsers --project institucion-59d9a
firebase deploy --only firestore:rules --config firebase.privacy.json --project institucion-59d9a
```

Hasta completar el paso 5, las reglas abiertas anteriores siguen vigentes y no hay protección completa contra acceso directo. Activar antes de preparar contraseñas y distribuir la app bloquearía las familias y los envíos de versiones anteriores.

## Reglas y comprobaciones

Las comunicaciones solo se leen por participantes autenticados y habilitados. Editar/eliminar conserva los roles administrativos existentes y exige además ser participante. Las modificaciones no pueden alterar emisor ni destinatarios. Las comunicaciones nuevas se crean solo mediante Cloud Functions; los endpoints obtienen el emisor del token verificado e ignoran un `userId` falsificado.

Para evitar que alguien cambie su rol o se agregue a una sala y eluda los permisos, las escrituras de usuarios y salas requieren un administrador habilitado. Cada usuario puede actualizar sus propios datos básicos y tokens, sin modificar rol o habilitación. Se conserva la lectura pública de perfiles usada por la búsqueda de DNI/email anterior al login; las contraseñas no se almacenan en esos perfiles. La privacidad de perfiles y las URLs compartibles de adjuntos son alcances distintos de la lectura de documentos de mensajes.

Pruebas locales:

```sh
npx jest __tests__/familyAuthentication.test.ts __tests__/setFamilyPassword.test.ts __tests__/communicationLoading.test.ts __tests__/communicationAudience.test.ts __tests__/communicationFunctions.test.ts __tests__/createManagedUser.test.ts __tests__/createAccount.test.ts --runInBand --watchman=false
```

Pruebas de reglas contra Firebase Rules API (sin publicar reglas ni modificar documentos):

```sh
node scripts/test-message-rules.cjs
```

Las pruebas de reglas cubren emisor/destinatario/tercero para cada rol, falta de sesión, usuario deshabilitado, mensajes antiguos, eliminación y cambios de audiencia.
