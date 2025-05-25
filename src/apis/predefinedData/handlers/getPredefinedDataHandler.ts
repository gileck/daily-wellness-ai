import { ApiHandlerContext } from '../../types';
import { GetPredefinedDataResponse, PredefinedData } from '../types';

// Embed predefined data directly to avoid file system issues in deployment
const PREDEFINED_DATA: PredefinedData = {
    "predefinedActivityTypes": [
        {
            "id": "sleep_basic",
            "name": "Sleep",
            "type": "sleep",
            "description": "Track your sleep duration and quality.",
            "fields": [
                {
                    "name": "Duration (hours)",
                    "fieldType": "Number",
                    "min": 0,
                    "max": 24
                },
                {
                    "name": "Quality (1-5)",
                    "fieldType": "Number",
                    "min": 1,
                    "max": 5
                }
            ],
            "isPredefined": true,
            "defaultEnabled": true
        },
        {
            "id": "meal_generic",
            "name": "Meal",
            "type": "meal",
            "description": "Log your meals and water intake.",
            "fields": [
                {
                    "name": "Description",
                    "fieldType": "Text"
                },
                {
                    "name": "Calories (kcal)",
                    "fieldType": "Number",
                    "min": 0
                },
                {
                    "name": "Water Intake (ml)",
                    "fieldType": "Number",
                    "min": 0
                }
            ],
            "isPredefined": true,
            "defaultEnabled": true
        },
        {
            "id": "workout_general",
            "name": "General Workout",
            "type": "workout",
            "description": "Track your physical activity.",
            "fields": [
                {
                    "name": "Duration (minutes)",
                    "fieldType": "Number",
                    "min": 0
                },
                {
                    "name": "Intensity (1-5)",
                    "fieldType": "Number",
                    "min": 1,
                    "max": 5
                },
                {
                    "name": "Type of Workout",
                    "fieldType": "Text"
                }
            ],
            "isPredefined": true,
            "defaultEnabled": true
        },
        {
            "id": "meditation_basic",
            "name": "Meditation",
            "type": "mindfulness",
            "description": "Track your meditation sessions.",
            "fields": [
                {
                    "name": "Duration (minutes)",
                    "fieldType": "Number",
                    "min": 0
                }
            ],
            "isPredefined": true,
            "defaultEnabled": false
        }
    ],
    "predefinedWellnessMetrics": [
        {
            "id": "energy_level",
            "name": "Energy Level (1-10)",
            "isPredefined": true,
            "defaultEnabled": true
        },
        {
            "id": "mood_rating",
            "name": "Mood (1-10)",
            "isPredefined": true,
            "defaultEnabled": true
        },
        {
            "id": "stress_level",
            "name": "Stress Level (1-10)",
            "isPredefined": true,
            "defaultEnabled": true
        },
        {
            "id": "fatigue_level",
            "name": "Fatigue Level (1-10)",
            "isPredefined": true,
            "defaultEnabled": false
        },
        {
            "id": "pain_level",
            "name": "Pain Level (1-10)",
            "isPredefined": true,
            "defaultEnabled": false
        }
    ]
};

export const process = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _payload: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ApiHandlerContext // Context not used for this public data endpoint
): Promise<GetPredefinedDataResponse> => {
    try {
        return PREDEFINED_DATA;
    } catch (error) {
        console.error('Error loading predefined data:', error);
        throw new Error('Could not load predefined configuration data.');
    }
}; 