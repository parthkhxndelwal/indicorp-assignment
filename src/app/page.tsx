import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin/dashboard')
    } else {
      redirect('/mechanic/dashboard')
    }
  }

  return (
    <>
      <div className="hero-section text-center">
        <h1 className="display-4 fw-bold mb-3">Tools Issue Management System</h1>
        <p className="lead text-muted mb-4">
          Streamline your workshop tool room. Register tools, issue them to mechanics, and track every transaction.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link href="/mechanic/login" className="btn btn-primary btn-lg px-4">
            Mechanic Login
          </Link>
          <Link href="/admin/login" className="btn btn-outline-secondary btn-lg px-4">
            Admin Login
          </Link>
        </div>
      </div>

      <div className="row g-4 mt-3">
        <div className="col-md-6">
          <div className="card feature-card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <svg width="48" height="48" fill="currentColor" className="text-primary" viewBox="0 0 16 16">
                  <path d="M7 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1c0 .402.16.783.413 1.06L9.707 5H13.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1c-.402 0-.783.16-1.06.413L11 7.707V13.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1c0-.402-.16-.783-.413-1.06L8.293 11H4.5a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1c.402 0 .783-.16 1.06-.413L7 8.293V2.5z"/>
                </svg>
              </div>
              <h3 className="h4">Mechanic Portal</h3>
              <p className="text-muted">
                Browse available tools, issue what you need with quantity, and return them when done. Track your full issue history.
              </p>
              <Link href="/mechanic/register" className="btn btn-outline-primary">
                Register as Mechanic
              </Link>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card feature-card shadow-sm h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <svg width="48" height="48" fill="currentColor" className="text-success" viewBox="0 0 16 16">
                  <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
              </div>
              <h3 className="h4">Admin Panel</h3>
              <p className="text-muted">
                Manage tool inventory, add new tools with images, view the complete issue register, and track all transactions in one place.
              </p>
              <Link href="/admin/register" className="btn btn-outline-success">
                Register as Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
