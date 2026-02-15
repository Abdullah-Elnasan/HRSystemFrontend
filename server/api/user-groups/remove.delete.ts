// ~/server/api/user-groups/permissions/remove.delete.ts
import { createJsonHandler } from '../../utils/createJsonHandler'

export default createJsonHandler('/user-groups/permissions/remove', 'DELETE')
