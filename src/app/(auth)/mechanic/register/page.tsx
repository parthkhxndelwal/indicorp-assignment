'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerMechanic } from '@/lib/actions/auth'
import { validatePassword } from '@/utils/validation'
import { MECHANIC_LEVELS } from '@/utils/validation'

export default function MechanicRegister() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

    const result = await registerMechanic(formData)

    if (result.success) {
      router.push('/mechanic/login')
    } else {
      setError(result.error || 'Registration failed')
    }

    setLoading(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Mechanic Registration</h2>
        <p className="auth-subtitle">Create your mechanic account</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="picture" value={preview || ''} />

          <div className="mb-3">
            <label htmlFor="name" className="form-label">Full Name *</label>
            <input type="text" className="form-control" id="name" name="name" required minLength={2} />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email Address *</label>
            <input type="email" className="form-control" id="email" name="email" required />
          </div>

          <div className="mb-3">
            <label htmlFor="mobile" className="form-label">Mobile Number *</label>
            <input
              type="tel"
              className="form-control"
              id="mobile"
              name="mobile"
              required
              maxLength={10}
              pattern="\d{10}"
              placeholder="10 digits"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="level" className="form-label">Experience Level *</label>
            <select className="form-select" id="level" name="level" required>
              <option value="">Select level...</option>
              {MECHANIC_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="picture" className="form-label">Profile Picture</label>
            <input
              ref={fileRef}
              type="file"
              className="form-control"
              id="picture"
              accept="image/*"
              onChange={handleImageChange}
            />
            {preview && (
              <div className="mt-2">
                <img src={preview} alt="Preview" className="img-thumbnail" style={{ maxHeight: '120px' }} />
              </div>
            )}
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

        <div className="auth-divider"></div>

        <p className="text-center text-muted" style={{ fontSize: 'var(--font-size-body)', marginBottom: 0 }}>
          Already registered? <Link href="/mechanic/login">Login here</Link>
        </p>
      </div>
    </div>
  )
}