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
  // Determine availability status
  const getAvailabilityClass = () => {
    if (availableQty === 0) return 'out-of-stock'
    if (availableQty <= 2) return 'low-stock'
    return 'in-stock'
  }

  const getAvailabilityLabel = () => {
    if (availableQty === 0) return 'Out of Stock'
    if (availableQty <= 2) return 'Low Stock'
    return 'In Stock'
  }

  return (
    <div className="tool-card">
      <div className="tool-card-image">
        {imageData ? (
          <img
            src={imageData}
            alt={name}
          />
        ) : (
          <svg width="48" height="48" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}>
            <path d="M1 0 0 1l2.2 3.081a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675-2.617 2.654A3.003 3.003 0 0 0 0 13a3 3 0 1 0 5.878-.851 3.003 3.003 0 0 0-.928-4.057L7.531 5.53l3.081 2.2a1 1 0 0 0 .815.419h.07a1 1 0 0 1 .708.293l2.675 2.675A2.993 2.993 0 0 0 14 9a3 3 0 1 0-2.122-5.12L9.5 6.5 3.88 0H1z"/>
          </svg>
        )}
      </div>
      <div className="tool-card-body">
        <h5 className="tool-card-title">{name}</h5>
        <div className="tool-card-meta">
          <span>{category}</span>
          <span>&middot;</span>
          <span className="badge badge-inventory">{inventoryNumber}</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className={`available-indicator ${getAvailabilityClass()}`}>
            <span className="dot"></span>
            {getAvailabilityLabel()}: {availableQty}
          </span>
          <span className="tool-card-meta">Total: {totalQty}</span>
        </div>
      </div>
      {showIssueButton && availableQty > 0 && onIssue && (
        <div className="tool-card-footer">
          <button
            className="btn btn-primary w-100 btn-sm"
            onClick={() => onIssue(id)}
          >
            Issue Tool
          </button>
        </div>
      )}
    </div>
  )
}