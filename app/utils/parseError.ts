// دالة مركزية لمعالجة الأخطاء في كل التطبيق
export function parseError(error: unknown): string {
  if (error instanceof Error) return error.message

  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, any>
    return err?.data?.message ?? err?.message ?? 'حدث خطأ غير متوقع'
  }

  return 'حدث خطأ غير متوقع'
}
