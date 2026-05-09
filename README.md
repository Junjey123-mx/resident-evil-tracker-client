# Resident Evil Franchise Tracker — Frontend

Cliente web estático para consumir la API REST del **Resident Evil Franchise Tracker**. Construido con HTML, CSS y JavaScript vanilla, sin frameworks, sin build step y usando `fetch()` nativo para comunicarse con el backend.

---

## Enlaces del proyecto

| Recurso | Link |
|---|---|
| Frontend GitHub | https://github.com/Junjey123-mx/resident-evil-tracker-client |
| Backend GitHub | https://github.com/Junjey123-mx/resident-evil-tracker-api |
| Frontend publicado | PENDIENTE_AGREGAR_LINK_NETLIFY |
| Backend publicado | PENDIENTE_AGREGAR_LINK_RENDER_O_RAILWAY |

---

## Screenshot de la aplicación

> Agregar capturas de pantalla en `assets/screenshots/` y referenciarlas aquí antes de la entrega.

| Dashboard | Archivo de juegos |
|---|---|
| *(pendiente — agregar screenshot)* | *(pendiente — agregar screenshot)* |

| Detalle de juego | Formulario de creación |
|---|---|
| *(pendiente — agregar screenshot)* | *(pendiente — agregar screenshot)* |

---

## Stack usado

| Tecnología | Rol |
|---|---|
| HTML5 | Estructura de cada pantalla |
| CSS3 modular | Sistema visual por capas |
| JavaScript vanilla con ES Modules | Lógica del cliente |
| Fetch API nativa | Comunicación con el backend |
| DOM API | Renderizado y eventos |
| Netlify | Hosting estático recomendado |
| FastAPI (backend externo) | API REST que consume el frontend |
| PostgreSQL (en backend) | Persistencia de datos |
| Cloudinary (manejado desde backend) | Almacenamiento de portadas |

**Sin dependencias externas:**

- No usa React
- No usa Vue
- No usa Angular
- No usa Tailwind
- No usa Bootstrap
- No usa Axios
- No usa jQuery
- No requiere npm
- No requiere build step
- No requiere Docker para el frontend

---

## Estructura del proyecto

```
resident-evil-tracker-client/
├── index.html              ← Dashboard principal
├── games.html              ← Listado del archivo
├── game-detail.html        ← Detalle de un juego
├── create-game.html        ← Formulario de creación
├── edit-game.html          ← Formulario de edición
├── css/
│   ├── tokens.css          ← Variables visuales (colores, tipografía, spacing)
│   ├── base.css            ← Reset, body, tipografía base
│   ├── layout.css          ← Estructura global, sidebar, main content
│   ├── components.css      ← Botones, cards, panels, badges, notificaciones
│   ├── forms.css           ← Formularios, selects, textareas, cover upload
│   └── pages.css           ← Estilos específicos de cada pantalla
├── js/
│   ├── core/
│   │   ├── api-client.js   ← fetch() con timeout, manejo de errores y ApiError
│   │   ├── config.js       ← API_BASE_URL, rutas, constantes globales
│   │   ├── dom.js          ← Helpers para manipulación del DOM
│   │   ├── formatters.js   ← Formateo de fechas, scores, años, texto
│   │   ├── notifications.js← Sistema de notificaciones toast
│   │   └── query-params.js ← Lectura y escritura de parámetros URL
│   ├── services/
│   │   ├── archive-entry.service.js ← CRUD de juegos (/series)
│   │   ├── rating.service.js        ← Ratings (/series/{id}/rating)
│   │   ├── cover.service.js         ← Upload de portadas (/series/{id}/cover)
│   │   ├── activity.service.js      ← Activity logs
│   │   └── dashboard.service.js     ← Estadísticas (/dashboard/stats)
│   ├── components/
│   │   ├── archive-card.component.js     ← Card de juego individual
│   │   ├── archive-form.component.js     ← Campos reutilizables del formulario
│   │   ├── archive-grid.component.js     ← Grid de cards
│   │   ├── activity-list.component.js    ← Lista de actividad
│   │   ├── cover-upload.component.js     ← Zona de subida de portada
│   │   ├── empty-state.component.js      ← Estados vacío, loading, error
│   │   ├── pagination.component.js       ← Controles de paginación
│   │   ├── rating-badge.component.js     ← Badges de rating, categoría, estado, amenaza
│   │   ├── sidebar.component.js          ← Navegación lateral
│   │   ├── stat-card.component.js        ← Cards de estadísticas
│   │   ├── status-strip.component.js     ← Barra superior de estado
│   │   └── validation-panel.component.js ← Panel de errores de validación
│   └── pages/
│       ├── dashboard.page.js    ← Controlador de index.html
│       ├── games.page.js        ← Controlador de games.html
│       ├── game-detail.page.js  ← Controlador de game-detail.html
│       ├── create-game.page.js  ← Controlador de create-game.html
│       └── edit-game.page.js    ← Controlador de edit-game.html
└── assets/
    ├── images/
    ├── placeholders/
    └── screenshots/
```

