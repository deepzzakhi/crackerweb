import { useEffect } from 'react'
import Hero from '../components/sections/Hero'
import DashboardPreview from '../components/sections/DashboardPreview'
import Services from '../components/sections/Services'
import SobreNosotros from '../components/sections/SobreNosotros'
import Cases from '../components/sections/Cases'
import ContactSection from '../components/sections/ContactSection'

export default function Home() {
  useEffect(() => { document.title = 'Cracker — Software Engineering' }, [])
  return (
    <>
      <Hero />
      <DashboardPreview />
      <Services />
      <SobreNosotros />
      <Cases />
      <ContactSection />
    </>
  )
}
