import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';

/**
 * Updates the route query parameters, removing undefined values.
 * @param router Vue router instance
 * @param route Current route
 * @param newQuery Partial query object to update
 */
export function updateQuery(
  router: Router,
  route: RouteLocationNormalizedLoaded,
  newQuery: Record<string, any>
) {
  router.push({
    query: {
      ...route.query,
      ...Object.fromEntries(
        Object.entries(newQuery).filter(([_, v]) => v !== undefined)
      )
    }
  });
}
