# Comandos Android

Ejecutar desde la carpeta `institucion`.

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
