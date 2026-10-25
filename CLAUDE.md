# CAOTICCO — web de la tienda

Web de **CAOTICCO**, marca colombiana de streetwear transformable y sostenible. La dueña es **Valeria**, que no es técnica: háblale en español, sin tecnicismos, y haz tú todos los pasos (no le pidas que ejecute comandos).

## Qué es
Sitio estático: HTML, CSS y JavaScript sin frameworks, sin npm y sin paso de compilación. Se puede subir tal cual a cualquier hosting.

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Inicio: portada con la Cape, franja de confianza, tienda, cómo funciona, historia, lookbook, piezas 1 de 1, preguntas, lista del drop, pie de página |
| `cape.html` | Landing del producto Cape CCC-0 (buzo transformable en capa): galería, talla, compra, modos, especificaciones, guía de tallas, lookbook, tote, preguntas |
| `checkout.html` | Formulario de pedido. Al confirmar abre WhatsApp con el pedido escrito y un número `CC-XXXXXX` |
| `lib/manifest.js` | **Datos de la tienda**: WhatsApp, envío, medios de pago y productos (precio, tallas, estado, foto). El carrito y el pedido leen de aquí |
| `main.js` | Carrito (se guarda en el navegador), botones de compra, selector de talla, pedido por WhatsApp, menú móvil y animaciones de aparición |
| `styles.css` | Todo el diseño. Colores y tipografías en `:root` al inicio |
| `assets/img/` | Fotos en WebP |
| `.htaccess` | Caché del hosting (Apache) |

## Cómo verla
Servidor local desde esta carpeta: `python3 -m http.server 8765` y abrir http://localhost:8765 (ya hay `.claude/launch.json` con esa configuración para la vista previa).

## Datos pendientes (son de ejemplo, marcados con `← CONFIRMAR` en `lib/manifest.js`)
- Número de WhatsApp (`573000000000` es falso)
- Precio Cape: preventa $249.000, normal $289.000
- Precio Pants 3/1: $320.000
- Envío $15.000, gratis desde $250.000, entrega en 3 a 6 días hábiles
- Correo `hola@caoticco.com`
- Cambios de talla en 15 días
- Medidas de la guía de tallas en `cape.html`

**Ojo:** los precios, el envío y los plazos también están escritos a mano en el HTML (portada, tarjetas, franja de confianza, preguntas frecuentes, guía de tallas, barra fija móvil). Cuando cambie un dato, búscalo y actualízalo en `manifest.js` **y** en los tres HTML.

## Reglas para mantenerla
- El contenido va escrito en el HTML; el JavaScript solo agrega funciones. La web debe leerse aunque el JavaScript falle.
- Scripts normales con `defer` (nunca `type="module"`), todo dentro de funciones autoejecutables.
- Imágenes siempre en WebP dentro de `assets/img/`, con nombres en minúscula y guiones.
- Cada vez que se cambie CSS o JS, subir la versión `?v=AAAAMMDDx` en los tres HTML para que los visitantes vean el cambio.
- Encabezado y pie de página están repetidos en los tres HTML: si se cambian, cambiarlos en los tres.
- Para un producto nuevo: agregarlo en `manifest.js` (el `id` se usa en los botones `data-add="id"`), agregar su tarjeta en la tienda de `index.html` y, si tiene landing, copiar `cape.html` como base (`data-product="id"` en el `<main>`).
- Estados de producto: `preventa`, `disponible`, `agotado` (botón «Avísame» por WhatsApp) y `pronto`.

## Identidad
- Colores: negro `#0b0b0c`, hueso `#eeeae3`, rojo marca `#b3262e` y rojo vivo `#e5484f`.
- Tipografías: Archivo (títulos expandidos en mayúscula, y texto) y JetBrains Mono (etiquetas).
- Motivo gráfico: la estrella de cinco puntas (logo con espiral).
- Lema: «El caos no te frena, te transforma».
- Producto estrella: **Cape CCC-0**. Usa siempre ese nombre con la descripción «buzo transformable en capa».

## Pendiente a futuro
- Fotos originales en alta resolución (varias vienen de Instagram, a 640 px).
- Páginas de términos, privacidad y cambios (el pie de página ya las menciona).
- Cobro en línea con una pasarela colombiana (Wompi, Bold, Mercado Pago), si la marca lo quiere.
- Píxel de Meta y analítica para medir las visitas que llegan desde Instagram.

## Contexto de marca
En `docs/analisis-instagram.html` está el diagnóstico de Instagram y comunicación (prioridades, bio propuesta, plan de contenido). Úsalo como referencia para el tono y las decisiones.
