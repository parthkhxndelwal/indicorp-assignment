import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Tool Room — Workshop Inventory',
  description:
    'A fast, minimal workshop tool inventory system. Track tools, issue to mechanics, and manage your tool room with precision.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="container py-4">{children}</main>
          <footer className="text-center py-3">
            <small className="text-muted">
              Tool Room &copy; {new Date().getFullYear()}
            </small>
          </footer>
        </Providers>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" />
      </body>
    </html>
  )
}
