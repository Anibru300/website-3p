# 3P S.A. DE C.V. - Sitio Web Oficial

Sitio web profesional para 3P S.A. DE C.V., empresa líder en distribución de equipos para la industria avícola, porcícola e invernaderos.

## 🚀 Tecnologías Utilizadas

- **React 19** - Framework de JavaScript
- **Vite** - Build tool rápido
- **Tailwind CSS** - Framework de CSS utility-first
- **Lucide React** - Iconos modernos
- **EmailJS** - Envío de formularios de contacto y reseñas
- **FastAPI** (backend local) - Portal operativo CJ_OS

## 📁 Estructura del Proyecto

```
3p-website/
├── api/                    # Backend FastAPI (portal operativo)
│   ├── app/               # Módulos de la API
│   ├── scripts/           # Utilidades (crear usuario admin)
│   ├── requirements.txt   # Dependencias Python
│   └── README.md          # Guía del backend
├── public/                 # Archivos estáticos
│   ├── images/            # Imágenes del sitio
│   ├── favicon-*.png      # Favicons
│   └── logo.png           # Logo principal
├── src/
│   ├── components/        # Componentes React
│   ├── pages/             # Páginas (Home, Login, Dashboard, marcas)
│   ├── context/           # Contextos (auth, tema, idioma)
│   ├── utils/             # Utilidades (cliente API)
│   ├── App.jsx            # Componente principal
│   ├── index.css          # Estilos globales
│   └── main.jsx           # Punto de entrada
├── index.html             # HTML principal
├── tailwind.config.js     # Configuración de Tailwind
└── package.json           # Dependencias
```

## 🌐 Sitio público

El sitio público incluye:

1. **Inicio (Hero)** - Presentación de la empresa con estadísticas
2. **Nosotros** - Historia desde 1997, misión, visión y valores
3. **Servicios** - Venta, importación, exportación, instalación, capacitación
4. **Marcas** - LUBING, FANCOM, MS Schippers, SBM, LB White, AMT, ALKE, TIGSA, Georgia Poultry
5. **Clientes** - Principales clientes nacionales e internacionales
6. **Contacto** - Formulario y datos de contacto
7. **Reseñas** - Formulario de reseñas con envío por EmailJS

## 🔐 Portal Operativo / Dashboard

El sitio cuenta con un área privada (`/login` → `/dashboard`) que muestra información operativa de 3P:

- Existencias por almacén
- Material en vales abiertos
- Pedidos vivos
- Facturas pendientes de cobranza
- Órdenes de compra San Antonio

La información se lee desde **PostgreSQL (`cj_assistant`)** y el Excel maestro de San Antonio en **solo lectura**. Nunca se tocan archivos originales de SAE ni Excel originales.

### Iniciar frontend

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

### Iniciar backend local

```bash
cd api
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
cp .env.example .env
# Edita .env con las credenciales reales de PostgreSQL

# Crear usuario admin
.venv/Scripts/python scripts/create_admin.py

# Iniciar servidor
.venv/Scripts/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en `http://localhost:8000`

### Despliegue a producción con backend real

Opción recomendada: **Cloudflare Tunnel** desde la computadora local de 3P.

1. Configura `api/.env` con las credenciales reales de PostgreSQL.
2. Crea el usuario admin:
   ```powershell
   cd api
   $env:AUTH_EMAIL="trespsadecv@hotmail.com"
   $env:AUTH_PASSWORD="Lumina38"
   .venv/Scripts/python scripts/create_admin.py
   ```
3. Configura el túnel (una sola vez):
   ```powershell
   cd api/tools
   .\setup-cloudflare-tunnel.ps1
   ```
4. Inicia backend + túnel:
   ```powershell
   cd api/tools
   .\start-production.ps1
   ```
5. Configura la variable `VITE_API_BASE_URL=https://api.3psadecv.com` en GitHub (**Settings > Secrets and variables > Actions > Variables**).
6. Haz push a `master` para recompilar el frontend con la URL del backend.

Ver detalles completos en `api/README.md`.

### Compilar para producción

```bash
# Crear build de producción
npm run build

# Los archivos estarán en la carpeta /dist
```

## 📞 Información de Contacto

- **Teléfonos:** (477) 774-83-23 y (477) 774-83-26
- **Email:** trespsadecv@hotmail.com
- **Dirección:** Industrial del Norte 201, Fracc. Industrial Del Norte, CP. 37200, León, Guanajuato

## 📝 Notas

- El sitio es completamente responsive (se adapta a móviles, tablets y desktop)
- Incluye animaciones suaves para mejor experiencia de usuario
- Formulario de contacto con validación y anti-spam (honeypot)
- SEO optimizado con meta tags apropiados
- Colores corporativos: Rojo (#C41E3A) y Azul (#1E3A8A)

---
© 2026 3P S.A. DE C.V. - Todos los derechos reservados
