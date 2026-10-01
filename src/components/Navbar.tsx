'use client'

import Link from 'next/link'
import { Radio, Menu, LogOut, User as UserIcon, Shield, Ticket, Calendar, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useApp, View } from '@/lib/store'
import { useState } from 'react'
import { toast } from 'sonner'

function navItem(label: string, icon: React.ReactNode, view: View, current: View['name'], target: string) {
  const isActive = current === target
  return (
    <button
      onClick={() => useApp.getState().setView(view)}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-red-500 ${
        isActive ? 'text-red-500' : 'text-foreground/80'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export function Navbar() {
  const { user, loadingUser, view, setUser, setView, openAuth } = useApp()
  const [loggingOut, setLoggingOut] = useState(false)

  async function logout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setView({ name: 'home' })
    toast.success('Sesión cerrada')
    setLoggingOut(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => setView({ name: 'home' })}
          className="flex items-center gap-2 font-bold text-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-700 text-white shadow-md">
            <Radio className="h-5 w-5" />
          </span>
          <span className="hidden sm:block">
            Palenque<span className="text-red-600">Live</span>
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItem('Inicio', <Radio className="h-4 w-4" />, { name: 'home' }, view.name, 'home')}
          {navItem('Eventos', <Calendar className="h-4 w-4" />, { name: 'events' }, view.name, 'events')}
          {user && navItem('Mis tickets', <Ticket className="h-4 w-4" />, { name: 'my-tickets' }, view.name, 'my-tickets')}
          {user?.role === 'ADMIN' && navItem('Admin', <Shield className="h-4 w-4" />, { name: 'admin' }, view.name, 'admin')}
          {navItem('Guía', <BookOpen className="h-4 w-4" />, { name: 'guide' }, view.name, 'guide')}
        </nav>

        {/* User actions */}
        <div className="flex items-center gap-2">
          {loadingUser ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-700 text-xs text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[120px] truncate sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setView({ name: 'my-tickets' })}>
                  <Ticket className="mr-2 h-4 w-4" /> Mis tickets
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem onClick={() => setView({ name: 'admin' })}>
                    <Shield className="mr-2 h-4 w-4" /> Panel admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setView({ name: 'guide' })}>
                  <BookOpen className="mr-2 h-4 w-4" /> Cómo transmitir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} disabled={loggingOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => openAuth('login')} className="hidden sm:flex">
                Iniciar sesión
              </Button>
              <Button size="sm" onClick={() => openAuth('register')} className="bg-red-700 hover:bg-red-800">
                Crear cuenta
              </Button>
            </>
          )}

          {/* Mobile menu (simplified — shows the same nav items via dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setView({ name: 'home' })}>
                <Radio className="mr-2 h-4 w-4" /> Inicio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setView({ name: 'events' })}>
                <Calendar className="mr-2 h-4 w-4" /> Eventos
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem onClick={() => setView({ name: 'my-tickets' })}>
                  <Ticket className="mr-2 h-4 w-4" /> Mis tickets
                </DropdownMenuItem>
              )}
              {user?.role === 'ADMIN' && (
                <DropdownMenuItem onClick={() => setView({ name: 'admin' })}>
                  <Shield className="mr-2 h-4 w-4" /> Admin
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setView({ name: 'guide' })}>
                <BookOpen className="mr-2 h-4 w-4" /> Guía
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
