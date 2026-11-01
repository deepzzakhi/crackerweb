import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatWidget from '../chat/ChatWidget'

export default function PageWrapper() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
