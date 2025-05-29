import { FoodCategory, NutritionInfo, ServingSize } from '@/server/database/collections/foods/types';

export interface CustomFoodFormData {
    name: string;
    brand: string;
    category: string;
    categorySimplified: FoodCategory | '';
    nutritionPer100g: NutritionInfo;
    commonServings: ServingSize[];
}

export interface CustomFoodDialogProps {
    open: boolean;
    onClose: () => void;
    onFoodCreated: () => void;
}

export interface AIGenerationSectionProps {
    onDataGenerated: (data: Partial<CustomFoodFormData>) => void;
    disabled?: boolean;
}

export interface BasicInfoSectionProps {
    formData: CustomFoodFormData;
    onChange: (field: keyof CustomFoodFormData, value: string | FoodCategory) => void;
    disabled?: boolean;
}

export interface NutritionFieldsSectionProps {
    nutritionData: NutritionInfo;
    onChange: (field: keyof NutritionInfo, value: number) => void;
    disabled?: boolean;
}

export interface ServingsSectionProps {
    servings: ServingSize[];
    onAdd: (serving: ServingSize) => void;
    onRemove: (index: number) => void;
    disabled?: boolean;
} 