# Publicación como HTML estático

El proyecto está configurado en modo **SPA estático** (TanStack Start `spa.enabled = true`).
Al compilar se genera un único `index.html` con los bundles de JS/CSS, listo para subir
a cualquier hosting estático (Netlify, Vercel static, GitHub Pages, Apache, Nginx, S3+CloudFront, etc.).

## Compilar

```bash
bun install
bun run build
```

La carpeta de salida contiene `index.html` + assets. Subir todo el contenido al hosting.

## Reglas de redirección (importante)

Como las rutas (`/proyectos`, `/verificar`, `/proyectos/:id/...`) se resuelven en el
navegador, el servidor debe devolver `index.html` para cualquier ruta que no sea un asset.

- **Netlify / Cloudflare Pages**: ya incluido en `public/_redirects` (`/*  /index.html  200`).
- **Vercel (static)**: crear `vercel.json`:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **Apache (.htaccess)**:
  ```apache
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
  ```
- **Nginx**:
  ```nginx
  location / { try_files $uri $uri/ /index.html; }
  ```