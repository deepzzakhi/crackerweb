// Datos de contacto de Cracker en un solo lugar (sección Contacto, footer y chat)
export const EMAIL = 'crackersoftware@gmail.com'
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '5491127585783').replace(/\D/g, '')
export const WHATSAPP_LABEL = '+54 9 11 2758-5783'

export const whatsappLink = (texto?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`
