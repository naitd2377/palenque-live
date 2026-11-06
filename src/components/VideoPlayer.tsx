'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

type Props = {
  src: string
  poster?: string
  autoPlay?: boolean
  className?: string
}

export function VideoPlayer({ src, autoPlay = false, className }: Props) {
  const [loading, setLoading] = useState(true)

  if (!src) return null

  // 1. Detectar YouTube
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be')
  let youtubeVideoId: string | null = null
  if (isYouTube) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = src.match(regExp)
    if (match && match[2].length === 11) youtubeVideoId = match[2]
  }
  if (isYouTube && youtubeVideoId) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`} style={{ aspectRatio: '16 / 9' }}>
        <iframe src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ border: '0', width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }} title="YouTube" onLoad={() => setLoading(false)} />
        {loading && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60"><div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2 text-white"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Cargando…</span></div></div>}
      </div>
    )
  }

  // 2. Detectar Castr
  const isCastrUrl = src.includes('castr.io') || src.includes('castr.com')
  if (isCastrUrl) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`} style={{ aspectRatio: '16 / 9' }}>
        <iframe src={src} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen style={{ border: '0', width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }} title="Castr Live" onLoad={() => setLoading(false)} />
        {loading && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60"><div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2 text-white"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Cargando Castr…</span></div></div>}
      </div>
    )
  }

  // 3. Detectar Mux
  const isMuxUrl = src.includes('stream.mux.com')
  const muxPlaybackId = isMuxUrl ? src.split('stream.mux.com/')[1].split('.m3u8')[0].split('?')[0] : null
  if (isMuxUrl && muxPlaybackId) {
    return (
      <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`} style={{ aspectRatio: '16 / 9' }}>
        <iframe src={`https://player.mux.com/${muxPlaybackId}?autoplay=${autoPlay ? 'true' : 'false'}`} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen style={{ border: '0', width: '100%', height: '100%', position: 'absolute', top: '0', left: '0' }} title="Mux Live" onLoad={() => setLoading(false)} />
        {loading && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60"><div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2 text-white"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Cargando Mux…</span></div></div>}
      </div>
    )
  }

  // 4. Fallback (Video HTML5 estándar para URLs .m3u8 directas)
  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-black ${className ?? ''}`} style={{ aspectRatio: '16 / 9' }}>
      <video src={src} controls autoPlay={autoPlay} playsInline className="h-full w-full bg-black" onLoadedData={() => setLoading(false)} onError={() => setLoading(false)} />
      {loading && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60"><div className="flex items-center gap-3 rounded-lg bg-black/70 px-4 py-2 text-white"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm">Cargando video…</span></div></div>}
    </div>
  )
}
