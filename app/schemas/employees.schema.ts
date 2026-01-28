import { z } from 'zod'

/**
 * Employee form validation schema
 * متوافق مع Laravel FormRequest
 */
export const employeeSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, { message: 'الاسم الأول مطلوب' }),

  last_name: z
    .string()
    .trim()
    .min(1, { message: 'اسم العائلة مطلوب' }),

  pin:
    z.preprocess(
    (val) => {
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    },
    z.number().int().refine(val => val !== undefined, { message: 'القسم مطلوب ويجب أن يكون رقمًا صحيحًا' })
  ),

  national_id: z
    .string()
    .trim()
    .min(1, { message: 'الرقم الوطني مطلوب' }),

  phone: z
    .string()
    .trim()
    .min(1, { message: 'رقم الهاتف مطلوب' }),

  email: z
    .string()
    .email({ message: 'البريد الإلكتروني غير صالح' }),

  position: z
    .string()
    .optional()
    .or(z.literal('')),

  // تحويل القيم إلى أرقام صحيحة إذا كانت موجودة
  department_id: z.preprocess(
    (val) => {
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    },
    z.number().int().refine(val => val !== undefined, { message: 'القسم مطلوب ويجب أن يكون رقمًا صحيحًا' })
  ),

  branch_id: z.preprocess(
    (val) => {
      const n = Number(val);
      return isNaN(n) ? undefined : n;
    },
    z.number().int().refine(val => val !== undefined, { message: 'الفرع مطلوب ويجب أن يكون رقمًا صحيحًا' })
  ),

  birth_date: z
    .string()
    .optional()
    .or(z.literal('')),

  image: z
    .instanceof(File)
    .optional()
    .refine(file => !file || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'نوع الصورة يجب أن يكون jpg, jpeg, png, أو webp',
    })
    .refine(file => !file || file.size <= 2 * 1024 * 1024, {
      message: 'حجم الصورة يجب ألا يتجاوز 2MB',
    }),
})

export type EmployeeForm = z.infer<typeof employeeSchema>
