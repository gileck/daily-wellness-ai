import { useCallback } from 'react';
import { ServingSize } from '@/server/database/collections/foods/types';
import { useCustomFoodForm } from './useCustomFoodForm';
import { CustomFoodFormData } from '../types';

export const useCustomFoodDialog = (onFoodCreated: () => void, onClose: () => void) => {
    // Initialize the form hook
    const formHooks = useCustomFoodForm(onFoodCreated, onClose);

    // Handler for AI data generation
    const handleAIDataGenerated = useCallback((data: Partial<CustomFoodFormData>) => {
        formHooks.updateFormData(data);
    }, [formHooks.updateFormData]);

    // Handler for adding servings
    const handleAddServing = useCallback((serving: ServingSize) => {
        const updatedServings = [...formHooks.formData.commonServings, serving];
        formHooks.updateFormData({ commonServings: updatedServings });
    }, [formHooks.formData.commonServings, formHooks.updateFormData]);

    // Handler for removing servings
    const handleRemoveServing = useCallback((index: number) => {
        const updatedServings = formHooks.formData.commonServings.filter((_, i) => i !== index);
        formHooks.updateFormData({ commonServings: updatedServings });
    }, [formHooks.formData.commonServings, formHooks.updateFormData]);

    // Enhanced close handler that resets all state
    const handleClose = useCallback(() => {
        formHooks.handleReset();
        onClose();
    }, [formHooks.handleReset, onClose]);

    // Determine if any operation is in progress
    const isAnyOperationInProgress = formHooks.isLoading;

    return {
        // Form data and state
        formData: formHooks.formData,
        isLoading: formHooks.isLoading,
        error: formHooks.error,
        isValid: formHooks.isValid,
        isAnyOperationInProgress,

        // Form handlers
        handleInputChange: formHooks.handleInputChange,
        handleNutritionChange: formHooks.handleNutritionChange,
        handleSubmit: formHooks.handleSubmit,
        handleClose,

        // AI generation handler
        handleAIDataGenerated,

        // Servings handlers
        handleAddServing,
        handleRemoveServing,

        // Error handling
        setError: formHooks.setError,
    };
}; 