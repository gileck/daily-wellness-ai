import React from 'react';
import {
    Box,
    TextField,
    Typography,
} from '@mui/material';
import { NutritionFieldsSectionProps } from '../types';

export const NutritionFieldsSection: React.FC<NutritionFieldsSectionProps> = ({
    nutritionData,
    onChange,
    disabled = false
}) => {
    return (
        <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Nutrition Information (per 100g)
            </Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <TextField
                    label="Calories"
                    type="number"
                    value={nutritionData.calories}
                    onChange={(e) => onChange('calories', Number(e.target.value))}
                    required
                    inputProps={{ min: 0 }}
                    sx={{ minWidth: 120, flex: '1 1 auto' }}
                    disabled={disabled}
                />
                <TextField
                    label="Protein (g)"
                    type="number"
                    value={nutritionData.protein}
                    onChange={(e) => onChange('protein', Number(e.target.value))}
                    required
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ minWidth: 120, flex: '1 1 auto' }}
                    disabled={disabled}
                />
                <TextField
                    label="Carbs (g)"
                    type="number"
                    value={nutritionData.carbs}
                    onChange={(e) => onChange('carbs', Number(e.target.value))}
                    required
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ minWidth: 120, flex: '1 1 auto' }}
                    disabled={disabled}
                />
                <TextField
                    label="Fat (g)"
                    type="number"
                    value={nutritionData.fat}
                    onChange={(e) => onChange('fat', Number(e.target.value))}
                    required
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ minWidth: 120, flex: '1 1 auto' }}
                    disabled={disabled}
                />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <TextField
                    label="Fiber (g)"
                    type="number"
                    value={nutritionData.fiber}
                    onChange={(e) => onChange('fiber', Number(e.target.value))}
                    required
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ minWidth: 120, flex: '1 1 auto' }}
                    disabled={disabled}
                />
                <TextField
                    label="Sugar (g)"
                    type="number"
                    value={nutritionData.sugar || 0}
                    onChange={(e) => onChange('sugar', Number(e.target.value))}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ minWidth: 120, flex: '1 1 auto' }}
                    disabled={disabled}
                />
                <TextField
                    label="Sodium (mg)"
                    type="number"
                    value={nutritionData.sodium || 0}
                    onChange={(e) => onChange('sodium', Number(e.target.value))}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ minWidth: 120, flex: '1 1 auto' }}
                    disabled={disabled}
                />
                <TextField
                    label="Cholesterol (mg)"
                    type="number"
                    value={nutritionData.cholesterol || 0}
                    onChange={(e) => onChange('cholesterol', Number(e.target.value))}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ minWidth: 120, flex: '1 1 auto' }}
                    disabled={disabled}
                />
            </Box>
        </>
    );
}; 