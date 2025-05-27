import { ActivityTypeField } from '@/apis/activity/types';
import { FoodPortion } from '@/client/components/FoodSelectionDialog/types';

// Union type for all possible field values
export type ActivityFieldValue = string | number | boolean | Date | null | string[] | FoodPortion[] | unknown;

// State for managing activity fields
export interface ActivityFieldState {
    [fieldName: string]: ActivityFieldValue;
}

// Props for the field renderer component
export interface ActivityFieldRendererProps {
    field: ActivityTypeField;
    value: ActivityFieldValue;
    onChange: (fieldName: string, value: ActivityFieldValue) => void;
    onFoodSelection?: (fieldName: string) => void;
    foodsCache?: Map<string, unknown>;
    error?: boolean;
    activityColor?: string;
} 