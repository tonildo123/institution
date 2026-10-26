# Plan: entrega de tareas en Classroom

Estado: **plan, sin implementar**.

## Qué se pide

- La docente publica una **tarea** en Classroom (una publicación con `type: 'tarea'`).
- Cada alumno puede entregar **una sola** respuesta por tarea.
- La entrega admite los adjuntos que la app ya soporta (imagen, video, audio, documento, enlace), reutilizando los servicios actuales.
- La tarea tiene un **cupo máximo** igual a la cantidad de alumnos destinatarios. En un aula de 50 alumnos, como máximo 50 entregas.

## Modelo de datos

**Tarea:** la publicación existente en `classroom/{taskId}`, con campos nuevos:

- `type: 'tarea'`
- `maxSubmissions`: número de destinatarios al momento del envío (fijo, para que el cupo no cambie si cambia el aula).
- `submissionsCount`: contador de entregas, actualizado solo por Cloud Functions.

**Entrega:** subcolección `classroom/{taskId}/submissions/{studentUid}`.

- El ID del documento es el UID del alumno. Así, una entrega por alumno queda garantizada por la base de datos: no puede existir un segundo documento para el mismo alumno.
- Campos: `studentId`, `studentName`, `body` (texto), `data` (adjuntos con el mismo formato que los mensajes actuales), `createdAt`.
- No se edita ni se borra desde el cliente.

## Reglas de negocio (aplicadas en Cloud Functions)

1. La tarea existe y es de tipo `tarea`.
2. El alumno está en `targetUserIds` de la tarea. Si no, no puede entregar.
3. El alumno todavía no entregó (el documento no existe).
4. El cupo no está completo: `submissionsCount < maxSubmissions`.
5. Los adjuntos pertenecen al alumno y a esa tarea (rutas `classroom-submissions/{taskId}/{uid}/...`).

La creación de la entrega y el incremento de `submissionsCount` ocurren en **una misma transacción**. Así, dos entregas simultáneas no pueden superar el cupo.

## Cambios por capa

**Funciones (`functions/src`)**

- Nueva función `submitClassroomTask`: valida las reglas de arriba, crea la entrega e incrementa el contador en una transacción.
- `sendClassroomToAll` y `sendClassroomToUsers`: al crear una tarea, guardan `type`, `maxSubmissions` y `submissionsCount: 0`.

**Reglas de Firestore**

- `classroom/{taskId}/submissions/{uid}`: lectura para el propio alumno y para administración / la docente que creó la tarea. Escritura solo por Cloud Functions (`allow create: if false`).

**Reglas de Storage**

- Nueva carpeta `classroom-submissions/{taskId}/{uid}/`: escritura solo para el dueño, con los mismos límites de tipo y tamaño que `communication-*`.

**Cliente**

- `src/services/firebase/classroom.ts`: `submitClassroomTask`, lectura de la entrega propia y de la lista de entregas (para la docente).
- Reutilizar el composer: extraer la parte de adjuntos, emojis y negrita de `ClassroomScreen` a un componente `MessageComposer`, para usarlo en publicar y en entregar sin copiar código.
- `ClassroomDetailScreen`:
  - **Alumno:** si no entregó, muestra el composer y el botón "Entregar tarea". Si ya entregó, muestra su entrega en modo lectura con el estado "Entregada".
  - **Docente / administración:** muestra "X de N entregas" y la lista de entregas.

## Casos borde

- Cupo completo: el botón de entregar se desactiva con el texto "Cupo completo".
- Entrega duplicada: la función responde "Ya entregaste esta tarea" y no crea nada.
- Alumno fuera del aula: la función responde "Esta tarea no está asignada a tu cuenta".
- Falla a mitad de la subida de adjuntos: la entrega no se crea hasta que todos los adjuntos estén subidos.

## Orden de implementación

1. Reglas y funciones de tarea (`type`, `maxSubmissions`, `submissionsCount`) y tests de cupo y duplicado.
2. Función `submitClassroomTask` y tests de transacción (cupo, duplicado, pertenencia).
3. Reglas de Storage para `classroom-submissions`.
4. Extraer `MessageComposer` y reutilizarlo en Classroom sin cambiar comportamiento.
5. UI de entrega para alumno y lista de entregas para docente.
6. Pruebas en dispositivo con una tarea real.

## Preguntas abiertas

1. **¿Los alumnos tienen cuenta propia?** Hoy no existe el rol `alumno`; las entregas las haría la cuenta de familia. ¿Cada alumno necesita una cuenta separada?
2. **¿Se puede editar o borrar una entrega?** Propuesta: no se edita. La docente puede borrar una entrega para que el alumno vuelva a entregar.
3. **¿Cuál es el cupo?** Propuesta: la cantidad de destinatarios al momento de publicar la tarea.
4. **¿Hay fecha límite?** El mockup muestra "Entrega: [fecha]". Propuesta: un campo `dueDate` que cierra las entregas después de esa fecha.
5. **¿La docente recibe aviso cuando llega una entrega?** Se puede agregar más adelante; no está en este plan.
