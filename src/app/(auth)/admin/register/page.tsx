'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerAdmin } from '@/lib/actions/auth'
import { validatePassword } from '@/utils/validation'

export default function AdminRegister() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    const pwValidation = validatePassword(password)
    if (!pwValidation.valid) {
      setError(pwValidation.message)
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const result = await registerAdmin(formData)

    if (result.success) {
      router.push('/admin/login')
    } else {
      setError(result.error || 'Registration failed')
    }

    setLoading(false)
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <h2 className="mb-4">Admin Registration</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input type="text" className="form-control" id="name" name="name" required minLength={2} />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input type="email" className="form-control" id="email" name="email" required />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password *</label>
            <input type="password" className="form-control" id="password" name="password" required minLength={8} />
            <div className="form-text">Min 8 chars, at least 1 letter, 1 number, 1 special character</div>
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password *</label>
            <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" required />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-3 text-center">
          Already registered? <Link href="/admin/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}
