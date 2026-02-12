import type { ApiResponse } from "~/types/api"
import { processPayloadForAPI } from "./payloadTransformers"

export async function createResource<T>({
  endpoint,
  payload,
  onSuccess,
  successMessage,
  toast,
}: {
  endpoint: string
  payload: Record<string, any> | FormData
  onSuccess?: (data: T) => void
  successMessage?: string
  toast: any
}): Promise<T> {

  const formData = processPayloadForAPI(payload)

  try {
    const res = await $fetch<ApiResponse<T>>(endpoint, {
      method: 'POST',
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
