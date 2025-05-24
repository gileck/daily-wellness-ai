export interface FoodPortion {
    foodId: string;
    amount: number;
    servingType: 'grams' | 'common_serving';
    servingName?: string; // e.g., "large", "cup", "tablespoon"
    gramsEquivalent: number; // calculated grams for the portion
}

export interface CommonServing {
    name: string;
    gramsEquivalent: number;
}

// Predefined portion sizes that are commonly used
export const PREDEFINED_PORTIONS: CommonServing[] = [
    { name: 'teaspoon', gramsEquivalent: 5 },
    { name: 'tablespoon', gramsEquivalent: 15 },
    { name: 'cup', gramsEquivalent: 240 },
    { name: '1/2 cup', gramsEquivalent: 120 },
    { name: '1/4 cup', gramsEquivalent: 60 },
    { name: 'ounce', gramsEquivalent: 28 },
    { name: 'small', gramsEquivalent: 100 },
    { name: 'medium', gramsEquivalent: 150 },
    { name: 'large', gramsEquivalent: 200 },
]; 