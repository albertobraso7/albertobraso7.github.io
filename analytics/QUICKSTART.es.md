# Consultar tus estadísticas

La web usa G-R8SZG8VFHS solo en producción y después de aceptar analítica.
No registra visitas desde localhost ni previews.

1. Abre Google Analytics y selecciona la propiedad que contiene este ID.
2. En Administrar → Flujos de datos → tu flujo web, desactiva Medición mejorada.
   La web ya mide scroll, vídeos y clics; evita mezclar esas mediciones automáticas.
3. Abre el portafolio publicado, acepta analítica y consulta Informes → Tiempo real.
   Busca page_view; abre un caso para comprobar project_view.
4. Para visitas habituales: Informes → Adquisición de tráfico y Páginas y pantallas.
5. Para proyectos, CV y vídeos: sigue las dimensiones y exploraciones de [README](README.md).
   Marca cv_click/contact_click como eventos clave para medir esas intenciones.

El envío desde producción fue aceptado por Google con HTTP 204. No se verificó
la aparición dentro de tu cuenta, ni se configuraron sus informes o retención.
Un clic en CV no demuestra descarga completada; email no demuestra correo enviado.
Los visitantes que rechacen el consentimiento no aparecerán en estas métricas.

Para pruebas locales usa ?analytics_debug=1: los eventos quedan en memoria,
sin envío a Google. Puedes retirar el consentimiento desde Analytics preferences.
