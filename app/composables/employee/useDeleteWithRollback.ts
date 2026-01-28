// /**
//  * Deletes an item from a store with rollback on error.
//  * @param id Item ID
//  * @param store Store object that contains 'employees' array and 'removeEmployee' method
//  * @param deleteFn Async delete function (e.g., API call)
//  */
// export async function deleteWithRollback<T>(
//   id: number,
//   store: { employees: T[]; removeEmployee?: (id: number) => void },
//   deleteFn: () => Promise<void>
// ) {
//   const snapshot = [...store.employees];
//   store.removeEmployee?.(id);

//   try {
//     await deleteFn();
//   } catch {
//     // Rollback on error
//     store.employees = snapshot;
//   }
// }
