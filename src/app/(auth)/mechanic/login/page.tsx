'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MechanicLogin() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/mechanic/dashboard')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Mechanic Login</h2>
        <p className="auth-subtitle">Sign in to access your tool room</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input type="email" className="form-control" id="email" name="email" required />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" name="password" required />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"></div>

        <p className="text-center text-muted" style={{ fontSize: 'var(--font-size-body)' }}>
          New mechanic? <Link href="/mechanic/register">Register here</Link>
        </p>
        <p className="text-center text-muted" style={{ fontSize: 'var(--font-size-body)', marginBottom: 0 }}>
          <Link href="/admin/login">Admin Login</Link>
        </p>
      </div>
    </div>
  )
}