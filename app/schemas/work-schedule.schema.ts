import { z } from 'zod'

/**
 * WorkSchedule form validation schema
 * متوافق مع Laravel FormRequest
 */
export const workScheduleSchema = z.object({
  name_ar: z
    .string()
    .trim()
    .min(1, { message: 'الاسم العربي مطلوب' })
    .max(255, { message: 'الاسم العربي يجب ألا يتجاوز 255 حرفًا' }),

  name_en: z
    .string()
    .trim()
    .min(1, { message: 'الاسم الإنجليزي مطلوب' })
    .max(255, { message: 'الاسم الإنجليزي يجب ألا يتجاوز 255 حرفًا' }),

  description_ar: z
    .string()
    .optional()
    .or(z.literal('')),

  description_en: z
    .string()
    .optional()
    .or(z.literal('')),

  type: z
    .string()
    .trim()
    .min(1, { message: 'نوع جدول العمل مطلوب' }),

  is_active: z
    .boolean(),
})

export type WorkScheduleForm = z.infer<typeof workScheduleSchema>
