// composables/useFormModel.ts
import { computed, type Ref } from "vue"

export function useFormModel<T>(
  modelValue: Ref<T>,
  emit: (event: "update:modelValue", value: T) => void,
) {
  return computed<T>({
    get: () => modelValue.value,
    set: (value) => emit("update:modelValue", value),
  })
}
