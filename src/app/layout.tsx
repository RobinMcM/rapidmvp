import type { Metadata } from 'next'
import '../index.css'
import AuthProvider from '../components/AuthProvider'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'RapidMVP — AI-Native Cloud Architecture & Product Engineering',
  description:
    'Design, validate and evolve modern cloud platforms using AI-assisted architecture, Azure cloud services and Cloudflare edge infrastructure.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-rm-black text-white">
            <Navigation />
            <main>{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
