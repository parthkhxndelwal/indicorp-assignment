export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateMobile(mobile: string): boolean {
  return /^\d{10}$/.test(mobile)
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' }
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' }
  }
  return { valid: true, message: '' }
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`
  }
  if (fieldName === 'Name' && value.trim().length < 2) {
    return 'Name must be at least 2 characters'
  }
  return null
}

export function validateImageFile(data: string | null): { valid: boolean; error: string | null } {
  if (!data) return { valid: true, error: null }
  if (!data.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid image format' }
  }
  if (data.length > 5 * 1024 * 1024) {
    return { valid: false, error: 'Image must be less than 5MB' }
  }
  return { valid: true, error: null }
}

export const TOOL_CATEGORIES = [
  'Screwdriver',
  'Wrench',
  'Plier',
  'Hammer',
  'Socket Set',
  'Measuring Tape',
  'Drill Bit',
  'Adjustable Spanner',
] as const

export const MECHANIC_LEVELS = [
  { value: 'EXPERT', label: 'Expert' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'NEW_RECRUIT', label: 'New Recruit' },
  { value: 'TRAINEE', label: 'Trainee' },
] as const
