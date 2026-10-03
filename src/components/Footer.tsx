'use client'

import { Radio } from 'lucide-react'
import { useApp } from '@/lib/store'

export function Footer() {
  const { setView } = useApp()
  return (
    <footer className="mt-auto border-t border-border/60 bg-stone-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 md:grid-cols-3">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-700 text-white">
              <Radio className="h-4 w-4" />
            </span>
            <span>Palenque<span className="text-red-600">Live</span></span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Transmisiones en vivo de tu palenque favorito. Acceso privado, calidad HD, sin restricciones.
          </p>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Plataforma</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              <button onClick={() => setView({ name: 'home' })} className="hover:text-foreground">Inicio</button>
            </li>
            <li>
              <button onClick={() => setView({ name: 'events' })} className="hover:text-foreground">Eventos</button>
            </li>
            <li>
              <button onClick={() => setView({ name: 'guide' })} className="hover:text-foreground">Cómo ver transmisiones</button>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-semibold">Soporte</h4>
          <p className="text-xs text-muted-foreground">
            ¿Tienes problemas para ver un evento? Escríbenos por WhatsApp
            y te ayudamos a configurar tu cuenta.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <strong>Pagos seguros</strong> procesados por Stripe.
            Aceptamos tarjetas de crédito y débito.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PalenqueLive — Todos los derechos reservados.
      </div>
    </footer>
  )
}
