# Publicar Android en Google Play

## Configuración local preparada

Se creó una clave nueva para `com.institucion` con alias `institucion-upload`.
En esta máquina ya están configurados:

- `android/upload-keystore.jks`: clave privada de carga.
- `android/keystore.properties`: ruta, alias y contraseñas; permisos `600`.
- `android/upload-certificate.pem`: certificado público de la clave de carga.

Respaldar los dos primeros archivos en un lugar seguro. Están excluidos de Git y
no estarán disponibles al clonar el repositorio. No volver a generar la clave para
cada versión. En esta máquina se puede ir directamente al paso 3.

## Variantes configuradas

| Variante | Uso | Firma | Metro |
| --- | --- | --- | --- |
| `debug` | Desarrollo con `npm run android` | Debug | Sí |
| `internal` | APK para compartir con testers | Debug | No |
| `release` | AAB para Play Console | Clave de carga propia | No |

Las tres usan `com.institucion` y el mismo Firebase. No hay flavors porque todavía
hay un solo entorno. `internal` es una variante local; la pista de pruebas internas
de Google Play recibe el AAB `release`.

El identificador de publicación es `com.institucion`. Confirmarlo antes de la primera
carga: identifica la app en Google Play y debe coincidir con Firebase. Si la app ya
está publicada, conservar su identificador y utilizar su clave de carga registrada.

## 1. Preparar la máquina

Seguir los requisitos de [COMANDOS_ANDROID.md](COMANDOS_ANDROID.md): Node 22.11+,
JDK 17, SDK/Build Tools 37, NDK 27.1.12297006, dependencias y configuración de Firebase.
El proyecto tiene `targetSdkVersion=36` y `minSdkVersion=24`.

## 2. Crear o reutilizar la clave de carga

Si ya existe una clave registrada en Play Console, usar esa clave. Para una app
nueva, ejecutar desde la raíz del proyecto:

```bash
keytool -genkeypair -v -keystore android/upload-keystore.jks -alias institucion-upload -keyalg RSA -keysize 2048 -validity 10000 -storetype JKS
```

El comando solicita las contraseñas y los datos del certificado en la terminal.
Guardar la clave y sus contraseñas en un respaldo seguro; se reutilizan para futuras
cargas. No compartir las contraseñas por chat ni incluirlas en Git.

```bash
cp android/keystore.properties.example android/keystore.properties
chmod 600 android/keystore.properties android/upload-keystore.jks
```

Completar el archivo local con la ruta, alias y contraseñas reales. La ruta del
keystore puede ser absoluta o relativa a `android/`; no admite `~`. Si se reutiliza
una clave externa, ajustar la ruta del comando `chmod`.

El archivo usa el formato Java Properties: escapar una barra inversa como `\\`.
No poner comillas alrededor de los valores. En CI se pueden proporcionar las cuatro
variables `INSTITUCION_UPLOAD_*` del ejemplo mediante el gestor de secretos; tienen
prioridad sobre el archivo local.

Gradle bloquea `release` cuando faltan datos o se configura la clave debug conocida.
`debug` e `internal` siguen funcionando sin credenciales de publicación.

## 3. Definir la versión

Editar `android/gradle.properties`:

```properties
APP_VERSION_CODE=1
APP_VERSION_NAME=1.0.0
```

Usar un `APP_VERSION_CODE` mayor al de cualquier carga anterior a Play Console.
`APP_VERSION_NAME` es la versión visible para el usuario.

## 4. Generar el AAB firmado

Desde la raíz:

```bash
npm run android:aab
```

Equivalente:

```bash
cd android
./gradlew :app:bundleRelease
cd ..
```

Para sobreescribir la versión en una compilación:

```bash
cd android
./gradlew :app:bundleRelease -PAPP_VERSION_CODE=2 -PAPP_VERSION_NAME=1.0.1
cd ..
```

Esperar `BUILD SUCCESSFUL`. Archivo para cargar:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Verificar su firma:

```bash
jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab
```

Un certificado autofirmado es normal para una clave de carga de Android. El AAB
contiene el código JavaScript y no requiere Metro. No se instala con `adb install`;
para probar la entrega real, usar una pista de pruebas de Google Play.

## 5. Cargar y probar en Play Console

1. Crear o abrir la app correspondiente a `com.institucion`.
2. Configurar Play App Signing. Google firma los APKs distribuidos; la clave local
   se usa para autenticar las cargas del AAB.
3. Crear una versión en Pruebas internas y subir `app-release.aab`.
4. Revisar los avisos de Play Console y probar inicio de sesión, notificaciones,
   formularios, audio, video y adjuntos en un dispositivo real.
5. Completar la ficha, política de privacidad, seguridad de datos, clasificación y
   acceso para revisión según lo que solicite la consola antes de producción.

Si un servicio de Firebase requiere huellas del certificado, registrar las de
**firma de la app** que muestra Play Console, además de las de carga que se utilicen
en instalaciones locales. No sustituir el applicationId para resolver problemas de firma.

Los APKs anteriores de pruebas usan otra firma. Una instalación desde Play puede
requerir desinstalarlos primero; desinstalar elimina los datos locales.

## Compatibilidad de bibliotecas nativas

React Native configura páginas flexibles de 16 KB con el NDK actual. Verificar también
las bibliotecas de terceros y probar en un dispositivo/emulador de 16 KB. Con bundletool
instalado, revisar la configuración del bundle:

```bash
bundletool dump config --bundle=android/app/build/outputs/bundle/release/app-release.aab
```

Buscar `PAGE_ALIGNMENT_16K`. Esto comprueba el empaquetado; la alineación ELF de las
bibliotecas y el funcionamiento en un dispositivo de 16 KB requieren validación adicional.

## Verificación realizada (5 de octubre de 2026)

- `bundleRelease`: compilación correcta, AAB firmado de aproximadamente 59,5 MiB.
- `bundletool validate`: correcto.
- Manifest: `com.institucion`, versión `1.0.0` (código `1`), target SDK `36`,
  sin depuración y sin tráfico HTTP en texto plano.
- Firma verificada con `jarsigner`; certificado autofirmado de carga. Java también
  informa advertencias por el orden del manifest dentro del ZIP del AAB; bundletool
  valida correctamente su estructura.
- Código JavaScript incluido y empaquetado `PAGE_ALIGNMENT_16K`.
- Los segmentos `LOAD` de las 36 bibliotecas de 64 bits tienen alineación de 16 KB.
- **Pendiente antes de producción:** 29 bibliotecas de 64 bits presentan un final de
  segmento `GNU_RELRO` no alineado a 16 KB según la comprobación de la guía de Android.
  Incluyen bibliotecas de React Native, Hermes y Nitro. Revisar/actualizar las
  dependencias afectadas y probar en Android con páginas de 16 KB; el build y la
  validación del bundle no certifican por sí solos la compatibilidad en ejecución.
- Se verificó el fallo explícito de `release` sin credenciales y la resolución de
  tareas de `assembleInternal` con `--dry-run`. No se recompiló el APK internal.
- No se subió a Play Console ni se realizó una prueba de instalación desde Play.

## Referencias oficiales

- [Firma y Play App Signing](https://developer.android.com/studio/publish/app-signing)
- [Requisitos de API de Google Play](https://support.google.com/googleplay/android-developer/answer/11926878)
- [Compatibilidad con páginas de 16 KB](https://developer.android.com/guide/practices/page-sizes)
