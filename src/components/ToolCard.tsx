'use client'

interface ToolCardProps {
  id: string
  name: string
  category: string
  imageData: string | null
  inventoryNumber: string
  availableQty: number
  totalQty: number
  onIssue?: (toolId: string) => void
  showIssueButton?: boolean
  showAdminInfo?: boolean
}

export default function ToolCard({
  id,
  name,
  category,
  imageData,
  inventoryNumber,
  availableQty,
  totalQty,
  onIssue,
  showIssueButton = false,
  showAdminInfo = false,
}: ToolCardProps) {
  return (
    <div className="card h-100">
      <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
        {imageData ? (
          <img
            src={imageData}
            alt={name}
            className="img-fluid"
            style={{ maxHeight: '180px', objectFit: 'contain' }}
          />
        ) : (
          <div className="text-muted">
            <svg width="64" height="64" fill="currentColor" className="bi bi-tools" viewBox="0 0 16 16">
              <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851 3.003 3.003 0 0 0-.928-4.057L7.531 5.53l3.081 2.2a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675A2.993 2.993 0 0 0 14 9a3 3 0 1 0-2.122-5.12L9.5 6.5 3.88 0H1z"/>
            </svg>
            <p className="small mt-1">No Image</p>
          </div>
        )}
      </div>
      <div className="card-body">
        <h6 className="card-title mb-1">{name}</h6>
        <p className="card-text small text-muted mb-1">{category}</p>
        <span className="badge bg-secondary mb-2">{inventoryNumber}</span>
        <div className="d-flex justify-content-between align-items-center">
          <span className={`small fw-bold ${availableQty > 0 ? 'text-success' : 'text-danger'}`}>
            Available: {availableQty}
          </span>
          {showAdminInfo && <span className="small text-muted">Total: {totalQty}</span>}
        </div>
      </div>
      {showIssueButton && availableQty > 0 && onIssue && (
        <div className="card-footer bg-white border-0 pt-0">
          <button
            className="btn btn-primary btn-sm w-100"
            onClick={() => onIssue(id)}
          >
            Issue Tool
          </button>
        </div>
      )}
    </div>
  )
}
