# Comandos Android

Ejecutar desde la carpeta `institucion`.

## Generar APK para instalar o compartir

El APK `release` incluye el código JavaScript y los recursos: funciona sin Metro
y sin conectar el teléfono a la computadora.

### Preparación

- Usar Node.js 22.11 o superior y JDK 17.
- Tener Android SDK instalado con Android Studio. El proyecto usa SDK y Build Tools
  37, y NDK `27.1.12297006`.
- Si todavía no están instaladas las dependencias, ejecutar `npm ci`.
- Tener la configuración de Firebase del proyecto, incluido
  `android/app/google-services.json`.
- Configurar la ubicación del SDK en `android/local.properties`. En esta Mac:

  ```properties
  sdk.dir=/Users/xetro/Library/Android/sdk
  ```

  En otra computadora, ajustar la ruta. Este archivo es local y está excluido de Git.

### Compilar

Desde la carpeta `institucion`:

```bash
cd android
./gradlew :app:assembleRelease
cd ..
```

Esperar el mensaje `BUILD SUCCESSFUL`. La primera compilación puede demorar más
porque descarga dependencias y compila las librerías nativas.

El APK queda en:

```text
android/app/build/outputs/apk/release/app-release.apk
```

Se puede compartir ese archivo para instalarlo en un teléfono Android.
Para instalar o actualizar por USB, reemplazar `ID_DISPOSITIVO` por el identificador
que muestra `adb devices -l`:

```bash
adb -s ID_DISPOSITIVO install -r android/app/build/outputs/apk/release/app-release.apk
```

La opción `-r` conserva los datos al actualizar una instalación con firma compatible.
Cada vez que se cambie el código, volver a compilar y reinstalar el APK.

**Firma actual:** la variante `release` usa `android/app/debug.keystore`, según
`android/app/build.gradle`. Este APK sirve para pruebas y distribución interna.
Para publicar en Google Play, configurar una clave de firma propia y generar el
artefacto de publicación correspondiente.

## Ver dispositivos conectados

```bash
adb devices -l
```

- `device`: conectado y autorizado.
- `unauthorized`: desbloquear el teléfono y aceptar «Permitir depuración USB».
- `offline`: reconectar el dispositivo.
- `emulator-5554` (o similar): emulador, no teléfono físico.

Si el teléfono no aparece, activar Opciones de desarrollador → Depuración USB y conectarlo con un cable de datos.

## Elegir dónde instalar y abrir la app

```bash
npm run android -- --list-devices
```

Seleccionar el teléfono o emulador en la lista.

## Iniciar Metro

```bash
npm start
```

Con Metro abierto, presionar `r` para recargar las apps conectadas. Para instalar o ejecutar Android, usar otra terminal.

## Conectar el teléfono con Metro por USB

Reemplazar `ID_DISPOSITIVO` por el identificador que muestra `adb devices -l`.

```bash
adb -s ID_DISPOSITIVO reverse tcp:8081 tcp:8081
```

## Reiniciar ADB si no detecta el dispositivo

Esto desconecta temporalmente las sesiones ADB de todos los dispositivos.

```bash
adb kill-server
adb start-server
adb devices -l
```

## Reiniciar Metro con caché limpia

Detener Metro con `Ctrl+C` y ejecutar:

```bash
npm start -- --reset-cache
```

Si se agregó una librería nativa, recompilar con `npm run android -- --list-devices`; recargar Metro no alcanza.

### Emulador sin conexión a Firebase (fallo DNS)

Si `auth/network-request-failed` aparece solo en el emulador y no puede resolver
`securetoken.googleapis.com`, cerrar el AVD y arrancarlo en frío con DNS explícito:

```bash
$ANDROID_HOME/emulator/emulator -avd Pixel_10 -dns-server 8.8.8.8,8.8.4.4 -no-snapshot-load
adb -s emulator-5554 reverse tcp:8081 tcp:8081
```

Este arranque conserva aplicaciones y datos. Ajustar el nombre del AVD si cambia.
No borrar la base de datos ni cerrar sesión para resolver un problema de DNS.
