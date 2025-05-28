import { ApiHandlerContext } from '@/apis/types';
import { GenerateFoodDataRequest, GenerateFoodDataResponse } from '../types';
import { AIModelAdapter } from '@/server/ai/baseModelAdapter';
import { isModelExists } from '@/server/ai/models';
import { 
    validateAIFoodResponse, 
    generateFoodDataPrompt
} from '@/common/utils/foodUtils';

// Helper function to create error response with required fields
function createErrorResponse(error: string, modelId: string = ''): GenerateFoodDataResponse {
    return {
        suggestedFood: {
            name: '',
            category: '',
            categorySimplified: 'other',
            nutritionPer100g: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0,
                sugar: 0,
                sodium: 0,
                cholesterol: 0,
                saturatedFat: 0,
                transFat: 0
            },
            commonServings: []
        },
        aiCost: { totalCost: 0 },
        modelUsed: modelId,
        error
    };
}

export async function process(
    payload: GenerateFoodDataRequest,
    context: ApiHandlerContext
): Promise<GenerateFoodDataResponse> {
    try {
        // Validate user authentication
        if (!context.userId) {
            return createErrorResponse('Authentication required');
        }

        // Validate required fields
        if (!payload.foodDescription || payload.foodDescription.trim().length === 0) {
            return createErrorResponse('Food description is required');
        }

        // Use provided model or default to gpt-4o-mini
        const modelId = payload.modelId || 'gpt-4o-mini';

        // Validate model exists
        if (!isModelExists(modelId)) {
            return createErrorResponse(`Invalid model ID: ${modelId}`, modelId);
        }

        // Initialize AI adapter
        const adapter = new AIModelAdapter(modelId);

        // Generate prompt using shared utility
        const prompt = generateFoodDataPrompt(
            payload.foodDescription.trim(),
            payload.additionalContext?.trim()
        );

        // Call AI model to generate structured JSON response
        const aiResponse = await adapter.processPromptToJSON(prompt, 'generate-food-data');

        // Validate AI response structure
        if (!validateAIFoodResponse(aiResponse.result)) {
            return {
                suggestedFood: createErrorResponse('AI generated invalid food data structure', modelId).suggestedFood,
                aiCost: aiResponse.cost,
                modelUsed: modelId,
                error: 'AI generated invalid food data structure'
            };
        }

        const validatedFood = aiResponse.result;

        // Return successful response with generated food data
        return {
            suggestedFood: {
                name: validatedFood.name,
                brand: validatedFood.brand,
                category: validatedFood.category,
                categorySimplified: validatedFood.categorySimplified,
                nutritionPer100g: validatedFood.nutritionPer100g,
                commonServings: validatedFood.commonServings.map(serving => ({
                    name: serving.name,
                    gramsEquivalent: serving.gramsEquivalent
                }))
            },
            aiCost: aiResponse.cost,
            modelUsed: modelId
        };

    } catch (error: unknown) {
        console.error('Error in generateFoodDataHandler:', error);
        
        return createErrorResponse(
            `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
            payload.modelId || 'gpt-4o-mini'
        );
    }
} 