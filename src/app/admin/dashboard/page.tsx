import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ToolActions from '@/components/ToolActions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/mechanic/dashboard')
  }

  const [totalTools, totalMechanics, activeIssues, recentIssues, tools] = await Promise.all([
    prisma.tool.count(),
    prisma.user.count({ where: { role: 'MECHANIC' } }),
    prisma.issue.count({ where: { status: 'ISSUED' } }),
    prisma.issue.findMany({
      take: 5,
      include: { tool: true, mechanic: true },
      orderBy: { issuedAt: 'desc' },
    }),
    prisma.tool.findMany({
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <div className="d-flex gap-2">
          <Link href="/admin/tools/add" className="btn btn-primary">
            Add New Tool
          </Link>
          <Link href="/admin/issues" className="btn btn-outline-primary">
            View Issue Register
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-value">{totalTools}</div>
            <div className="stat-label">Total Tools</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-value">{totalMechanics}</div>
            <div className="stat-label">Total Mechanics</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-value">{activeIssues}</div>
            <div className="stat-label">Active Issues</div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h4>Tool Inventory</h4>
      </div>
      {tools.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851 3.003 3.003 0 0 0-.928-4.057L7.531 5.53l3.081 2.2a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675A2.993 2.993 0 0 0 14 9a3 3 0 1 0-2.122-5.12L9.5 6.5 3.88 0H1z"/>
            </svg>
          </div>
          <h4>No tools in inventory</h4>
          <p>Add your first tool to get started!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Inventory #</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Available</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id}>
                  <td><span className="badge badge-inventory">{tool.inventoryNumber}</span></td>
                  <td>
                    {tool.imageData ? (
                      <img src={tool.imageData} alt={tool.name} className="rounded-custom" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                    ) : (
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16" className="text-muted" style={{ opacity: 0.4 }}>
                        <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z"/>
                      </svg>
                    )}
                  </td>
                  <td className="fw-medium">{tool.name}</td>
                  <td>{tool.category}</td>
                  <td>
                    <span className={`badge ${tool.availableQty > 0 ? 'badge-status-available' : 'badge-status-out'}`}>
                      {tool.availableQty}
                    </span>
                  </td>
                  <td>{tool.totalQty}</td>
                  <td><ToolActions tool={tool} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {recentIssues.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: 'var(--space-xl)' }}>
            <h4>Recent Issues</h4>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Tool</th>
                  <th>Mechanic</th>
                  <th>Qty</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.map((issue) => (
                  <tr key={issue.id}>
                    <td>{issue.tool.name}</td>
                    <td>{issue.mechanic.name}</td>
                    <td>{issue.quantity}</td>
                    <td>{new Date(issue.issuedAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${issue.status === 'RETURNED' ? 'badge-status-returned' : 'badge-status-issued'}`}>
                        {issue.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
