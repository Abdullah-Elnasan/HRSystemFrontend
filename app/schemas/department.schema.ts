import { z } from 'zod'

/**
 * Department form validation schema
 * متوافق مع Laravel FormRequest
 */
export const departmentSchema = z.object({
  name_ar: z
    .string()
    .trim()
    .min(1, { message: 'الاسم العربي مطلوب' })
    .max(255, { message: 'الاسم العربي يجب ألا يتجاوز 255 حرفًا' }),

  description_ar: z
    .string()
    .optional()
    .or(z.literal('')),

})

export type DepartmentForm = z.infer<typeof departmentSchema>
