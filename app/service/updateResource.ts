import type { ApiResponse } from "~/types/api"

export async function updateResource<T>({
  endpoint,
  payload,
  toast,
  onSuccess,
  successMessage,
  method = 'PUT',
}: {
  endpoint: string
  payload: Record<string, any> | FormData
  toast: ReturnType<typeof useToast>
  onSuccess?: (data: T) => void
  successMessage?: string
  method?: 'PUT' | 'PATCH'
}): Promise<T> {
  const formData = payload instanceof FormData ? payload : toFormData(payload)

  try {
    const res = await $fetch<ApiResponse<T>>(endpoint, {
      method,
      body: formData,
    })

    const data = res.data

    if (onSuccess) {
      onSuccess(data)
    }

    toast.add({
      title: successMessage ?? res.messageAr ?? res.message,
      color: 'success',
    })

    return data
  } catch (error) {
    handleApiError(error, toast)
    throw error
  }
}
