'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Laptop, Radio, Server, BookOpen, ListChecks, AlertTriangle, ExternalLink } from 'lucide-react'

export function GuideView() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Badge className="mb-3 bg-amber-500 text-stone-900 hover:bg-amber-400">
          <BookOpen className="mr-1 h-3 w-3" /> Guía paso a paso
        </Badge>
        <h1 className="text-3xl font-bold">Cómo transmitir en vivo desde tu celular</h1>
        <p className="mt-2 text-muted-foreground">
          Esta guía te explica cómo usar tu celular como cámara y tu laptop para administrar
          el stream. Solo necesitas 3 cosas: tu celular, una red WiFi, y un servicio de
          streaming RTMP.
        </p>
      </div>

      {/* Overview */}
      <Card className="mb-6 border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-red-700" /> Resumen del flujo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="ml-5 list-decimal space-y-2 text-sm leading-relaxed">
            <li>
              <strong>En tu laptop (admin):</strong> creas el evento en el panel de admin.
              El sistema genera un <em>Stream key</em> único para ese evento.
            </li>
            <li>
              <strong>En tu celular:</strong> instalas la app <strong>Larix Broadcaster</strong> (gratis, Android/iOS)
              y configuras el servidor RTMP y el stream key del evento.
            </li>
            <li>
              <strong>Apuntas la cámara del celular al palenque</strong> y presionas "Start" en Larix.
              El video se envía al servidor RTMP.
            </li>
            <li>
              <strong>El servidor RTMP convierte la señal</strong> a formato HLS (.m3u8) que tus
              clientes pueden ver en el navegador.
            </li>
            <li>
              <strong>Copias la URL HLS</strong> en el panel de admin del evento. Listo, tus clientes
              ya pueden ver el stream.
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Step 1: Cellphone */}
      <SectionCard
        step={1}
        icon={<Smartphone className="h-6 w-6" />}
        title="Configura tu celular como cámara"
        color="#b91c1c"
      >
        <p className="mb-3">
          Descarga la aplicación <strong>Larix Broadcaster</strong> — es gratis y funciona en Android y iOS:
        </p>
        <ul className="mb-4 space-y-1 text-sm">
          <li>
            <strong>Android:</strong>{' '}
            <a
              href="https://play.google.com/store/apps/details?id=com.wmspanel.larix_broadcaster"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-red-700 underline"
            >
              Buscar en Google Play <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>
            <strong>iPhone/iPad:</strong>{' '}
            <a
              href="https://apps.apple.com/us/app/larix-broadcaster/id1044878094"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-red-700 underline"
            >
              Buscar en App Store <ExternalLink className="h-3 w-3" />
            </a>
          </li>
        </ul>
        <p className="mb-2 text-sm">
          Una vez instalada, abre la app y ve a <strong>Settings → Connections → Add new</strong>.
          Configura una conexión SRT o RTMP con:
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li><strong>URL:</strong> la dirección RTMP de tu servidor (ej. <code className="rounded bg-muted px-1">rtmp://tu-servidor.com/live</code>)</li>
          <li><strong>Stream name/key:</strong> el stream key generado en el panel de admin del evento</li>
        </ul>
      </SectionCard>

      {/* Step 2: RTMP server */}
      <SectionCard
        step={2}
        icon={<Server className="h-6 w-6" />}
        title="Consigue un servidor RTMP"
        color="#92400e"
      >
        <p className="mb-3">
          El servidor RTMP es el que recibe el video de tu celular y lo convierte a un formato
          que los navegadores pueden reproducir (HLS). Tienes 3 opciones:
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/60 p-3">
            <Badge className="mb-2 bg-green-700 text-white hover:bg-green-800">Recomendado</Badge>
            <p className="text-sm font-semibold">Mux.com</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Servicio gestionado. Te dan la URL RTMP + URL HLS directamente. ~$0.50 USD por hora de stream.
              Es la opción más fácil y profesional.
            </p>
            <a
              href="https://www.mux.com/live-streaming"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs text-red-700 underline"
            >
              mux.com <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <Badge variant="secondary" className="mb-2">Económico</Badge>
            <p className="text-sm font-semibold">YouTube (no listado)</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Crea una transmisión "No listada" en YouTube Studio. Copia la URL RTMP y la URL HLS.
              Gratis, pero no puedes cobrar directamente.
            </p>
          </div>
          <div className="rounded-lg border border-border/60 p-3">
            <Badge variant="secondary" className="mb-2">DIY</Badge>
            <p className="text-sm font-semibold">Tu propio nginx-rtmp</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Instalas nginx + módulo RTMP en una VPS (DigitalOcean ~$6/mes). Total control pero
              requiere conocimiento técnico.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Step 3: Laptop */}
      <SectionCard
        step={3}
        icon={<Laptop className="h-6 w-6" />}
        title="Administra el evento desde tu laptop"
        color="#7c2d12"
      >
        <p className="text-sm">
          En la laptop solo usas el navegador. Entra al <strong>Panel de admin</strong> de esta
          plataforma y:
        </p>
        <ol className="ml-5 mt-2 list-decimal space-y-1 text-sm">
          <li>Crea el evento (título, fecha, precio, descripción).</li>
          <li>Copia el <strong>servidor RTMP</strong> y el <strong>stream key</strong> generado.</li>
          <li>Pega esas credenciales en la app Larix de tu celular.</li>
          <li>Cuando el servidor te dé la URL HLS (.m3u8), pégala en el campo "URL HLS" del evento.</li>
          <li>Cambia el estado del evento a <strong>LIVE</strong>.</li>
          <li>Tus clientes que compraron acceso ya pueden verlo.</li>
        </ol>
      </SectionCard>

      {/* Step 4: Live */}
      <SectionCard
        step={4}
        icon={<Radio className="h-6 w-6" />}
        title="¡Estás en vivo!"
        color="#991b1b"
      >
        <p className="text-sm">
          Cuando termines el evento, vuelve al panel y cambia el estado a <strong>ENDED</strong>.
          Los clientes ya no podrán ver el stream. Puedes repetir este flujo para cada evento futuro.
        </p>
      </SectionCard>

      {/* Warning */}
      <Card className="border-amber-300 bg-amber-50">
        <CardContent className="p-4">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle className="h-5 w-5" /> Avisos importantes
          </h3>
          <ul className="ml-5 list-disc space-y-1 text-sm text-amber-900/90">
            <li>
              <strong>WiFi estable:</strong> el celular y la laptop deben tener una buena conexión
              a internet (mínimo 5 Mbps de subida). Si tu palenque no tiene WiFi, usa un plan de
              datos móviles 4G/5G con buen cobertura.
            </li>
            <li>
              <strong>Batería:</strong> la transmisión consume bastante batería. Conecta el celular
              al cargador mientras transmites.
            </li>
            <li>
              <strong>Audio:</strong> Larix permite elegir el micrófono. Si tu celular está lejos
              del sonido, considera conectar un micrófono externo por Bluetooth o jack.
            </li>
            <li>
              <strong>Soporte de varias cámaras:</strong> puedes usar varios celulares, cada uno
              con su propio stream key, si quieres múltiples ángulos (requiere una cuenta de
              streaming que soporte multi-bitrate).
            </li>
            <li>
              <strong>Cobro real:</strong> esta plataforma simula el pago. Para cobrar de verdad
              con tarjeta, integra MercadoPago o Stripe (la lógica está en <code className="rounded bg-amber-100 px-1">/api/events/[id]/purchase</code>).
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function SectionCard({
  step,
  icon,
  title,
  color,
  children,
}: {
  step: number
  icon: React.ReactNode
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <Card className="mb-6 border-border/60">
      <CardHeader>
        <div className="flex items-start gap-3">
          <span
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white"
            style={{ background: color }}
          >
            {icon}
          </span>
          <div>
            <p className="text-xs font-mono text-muted-foreground">PASO {step}</p>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
