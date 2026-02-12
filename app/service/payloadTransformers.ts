/**
 * تحويل جميع قيم boolean إلى 0/1 بشكل عميق
 * يتخطى File objects لأنها يجب أن تبقى كما هي
 */
export function convertBooleansToNumbers(obj: any): any {
  if (obj === null || obj === undefined) return obj

  // Skip File objects - they should remain unchanged
  if (obj instanceof File) {
    return obj
  }

  if (typeof obj === 'boolean') {
    return obj ? 1 : 0
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertBooleansToNumbers(item))
  }

  if (typeof obj === 'object') {
    const converted: any = {}
    for (const key in obj) {
      const value = obj[key]
      // Skip File objects - they should remain unchanged
      if (value instanceof File) {
        converted[key] = value
      } else {
        converted[key] = convertBooleansToNumbers(value)
      }
    }
    return converted
  }

  return obj
}

/**
 * تحويل object إلى FormData مع دعم nested objects و arrays
 */
export function toFormData(obj: any, formData = new FormData(), parentKey = ''): FormData {
  if (obj === null || obj === undefined) {
    return formData
  }

  if (obj instanceof Date) {
    formData.append(parentKey, obj.toISOString())
    return formData
  }

  if (obj instanceof File) {
    formData.append(parentKey, obj)
    return formData
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      formData.append(`${parentKey}[]`, '')
    } else {
      obj.forEach((item, index) => {
        const key = `${parentKey}[${index}]`
        toFormData(item, formData, key)
      })
    }
    return formData
  }

  if (typeof obj === 'object') {
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      const formKey = parentKey ? `${parentKey}[${key}]` : key

      if (value === null || value === undefined) {
        // Skip null/undefined values
        return
      } else if (value instanceof File) {
        // File object - append directly with the key name (not nested)
        // Use the original key to avoid nesting like image[name], image[size], etc.
        formData.append(key, value)
      } else if (value instanceof FileList) {
        // FileList - append all files
        Array.from(value).forEach((file, index) => {
          formData.append(index === 0 ? formKey : `${formKey}[${index}]`, file)
        })
      } else if (value instanceof Date) {
        formData.append(formKey, value.toISOString())
      } else if (typeof value === 'boolean') {
        formData.append(formKey, value ? '1' : '0')
      } else if (Array.isArray(value)) {
        // Handle arrays
        if (value.length === 0) {
          formData.append(`${formKey}[]`, '')
        } else {
          value.forEach((item, index) => {
            const arrayKey = `${formKey}[${index}]`
            toFormData(item, formData, arrayKey)
          })
        }
      } else if (typeof value === 'object' && value !== null) {
        // Check if it's a File-like object (has File properties but lost instanceof check)
        // This can happen when File is stored in reactive objects in Vue
        const isFileLike =
          value.constructor &&
          (value.constructor.name === 'File' ||
           (typeof value.name === 'string' &&
            typeof value.size === 'number' &&
            typeof value.type === 'string' &&
            typeof value.lastModified === 'number' &&
            typeof value.arrayBuffer === 'function'))

        if (isFileLike) {
          // It's a File object - append it directly with the key name (not nested)
          // Use the original key, not formKey, to avoid nesting
          formData.append(key, value as File)
        } else {
          // Regular object - recurse
          toFormData(value, formData, formKey)
        }
      } else {
        formData.append(formKey, value.toString())
      }
    })
    return formData
  }

  formData.append(parentKey, obj.toString())
  return formData
}

/**
 * تحويل WorkScheduleForm إلى صيغة API
 */
export function transformWorkSchedulePayload(payload: any): any {
  const transformed: any = {
    name_ar: payload.name_ar,
    name_en: payload.name_en || payload.name_ar,
    type: payload.type,
    description_ar: payload.description_ar || null,
    description_en: payload.description_en || null,
    is_active: payload.is_active ? 1 : 0,
  }

  if (payload.type === 'fixed') {
    transformed.fixed_rules = buildFixedRules(payload)
  } else if (payload.type === 'flexible') {
    transformed.flexible_rules = buildFlexibleRules(payload)
  }

  return transformed
}

/**
 * بناء fixed_rules من البيانات
 */
