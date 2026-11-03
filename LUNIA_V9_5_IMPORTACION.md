# LUNIA v9.5 — Registro y entrada (entrega en preparación)

Esta rama conserva el proyecto Figma existente en `main` y prepara una importación separada de la versión web v9.5 procedente del paquete `LUNIA_registro_y_entrada(1).zip`.

## Estado comprobado (3 de noviembre de 2026)
- La copia local del paquete contiene la app web, fuentes JSX/MJS, recursos visuales, archivos compilados, scripts y pruebas.
- `npm run check`: correcto sobre los archivos `dist/` incluidos.
- `npm test`: **19 pruebas aprobadas**.
- `npm ci`/recompilación: **no verificados**, porque el entorno de revisión no pudo descargar dependencias.
- Los archivos subidos a esta rama son **parciales**: NO representan por sí solos la aplicación completa ni sustituyen el ZIP.
- No se han configurado pagos reales, inicio de sesión con Google ni servicios privados.

## Importación segura
1. Mantener `main` sin cambios hasta importar y validar la aplicación completa.
2. Extraer `LUNIA_registro_y_entrada(1).zip` en una rama dedicada, sin mezclar indiscriminadamente con el proyecto Figma.
3. Revisar medios con derechos de terceros y excluir secretos o credenciales.
4. Ejecutar `npm ci`, `npm run build`, `npm run check`, `npm test`.
5. Revisar diseño responsive, imágenes del registro y calma, barra móvil, corazones animados, audio y recuperación de sesión en navegador y dispositivo.
6. Integrar mediante un pull request revisado y no por sobreescritura directa de `main`.

## Próximos puntos de diseño
- Pulir degradados y animaciones de entrada y registro.
- Evitar desbordamientos en controles del reproductor.
- Comprobar contraste y tamaño de los botones de navegación móvil.
- Verificar que las mascotas mantengan sus colores y que los corazones respondan a cada interacción.
