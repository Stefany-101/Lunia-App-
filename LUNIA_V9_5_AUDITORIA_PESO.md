# Auditoría de peso LUNIA v9.5 (3 nov 2026)

Auditoría sobre `LUNIA_registro_y_entrada(1).zip` provisto por la creadora, **sin subir archivos multimedia sujetos a derechos**.

| Métrica | Antes | Paquete optimizado local |
|---|---:|---:|
| Archivos descomprimidos | 44,16 MB | 23,91 MB |
| ZIP comprimido | 42,19 MB | 22,76 MB |
| Música en ZIP original | 30,39 MB | MP3 grandes recodificados a 80 kb/s |
| Tests | 19/19 | 19/19 |

## Hallazgos
- MP3 (audio) 30,39 MB: el principal responsable (~69%).
- Imágenes WebP/JPG/PNG aproximadamente 12,48 MB.
- JavaScript/CSS/HTML y otros recursos: aproximadamente 1,29 MB.
- Ningún `.jar` o `.class` detectado.
- El service worker precargaba más de cien elementos, y durante `activate` descargaba varios MP3 completos.
- El estado de plan `lunia-v9-preview-plan` en `localStorage` es un **selector de maqueta**, no una autorización de pago real.

## Cambios comprobados en una copia local
1. Core mínimo en SW con HTML, JS, CSS, configuración y algunos iconos.
2. No precargar canciones al activar SW. Música e imágenes cargan cuando se solicitan.
3. Recodificación de 7 pistas MP3 de gran tamaño al formato MP3 compatible a 80 kb/s, preservando nombres y rutas.
4. Se conservan los recursos existentes y se añaden 9 fotografías de referencia como assets opcionales (no en la caché inicial).
5. Se actualizaron las pruebas del service worker: 19/19 superadas.

**El ZIP optimizado está disponible en la conversación, pero no se ha importado aún íntegramente a GitHub. Esta rama/PR sigue siendo parcial, no desplegable.** No fusionar con `main` aún.

## Para acceso público y creadora
- Publicar después de completar carga de recursos y verificación de licencias en HTTPS, con GitHub Pages para la UI estática.
- Usar Supabase Auth y RLS para membresías; asignar ambas membresías de prueba a **un UUID de creadora autenticado** desde un entorno seguro; no comprobar nombres/correos en el cliente ni poner contraseñas en repositorio.
- Para usuarios normales validar `Lunial` o `Galáctica` contra una tabla de derechos que cambie solo mediante webhook verificado del proveedor de cobro.
- Nunca autorizar acceso premium con `localStorage`, query params o una función JS del frontend.
