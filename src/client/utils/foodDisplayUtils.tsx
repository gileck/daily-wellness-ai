import React, { useState, useEffect } from 'react';
import { Chip, Box } from '@mui/material';
import { FoodClient } from '@/apis/foods/types';
import { searchFoods } from '@/apis/foods/client';
import { formatFoodWithEmoji } from './foodEmojiUtils';

interface FoodChipsProps {
    foodIds: string[];
    size?: 'small' | 'medium';
    variant?: 'filled' | 'outlined';
}

export const FoodChips: React.FC<FoodChipsProps> = ({
    foodIds,
    size = 'small',
    variant = 'outlined'
}) => {
    const [foods, setFoods] = useState<FoodClient[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (foodIds.length === 0) return;

        const fetchFoods = async () => {
            setLoading(true);
            try {
                const result = await searchFoods({
                    filters: {},
                    limit: 1000
                });

                const relevantFoods = result.data.foods.filter(food => foodIds.includes(food.id));
                setFoods(relevantFoods);
            } catch (error) {
                console.error('Error fetching foods for display:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFoods();
    }, [foodIds]);

    if (loading) {
        return <Chip label="Loading foods..." size={size} variant={variant} />;
    }

    // If more than 3 foods, show just a count chip
    if (foods.length > 3) {
        return (
            <Chip
                label={`Foods (${foods.length})`}
                size={size}
                variant={variant}
                sx={{ fontSize: size === 'small' ? '10px' : '12px' }}
            />
        );
    }

    // Otherwise show individual food chips
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {foods.map((food) => (
                <Chip
                    key={food.id}
                    label={formatFoodWithEmoji(food.displayName)}
                    size={size}
                    variant={variant}
                    sx={{ fontSize: size === 'small' ? '10px' : '12px' }}
                />
            ))}
        </Box>
    );
};

export const formatFieldValue = (fieldName: string, value: unknown): React.ReactNode => {
    // Check if this is a foods field by checking if the value is an array of strings
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        // Assume this is a foods field if it's an array of strings
        return <FoodChips foodIds={value} />;
    }

    // For all other field types, display as string
    return `${fieldName}: ${String(value)}`;
}; 