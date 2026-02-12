/**
 * Authentication types for Laravel Sanctum SPA
 */

export interface User {
  id: number
  name: string
  email: string
  employee: Employee | null
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
  [key: string]: any // Allow additional user properties
}

export interface UserMe {
  id: number
  name: string
  email: string
  employee: Employee | null
}

export interface LoginForm {
  email: string
  password: string
}

export interface Employee {
  id: number
  image: string
}

export interface AuthResponse {
  success: boolean
  message?: string
  messageAr?: string
  messageEn?: string
  data: {
    user: User
    token?: string
  }
}


export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  csrfToken: string | null
}

/**
 * Empty login form initializer
 */
export const emptyLoginForm = (): LoginForm => ({
  email: '',
  password: '',
})

