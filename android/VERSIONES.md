# Historial de versiones Android

Cada build que se suba a Play Console o se distribuya debe tener un `APP_VERSION_CODE` nuevo.
Los valores se definen en `android/gradle.properties` (`APP_VERSION_CODE`, `APP_VERSION_NAME`).

| versionCode | versionName | Fecha | Artefactos | Notas |
|---|---|---|---|---|
| 3 | 1.0.0 | 2026-11-06 | `app-internal.apk` (firma debug), `app-release.aab` (firma upload) | Build con fix de `usesCleartextTraffic=false` en `app/build.gradle`. |
| 2 | 1.0.0 | — | — | Versión previa en `gradle.properties`. No hay registro de qué se subió. |

## Cómo generar

```bash
cd android
./gradlew :app:assembleInternal   # APK
./gradlew :app:bundleRelease      # AAB para Play
```

Salidas:
- APK: `android/app/build/outputs/apk/internal/app-internal.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

## Regla

Antes de cada build para Play: incrementar `APP_VERSION_CODE` y agregar una fila a esta tabla.
