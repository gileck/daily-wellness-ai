import React from 'react';
import {
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { FoodCategory } from '@/server/database/collections/foods/types';
import { VALID_FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from '@/common/utils/foodUtils';
import { BasicInfoSectionProps } from '../types';

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
    formData,
    onChange,
    disabled = false
}) => {
    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                    fullWidth
                    label="Food Name"
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    required
                    disabled={disabled}
                />
                <TextField
                    fullWidth
                    label="Brand (optional)"
                    value={formData.brand}
                    onChange={(e) => onChange('brand', e.target.value)}
                    disabled={disabled}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                    fullWidth
                    label="Category"
                    value={formData.category}
                    onChange={(e) => onChange('category', e.target.value)}
                    required
                    disabled={disabled}
                />
                <FormControl fullWidth disabled={disabled}>
                    <InputLabel>Simplified Category (optional)</InputLabel>
                    <Select
                        value={formData.categorySimplified}
                        onChange={(e) => onChange('categorySimplified', e.target.value as FoodCategory)}
                        label="Simplified Category (optional)"
                    >
                        <MenuItem value="">None</MenuItem>
                        {VALID_FOOD_CATEGORIES.map((category) => (
                            <MenuItem key={category} value={category}>
                                {FOOD_CATEGORY_LABELS[category]}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </>
    );
}; 