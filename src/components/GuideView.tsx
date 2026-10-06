'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserPlus, CreditCard, Eye, BookOpen, Calendar, Clock, Play, Smartphone, Monitor } from 'lucide-react'

export function GuideView() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Badge className="mb-3 bg-amber-500 text-stone-900 hover:bg-amber-400">
          <BookOpen className="mr-1 h-3 w-3" /> Guía para clientes
        </Badge>
        <h1 className="text-3xl font-bold">Cómo disfrutar las transmisiones</h1>
        <p className="mt-2 text-muted-foreground">
          Sigue estos 3 pasos para ver tus primeros eventos en vivo.
          Si tienes dudas, contáctanos por WhatsApp.
        </p>
      </div>

      {/* PASO 1 */}
      <SectionCard
        step={1}
        icon={<UserPlus className="h-6 w-6" />}
        title="Crea tu cuenta gratis"
        color="#b91c1c"
      >
        <p className="mb-3 text-sm">
          Para empezar, necesitas registrarte en la plataforma. Es gratis y solo te toma 1 minuto.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>Haz clic en <strong>"Crear cuenta gratis"</strong> arriba a la derecha.</li>
          <li>Escribe tu nombre, correo electrónico y una contraseña.</li>
          <li>¡Listo! Ya puedes ver los eventos disponibles.</li>
        </ul>
      </SectionCard>

      {/* PASO 2 */}
      <SectionCard
        step={2}
        icon={<CreditCard className="h-6 w-6" />}
        title="Compra tu acceso al evento"
        color="#92400e"
      >
        <p className="mb-3 text-sm">
          Cada evento tiene un costo individual. Solo pagas por lo que quieres ver.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>Ve a la sección <strong>"Eventos"</strong> o revisa los destacados en la página principal.</li>
          <li>Elige el evento que quieres ver y haz clic en <strong>"Comprar acceso"</strong>.</li>
          <li>Serás redirigido a la página de pago segura de <strong>Stripe</strong>.</li>
          <li>Puedes pagar con tarjeta de crédito o débito.</li>
          <li>Una vez aprobado el pago, tendrás acceso inmediato al stream.</li>
        </ul>
      </SectionCard>

      {/* PASO 3 */}
      <SectionCard
        step={3}
        icon={<Eye className="h-6 w-6" />}
        title="Disfruta el evento en vivo"
        color="#7c2d12"
      >
        <p className="mb-3 text-sm">
          El día y hora del evento, entra a disfrutar.
        </p>
        <ul className="ml-5 list-disc space-y-1 text-sm">
          <li>Entra a <strong>"Mis tickets"</strong> en el menú principal.</li>
          <li>Verás la lista de eventos que has comprado.</li>
          <li>Cuando el evento esté por empezar, haz clic en <strong>"Ver"</strong>.</li>
          <li>La transmisión comenzará automáticamente.</li>
          <li>Si el evento tiene varias cámaras, verás botones para cambiar entre ellas.</li>
        </ul>
      </SectionCard>

      {/* TIPS */}
      <Card className="mt-8 border-amber-300 bg-amber-50">
        <CardContent className="p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-amber-900">
            <Smartphone className="h-5 w-5" /> Consejos para una mejor experiencia
          </h3>
          <ul className="ml-5 list-disc space-y-1 text-sm text-amber-900/90">
            <li><strong>Conexión estable:</strong> Para evitar cortes, usa WiFi en lugar de datos móviles.</li>
            <li><strong>Cierra otras apps:</strong> Cierra apps que consuman mucho internet (Netflix, YouTube, descargas).</li>
            <li><strong>Calidad automática:</strong> El video se ajusta a tu velocidad de internet. Si se ve borroso, espera unos segundos a que mejore.</li>
            <li><strong>Modo pantalla completa:</strong> Toca el ícono de pantalla completa en el reproductor para mejor visualización.</li>
            <li><strong>Chat en vivo:</strong> Participa en el chat durante el evento (si está disponible).</li>
          </ul>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Preguntas frecuentes</h2>
        
        <Card className="mb-3 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-700" />
              ¿Puedo ver un evento si ya terminó?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Solo si compraste el acceso antes de que empezara. Una vez terminado, puedes entrar a "Mis tickets" y verlo mientras el administrador mantenga la repetición disponible.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-3 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-700" />
              ¿Si compré y no pude verlo en vivo, pierdo mi dinero?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No. Tu acceso queda guardado en "Mis tickets". Si el evento se transmitió en vivo, puedes ver la repetición cuando quieras.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-3 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-5 w-5 text-red-700" />
              El video se ve cortado o con baja calidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Esto suele ser por la velocidad de tu internet. Intenta cambiar de WiFi a datos móviles (o viceversa), acércate a tu router, o cierra otras aplicaciones que estén usando internet.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-3 border-border/60">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-700" />
              ¿Es seguro pagar con tarjeta aquí?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sí, totalmente. Los pagos son procesados por <strong>Stripe</strong>, la plataforma de pagos más segura del mundo (la usan Amazon, Google, Uber). Nosotros no vemos ni guardamos los datos de tu tarjeta.
            </p>
          </CardContent>
        </Card>
      </div>
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
