'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addTool } from '@/lib/actions/tools'
import { TOOL_CATEGORIES } from '@/utils/validation'

export default function AddTool() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

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
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (preview) {
      formData.set('imageData', preview)
    }

    const result = await addTool(formData)

    if (result.success) {
      setSuccess(`Tool "${result.inventoryNumber}" added successfully!`)
      const form = document.getElementById('add-tool-form') as HTMLFormElement
      if (form) form.reset()
      setPreview(null)
      const fileInput = document.getElementById('tool-image') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } else {
      setError(result.error || 'Failed to add tool')
    }

    setLoading(false)
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="p-4 rounded-custom-lg bg-surface">
          <h2 className="mb-4">Add New Tool</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form id="add-tool-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Tool Name *</label>
              <input type="text" className="form-control" id="name" name="name" required />
            </div>

            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category *</label>
              <select className="form-select" id="category" name="category" required>
                <option value="">Select category...</option>
                {TOOL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="image" className="form-label">Tool Image</label>
              <input type="file" className="form-control" id="tool-image" accept="image/*" onChange={handleImageChange} />
              {preview && (
                <div className="mt-2">
                  <img src={preview} alt="Preview" className="tool-card-image rounded-custom" style={{ maxHeight: '120px' }} />
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="availableQty" className="form-label">Available Quantity *</label>
                <input type="number" className="form-control" id="availableQty" name="availableQty" min={0} required defaultValue={0} />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="totalQty" className="form-label">Total Quantity *</label>
                <input type="number" className="form-control" id="totalQty" name="totalQty" min={0} required defaultValue={0} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Adding...' : 'Add Tool'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
