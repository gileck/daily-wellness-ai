export const name = 'trackedActivities';
export const API_CREATE_TRACKED_ACTIVITY = 'trackedActivities/create';
export const API_GET_TRACKED_ACTIVITIES = 'trackedActivities/list';

// Re-export types for convenience
export * from './types';
// Specific API names are now defined here, no longer re-exporting from server.ts for these names 