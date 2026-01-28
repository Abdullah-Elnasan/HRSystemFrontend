// schemas/user-group.schema.ts
import { z } from 'zod'

/**
 * UserGroup form validation schema
 * متوافق مع Laravel FormRequest
 */
export const userGroupSchema = z.object({
  name_ar: z
    .string()
    .trim()
    .min(1, { message: 'اسم المجموعة بالعربية مطلوب' })
    .max(255, { message: 'اسم المجموعة بالعربية يجب ألا يتجاوز 255 حرفًا' }),

  // name_en: z
  //   .string()
  //   .trim()
  //   .min(1, { message: 'اسم المجموعة بالإنجليزية مطلوب' })
  //   .max(255, { message: 'اسم المجموعة بالإنجليزية يجب ألا يتجاوز 255 حرفًا' }),

  description_ar: z
    .string()
    .optional()
    .or(z.literal('')),

  // description_en: z
  //   .string()
  //   .optional()
  //   .or(z.literal('')),
})

export type UserGroupForm = z.infer<typeof userGroupSchema>
