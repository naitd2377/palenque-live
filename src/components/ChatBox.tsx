'use client'

import { useEffect, useRef, useState } from 'react'
import Pusher from 'pusher-js'
import { Send, MessageCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

type ChatMessage = {
  id: string
  text: string
  createdAt: string
  user: { id: string; name: string }
  isMine: boolean
}

type Props = {
  eventId: string
}

export function ChatBox({ eventId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Cargar mensajes iniciales
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/chat/${eventId}`, { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled) setMessages(data.messages || [])
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [eventId])

  // Conectar a Pusher para mensajes en tiempo real
  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1'

    if (!pusherKey) return

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    })
    const channel = pusher.subscribe(`chat-event-${eventId}`)
    channel.bind('new-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg])
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
    }
  }, [eventId])

  // Auto-scroll al final cuando llegan mensajes nuevos
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    setSending(true)
    try {
      const res = await fetch(`/api/chat/${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al enviar mensaje')
        return
      }
      // El mensaje llega por Pusher, pero por si acaso lo agregamos localmente
      // (Pusher hace deduplicación por id en el cliente normalmente)
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev
        return [...prev, data.message]
      })
      setText('')
    } catch {
      toast.error('Error de red')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/60 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <MessageCircle className="h-4 w-4 text-red-700" />
        <span className="font-semibold">Chat en vivo</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {messages.length} mensajes
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ maxHeight: '400px', minHeight: '300px' }}
      >
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Cargando mensajes…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Sé el primero en escribir. ¡Anima a tu favorito!
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}
            >
              <span className="text-xs text-muted-foreground">
                {m.user.name} · {new Date(m.createdAt).toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <div
                className={`mt-0.5 max-w-[85%] rounded-lg px-3 py-1.5 text-sm ${
                  m.isMine
                    ? 'bg-red-700 text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={send} className="flex gap-2 border-t border-border/60 p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          maxLength={500}
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
