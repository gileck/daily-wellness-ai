import { useState, useEffect, useCallback } from 'react';
import { generateFoodData } from '@/apis/foods/client';
import { getAllModels } from '@/server/ai/models';
import { CustomFoodFormData } from '../types';

interface AIState {
    showAISection: boolean;
    isGenerating: boolean;
    aiDescription: string;
    aiContext: string;
    selectedModel: string;
    lastGenerationCost: number | null;
    hasGeneratedData: boolean;
    showAdditionalContext: boolean;
    error: string | null;
}

const getDefaultAIState = (): AIState => ({
    showAISection: false,
    isGenerating: false,
    aiDescription: '',
    aiContext: '',
    selectedModel: 'gpt-4o-mini',
    lastGenerationCost: null,
    hasGeneratedData: false,
    showAdditionalContext: false,
    error: null,
});

export const useAIGeneration = (onDataGenerated: (data: Partial<CustomFoodFormData>) => void) => {
    const [state, setState] = useState<AIState>(getDefaultAIState());

    const availableModels = getAllModels();

    const updateState = useCallback((partialState: Partial<AIState>) => {
        setState(prev => ({ ...prev, ...partialState }));
    }, []);

    // Load model preference from localStorage
    useEffect(() => {
        const savedModel = localStorage.getItem('preferredAIModel');
        if (savedModel && availableModels.some(model => model.id === savedModel)) {
            updateState({ selectedModel: savedModel });
        }
    }, [availableModels, updateState]);

    const handleAIGenerate = useCallback(async () => {
        if (!state.aiDescription.trim()) {
            updateState({ error: 'Please enter a food description' });
            return;
        }

        updateState({ isGenerating: true, error: null });

        // If this is a regeneration, clear previous data
        if (state.hasGeneratedData) {
            updateState({ hasGeneratedData: false, lastGenerationCost: null });
        }

        try {
            const result = await generateFoodData({
                foodDescription: state.aiDescription.trim(),
                additionalContext: state.aiContext.trim() || undefined,
                modelId: state.selectedModel
            });

            if (result.data?.error) {
                updateState({ error: result.data.error, isGenerating: false });
            } else if (result.data?.suggestedFood) {
                const suggestedFood = result.data.suggestedFood;
                
                // Populate form with AI-generated data
                const generatedData: Partial<CustomFoodFormData> = {
                    name: suggestedFood.name,
                    brand: suggestedFood.brand || '',
                    category: suggestedFood.category,
                    categorySimplified: suggestedFood.categorySimplified || '',
                    nutritionPer100g: suggestedFood.nutritionPer100g,
                    commonServings: suggestedFood.commonServings
                };

                onDataGenerated(generatedData);

                updateState({
                    lastGenerationCost: result.data.aiCost.totalCost,
                    hasGeneratedData: true,
                    isGenerating: false
                });

                // Save model preference
                localStorage.setItem('preferredAIModel', state.selectedModel);
            }
        } catch (err) {
            updateState({ error: 'Failed to generate food data', isGenerating: false });
            console.error('Error generating food data:', err);
        }
    }, [state.aiDescription, state.aiContext, state.selectedModel, state.hasGeneratedData, onDataGenerated, updateState]);

    const handleCloseAI = useCallback(() => {
        setState(getDefaultAIState());
    }, []);

    const handleShowAISection = useCallback(() => {
        updateState({ showAISection: true });
    }, [updateState]);

    const handleModelChange = useCallback((modelId: string) => {
        updateState({ selectedModel: modelId });
    }, [updateState]);

    const handleDescriptionChange = useCallback((description: string) => {
        updateState({ aiDescription: description });
    }, [updateState]);

    const handleContextChange = useCallback((context: string) => {
        updateState({ aiContext: context });
    }, [updateState]);

    const handleToggleAdditionalContext = useCallback(() => {
        updateState({ showAdditionalContext: !state.showAdditionalContext });
    }, [state.showAdditionalContext, updateState]);

    return {
        ...state,
        availableModels,
        handleAIGenerate,
        handleCloseAI,
        handleShowAISection,
        handleModelChange,
        handleDescriptionChange,
        handleContextChange,
        handleToggleAdditionalContext,
        setError: (error: string | null) => updateState({ error }),
    };
}; 