function buildFixedRules(payload: any): any[] {
  const rules: any[] = []
  const allDays = [0, 1, 2, 3, 4, 5, 6]

  if (payload.is_uniform && payload.uniform_fixed) {
    const { working_days, start_time, end_time, grace_period_in_minutes, early_leave_grace_minutes } = payload.uniform_fixed

    allDays.forEach((dayOfWeek) => {
      const isWorkingDay = working_days.includes(dayOfWeek)

      rules.push({
        day_of_week: dayOfWeek,
        period_index: 1,
        start_time: isWorkingDay ? start_time : null,
        end_time: isWorkingDay ? end_time : null,
        grace_period_in_minutes: isWorkingDay ? grace_period_in_minutes : 0,
        early_leave_grace_minutes: isWorkingDay ? early_leave_grace_minutes : 0,
        is_working_day: isWorkingDay ? 1 : 0,
      })
    })
  } else if (!payload.is_uniform && payload.custom_fixed_days) {
    payload.custom_fixed_days.forEach((day: any) => {
      day.periods.forEach((period: any) => {
        rules.push({
          day_of_week: day.day_of_week,
          period_index: period.period_index,
          start_time: day.is_working_day ? period.start_time : null,
          end_time: day.is_working_day ? period.end_time : null,
          grace_period_in_minutes: day.is_working_day ? period.grace_period_in_minutes : 0,
          early_leave_grace_minutes: day.is_working_day ? period.early_leave_grace_minutes : 0,
          is_working_day: day.is_working_day ? 1 : 0,
        })
      })
    })
  }

  return rules
}

/**
 * بناء flexible_rules من البيانات
 */
function buildFlexibleRules(payload: any): any[] {
  const rules: any[] = []
  const allDays = [0, 1, 2, 3, 4, 5, 6]

  if (payload.is_uniform && payload.uniform_flexible) {
    const { working_days, required_hours } = payload.uniform_flexible

    allDays.forEach((dayOfWeek) => {
      const isWorkingDay = working_days.includes(dayOfWeek)

      rules.push({
        day_of_week: dayOfWeek,
        required_hours: isWorkingDay ? required_hours : 0,
        is_working_day: isWorkingDay ? 1 : 0,
      })
    })
  } else if (!payload.is_uniform && payload.custom_flexible_days) {
    payload.custom_flexible_days.forEach((day: any) => {
      rules.push({
        day_of_week: day.day_of_week,
        required_hours: day.is_working_day ? day.required_hours : 0,
        is_working_day: day.is_working_day ? 1 : 0,
      })
    })
  }

  return rules
}

/**
 * استخراج File objects من payload قبل التحويل
 * هذا يحل مشكلة فقدان instanceof File عند تخزين File في reactive objects
 */
function extractFiles(payload: Record<string, any>): { files: Record<string, File>, cleanPayload: Record<string, any> } {
  const files: Record<string, File> = {}
  const cleanPayload: Record<string, any> = {}

  for (const key in payload) {
    const value = payload[key]

    // Check if value is a File instance
    if (value instanceof File) {
      files[key] = value
      // Don't include File in cleanPayload - will be added separately
      continue
    }

    // Check if value is a File-like object (lost instanceof check due to Vue reactivity)
    if (
      value &&
      typeof value === 'object' &&
      value.constructor &&
      (value.constructor.name === 'File' ||
        (typeof value.name === 'string' &&
          typeof value.size === 'number' &&
          typeof value.type === 'string' &&
          typeof value.lastModified === 'number' &&
          typeof value.arrayBuffer === 'function'))
    ) {
      // It's a File object - store it and skip from cleanPayload
      files[key] = value as File
      continue
    }

    // Regular value - include in cleanPayload
    cleanPayload[key] = value
  }

  return { files, cleanPayload }
}

/**
 * معالجة البيانات قبل الإرسال للـ API
 */
export function processPayloadForAPI(payload: Record<string, any> | FormData): FormData {
  if (payload instanceof FormData) {
    return payload
  }

  // Extract File objects before processing
  // This prevents File objects from being converted to nested objects
  const { files, cleanPayload } = extractFiles(payload)

  let processedPayload = convertBooleansToNumbers(cleanPayload)

  // تحويل WorkScheduleForm إذا كانت موجودة
  if (
    processedPayload.type &&
    (processedPayload.uniform_fixed ||
      processedPayload.uniform_flexible ||
      processedPayload.custom_fixed_days ||
      processedPayload.custom_flexible_days)
  ) {
    processedPayload = transformWorkSchedulePayload(processedPayload)
  }

  // Convert to FormData
  const formData = toFormData(processedPayload)

  // Add File objects directly to FormData (not nested)
  for (const key in files) {
    const file = files[key]
    if (file) {
      formData.append(key, file)
    }
  }

  return formData
}
