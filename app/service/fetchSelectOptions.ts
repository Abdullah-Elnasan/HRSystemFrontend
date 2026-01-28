/**
 * Service functions to fetch select menu options
 * Uses native fetch to avoid Nuxt caching issues
 */

/**
 * Fetch departments list for select menu
 * @param searchQuery - Optional search query for filtering
 */
export async function fetchDepartmentsList(searchQuery?: string): Promise<any[]> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const uniqueParam = `_dep_${timestamp}_${random}`;
  const searchParam = searchQuery ? `&filter[search]=${encodeURIComponent(searchQuery)}` : '';

  console.log(`[fetchDepartmentsList] Calling with uniqueParam: ${uniqueParam}`);

  const response = await fetch(`/api/departments/departments?${uniqueParam}=1${searchParam}`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'X-Request-ID': `departments-${Date.now()}-${Math.random()}`,
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch departments: HTTP ${response.status}`);
  }

  const res: any = await response.json();

  console.log(`[fetchDepartmentsList] Response received, data length: ${res?.data?.length ?? 0}, first item:`, res?.data?.[0]);

  if (!res || !res.data) {
    throw new Error('Invalid response format from departments API');
  }

  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Fetch branches list for select menu
 * @param searchQuery - Optional search query for filtering
 */
export async function fetchBranchesList(searchQuery?: string): Promise<any[]> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const uniqueParam = `_br_${timestamp}_${random}`;
  const searchParam = searchQuery ? `&filter[search]=${encodeURIComponent(searchQuery)}` : '';

  console.log(`[fetchBranchesList] Calling with uniqueParam: ${uniqueParam}`);

  const response = await fetch(`/api/branches/branches?${uniqueParam}=1${searchParam}`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'X-Request-ID': `branches-${Date.now()}-${Math.random()}`,
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch branches: HTTP ${response.status}`);
  }

  const res: any = await response.json();

  console.log(`[fetchBranchesList] Response received, data length: ${res?.data?.length ?? 0}, first item:`, res?.data?.[0]);

  if (!res || !res.data) {
    throw new Error('Invalid response format from branches API');
  }

  return Array.isArray(res.data) ? res.data : [];
}

