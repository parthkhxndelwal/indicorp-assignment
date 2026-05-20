'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateIssue, deleteIssue } from '@/lib/actions/issues'

interface Issue {
  id: string
  quantity: number
  purpose: string | null
  conditionNotes: string | null
  status: string
  tool: { name: string; inventoryNumber: string }
  mechanic: { name: string }
}

export default function IssueActions({ issue }: { issue: Issue }) {
  const router = useRouter()
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(issue.quantity)
  const [purpose, setPurpose] = useState(issue.purpose || '')
  const [conditionNotes, setConditionNotes] = useState(issue.conditionNotes || '')

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData()
    formData.set('issueId', issue.id)
    formData.set('quantity', quantity.toString())
    formData.set('purpose', purpose)
    formData.set('conditionNotes', conditionNotes)

    const result = await updateIssue(formData)

    if (result.success) {
      setShowEdit(false)
      router.refresh()
    } else {
      setError(result.error || 'Failed to update issue')
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete issue for "${issue.tool.name}"? This cannot be undone.`)) return
    setError('')
    setLoading(true)

    const result = await deleteIssue(issue.id)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Failed to delete issue')
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
              <h5>Edit Issue</h5>
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
                  <label className="form-label">Tool</label>
                  <input type="text" className="form-control" value={issue.tool.name} readOnly disabled />
                </div>

                <div className="mb-3">
                  <label className="form-label">Mechanic</label>
                  <input type="text" className="form-control" value={issue.mechanic.name} readOnly disabled />
                </div>

                <div className="mb-3">
                  <label htmlFor="edit-qty" className="form-label">Quantity *</label>
                  <input
                    type="number"
                    id="edit-qty"
                    className="form-control"
                    value={quantity}
                    min={1}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="edit-purpose" className="form-label">Purpose / Reason</label>
                  <input
                    type="text"
                    id="edit-purpose"
                    className="form-control"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="edit-notes" className="form-label">Condition Notes</label>
                  <input
                    type="text"
                    id="edit-notes"
                    className="form-control"
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                  />
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
