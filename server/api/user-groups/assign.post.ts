// ~/server/api/user-groups/permissions.post.ts
import { createJsonHandler } from '../../utils/createJsonHandler'

export default createJsonHandler('/user-groups/permissions/assign', 'POST')
