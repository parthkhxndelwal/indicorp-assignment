import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminIssues() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/mechanic/dashboard')
  }

  const issues = await prisma.issue.findMany({
    include: {
      tool: true,
      mechanic: true,
    },
    orderBy: { issuedAt: 'desc' },
  })

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Issue Register</h1>
        <span className="badge bg-secondary fs-6">Total: {issues.length}</span>
      </div>

      {issues.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.5 5.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3zm0 5a.5.5 0 0 1 1 0v.5a.5.5 0 0 1-1 0v-.5z"/>
          </svg>
          <p>No issues recorded yet. Issues will appear when mechanics request tools.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Tool Name</th>
                <th>Inventory #</th>
                <th>Mechanic</th>
                <th>Qty</th>
                <th>Purpose</th>
                <th>Condition Notes</th>
                <th>Issue Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr key={issue.id}>
                  <td>{index + 1}</td>
                  <td className="fw-medium">{issue.tool.name}</td>
                  <td><span className="badge bg-secondary">{issue.tool.inventoryNumber}</span></td>
                  <td>{issue.mechanic.name}</td>
                  <td>{issue.quantity}</td>
                  <td>{issue.purpose || '—'}</td>
                  <td>{issue.conditionNotes || '—'}</td>
                  <td>{new Date(issue.issuedAt).toLocaleDateString()}</td>
                  <td>
                    {issue.returnedAt
                      ? new Date(issue.returnedAt).toLocaleDateString()
                      : <span className="text-muted">Not Returned</span>
                    }
                  </td>
                  <td>
                    <span className={`badge badge-status ${issue.status === 'RETURNED' ? 'bg-success' : 'bg-warning text-dark'}`}>
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
  )
}
