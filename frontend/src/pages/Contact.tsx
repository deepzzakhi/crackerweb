import { useEffect } from 'react'
import ContactSection from '../components/sections/ContactSection'

export default function ContactPage() {
  useEffect(() => { document.title = 'Contacto — Cracker' }, [])
  return (
    <div className="bg-background">
      <div className="max-w-7xl mx-auto px-4 py-24 border-b border-border">
        <p className="section-label mb-4">Hablemos</p>
        <h1 className="section-heading">Contacto</h1>
      </div>
      <ContactSection />
    </div>
  )
}
