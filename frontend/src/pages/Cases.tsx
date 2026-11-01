import { useEffect } from 'react'
import Cases from '../components/sections/Cases'
import ContactSection from '../components/sections/ContactSection'

export default function CasesPage() {
  useEffect(() => { document.title = 'Casos — Cracker' }, [])
  return (
    <div className="bg-background pt-8">
      <div className="max-w-7xl mx-auto px-4 py-16 border-b border-border">
        <p className="section-label mb-4">Portfolio</p>
        <h1 className="section-heading">Casos de éxito</h1>
      </div>
      <Cases />
      <ContactSection />
    </div>
  )
}