---

## Arquitectura frontend

El frontend sigue una separación estricta de responsabilidades:

| Capa | Responsabilidad |
|---|---|
| **HTML** | Define la estructura base de cada pantalla y los `id` raíz donde se monta el contenido |
| **CSS** | Define el sistema visual completo (tokens → base → layout → components → forms → pages) |
| **js/core** | Utilidades generales: fetch, config, formateo, URL params, DOM helpers, notificaciones |
| **js/services** | Conocen los endpoints del backend y llaman a `api-client.js` con los parámetros correctos |
| **js/components** | Funciones puras que reciben datos y devuelven strings HTML reutilizables |
| **js/pages** | Controlan el ciclo completo de cada pantalla: inicializar, llamar services, renderizar components, registrar eventos |

**Regla principal del frontend:** `api-client` hace fetch, `services` llaman endpoints, `components` generan HTML y `pages` controlan eventos.

Cada pantalla (`*.html`) carga un único script `type="module"` que importa todo lo que necesita. No hay estado global entre páginas: cada pantalla inicia desde cero al cargar.

---

## Páginas disponibles

| Página | URL | Descripción |
|---|---|---|
| Dashboard | `/index.html` | Estadísticas generales, registros recientes, top rated, actividad |
| Archivo | `/games.html` | Listado paginado con búsqueda, sort y filtros |
| Detalle | `/game-detail.html?id={id}` | Datos completos, rating personal y actividad de un juego |
| Crear | `/create-game.html` | Formulario completo de registro nuevo con upload de portada |
| Editar | `/edit-game.html?id={id}` | Edición de un registro existente con detección de cambios |

---

## Cómo correr localmente

**Requisitos:**

