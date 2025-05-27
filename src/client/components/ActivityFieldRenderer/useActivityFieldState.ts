import { useState, useCallback } from 'react';
import { ActivityTypeClient } from '@/apis/activity/types';
import { ActivityFieldValue, ActivityFieldState } from './types';

interface UseActivityFieldStateOptions {
    activityType: ActivityTypeClient | null;
    initialValues?: Record<string, unknown>;
}

export const useActivityFieldState = ({
    activityType,
    initialValues = {}
}: UseActivityFieldStateOptions) => {
    const [fieldState, setFieldState] = useState<ActivityFieldState>(() => {
        if (!activityType) return {};

        const initialState: ActivityFieldState = {};
        
        activityType.fields.forEach(field => {
            if (initialValues && field.name in initialValues) {
                const fieldValue = initialValues[field.name] as ActivityFieldValue;

                // Keep the value as-is, let the renderer handle format conversion

                initialState[field.name] = fieldValue;
            } else {
                // Set default values based on field type
                if (field.fieldType === 'Boolean') {
                    initialState[field.name] = false;
                } else if (field.fieldType === 'Foods') {
                    initialState[field.name] = [];
                } else {
                    initialState[field.name] = '';
                }
            }
        });

        return initialState;
    });

    const updateField = useCallback((fieldName: string, value: ActivityFieldValue) => {
        setFieldState(prev => ({ ...prev, [fieldName]: value }));
    }, []);

    const resetFields = useCallback((newInitialValues: Record<string, unknown> = {}) => {
        if (!activityType) {
            setFieldState({});
            return;
        }

        const newState: ActivityFieldState = {};
        
        activityType.fields.forEach(field => {
            if (newInitialValues && field.name in newInitialValues) {
                const fieldValue = newInitialValues[field.name] as ActivityFieldValue;

                // Keep the value as-is, let the renderer handle format conversion

                newState[field.name] = fieldValue;
            } else {
                if (field.fieldType === 'Boolean') {
                    newState[field.name] = false;
                } else if (field.fieldType === 'Foods') {
                    newState[field.name] = [];
                } else {
                    newState[field.name] = '';
                }
            }
        });

        setFieldState(newState);
    }, [activityType]);

    const validateFields = useCallback(() => {
        if (!activityType) return { isValid: false, errors: [] };

        const errors: string[] = [];

        for (const field of activityType.fields) {
            if (field.required) {
                const value = fieldState[field.name];
                
                if (value === '' || value === null || value === undefined) {
                    if (field.fieldType === 'Boolean' && typeof value === 'boolean' && value === false) {
                        continue; // Boolean false is valid for required boolean fields
                    }
                    if (field.fieldType === 'Foods' && Array.isArray(value) && value.length === 0) {
                        errors.push(`Field '${field.name}' is required.`);
                        continue;
                    }
                    if (field.fieldType !== 'Foods') {
                        errors.push(`Field '${field.name}' is required.`);
                        continue;
                    }
                }
            }

            // Validate number fields
            if (field.fieldType === 'Number' && fieldState[field.name] !== '' && 
                typeof fieldState[field.name] === 'number' && 
                isNaN(fieldState[field.name] as number)) {
                errors.push(`Field '${field.name}' must be a number.`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [activityType, fieldState]);

    // Convert field state to the format expected by the API
    const getFieldValuesForSubmission = useCallback(() => {
        if (!activityType) return [];

        return activityType.fields.map(field => ({
            fieldName: field.name,
            value: fieldState[field.name],
        }));
    }, [activityType, fieldState]);

    return {
        fieldState,
        updateField,
        resetFields,
        validateFields,
        getFieldValuesForSubmission
    };
}; 