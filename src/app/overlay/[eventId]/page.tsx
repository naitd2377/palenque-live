'use client'

import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'

type OverlayData = {
  overlayEnabled: boolean
  roundLabel: string | null
  teamRedName: string | null
  teamRedScore: number
  teamGreenName: string | null
  teamGreenScore: number
}

export default function OverlayPage({ params }: { params: { eventId: string } }) {
  const { eventId } = params
  const [data, setData] = useState<OverlayData>({
    overlayEnabled: false,
    roundLabel: null,
    teamRedName: null,
    teamRedScore: 0,
    teamGreenName: null,
    teamGreenScore: 0,
  })

  useEffect(() => {
    fetch(`/api/overlay/${eventId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setData(d.overlay || data))
  }, [eventId])

  useEffect(() => {
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1'
    if (!pusherKey) return

    const pusher = new Pusher(pusherKey, { cluster: pusherCluster })
    const channel = pusher.subscribe(`overlay-${eventId}`)
    channel.bind('update', (msg: OverlayData) => setData(msg))

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
    }
  }, [eventId])

  if (!data.overlayEnabled) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    }}>
      {/* RONDA / PELEA */}
      {data.roundLabel && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #7c2d12, #b91c1c)',
          padding: '8px 32px',
          borderRadius: '8px',
          fontSize: '24px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          border: '2px solid #fbbf24',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
          {data.roundLabel}
        </div>
      )}

      {/* MARCADOR */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
      }}>
        <div style={{
          background: '#dc2626',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '28px',
          fontWeight: 'bold',
          border: '3px solid #fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span>{data.teamRedName || 'EQUIPO ROJO'}</span>
          <span style={{
            background: '#fff',
            color: '#dc2626',
            padding: '4px 16px',
            borderRadius: '4px',
            minWidth: '50px',
            textAlign: 'center',
          }}>
            {data.teamRedScore}
          </span>
        </div>

        <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#fbbf24' }}>VS</span>

        <div style={{
          background: '#16a34a',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '28px',
          fontWeight: 'bold',
          border: '3px solid #fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            background: '#fff',
            color: '#16a34a',
            padding: '4px 16px',
            borderRadius: '4px',
            minWidth: '50px',
            textAlign: 'center',
          }}>
            {data.teamGreenScore}
          </span>
          <span>{data.teamGreenName || 'EQUIPO VERDE'}</span>
        </div>
      </div>
    </div>
  )
}
