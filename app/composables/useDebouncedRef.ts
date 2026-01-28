import { ref, watch, type Ref } from 'vue';

/**
 * Creates a debounced ref that updates after a specified delay.
 * @param source The original ref to debounce
 * @param delay Delay in milliseconds (default 400ms)
 * @returns A new debounced ref
 */
export function useDebouncedRef<T>(source: Ref<T>, delay = 400) {
  const debounced = ref(source.value) as Ref<T>;
  let timer: ReturnType<typeof setTimeout> | null = null;

  watch(source, (val) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => (debounced.value = val), delay);
  });

  return debounced;
}
