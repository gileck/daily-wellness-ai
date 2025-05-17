export * from './index'; // Re-export API names and other exports from index.ts
import {
    API_CREATE_ACTIVITY_TYPE,
    API_GET_ACTIVITY_TYPES,
    API_UPDATE_ACTIVITY_TYPE,
    API_DELETE_ACTIVITY_TYPE,
    API_ADD_ACTIVITY,
    API_GET_ACTIVITIES,
    API_GET_ACTIVITY_BY_ID,
    API_UPDATE_ACTIVITY,
    API_DELETE_ACTIVITY,
} from './index'; // Import API names from the current directory's index.ts

// Import individual handler process functions
import { process as createActivityTypeProcess } from './handlers/createActivityTypeHandler';
import { process as getActivityTypesProcess } from './handlers/getActivityTypesHandler';
import { process as updateActivityTypeProcess } from './handlers/updateActivityTypeHandler';
import { process as deleteActivityTypeProcess } from './handlers/deleteActivityTypeHandler';
import { process as addActivityProcess } from './handlers/addActivityHandler';
import { process as getActivitiesProcess } from './handlers/getActivitiesHandler';
import { process as getActivityByIdProcess } from './handlers/getActivityByIdHandler';
import { process as updateActivityProcess } from './handlers/updateActivityHandler';
import { process as deleteActivityProcess } from './handlers/deleteActivityHandler';

// ===== ActivityType Handlers =====

// ===== Activity Handlers =====

export const activityApiHandlers = {
    [API_CREATE_ACTIVITY_TYPE]: { process: createActivityTypeProcess },
    [API_GET_ACTIVITY_TYPES]: { process: getActivityTypesProcess },
    [API_UPDATE_ACTIVITY_TYPE]: { process: updateActivityTypeProcess },
    [API_DELETE_ACTIVITY_TYPE]: { process: deleteActivityTypeProcess },
    [API_ADD_ACTIVITY]: { process: addActivityProcess },
    [API_GET_ACTIVITIES]: { process: getActivitiesProcess },
    [API_GET_ACTIVITY_BY_ID]: { process: getActivityByIdProcess },
    [API_UPDATE_ACTIVITY]: { process: updateActivityProcess },
    [API_DELETE_ACTIVITY]: { process: deleteActivityProcess },
}; 