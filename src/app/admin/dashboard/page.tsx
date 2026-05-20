import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

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
      <div className="d-flex justify-content-between align-items-center mb-4">
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
          <div className="card border-primary">
            <div className="card-body text-center">
              <div className="dashboard-stat text-primary">{totalTools}</div>
              <div className="text-muted">Total Tools</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-success">
            <div className="card-body text-center">
              <div className="dashboard-stat text-success">{totalMechanics}</div>
              <div className="text-muted">Total Mechanics</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-warning">
            <div className="card-body text-center">
              <div className="dashboard-stat text-warning">{activeIssues}</div>
              <div className="text-muted">Active Issues</div>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mb-3">Tool Inventory</h5>
      {tools.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851 3.003 3.003 0 0 0-.928-4.057L7.531 5.53l3.081 2.2a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675A2.993 2.993 0 0 0 14 9a3 3 0 1 0-2.122-5.12L9.5 6.5 3.88 0H1z"/>
          </svg>
          <p>No tools in inventory. Add your first tool!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-dark">
              <tr>
                <th>Inventory #</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Available</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id}>
                  <td><span className="badge bg-secondary">{tool.inventoryNumber}</span></td>
                  <td>
                    {tool.imageData ? (
                      <img src={tool.imageData} alt={tool.name} style={{ width: '40px', height: '40px', objectFit: 'cover' }} className="rounded" />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="fw-medium">{tool.name}</td>
                  <td>{tool.category}</td>
                  <td>
                    <span className={`badge ${tool.availableQty > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {tool.availableQty}
                    </span>
                  </td>
                  <td>{tool.totalQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {recentIssues.length > 0 && (
        <>
          <h5 className="mb-3 mt-4">Recent Issues</h5>
          <div className="table-responsive">
            <table className="table table-sm table-hover">
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
                      <span className={`badge ${issue.status === 'RETURNED' ? 'bg-success' : 'bg-warning text-dark'}`}>
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
