'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTool, deleteTool } from '@/lib/actions/tools'
import { TOOL_CATEGORIES } from '@/utils/validation'

interface Tool {
  id: string
  name: string
  category: string
  imageData: string | null
  inventoryNumber: string
  availableQty: number
  totalQty: number
}

export default function ToolActions({ tool }: { tool: Tool }) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState(tool.name)
  const [category, setCategory] = useState(tool.category)
  const [totalQty, setTotalQty] = useState(tool.totalQty)

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData()
    formData.set('toolId', tool.id)
    formData.set('name', name)
    formData.set('category', category)
    formData.set('totalQty', totalQty.toString())
    formData.set('availableQty', totalQty.toString())

    const result = await updateTool(formData)

    if (result.success) {
      setShowEdit(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update tool')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${tool.name}"? This cannot be undone.`)) return
    setError('')
    setLoading(true)

    const result = await deleteTool(tool.id)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to delete tool')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="d-flex gap-1">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => { setShowEdit(true); setError('') }}
          title="Edit"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={handleDelete}
          disabled={loading}
          title="Delete"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
          </svg>
        </button>
      </div>

      {showEdit && (
        <div className="modal-custom-overlay">
          <div className="modal-custom">
            <div className="modal-custom-header">
              <h5>Edit Tool</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEdit(false)}
              />
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-custom-body">
                {error && <div className="alert alert-danger py-2">{error}</div>}

                <div className="mb-3">
                  <label className="form-label">Inventory #</label>
                  <input type="text" className="form-control" value={tool.inventoryNumber} readOnly disabled />
                </div>

                <div className="mb-3">
                  <label htmlFor="edit-name" className="form-label">Tool Name *</label>
                  <input
                    type="text"
                    id="edit-name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="edit-category" className="form-label">Category *</label>
                  <select
                    id="edit-category"
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    {TOOL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="edit-totalQty" className="form-label">Total Quantity *</label>
                  <input
                    type="number"
                    id="edit-totalQty"
                    className="form-control"
                    value={totalQty}
                    min={0}
                    onChange={(e) => setTotalQty(parseInt(e.target.value) || 0)}
                    required
                  />
                  <small className="text-muted">Currently issued: {tool.totalQty - tool.availableQty}</small>
                </div>
              </div>
              <div className="modal-custom-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowEdit(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
