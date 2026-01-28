// composables/useServerList.ts
export function useServerList<T>(endpoint: string) {
  const rows = ref<T[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetch(params: Record<string, any>) {
    loading.value = true
    error.value = null

    try {
      const res = await $fetch<{
        data: T[]
        meta: { total: number }
      }>(endpoint, { query: params })

      rows.value = res.data
      total.value = res.meta.total
    } catch (e: any) {
      error.value = e?.data?.message ?? 'Failed to load data'
    } finally {
      loading.value = false
    }
  }

  return {
    rows,
    total,
    loading,
    error,
    fetch,
  }
}