- Python 3 instalado (solo para servir archivos estáticos)
- Backend corriendo en `http://localhost:8000` (ver instrucciones en el [repositorio del backend](https://github.com/Junjey123-mx/resident-evil-tracker-api))

**Pasos:**

```bash
# 1. Clonar el repositorio
git clone https://github.com/Junjey123-mx/resident-evil-tracker-client.git
cd resident-evil-tracker-client

# 2. Levantar el servidor local
python3 -m http.server 5500
```

**Abrir en el navegador:**

```
http://localhost:5500
```

No hay `npm install`, no hay `build`, no hay configuración adicional. El frontend es un conjunto de archivos estáticos que el navegador ejecuta directamente.

---

## Variables de configuración

La única configuración relevante del frontend es la URL del backend, definida en `js/core/config.js`:

```js
export const API_BASE_URL =
  (typeof window !== 'undefined' && window.__RESIDENT_EVIL_API_BASE_URL__)
    ? window.__RESIDENT_EVIL_API_BASE_URL__
    : 'http://localhost:8000';
```

En producción se puede sobreescribir inyectando `window.__RESIDENT_EVIL_API_BASE_URL__` en el HTML antes de cargar los scripts, sin necesidad de recompilar nada.

---

## CORS

El frontend hace peticiones `fetch()` al backend desde un origen diferente (distinto puerto o dominio). Esto activa la política CORS del navegador.

**¿Qué es CORS?**
CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad del navegador que bloquea las respuestas HTTP provenientes de un origen distinto al de la página actual, a menos que el servidor incluya las cabeceras HTTP correspondientes que lo autoricen explícitamente.

**¿Por qué aplica aquí?**
El frontend corre en `http://localhost:5500` y el backend en `http://localhost:8000`. Son orígenes distintos (diferente puerto). Sin las cabeceras CORS correctas en el backend, el navegador bloquea todas las respuestas de la API aunque el servidor las procese y las envíe.

**¿Cómo está resuelto?**
El backend FastAPI tiene configurado `CORSMiddleware` que incluye `http://localhost:5500` en la lista de orígenes permitidos (`BACKEND_CORS_ORIGINS`). En producción, el dominio del frontend publicado debe añadirse a esa variable de entorno en el backend.

**¿El frontend hace algo especial?**
No. El frontend usa `fetch()` estándar. El navegador y el backend negocian CORS automáticamente mediante la cabecera `Access-Control-Allow-Origin`. Si el backend no está configurado, el navegador muestra un error `CORS policy` en consola y las peticiones fallan.

---

## Separación cliente / servidor

Este proyecto implementa una arquitectura completamente desacoplada:

- El **frontend** es un sitio estático puro. No tiene acceso directo a la base de datos, no corre Python ni contiene lógica de negocio.
- El **backend** es una API REST independiente. No genera HTML ni tiene referencias al cliente.
- La comunicación ocurre **únicamente vía HTTP con respuestas JSON**: el frontend hace `fetch()` a los endpoints del backend y renderiza los datos recibidos en el DOM.
- Se pueden desplegar en servicios completamente distintos (Netlify para el frontend, Render para el backend) sin acoplamiento entre ellos.

---

## Challenges implementados

- Frontend completamente desacoplado del backend: cliente estático puro en HTML/CSS/JS vanilla sin frameworks
- ES Modules nativos: imports/exports sin bundler ni transpilador
- Fetch con manejo de errores robusto: timeout con `AbortController`, `ApiError` tipado, estados de carga/error/vacío en todas las pantallas
- Dashboard conectado: estadísticas, registros recientes, top rated, timeline y actividad en tiempo real
- Listado con búsqueda, ordenamiento y paginación: parámetros sincronizados en la URL (`?q=&sort=&order=&page=&limit=`)
- Detalle completo de juego: carga concurrente de datos, rating y actividad con `Promise.allSettled`
- Crear registro: validación client-side, POST al backend y redirección al detalle
- Editar registro: precarga de datos desde la API, detección de cambios pendientes, PUT al backend
- Upload de portada: envío de imagen vía `FormData` a través del backend hacia Cloudinary
- Rating interactivo: crear, actualizar y eliminar rating personal con re-render parcial del panel sin recargar la página
- Eliminar registro: confirmación visual, DELETE al backend y actualización del listado
- Estados resilientes: loading, error, vacío y API caída con mensajes visuales claros en toda la app
- Notificaciones toast: éxito, error, warning e info implementados desde cero sin librerías
- CORS resuelto: backend configurado para aceptar el origen del frontend en local y producción
- Responsive básico: layout adaptado para pantallas de distinto tamaño

---

## Reflexión sobre la tecnología y los challenges

Construir un frontend completamente en JavaScript vanilla con ES Modules fue un ejercicio directo para entender qué resuelven los frameworks por defecto: el ciclo de renderizado, la gestión del estado local, el enrutamiento y el manejo de efectos secundarios. Sin esas abstracciones, cada decisión arquitectónica es explícita y visible.

El mayor reto fue mantener consistencia entre capas sin componentes reactivos: cualquier cambio de datos requiere un re-render manual y explícito. La separación en `core`, `services`, `components` y `pages` resultó ser la estructura correcta para mantener el código predecible y cada archivo con una responsabilidad única.

`fetch()` con `AbortController` para timeouts y un `ApiError` con status HTTP fue suficiente para manejar todos los casos de error de forma uniforme en toda la app. La ausencia de dependencias externas simplificó enormemente el deploy: el frontend es un conjunto de archivos que cualquier servidor estático puede servir sin configuración especial.

La integración con el backend fue fluida una vez definidos los contratos de los endpoints. El punto más delicado fue garantizar que los valores enviados en formularios coincidieran exactamente con los literales que el backend valida, lo que reforzó la importancia de revisar los contratos de API antes de construir el cliente.

---

## Deploy en Netlify

1. Conectar el repositorio de GitHub en Netlify.
2. No configurar build command (el proyecto no tiene build step).
3. Publicar directamente desde la raíz del repositorio.
4. Para apuntar al backend publicado: inyectar `window.__RESIDENT_EVIL_API_BASE_URL__ = 'URL_DEL_BACKEND'` en el HTML antes de cargar los scripts, o configurarlo en Netlify como variable de entorno si se usa un `_redirects` o función edge.
5. Agregar el dominio de Netlify a la variable `BACKEND_CORS_ORIGINS` en el backend.

**URL frontend publicado:** `PENDIENTE_AGREGAR_LINK_NETLIFY`

---

## Endpoints consumidos desde este frontend

El backend completo está documentado en su [propio repositorio](https://github.com/Junjey123-mx/resident-evil-tracker-api). Los endpoints que consume este frontend son:

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/health` | Health check de la API |
| GET | `/dashboard/stats` | Estadísticas del dashboard |
| GET | `/series` | Listado paginado de juegos |
| GET | `/series/{id}` | Detalle de un juego |
| POST | `/series` | Crear registro |
| PUT | `/series/{id}` | Actualizar registro |
| DELETE | `/series/{id}` | Eliminar registro |
| GET | `/series/{id}/rating` | Obtener rating de un juego |
| POST | `/series/{id}/rating` | Crear rating |
| PUT | `/series/{id}/rating` | Actualizar rating |
| DELETE | `/series/{id}/rating` | Eliminar rating |
| POST | `/series/{id}/cover` | Subir portada |
| GET | `/series/{id}/activity` | Actividad de un juego |
| GET | `/activity` | Actividad global reciente |
