// /**
//  * Deletes an item from a store with rollback on error.
//  * @param id Item ID
//  * @param store Store object that contains 'branches' array and 'removeEmployee' method
//  * @param deleteFn Async delete function (e.g., API call)
//  */
// export async function deleteWithRollback<T>(
//   id: number,
//   store: { branches: T[]; removeBranch?: (id: number) => void },
//   deleteFn: () => Promise<void>
// ) {
//   const snapshot = [...store.branches];
//   store.removeBranch?.(id);

//   try {
//     await deleteFn();
//   } catch {
//     // Rollback on error
//     store.branches = snapshot;
//   }
// }
