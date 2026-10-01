# 🐓 PalenqueLive — Plataforma privada de streaming

Plataforma web privada para transmitir eventos en vivo desde tu celular, con cobro por acceso (pay-per-view) y control total de tus clientes.

## ✨ Características

- 🔴 **Streaming en vivo** desde tu celular (Larix Broadcaster + Mux/RTMP)
- 💳 **Cobro por evento** — tus clientes pagan y obtienen acceso
- 👤 **Acceso privado** — solo tus clientes registrados ven el stream
- 📅 **Calendario de eventos** — programa peleas con fecha, hora y precio
- 👨‍💼 **Panel de admin** — gestiona eventos, usuarios y ventas
- 📱 **Responsive** — funciona en celular, tablet y laptop
- 🎨 **Reproductor HLS** — compatible con todos los navegadores

## 🚀 Despliegue en Vercel

### Requisitos previos
1. Cuenta en [GitHub](https://github.com)
2. Cuenta en [Vercel](https://vercel.com)
3. Live Stream creado en [Mux](https://www.mux.com) (RTMP URL, Stream Key, Playback URL)

### Pasos

1. **Subir el código a GitHub**
   - Crea un repositorio nuevo en GitHub (ej: `palenque-live`)
   - Sube todos los archivos de este proyecto

2. **Conectar con Vercel**
   - Entra a [vercel.com/new](https://vercel.com/new)
   - Importa tu repositorio de GitHub
   - Vercel detecta Next.js automáticamente

3. **Configurar base de datos PostgreSQL**
   - En el proyecto de Vercel: pestaña "Storage" → "Create Database" → "Postgres"
   - Vercel te da la `DATABASE_URL` automáticamente

4. **Configurar variables de entorno**
   En Vercel → Settings → Environment Variables, agrega:
   ```
   DATABASE_URL=tu_url_de_vercel_postgres
   ADMIN_EMAIL=admin@tupalenque.com
   ADMIN_PASSWORD=una_contraseña_segura
   ADMIN_NAME=Tu Nombre
   DEMO_CLIENT=false   # opcional: quita el cliente demo
   ```

5. **Deploy**
   - Vercel hace deploy automático
   - Tu URL final: `https://palenque-live.vercel.app`

6. **Crear las tablas y datos iniciales**
   - En Vercel → pestaña "Storage" → tu base de datos → "Query"
   - O conecta con Prisma desde tu máquina local

## 📱 Configurar tu celular como cámara (Larix Broadcaster)

1. Descarga **Larix Broadcaster** (Google Play / App Store)
2. Abre la app → Settings → Connections → Add new
3. Configura:
   - **Type**: RTMP
   - **URL**: tu RTMP URL de Mux (ej: `rtmp://global-live.mux.com:5222/app`)
   - **Stream name/key**: tu Stream Key de Mux
4. Apunta la cámara y presiona el botón rojo de "Start"

## 🔧 Stack técnico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Base de datos**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **Streaming**: hls.js (frontend) + Mux (backend RTMP/HLS)
- **Auth**: cookies httpOnly + scrypt

## 📂 Estructura

```
src/
├── app/
│   ├── api/            # Rutas API (auth, events, purchases, admin)
│   ├── page.tsx        # Página principal (SPA con vistas)
│   └── layout.tsx      # Layout raíz
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── AuthModal.tsx
│   ├── HomeView.tsx
│   ├── EventsView.tsx
│   ├── EventView.tsx        # Visor con reproductor HLS
│   ├── MyTicketsView.tsx
│   ├── AdminView.tsx        # Panel de administrador
│   ├── GuideView.tsx        # Guía de configuración
│   └── VideoPlayer.tsx      # Reproctor HLS
└── lib/
    ├── auth.ts         # Hash de contraseñas y sesiones
    ├── session.ts      # Helper de auth en requests
    ├── db.ts           # Cliente Prisma
    └── store.ts        # Store Zustand
```

## 🆘 Soporte

Para dudas sobre el despliegue o configuración, consulta la sección "Guía" dentro de la propia plataforma.
