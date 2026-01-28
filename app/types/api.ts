export type FetchListOptions = {
  endpoint: string
  page?: number
  perPage?: number
  search?: string
  signal?: AbortSignal
}

export interface ApiResponse<T> {
  data: T
  message?: string
  messageAr?: string
  status?: boolean
}

