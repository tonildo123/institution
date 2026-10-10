# iOS: configuración inicial y TestFlight

## Identidad configurada

- Nombre visible en iOS: **IMEP**.
- Bundle ID en Debug y Release: `com.imep.institucional`.
- Team ID: `8JZ4SGUJ5R`.
- Firma automática habilitada en el proyecto. Falta agregar la cuenta a Xcode
  para que pueda obtener los certificados y perfiles. El Bundle ID fue registrado
  en Apple Developer, según confirmación del titular.

## Integración de Firebase

`GoogleService-Info.plist` está agregado a los recursos del target y
`AppDelegate.swift` inicializa Firebase antes de React Native. El archivo
corresponde a `com.imep.institucional` y al proyecto `institucion-59d9a`.
Los pods se instalaron con CocoaPods 1.16.2 (`cd ios` y `pod install`); el
entorno actual de Bundler requiere reparar sus gems antes de usar
`bundle exec pod install`.

Pendiente: habilitar las capabilities de notificaciones y cargar la clave APNs
en Firebase para probar la entrega en un dispositivo físico.

## Validación realizada

- Pods instalados correctamente.
- Compilación Debug para simulador: correcta (antes de optar por iPhone físico).
- Simulador apagado para liberar memoria.
- Compilación Debug firmada para iPhone físico: correcta, con `-jobs 1`.
- App instalada y proceso iniciado en el iPhone conectado.
- Pendiente de comprobar visualmente el login y los flujos; las notificaciones
  requieren completar APNs.

## Estado inicial

El proyecto usa React Native y tiene un workspace en `ios/institucion.xcworkspace`.
Abrir siempre el workspace, que incluye las dependencias de CocoaPods.

Antes de ejecutar la app hay que completar Firebase nativo: el código utiliza
`@react-native-firebase/messaging`, incluso al iniciar la navegación.

## 1. Cuenta y firma en Xcode

1. En Xcode → Settings → Accounts, agregar la cuenta de Apple.
2. Abrir `ios/institucion.xcworkspace`.
3. Seleccionar el proyecto → target `institucion` → Signing & Capabilities.
4. Activar Automatically manage signing y seleccionar el equipo del programa
   Apple Developer.
5. Definir un Bundle Identifier propio y estable. Debe coincidir en Xcode,
   Apple Developer, Firebase y App Store Connect, tanto en Debug como Release.

El Team ID se consulta en la sección Membership details de Apple Developer.
No compartir contraseñas ni claves privadas para configurar el repositorio.

## 2. Firebase para iOS

1. En el proyecto Firebase existente, agregar una aplicación iOS con el Bundle
   Identifier definitivo.
2. Descargar `GoogleService-Info.plist` y agregarlo en Xcode al grupo
   `institucion`, con el target `institucion` seleccionado. Verificar que se
   incluya en Build Phases → Copy Bundle Resources.
3. Configurar la inicialización de Firebase en `AppDelegate.swift` antes de
   iniciar React Native, siguiendo la instalación de React Native Firebase.
4. Revisar el Podfile según las versiones instaladas y reinstalar los pods.
5. Agregar las capabilities Push Notifications y Background Modes → Remote
   notifications.
6. Crear una clave APNs en Apple Developer y cargarla en Firebase → Project
   settings → Cloud Messaging, con su Key ID y Team ID. Guardar el archivo
   privado `.p8` fuera del repositorio.

Referencia: https://rnfirebase.io/ y https://rnfirebase.io/messaging/usage/ios-setup

## 3. Ejecutar y probar

Si cambiaron dependencias nativas, desde la raíz:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
```

Para desarrollo, en una terminal:

```sh
npm start
```

En otra terminal:

```sh
npm run ios
```

También se puede seleccionar un simulador en Xcode y usar Run. Para un iPhone
físico, conectar el dispositivo, aceptar la confianza y activar Developer Mode
si lo solicita. Seleccionarlo como destino y ejecutar con el equipo configurado.

Para reducir la memoria usada por el Mac, preferir el iPhone físico y mantener
el simulador apagado. En Xcode, seleccionarlo en la barra de destinos y usar
Product → Run, con Metro iniciado. La compilación inicial igualmente necesita
recursos del Mac.

Para compilar desde terminal con poca concurrencia (reemplazar el UDID por el
del dispositivo conectado):

```sh
xcodebuild -workspace ios/institucion.xcworkspace -scheme institucion \
  -configuration Debug -destination 'platform=iOS,id=UDID_DEL_IPHONE' \
  -jobs 1 -allowProvisioningUpdates -allowProvisioningDeviceRegistration build
```

Comprobar inicio de sesión, comunicaciones, adjuntos, audio y notificaciones.
Validar las notificaciones también en un iPhone físico.

## 4. App Store Connect y TestFlight

1. Completar los íconos de `Images.xcassets/AppIcon.appiconset`, incluyendo el
   ícono de App Store de 1024 × 1024.
2. Revisar nombre visible, versión y número de build en el target de Xcode.
3. En App Store Connect → Apps → + → New App, crear la ficha iOS usando el
   mismo Bundle ID. Definir nombre, idioma y un SKU interno único.
4. En Xcode, seleccionar un destino genérico de dispositivo iOS y ejecutar
   Product → Archive.
5. En Organizer, validar el archivo y usar Distribute App → App Store Connect
   para cargarlo con firma automática.
6. Una vez procesado, completar los datos requeridos en TestFlight y habilitar
   las pruebas. Los testers externos pueden requerir revisión beta de Apple.

La publicación en App Store requiere además la ficha comercial, capturas,
política de privacidad, declaraciones de datos, clasificación por edad y los
datos de acceso para revisión cuando la app requiere login. TestFlight y
publicación son pasos separados.

Referencias oficiales:

- https://developer.apple.com/documentation/xcode/preparing-your-app-for-distribution
- https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases
