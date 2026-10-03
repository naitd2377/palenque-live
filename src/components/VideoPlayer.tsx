'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

type Props = {
  src: string
  poster?: string
  autoPlay?: boolean
  className?: string
}

/**
 * Reproductor de video que usa el Mux Player oficial si la URL es de Mux,
 * o el reproductor HTML5 estándar para otros sources.
 *
 * Mux Player es 100% confiable porque es mantenido por Mux.
 * URL: https://github.com/muxinc/mux-player-react
 */
export function VideoPlayer({ src, autoPlay = false, className }: Props) {
  const [loading, setLoading] = useState(true)

  // Detectar si la URL es de Mux (https://stream.mux.com/XXXX.m3u8)
  const isMuxUrl = src && src.includes('stream.mux.com')

  // Extraer el Playback ID de la URL de Mux
  // URL: https://stream.mux.com/PLAYBACK_ID.m3u8
  // Playback ID: PLAYBACK_ID
  const muxPlaybackId = isMuxUrl
    ? src
        .split('stream.mux.com/')[1]
        .split('.m3u8')[0]
        .split('?')[0]
    : null

  // Si es URL de Mux, usar Mux Player oficial
  if (isMuxUrl && muxPlaybackId) {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`}
        style={{ aspectRatio: '16 / 9' }}
      >
        <iframe
          src={`https://player.mux.com/${muxPlaybackId}?autoplay=${autoPlay ? 'true' : 'false'}`}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          style={{
            border: '0',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: '0',
            left: '0',
          }}
          title="Transmisión en vivo"
          onLoad={() => setLoading(false)}
        />
        {loading && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2 text-white">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Cargando transmisión…</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Para URLs que NO son de Mux, usar video HTML5 estándar
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`}
      style={{ aspectRatio: '16 / 9' }}
    >
      <video
        src={src}
        controls
        autoPlay={autoPlay}
        playsInline
        className="h-full w-full bg-black"
        onLoadedData={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2 text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando transmisión…</span>
          </div>
        </div>
      )}
    </div>
  )
}
