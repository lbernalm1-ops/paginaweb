# Web Dra. Laura Bernal

Sitio web profesional de la Dra. Laura Bernal - Medicina de precisión, desarrollo tecnológico y formación en IA clínica.

## Estructura del proyecto

```
dralaurabernal-web/
├── index.html              # Página de inicio
├── sobre-mi.html           # Perfil profesional completo
├── clinica.html            # Información sobre la clínica
├── herramientas.html       # Herramientas de IA desarrolladas
├── contacto.html           # Página de contacto
├── css/
│   ├── style.css          # Estilos principales
│   └── pages.css          # Estilos de páginas internas
├── js/
│   └── main.js            # JavaScript principal
├── images/                # Imágenes del sitio
│   ├── logo.png          # Logo principal
│   └── laura-bernal.jpg  # Foto principal
└── tools/                # Herramientas clínicas
    └── anticoagulacion.html
```

## Cómo desplegar en Netlify

### Opción 1: Desde el navegador (la más fácil)

1. Ve a [https://app.netlify.com](https://app.netlify.com)
2. Regístrate o inicia sesión (puedes usar tu cuenta de GitHub, GitLab o email)
3. Arrastra toda la carpeta `dralaurabernal-web` a la zona de "Drop" en Netlify
4. Netlify desplegará el sitio automáticamente y te dará una URL tipo `random-name.netlify.app`
5. Para conectar tu dominio `dralaurabernal.es`:
   - Ve a "Site settings" → "Domain management"
   - Clic en "Add custom domain"
   - Introduce `dralaurabernal.es`
   - Netlify te dará instrucciones DNS para configurar en tu proveedor de dominio

### Opción 2: Desde GitHub (recomendada para actualizaciones futuras)

1. Sube este proyecto a un repositorio de GitHub
2. En Netlify, clic en "Add new site" → "Import an existing project"
3. Conecta con GitHub y selecciona el repositorio
4. Netlify detectará automáticamente que es un sitio HTML estático
5. Clic en "Deploy site"

Cada vez que hagas cambios y los subas a GitHub, Netlify actualizará el sitio automáticamente.

## Añadir imágenes

Antes de desplegar, añade tus imágenes en la carpeta `images/`:

- `logo.png` - Tu logo (el que subiste como Logo_Zoho_2400_x852_transparente.png)
- `laura-bernal.jpg` - Tu foto de bata blanca (linkedin_profile_mejorada.jpg)

## Personalización

### Cambiar contenido
Edita los archivos HTML directamente. El contenido está estructurado con clases semánticas fáciles de identificar.

### Añadir más herramientas
Sube nuevos archivos HTML a la carpeta `tools/` y añádelos como nuevas tarjetas en `herramientas.html` siguiendo el mismo formato.

### Modificar colores
Los colores principales están definidos en `css/style.css` en las variables CSS:

```css
:root {
    --color-dark: #0a1628;           /* Azul oscuro principal */
    --color-dark-light: #1a2d47;     /* Azul oscuro claro */
    --color-accent: #d4af37;         /* Dorado/acento */
    --color-white: #ffffff;
    --color-gray-light: #f8f9fa;
    --color-gray: #8b95a1;
}
```

## Soporte

Si tienes problemas con el despliegue, puedes contactar con soporte de Netlify o consultar su documentación: https://docs.netlify.com

## Licencia

© 2026 Dra. Laura Bernal. Todos los derechos reservados.
