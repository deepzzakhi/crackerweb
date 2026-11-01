import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatWidget from '../chat/ChatWidget'

export default function PageWrapper() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* Las secciones que se cargan aparte muestran un esqueleto mientras llegan */}
        <Suspense fallback={<div className="max-w-5xl mx-auto px-4 md:px-8 py-12" role="status" aria-label="Cargando"><div className="h-8 w-48 bg-surface-2 animate-pulse" /><div className="h-64 mt-6 bg-surface-2 animate-pulse" /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
