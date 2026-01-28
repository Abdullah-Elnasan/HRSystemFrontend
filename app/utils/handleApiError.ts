export function handleApiError(
  error: any,
  toast: ReturnType<typeof useToast>
) {
  const data =
    error?.data ||
    error?.response?._data ||
    error

  // 🔴 Validation Errors
  if (data?.data?.errors && Array.isArray(data.data.errors)) {
    toast.add({
      title: 'خطأ في الإدخال',
      description: data.data.errors.join(' • '),
      color: 'error',
    })
    return
  }

  // 🔴 Error برسالة واضحة
  if (data?.messageAr || data?.messageEn) {
    toast.add({
      title: data.messageAr ?? 'حدث خطأ غير متوقع',
      description: data.messageEn,
      color: 'error',
    })
    return
  }

  // 🔴 Fallback
  toast.add({
    title: 'حدث خطأ غير متوقع',
    color: 'error',
  })
}
