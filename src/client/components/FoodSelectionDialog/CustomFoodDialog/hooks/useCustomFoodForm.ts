import { useState, useCallback } from 'react';
import { createFood } from '@/apis/foods/client';
import { CreateFoodRequest } from '@/apis/foods/types';
import { FoodCategory, NutritionInfo, ServingSize } from '@/server/database/collections/foods/types';
import { DEFAULT_NUTRITION } from '@/common/utils/foodUtils';
import { CustomFoodFormData } from '../types';

interface FormState {
    formData: CustomFoodFormData;
    isLoading: boolean;
    error: string | null;
}

const getDefaultFormState = (): FormState => ({
    formData: {
        name: '',
        brand: '',
        category: '',
        categorySimplified: '',
        nutritionPer100g: { ...DEFAULT_NUTRITION } as NutritionInfo,
        commonServings: [] as ServingSize[],
    },
    isLoading: false,
    error: null,
});

export const useCustomFoodForm = (onFoodCreated: () => void, onClose: () => void) => {
    const [state, setState] = useState<FormState>(getDefaultFormState());

    const updateState = useCallback((partialState: Partial<FormState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    const updateFormData = useCallback((partialFormData: Partial<CustomFoodFormData>) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, ...partialFormData }
        }));
    }, []);

    const handleInputChange = useCallback((field: keyof CustomFoodFormData, value: string | FoodCategory) => {
        updateFormData({ [field]: value });
    }, [updateFormData]);

    const handleNutritionChange = useCallback((field: keyof NutritionInfo, value: number) => {
        setState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                nutritionPer100g: { ...prev.formData.nutritionPer100g, [field]: value }
            }
        }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        updateState({ isLoading: true, error: null });

        try {
            const createData: CreateFoodRequest = {
                name: state.formData.name,
                brand: state.formData.brand || undefined,
                category: state.formData.category,
                categorySimplified: state.formData.categorySimplified || undefined,
                nutritionPer100g: state.formData.nutritionPer100g,
                commonServings: state.formData.commonServings,
            };

            const result = await createFood(createData);

            if (result.data?.error) {
                updateState({ error: result.data.error, isLoading: false });
            } else {
                onFoodCreated();
                handleReset();
                onClose();
            }
        } catch (err) {
            updateState({ error: 'Failed to create food', isLoading: false });
            console.error('Error creating food:', err);
        }
    }, [state.formData, onFoodCreated, onClose, updateState]);

    const handleReset = useCallback(() => {
        setState(getDefaultFormState());
    }, []);

    const isValid = state.formData.name && state.formData.category && state.formData.nutritionPer100g.calories >= 0;

    return {
        formData: state.formData,
        isLoading: state.isLoading,
        error: state.error,
        isValid,
        handleInputChange,
        handleNutritionChange,
        handleSubmit,
        handleReset,
        updateFormData,
        setError: (error: string | null) => updateState({ error }),
    };
}; 