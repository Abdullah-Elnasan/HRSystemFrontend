// ~/service/assignResource.ts
import type { ApiResponse } from "~/types/api"

export async function assignResource<T>({
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
  try {
    const res = await $fetch<ApiResponse<T>>(endpoint, {
      method: 'POST',
      body: payload,
      credentials: 'include',
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
  } catch (error: any) {
    handleApiError(error, toast)
    throw error
  }
}

export async function removeResource<T>({
  endpoint,
  payload,
  onSuccess,
  successMessage,
  toast,
}: {
  endpoint: string
  payload: Record<string, any>
  onSuccess?: (data: T) => void
  successMessage?: string
  toast: any
}): Promise<T> {
  try {
    const res = await $fetch<ApiResponse<T>>(endpoint, {
      method: 'DELETE',
      body: payload,
      credentials: 'include',
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
  } catch (error: any) {
    handleApiError(error, toast)
    throw error
  }
}
