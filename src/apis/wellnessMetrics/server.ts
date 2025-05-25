export * from './index'; // Re-export API names

import {
    API_CREATE_WELLNESS_METRIC,
    API_GET_WELLNESS_METRICS,
    API_GET_WELLNESS_METRIC_BY_ID,
    API_UPDATE_WELLNESS_METRIC,
    API_DELETE_WELLNESS_METRIC,
    API_TRACK_WELLNESS_METRIC,
    API_GET_WELLNESS_METRIC_RECORDS,
    API_UPDATE_WELLNESS_METRIC_RECORD,
    API_DELETE_WELLNESS_METRIC_RECORD,
} from './index';

import { process as createWellnessMetricProcess } from './handlers/createWellnessMetricHandler';
import { process as getWellnessMetricsProcess } from './handlers/getWellnessMetricsHandler';
import { process as getWellnessMetricByIdProcess } from './handlers/getWellnessMetricByIdHandler';
import { process as updateWellnessMetricProcess } from './handlers/updateWellnessMetricHandler';
import { process as deleteWellnessMetricProcess } from './handlers/deleteWellnessMetricHandler';
import { process as trackWellnessMetricProcess } from './handlers/trackWellnessMetricHandler';
import { process as getWellnessMetricRecordsProcess } from './handlers/getWellnessMetricRecordsHandler';
import { process as updateWellnessMetricRecordProcess } from './handlers/updateWellnessMetricRecordHandler';
import { process as deleteWellnessMetricRecordProcess } from './handlers/deleteWellnessMetricRecordHandler';

export const wellnessMetricsApiHandlers = {
    [API_CREATE_WELLNESS_METRIC]: { process: createWellnessMetricProcess },
    [API_GET_WELLNESS_METRICS]: { process: getWellnessMetricsProcess },
    [API_GET_WELLNESS_METRIC_BY_ID]: { process: getWellnessMetricByIdProcess },
    [API_UPDATE_WELLNESS_METRIC]: { process: updateWellnessMetricProcess },
    [API_DELETE_WELLNESS_METRIC]: { process: deleteWellnessMetricProcess },
    [API_TRACK_WELLNESS_METRIC]: { process: trackWellnessMetricProcess },
    [API_GET_WELLNESS_METRIC_RECORDS]: { process: getWellnessMetricRecordsProcess },
    [API_UPDATE_WELLNESS_METRIC_RECORD]: { process: updateWellnessMetricRecordProcess },
    [API_DELETE_WELLNESS_METRIC_RECORD]: { process: deleteWellnessMetricRecordProcess },
}; 