// export function handleApiError(
//   error: any,
//   toast: ReturnType<typeof useToast>
// ) {
//   const data =
//     error?.data ||
//     error?.response?._data ||
//     error

//   // 🔴 Validation Errors
//   if (data?.data?.errors && Array.isArray(data.data.errors)) {
//     toast.add({
//       title: 'خطأ في الإدخال',
//       description: data.data.errors.join(' • '),
//       color: 'error',
//     })
//     return
//   }

//   // 🔴 Error برسالة واضحة
//   if (data?.messageAr || data?.messageEn) {
//     toast.add({
//       title: data.messageAr ?? 'حدث خطأ غير متوقع',
//       description: data.messageEn,
//       color: 'error',
//     })
//     return
//   }

//   // 🔴 Fallback
//   toast.add({
//     title: 'حدث خطأ غير متوقع',
//     color: 'error',
//   })
// }


// ~/utils/handleApiError.ts
export function handleApiError(error: any, toast: ReturnType<typeof useToast>) {
  console.error('handleApiError:', error)

  const data = error?.data || error?.response?._data || error

  // 🔴 معالجة errors array مباشرة من الاستجابة
  if (data?.errors && Array.isArray(data.errors)) {
    toast.add({
      title: data.messageAr || 'خطأ في العملية',
      description: data.errors.join(' • '),
      color: 'error',
    })
    return
  }

  // 🔴 Validation Errors (object format - Laravel)
  if (data?.errors && typeof data.errors === 'object') {
    const errorMessages = Object.values(data.errors).flat().join(' • ')
    toast.add({
      title: data.messageAr || 'خطأ في الإدخال',
      description: errorMessages,
      color: 'error',
    })
    return
  }

  // 🔴 Nested errors في data.data
  if (data?.data?.errors && Array.isArray(data.data.errors)) {
    toast.add({
      title: data.data.messageAr || data.messageAr || 'خطأ في العملية',
      description: data.data.errors.join(' • '),
      color: 'error',
    })
    return
  }

  // 🔴 Nested errors (object) في data.data
  if (data?.data?.errors && typeof data.data.errors === 'object') {
    const errorMessages = Object.values(data.data.errors).flat().join(' • ')
    toast.add({
      title: data.data.messageAr || data.messageAr || 'خطأ في الإدخال',
      description: errorMessages,
      color: 'error',
    })
    return
  }

  // 🔴 Error برسالة واضحة
  if (data?.messageAr || data?.messageEn) {
    toast.add({
      title: data.messageAr ?? 'حدث خطأ',
      description: data.messageEn,
      color: 'error',
    })
    return
  }

  // 🔴 Error من data.data (nested)
  if (data?.data?.messageAr || data?.data?.messageEn) {
    toast.add({
      title: data.data.messageAr ?? 'حدث خطأ',
      description: data.data.messageEn,
      color: 'error',
    })
    return
  }

  // 🔴 statusMessage من h3 errors
  if (error?.statusMessage) {
    toast.add({
      title: 'خطأ',
      description: error.statusMessage,
      color: 'error',
    })
    return
  }

  // 🔴 Fallback
  toast.add({
    title: 'حدث خطأ غير متوقع',
    description: error?.message || undefined,
    color: 'error',
  })
}
