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

    if (value instanceof File) {
      formData.append(formKey, value)
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        formData.append(`${formKey}[${i}]`, v)
      })
    } else if (typeof value === 'object') {
      toFormData(value, formData, formKey)
    } else {
      formData.append(formKey, String(value))
    }
  }

  return formData
}
