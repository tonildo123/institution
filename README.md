# Institución

## iOS: Apple Developer y App Store Connect

- [Configuración inicial, ejecución en iOS y TestFlight](PUBLICAR_IOS.md)
- Abrir `ios/institucion.xcworkspace` en Xcode.
- `npm run ios`: ejecutar en simulador con Metro; requiere completar Firebase iOS.

## Android: pruebas y Google Play

- [Comandos Android y APK de pruebas](COMANDOS_ANDROID.md)
- [Configurar firma y generar el AAB para Google Play](PUBLICAR_ANDROID.md)
- `npm run android:apk`: APK de pruebas que funciona sin Metro.
- `npm run android:aab`: AAB de publicación; requiere configurar la clave de carga.

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.



### agregar

- rol de adminisrtador total
- rol equipo directivo - equipo de conduccion
- rol directivo con nombre
- rol docente - comunicacion - perfil - ver mensajes recibidos y enviados
- rol docente tutor - 
- rol padre - ya esta 
- rol preceptor - ya esta
- rol administrador - ya esta
- centro de estudiantes imep
- para perfil de padre / recibir mescladoz mensajes de todos sus hijos
- recibir notificaciones con colores segun nivel inicial
- cambiar todos por institucional

✅ Realizado
🟡 Pendiente
❌ (Sin realizar)
# Agregar
- Mensajes de audios transcriptos
- Roles combinados - selector de pantallas
- Dejar funcional "Dar de baja mi cuenta"
- Reportar problema
- agrgear mas salas (institucional[docentes- nivel inicial - docentes nivel primario - doc nivel sec, [PRIMARIA] todos los docentes, docentes materia especial- docente, deparatamento de ingles, personal no docente] - consultar / si queda por rol
    , solo a docentes, etc [ a definir])
- agregar bloqueo de pantalla
- Quitar editar mensaje ✅ 
- eliminar mensaje - consultar / si queda por rol


# Estimaciones pendientes de aprobado
- Biometria (3hs)| classroom (aula kit)(20 hs) | estimar costos - 23 hs mas
- WEB para las tiendas + configuracion de email (10 hs)

### trabajamos en estas mejoras de la aplicación:
- Privacidad de los mensajes: ajustamos el historial para que cada usuario vea los mensajes que envió o recibió. La protección completa en Firebase todavía requiere finalizar la migración de las cuentas familiares.
- Acceso de las familias: ingreso con DNI y contraseña. Desde la administración se pueden crear usuarios y cambiar sus contraseñas.
- Docentes por sala: se pueden asignar docentes a cursos específicos. Cada docente puede enviar mensajes únicamente a sus cursos.
- Gestión de alumnos: desde Salas se puede consultar su información, editarla o quitar al alumno del curso sin eliminar su cuenta.
- Cambio de curso: permite pasar a otro curso del mismo año o al año siguiente, en cualquiera de sus turnos.
- Gestión de usuarios: los contadores de administradores, docentes y familias funcionan como filtros.
- Mensajes: ocultamos el botón de editar y permitimos que los docentes eliminen sus propios mensajes, con confirmación previa.
- Selección de destinatarios: corregimos la ubicación de las listas desplegables y permitimos cerrarlas tocando nuevamente el botón.
- Perfil personal: cada usuario puede actualizar su nombre, correo, contraseña y foto. Las contraseñas tienen un botón para mostrarlas u ocultarlas.
- Perfil de familias: muestra el curso y turno al que pertenecen.
- Fotos de usuarios: aparecen al consultar el detalle desde Salas. También corregimos un problema que impedía cargar fotos JPG desde iPhone.
- Baja de cuenta: el usuario puede deshabilitar su cuenta con confirmación previa; luego se cierra su sesión y se conservan sus datos.
- Seguridad biométrica: incorporamos Face ID o huella para ingresar, desbloquear la aplicación y confirmar envíos. Falta completar la validación en dispositivos físicos.
- Correcciones en iPhone: ajustamos el visor de imágenes para poder cerrarlo correctamente.
Quedan pendientes la opción Reportar problema, la activación final de la privacidad en Firebase y las pruebas de biometría en teléfonos físicos.