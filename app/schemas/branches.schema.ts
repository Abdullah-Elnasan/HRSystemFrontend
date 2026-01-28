// schemas/branch.schema.ts
import { z } from 'zod'

/**
 * Branch form validation schema
 * متوافق مع Laravel FormRequest
 */
export const branchSchema = z.object({
  name_ar: z
    .string()
    .trim()
    .min(1, { message: 'الاسم العربي مطلوب' })
    .max(255, { message: 'الاسم العربي يجب ألا يتجاوز 255 حرفًا' }),


  description_ar: z
    .string()
    .optional()
    .or(z.literal('')),

  description_en: z
    .string()
    .optional()
    .or(z.literal('')),

  location_ar: z
    .string()
    .optional()
    .or(z.literal('')),

  location_en: z
    .string()
    .optional()
    .or(z.literal('')),
})

export type BranchForm = z.infer<typeof branchSchema>
