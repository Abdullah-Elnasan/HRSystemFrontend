import { z } from "zod"

const numberRequired = (message: string) =>
  z.preprocess(
    (val) => {
      const n = Number(val)
      return isNaN(n) ? undefined : n
    },
    z.number().int().refine(v => v !== undefined, { message })
  )

export const employeeSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, { message: "الاسم الأول مطلوب" }),

  last_name: z
    .string()
    .trim()
    .min(1, { message: "اسم العائلة مطلوب" }),

  pin: numberRequired("الرقم التعريفي مطلوب"),

  national_id: z
    .string()
    .trim()
    .min(1, { message: "الرقم الوطني مطلوب" }),

  phone: z
    .string()
    .trim()
    .min(1, { message: "رقم الهاتف مطلوب" }),

  email: z
    .string()
    .email({ message: "البريد الإلكتروني غير صالح" }),

  position: z
    .string()
    .optional()
    .or(z.literal("")),

  department_id: numberRequired("القسم مطلوب"),

  branch_id: numberRequired("الفرع مطلوب"),

  user_group_id: numberRequired("مجموعة المستخدمين مطلوبة"),

  birth_date: z
    .string()
    .optional()
    .or(z.literal("")),

  image: z
    .instanceof(File)
    .optional()
    .refine(
      file =>
        !file ||
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type),
      { message: "نوع الصورة يجب أن يكون jpg, jpeg, png, أو webp" }
    )
    .refine(
      file => !file || file.size <= 2 * 1024 * 1024,
      { message: "حجم الصورة يجب ألا يتجاوز 2MB" }
    ),
})

export type EmployeeForm = z.infer<typeof employeeSchema>
