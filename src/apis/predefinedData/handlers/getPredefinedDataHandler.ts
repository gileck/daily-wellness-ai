import fs from 'fs/promises';
import path from 'path';
import { ApiHandlerContext } from '../../types';
import { GetPredefinedDataResponse, PredefinedData } from '../types';

// Use global.process.cwd() to avoid ambiguity with a potential local 'process' variable or function parameter
const PREDEFINED_DATA_PATH = path.resolve(global.process.cwd(), 'src/server/data/predefinedActivityAndMetricTypes.json');

export const process = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _payload: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ApiHandlerContext // Context not used for this public data endpoint
): Promise<GetPredefinedDataResponse> => {
    try {
        const fileContent = await fs.readFile(PREDEFINED_DATA_PATH, 'utf-8');
        const jsonData: PredefinedData = JSON.parse(fileContent);
        return jsonData;
    } catch (error) {
        console.error('Error reading predefined data file:', error);
        // In a real app, you might want a more structured error response
        // or ensure the file always exists, perhaps by a build step.
        throw new Error('Could not load predefined configuration data.');
    }
}; 