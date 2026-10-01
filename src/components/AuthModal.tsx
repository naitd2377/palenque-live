'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useApp } from '@/lib/store'
import { toast } from 'sonner'

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuth, setUser, setView } = useApp()
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  // Sync internal mode when reopened
  useState(() => {
    /* no-op, just keep hook ordering */
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload =
        mode === 'login' ? { email, password } : { email, password, name, phone }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Error al autenticar')
        return
      }
      setUser(data.user)
      toast.success(mode === 'login' ? `Bienvenido, ${data.user.name}` : `Cuenta creada. ¡Bienvenido, ${data.user.name}!`)
      setEmail('')
      setPassword('')
      setName('')
      setPhone('')
      closeAuth()
      if (data.user.role === 'ADMIN') setView({ name: 'admin' })
      else setView({ name: 'events' })
    } catch (err) {
      toast.error('Error de red. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) closeAuth()
  }

  // Reset mode when modal opens
  function onOpenChange(open: boolean) {
    if (open) setMode(authModalMode)
    handleOpenChange(open)
  }

  return (
    <Dialog open={authModalOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Acceso a PalenqueLive</DialogTitle>
          <DialogDescription>
            Inicia sesión para ver los eventos en vivo o crea tu cuenta nueva.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Crear cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={submit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo electrónico</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-pass">Contraseña</Label>
                <Input
                  id="login-pass"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Cuenta demo: <span className="font-mono">cliente@demo.com / demo12345</span>
              </p>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={submit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Nombre completo</Label>
                <Input
                  id="reg-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Correo electrónico</Label>
                <Input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-phone">Teléfono (opcional)</Label>
                <Input
                  id="reg-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 555 555 5555"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-pass">Contraseña (mín. 6 caracteres)</Label>
                <Input
                  id="reg-pass"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={loading}>
                {loading ? 'Creando…' : 'Crear cuenta y entrar'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
