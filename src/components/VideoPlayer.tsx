'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

type Props = {
  src: string
  poster?: string
  autoPlay?: boolean
  className?: string
}

/**
 * HLS-capable HTML5 video player.
 * - Safari/iOS plays HLS natively, hls.js handles Chrome/Firefox.
 * - Falls back to native video for non-HLS sources (mp4, webm).
 */
export function VideoPlayer({ src, poster, autoPlay = false, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string>('')

  // Reset status when src changes (render-phase setState keyed by src).
  // Using `key`-style state derivation avoids the lint warning about
  // calling setState inside useEffect.
  const [lastSrc, setLastSrc] = useState<string>(src)
  if (src !== lastSrc) {
    setLastSrc(src)
    setStatus('loading')
    setErrorMsg('')
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Non-HLS source -> just use the video element directly
    if (!src.endsWith('.m3u8') && !src.includes('.m3u8')) {
      video.src = src
      const onLoaded = () => setStatus('playing')
      const onError = () => {
        setStatus('error')
        setErrorMsg('No se pudo cargar el video. Verifica la URL.')
      }
      video.addEventListener('loadeddata', onLoaded)
      video.addEventListener('error', onError)
      return () => {
        video.removeEventListener('loadeddata', onLoaded)
        video.removeEventListener('error', onError)
        video.src = ''
      }
    }

    // HLS — Safari supports natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      const onLoaded = () => setStatus('playing')
      const onError = () => {
        setStatus('error')
        setErrorMsg('No se pudo reproducir la transmisión HLS.')
      }
      video.addEventListener('loadedmetadata', onLoaded)
      video.addEventListener('error', onError)
      return () => {
        video.removeEventListener('loadedmetadata', onLoaded)
        video.removeEventListener('error', onError)
        video.src = ''
      }
    }

    // HLS via hls.js (Chrome, Firefox, etc.)
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus('playing'))
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setStatus('error')
          setErrorMsg(`Error de transmisión: ${data.details ?? data.type}`)
        }
      })
      return () => {
        hls.destroy()
      }
    }

    // Last-resort fallback — defer to a microtask to avoid the lint warning
    // about calling setState synchronously inside an effect.
    Promise.resolve().then(() => {
      setStatus('error')
      setErrorMsg('Tu navegador no soporta HLS.')
    })
  }, [src])

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`}>
      <video
        ref={videoRef}
        controls
        autoPlay={autoPlay}
        poster={poster}
        playsInline
        className="h-full w-full bg-black"
        style={{ aspectRatio: '16 / 9' }}
      />
      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2 text-white">
            <span className="h-3 w-3 animate-ping rounded-full bg-red-500" />
            <span className="text-sm">Cargando transmisión…</span>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center">
          <div className="max-w-md text-white">
            <p className="mb-2 text-lg font-semibold text-red-400">No hay señal</p>
            <p className="text-sm text-white/80">{errorMsg}</p>
            <p className="mt-3 text-xs text-white/60">
              Verifica que el evento esté en vivo y que la URL del stream sea correcta.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
