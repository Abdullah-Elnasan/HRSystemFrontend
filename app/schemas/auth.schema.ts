import { z } from 'zod'

/**
 * Login form validation schema
 * متوافق مع Laravel FormRequest
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'البريد الإلكتروني مطلوب' })
    .email({ message: 'البريد الإلكتروني غير صالح' }),

  password: z
    .string()
    .trim()
    .min(1, { message: 'كلمة المرور مطلوبة' })
    .min(6, { message: 'كلمة المرور يجب أن تكون على الأقل 6 أحرف' }),
})

export type LoginForm = z.infer<typeof loginSchema>

