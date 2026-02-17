// utils/toFormData.ts
export function toFormData(
  data: Record<string, any>,
  formData = new FormData(),
  parentKey?: string
): FormData {
  for (const key in data) {
    const value = data[key]
    const formKey = parentKey ? `${parentKey}[${key}]` : key

    if (value === null || value === undefined) continue

    if (value instanceof File || value instanceof Blob) {
      formData.append(formKey, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(`${formKey}[${index}]`, item)
        } else if (typeof item === 'object' && item !== null) {
          toFormData(item, formData, `${formKey}[${index}]`)
        } else {
          formData.append(`${formKey}[${index}]`, String(item))
        }
      })
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      toFormData(value, formData, formKey)
    } else if (value instanceof Date) {
      formData.append(formKey, value.toISOString())
    } else if (typeof value === 'boolean') {
      formData.append(formKey, value ? '1' : '0')
    } else {
      formData.append(formKey, String(value))
    }
  }

  return formData
}
