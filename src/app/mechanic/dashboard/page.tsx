'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ToolCard from '@/components/ToolCard'
import { getAvailableTools } from '@/lib/actions/tools'
import { issueTool, returnTool, getMechanicActiveIssues, getMechanicIssues } from '@/lib/actions/issues'

interface Tool {
  id: string
  name: string
  category: string
  imageData: string | null
  inventoryNumber: string
  availableQty: number
  totalQty: number
}

interface Issue {
  id: string
  toolId: string
  quantity: number
  purpose: string | null
  conditionNotes: string | null
  issuedAt: Date
  returnedAt: Date | null
  status: string
  tool: { name: string; inventoryNumber: string }
}

export default function MechanicDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [tools, setTools] = useState<Tool[]>([])
  const [activeIssues, setActiveIssues] = useState<Issue[]>([])
  const [issueHistory, setIssueHistory] = useState<Issue[]>([])
  const [issueModal, setIssueModal] = useState<{ tool: Tool } | null>(null)
  const [issueQty, setIssueQty] = useState(1)
  const [purpose, setPurpose] = useState('')
  const [conditionNotes, setConditionNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [issueLoading, setIssueLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tools' | 'issued' | 'history'>('tools')

  const fetchData = useCallback(async () => {
    setDataLoading(true)
    const [toolsData, activeData, historyData] = await Promise.all([
      getAvailableTools(),
      getMechanicActiveIssues(session?.user?.id || ''),
      getMechanicIssues(session?.user?.id || ''),
    ])
    setTools(toolsData)
    setActiveIssues(activeData)
    setIssueHistory(historyData)
    setDataLoading(false)
  }, [session?.user?.id])

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'MECHANIC') {
      router.push('/')
      return
    }
    fetchData()
  }, [session, status, router, fetchData])

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault()
    if (!issueModal) return
    setError('')
    setSuccess('')
    setIssueLoading(true)

    const formData = new FormData()
    formData.set('toolId', issueModal.tool.id)
    formData.set('quantity', issueQty.toString())
    formData.set('purpose', purpose)
    formData.set('conditionNotes', conditionNotes)

    const result = await issueTool(formData)

    if (result.success) {
      setSuccess('Tool issued successfully!')
      setIssueModal(null)
      setIssueQty(1)
      setPurpose('')
      setConditionNotes('')
      fetchData()
    } else {
      setError(result.error || 'Failed to issue tool')
    }

    setIssueLoading(false)
  }

  async function handleReturn(issueId: string) {
    setError('')
    setSuccess('')

    const result = await returnTool(issueId)

    if (result.success) {
      setSuccess('Tool returned successfully!')
      fetchData()
    } else {
      setError(result.error || 'Failed to return tool')
    }
  }

  if (status === 'loading') {
    return <div className="text-center mt-5"><div className="spinner-border" role="status" /></div>
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Mechanic Dashboard</h1>
          <p className="mb-0">Welcome, <span className="text-secondary">{session?.user?.name}</span></p>
        </div>
      </div>

      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error}
        <button type="button" className="btn-close" onClick={() => setError('')} />
      </div>}

      {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
        {success}
        <button type="button" className="btn-close" onClick={() => setSuccess('')} />
      </div>}

      <div className="tabs-custom">
        <button
          className={`tab-item ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Available Tools<span className="tab-count">{tools.length}</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'issued' ? 'active' : ''}`}
          onClick={() => setActiveTab('issued')}
        >
          My Issued Tools<span className="tab-count">{activeIssues.length}</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History<span className="tab-count">{issueHistory.length}</span>
        </button>
      </div>

      {activeTab === 'tools' && (
        <>
          {dataLoading ? (
            <div className="text-center mt-5">
              <div className="spinner-border" role="status" />
            </div>
          ) : tools.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851 3.003 3.003 0 0 0-.928-4.057L7.531 5.53l3.081 2.2a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675A2.993 2.993 0 0 0 14 9a3 3 0 1 0-2.122-5.12L9.5 6.5 3.88 0H1z"/>
                </svg>
              </div>
              <h4>No Tools Available</h4>
              <p>No tools available in inventory right now.</p>
            </div>
          ) : (
            <div className="row g-4">
              {tools.map((tool) => (
                <div className="col-md-4 col-lg-3" key={tool.id}>
                  <ToolCard
                    {...tool}
                    showIssueButton
                    onIssue={() => {
                      setIssueModal({ tool })
                      setIssueQty(1)
                      setError('')
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'issued' && (
        <>
          {activeIssues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
              </div>
              <h4>No Issued Tools</h4>
              <p>No tools currently issued.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Inventory #</th>
                    <th>Qty</th>
                    <th>Purpose</th>
                    <th>Issue Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="fw-medium">{issue.tool.name}</td>
                      <td><span className="badge badge-inventory">{issue.tool.inventoryNumber}</span></td>
                      <td>{issue.quantity}</td>
                      <td>{issue.purpose || '—'}</td>
                      <td>{new Date(issue.issuedAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleReturn(issue.id)}
                        >
                          Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <>
          {issueHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                </svg>
              </div>
              <h4>No History</h4>
              <p>No issue history yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tool</th>
                    <th>Inventory #</th>
                    <th>Qty</th>
                    <th>Purpose</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issueHistory.map((issue) => (
                    <tr key={issue.id}>
                      <td className="fw-medium">{issue.tool.name}</td>
                      <td><span className="badge badge-inventory">{issue.tool.inventoryNumber}</span></td>
                      <td>{issue.quantity}</td>
                      <td>{issue.purpose || '—'}</td>
                      <td>{new Date(issue.issuedAt).toLocaleDateString()}</td>
                      <td>
                        {issue.returnedAt
                          ? new Date(issue.returnedAt).toLocaleDateString()
                          : <span className="text-secondary">—</span>
                        }
                      </td>
                      <td>
                        <span className={`badge badge-status-${issue.status.toLowerCase()}`}>
                          {issue.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Issue Modal */}
      {issueModal && (
        <div className="modal-custom-overlay">
          <div className="modal-custom">
            <div className="modal-custom-header">
              <h5>Issue Tool</h5>
              <button type="button" className="btn-close" onClick={() => setIssueModal(null)} />
            </div>
            <form onSubmit={handleIssue}>
              <div className="modal-custom-body">
                <div className="mb-3">
                  <label className="form-label">Tool</label>
                  <input type="text" className="form-control" value={issueModal.tool.name} readOnly />
                </div>
                <div className="mb-3">
                  <label className="form-label">Available Quantity</label>
                  <input type="text" className="form-control" value={issueModal.tool.availableQty} readOnly />
                </div>
                <div className="mb-3">
                  <label htmlFor="qty" className="form-label">Quantity to Issue *</label>
                  <input
                    type="number"
                    className="form-control"
                    id="qty"
                    min={1}
                    max={issueModal.tool.availableQty}
                    value={issueQty}
                    onChange={(e) => setIssueQty(parseInt(e.target.value) || 1)}
                    required
                  />
                  {issueQty > issueModal.tool.availableQty && (
                    <div className="text-danger small mt-1">Cannot exceed available quantity</div>
                  )}
                </div>
                <div className="mb-3">
                  <label htmlFor="purpose" className="form-label">Purpose / Reason</label>
                  <input
                    type="text"
                    className="form-control"
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">Condition Notes</label>
                  <input
                    type="text"
                    className="form-control"
                    id="notes"
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-custom-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setIssueModal(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={issueLoading || issueQty > issueModal.tool.availableQty || issueQty < 1}
                >
                  {issueLoading ? 'Issuing...' : 'Issue Tool'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}