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
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Clean up any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Reset state
    setStatus('loading')
    setErrorMsg('')

    // Non-HLS source -> use video element directly
    if (!src.includes('.m3u8')) {
      video.src = src
      const onLoaded = () => setStatus('playing')
      const onError = () => {
        setStatus('error')
        setErrorMsg('No se pudo cargar el video.')
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

    // HLS via hls.js (Chrome, Firefox, Edge)
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveDurationInfinity: true,
        liveBackBufferLength: 30,
      })
      hlsRef.current = hls

      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest parsed, attempting playback')
        video.play().catch((e) => {
          console.warn('Autoplay blocked:', e)
        })
        setStatus('playing')
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('❌ HLS error:', data)
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover network error
              console.log('🔄 Trying to recover network error...')
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              // Try to recover media error
              console.log('🔄 Trying to recover media error...')
              hls.recoverMediaError()
              break
            default:
              // Cannot recover
              setStatus('error')
              setErrorMsg(`Error de transmisión: ${data.details ?? data.type}`)
              hls.destroy()
              break
          }
        }
      })

      return () => {
        hls.destroy()
        hlsRef.current = null
      }
    }

    // Last-resort fallback
    setStatus('error')
    setErrorMsg('Tu navegador no soporta HLS.')
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
