# Resident Evil Franchise Tracker — Frontend

Frontend vanilla del proyecto **Resident Evil Franchise Tracker**.

Construido con HTML, CSS y JavaScript nativos. Sin frameworks, sin bundlers, sin dependencias de Node.

---

## Correr en local

```bash
python3 -m http.server 5500
```

URL local: [http://localhost:5500](http://localhost:5500)

---

## CORS

El frontend hace peticiones `fetch()` al backend desde un puerto distinto. El backend debe tener configurado `Access-Control-Allow-Origin` para permitir el origen `http://localhost:5500`, de lo contrario el navegador bloqueará las respuestas.

---

## Notas

- Este repositorio no necesita Docker. Es un sitio estático servido por cualquier servidor HTTP simple.
- No tiene package.json, npm ni proceso de build.

---

## Deploy

Recomendado: **Netlify**, publicando directamente la raíz de este repositorio.
