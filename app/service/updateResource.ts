// ~/service/updateResource.ts
import type { ApiResponse } from "~/types/api"
import { processPayloadForAPI } from "./payloadTransformers"

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
  const formData = processPayloadForAPI(payload)

  try {
    const res = await $fetch<ApiResponse<T>>(endpoint, {
      method,
      body: formData,
      credentials: 'include', // Required for Sanctum SPA cookies
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
