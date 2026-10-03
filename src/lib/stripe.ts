import Stripe from 'stripe'

/**
 * Cliente de Stripe usando la Secret key.
 * Se usa en el backend para crear sesiones de checkout y verificar webhooks.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil' as any,
  typescript: true,
})

/**
 * URL de tu plataforma. En desarrollo es localhost, en producción es tu URL de Vercel.
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://palenque-live-nine.vercel.app'
