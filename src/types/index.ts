export type Role = 'ADMIN' | 'MECHANIC'

export type MechanicLevel = 'EXPERT' | 'MEDIUM' | 'NEW_RECRUIT' | 'TRAINEE'

export type IssueStatus = 'ISSUED' | 'RETURNED'

export interface UserData {
  id: string
  email: string
  name: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

export interface MechanicProfileData {
  id: string
  userId: string
  mobile: string
  picture: string | null
  level: MechanicLevel
  user?: UserData
}

export interface ToolData {
  id: string
  name: string
  category: string
  imageData: string | null
  inventoryNumber: string
  availableQty: number
  totalQty: number
  createdAt: Date
  updatedAt: Date
}

export interface IssueData {
  id: string
  toolId: string
  mechanicId: string
  quantity: number
  purpose: string | null
  conditionNotes: string | null
  issuedAt: Date
  returnedAt: Date | null
  status: IssueStatus
  approvedById: string | null
  tool?: ToolData
  mechanic?: UserData
  approvedBy?: UserData | null
}
