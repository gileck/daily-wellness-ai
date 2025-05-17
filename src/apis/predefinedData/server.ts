export * from './index'; // Re-export API names

import { API_GET_PREDEFINED_DATA } from './index';
import { process as getPredefinedDataProcess } from './handlers/getPredefinedDataHandler';

export const predefinedDataApiHandlers = {
    [API_GET_PREDEFINED_DATA]: { process: getPredefinedDataProcess },
}; 