'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="navbar navbar-expand-lg navbar-main">
      <div className="container">
        <Link className="navbar-brand fw-semibold" href="/">
          Tools Management
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!session?.user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/">
                    Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/mechanic/login">
                    Mechanic Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/mechanic/register">
                    Mechanic Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/login">
                    Admin Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/register">
                    Admin Register
                  </Link>
                </li>
              </>
            ) : session.user.role === 'ADMIN' ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/tools/add">
                    Add Tool
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/admin/issues">
                    Issue Register
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/mechanic/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}