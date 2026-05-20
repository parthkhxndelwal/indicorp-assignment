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
            <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z"/>
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