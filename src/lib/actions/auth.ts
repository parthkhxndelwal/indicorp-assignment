'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateEmail, validateMobile, validatePassword, validateRequired } from '@/utils/validation'

export async function registerMechanic(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const mobile = formData.get('mobile') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const picture = formData.get('picture') as string
  const level = formData.get('level') as string

  const nameError = validateRequired(name, 'Name')
  if (nameError) return { success: false, error: nameError }

  const emailError = validateRequired(email, 'Email')
  if (emailError) return { success: false, error: emailError }
  if (!validateEmail(email)) return { success: false, error: 'Invalid email format' }

  const mobileError = validateRequired(mobile, 'Mobile')
  if (mobileError) return { success: false, error: mobileError }
  if (!validateMobile(mobile)) return { success: false, error: 'Mobile must be exactly 10 digits' }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) return { success: false, error: passwordValidation.message }

  if (password !== confirmPassword) return { success: false, error: 'Passwords do not match' }

  if (!level || !['EXPERT', 'MEDIUM', 'NEW_RECRUIT', 'TRAINEE'].includes(level)) {
    return { success: false, error: 'Invalid mechanic level' }
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) return { success: false, error: 'Email already registered' }

  const existingMobile = await prisma.mechanicProfile.findUnique({ where: { mobile } })
  if (existingMobile) return { success: false, error: 'Mobile number already registered' }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'MECHANIC',
    },
  })

  await prisma.mechanicProfile.create({
    data: {
      userId: user.id,
      mobile,
      picture: picture || null,
      level: level as 'EXPERT' | 'MEDIUM' | 'NEW_RECRUIT' | 'TRAINEE',
    },
  })

  return { success: true, error: null }
}

export async function registerAdmin(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  const nameError = validateRequired(name, 'Name')
  if (nameError) return { success: false, error: nameError }

  const emailError = validateRequired(email, 'Email')
  if (emailError) return { success: false, error: emailError }
  if (!validateEmail(email)) return { success: false, error: 'Invalid email format' }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) return { success: false, error: passwordValidation.message }

  if (password !== confirmPassword) return { success: false, error: 'Passwords do not match' }

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) return { success: false, error: 'Email already registered' }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  return { success: true, error: null }
}
