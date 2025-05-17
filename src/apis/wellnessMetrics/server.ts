export * from './index'; // Re-export API names

import {
    API_CREATE_WELLNESS_METRIC,
    API_GET_WELLNESS_METRICS,
    API_GET_WELLNESS_METRIC_BY_ID,
    API_UPDATE_WELLNESS_METRIC,
    API_DELETE_WELLNESS_METRIC,
} from './index';

import { process as createWellnessMetricProcess } from './handlers/createWellnessMetricHandler';
import { process as getWellnessMetricsProcess } from './handlers/getWellnessMetricsHandler';
import { process as getWellnessMetricByIdProcess } from './handlers/getWellnessMetricByIdHandler';
import { process as updateWellnessMetricProcess } from './handlers/updateWellnessMetricHandler';
import { process as deleteWellnessMetricProcess } from './handlers/deleteWellnessMetricHandler';

export const wellnessMetricsApiHandlers = {
    [API_CREATE_WELLNESS_METRIC]: { process: createWellnessMetricProcess },
    [API_GET_WELLNESS_METRICS]: { process: getWellnessMetricsProcess },
    [API_GET_WELLNESS_METRIC_BY_ID]: { process: getWellnessMetricByIdProcess },
    [API_UPDATE_WELLNESS_METRIC]: { process: updateWellnessMetricProcess },
    [API_DELETE_WELLNESS_METRIC]: { process: deleteWellnessMetricProcess },
}; 