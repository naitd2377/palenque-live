/**
 * Seed script — runs automatically on first deploy via `postinstall` or manually.
 *
 * Creates:
 *   - Default admin user  (from env ADMIN_EMAIL / ADMIN_PASSWORD, defaults provided)
 *   - Default demo client  (cliente@demo.com / demo12345)
 *   - 5 sample events (1 LIVE, 3 UPCOMING, 1 ENDED) with a sample HLS stream
 */
import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'

async function main() {
  // ---- Admin (from env or defaults) ----
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@palenque.live'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345'
  let admin = await db.user.findUnique({ where: { email: adminEmail } })
  if (!admin) {
    admin = await db.user.create({
      data: {
        email: adminEmail,
        name: process.env.ADMIN_NAME || 'Administrador',
        phone: '+52 000 000 0000',
        password: hashPassword(adminPassword),
        role: 'ADMIN',
      },
    })
    console.log('✓ Admin creado:', admin.email)
  } else {
    console.log('• Admin ya existe:', admin.email)
  }

  // ---- Demo client (skip in production if DEMO_CLIENT=false) ----
  if (process.env.DEMO_CLIENT !== 'false') {
    const clientEmail = 'cliente@demo.com'
    let client = await db.user.findUnique({ where: { email: clientEmail } })
    if (!client) {
      client = await db.user.create({
        data: {
          email: clientEmail,
          name: 'Cliente Demo',
          phone: '+52 555 555 5555',
          password: hashPassword('demo12345'),
          role: 'CLIENT',
        },
      })
      console.log('✓ Cliente demo creado:', client.email)
    } else {
      console.log('• Cliente demo ya existe:', client.email)
    }

    // Sample events + demo purchase (only on first run)
    const existingEvents = await db.event.count()
    if (existingEvents === 0) {
      const sampleHls = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
      const now = new Date()
      const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000)

      const events = await db.event.createMany({
        data: [
          {
            title: 'Gran Peleas de Gallos — Sabado Estelar',
            description:
              'Evento principal del fin de semana. 12 peleas programadas con los mejores ejemplares de la region. Transmision en HD desde el palenque principal.',
            eventDate: inDays(1),
            price: 150,
            streamUrl: sampleHls,
            rtmpUrl: 'rtmp://global-live.mux.com:5222/app',
            streamKey: 'demo-key-sabado-' + Math.random().toString(36).slice(2, 8),
            coverColor: '#b91c1c',
            status: 'UPCOMING',
          },
          {
            title: 'Tarde Dominicana — 8 Peliculas',
            description:
              'Programacion dominical con 8 enfrentamientos. Ideal para disfrutar en familia desde casa. Acceso individual por evento.',
            eventDate: inDays(3),
            price: 100,
            streamUrl: sampleHls,
            rtmpUrl: 'rtmp://global-live.mux.com:5222/app',
            streamKey: 'demo-key-domingo-' + Math.random().toString(36).slice(2, 8),
            coverColor: '#92400e',
            status: 'UPCOMING',
          },
          {
            title: 'Evento Especial — Aniversario del Palenque',
            description:
              'Celebracion del aniversario con peleas exhibicion y sorteos entre los suscriptores. No te lo pierdas.',
            eventDate: inDays(10),
            price: 250,
            streamUrl: '',
            rtmpUrl: 'rtmp://global-live.mux.com:5222/app',
            streamKey: 'demo-key-aniv-' + Math.random().toString(36).slice(2, 8),
            coverColor: '#7c2d12',
            status: 'UPCOMING',
          },
          {
            title: 'Viernes Nocturno — Transmision en Vivo',
            description:
              'Transmitiendo AHORA. Evento en vivo con 6 peleas programadas. Unete y disfruta en tiempo real.',
            eventDate: now,
            price: 120,
            streamUrl: sampleHls,
            rtmpUrl: 'rtmp://global-live.mux.com:5222/app',
            streamKey: 'demo-key-viernes-' + Math.random().toString(36).slice(2, 8),
            coverColor: '#991b1b',
            status: 'LIVE',
          },
          {
            title: 'Evento Pasado — Miercoles Clasico',
            description: 'Evento ya finalizado. Disponible proximamente como repeticion.',
            eventDate: inDays(-3),
            price: 80,
            streamUrl: '',
            rtmpUrl: 'rtmp://global-live.mux.com:5222/app',
            streamKey: 'demo-key-miercoles-' + Math.random().toString(36).slice(2, 8),
            coverColor: '#525252',
            status: 'ENDED',
          },
        ],
      })
      console.log(`✓ ${events.count} eventos de ejemplo creados`)

      // Mark one purchase by the demo client on the LIVE event
      const liveEvent = await db.event.findFirst({ where: { status: 'LIVE' } })
      if (liveEvent && client) {
        await db.purchase.create({
          data: {
            userId: client.id,
            eventId: liveEvent.id,
            amount: liveEvent.price,
            currency: 'MXN',
            status: 'PAID',
          },
        })
        console.log('✓ Compra de ejemplo creada para el cliente demo (evento LIVE)')
      }
    } else {
      console.log(`• Ya hay ${existingEvents} eventos en la BD, no se crearon nuevos`)
    }
  }

  console.log('\n--- Credenciales ---')
  console.log(`Admin   : ${adminEmail} / ${adminPassword}`)
  if (process.env.DEMO_CLIENT !== 'false') {
    console.log('Cliente : cliente@demo.com / demo12345')
  }
}

main()
  .catch((e) => {
    console.error(e)
    // Don't exit with error code on Vercel — just log it
    console.error('Seed failed but deployment will continue')
  })
  .finally(async () => {
    await db.$disconnect()
  })
