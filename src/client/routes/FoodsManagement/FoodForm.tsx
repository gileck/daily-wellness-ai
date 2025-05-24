import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FoodClient, CreateFoodRequest, UpdateFoodRequest } from '@/apis/foods/types';
import { FoodCategory, NutritionInfo, ServingSize } from '@/server/database/collections/foods/types';

interface FoodFormProps {
  food?: FoodClient | null;
  onSubmit: (data: CreateFoodRequest | UpdateFoodRequest['updates']) => Promise<void>;
  onCancel: () => void;
}

export const FoodForm: React.FC<FoodFormProps> = ({ food, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    categorySimplified: '' as FoodCategory | '',
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
      transFat: 0,
    } as NutritionInfo,
    commonServings: [] as ServingSize[],
  });

  const [newServing, setNewServing] = useState({ name: '', gramsEquivalent: 0 });

  const categories: FoodCategory[] = [
    'fruits', 'vegetables', 'grains', 'proteins', 'dairy',
    'nuts_seeds', 'oils_fats', 'beverages', 'sweets', 'condiments', 'other'
  ];

  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name,
        brand: food.brand || '',
        category: food.category,
        categorySimplified: food.categorySimplified || '',
        nutritionPer100g: { ...food.nutritionPer100g },
        commonServings: [...food.commonServings],
      });
    }
  }, [food]);

  const handleInputChange = (field: string, value: string | FoodCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNutritionChange = (field: keyof NutritionInfo, value: number) => {
    setFormData(prev => ({
      ...prev,
      nutritionPer100g: { ...prev.nutritionPer100g, [field]: value }
    }));
  };

  const handleAddServing = () => {
    if (newServing.name && newServing.gramsEquivalent > 0) {
      setFormData(prev => ({
        ...prev,
        commonServings: [...prev.commonServings, { ...newServing }]
      }));
      setNewServing({ name: '', gramsEquivalent: 0 });
    }
  };

  const handleRemoveServing = (index: number) => {
    setFormData(prev => ({
      ...prev,
      commonServings: prev.commonServings.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (food) {
      // Editing existing food - only pass the fields that can be updated
      const updates: UpdateFoodRequest['updates'] = {
        name: formData.name,
        brand: formData.brand || undefined,
        category: formData.category,
        categorySimplified: formData.categorySimplified || undefined,
        nutritionPer100g: formData.nutritionPer100g,
        commonServings: formData.commonServings,
      };
      onSubmit(updates);
    } else {
      // Creating new food
      const createData: CreateFoodRequest = {
        name: formData.name,
        brand: formData.brand || undefined,
        category: formData.category,
        categorySimplified: formData.categorySimplified || undefined,
        nutritionPer100g: formData.nutritionPer100g,
        commonServings: formData.commonServings,
      };
      onSubmit(createData);
    }
  };

  const isValid = formData.name && formData.category && formData.nutritionPer100g.calories >= 0;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {/* Basic Information */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          label="Food Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Brand (optional)"
          value={formData.brand}
          onChange={(e) => handleInputChange('brand', e.target.value)}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          label="Category"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          required
        />
        <FormControl fullWidth>
          <InputLabel>Simplified Category (optional)</InputLabel>
          <Select
            value={formData.categorySimplified}
            onChange={(e) => handleInputChange('categorySimplified', e.target.value)}
            label="Simplified Category (optional)"
          >
            <MenuItem value="">None</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category.replace('_', ' ').toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Nutrition Information */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Nutrition Information (per 100g)
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField
          label="Calories"
          type="number"
          value={formData.nutritionPer100g.calories}
          onChange={(e) => handleNutritionChange('calories', Number(e.target.value))}
          required
          inputProps={{ min: 0 }}
          sx={{ minWidth: 120, flex: '1 1 auto' }}
        />
        <TextField
          label="Protein (g)"
          type="number"
          value={formData.nutritionPer100g.protein}
          onChange={(e) => handleNutritionChange('protein', Number(e.target.value))}
          required
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ minWidth: 120, flex: '1 1 auto' }}
        />
        <TextField
          label="Carbs (g)"
          type="number"
          value={formData.nutritionPer100g.carbs}
          onChange={(e) => handleNutritionChange('carbs', Number(e.target.value))}
          required
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ minWidth: 120, flex: '1 1 auto' }}
        />
        <TextField
          label="Fat (g)"
          type="number"
          value={formData.nutritionPer100g.fat}
          onChange={(e) => handleNutritionChange('fat', Number(e.target.value))}
          required
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ minWidth: 120, flex: '1 1 auto' }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <TextField
          label="Fiber (g)"
          type="number"
          value={formData.nutritionPer100g.fiber}
          onChange={(e) => handleNutritionChange('fiber', Number(e.target.value))}
          required
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ minWidth: 120, flex: '1 1 auto' }}
        />
        <TextField
          label="Sugar (g)"
          type="number"
          value={formData.nutritionPer100g.sugar || 0}
          onChange={(e) => handleNutritionChange('sugar', Number(e.target.value))}
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ minWidth: 120, flex: '1 1 auto' }}
        />
        <TextField
          label="Sodium (mg)"
          type="number"
          value={formData.nutritionPer100g.sodium || 0}
          onChange={(e) => handleNutritionChange('sodium', Number(e.target.value))}
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ minWidth: 120, flex: '1 1 auto' }}
        />
        <TextField
          label="Cholesterol (mg)"
          type="number"
          value={formData.nutritionPer100g.cholesterol || 0}
          onChange={(e) => handleNutritionChange('cholesterol', Number(e.target.value))}
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ minWidth: 120, flex: '1 1 auto' }}
        />
      </Box>

      {/* Common Servings */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Common Servings
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-end', flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          label="Serving Name"
          value={newServing.name}
          onChange={(e) => setNewServing(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., 1 cup, 1 medium"
          sx={{ flex: 1 }}
        />
        <TextField
          label="Grams Equivalent"
          type="number"
          value={newServing.gramsEquivalent}
          onChange={(e) => setNewServing(prev => ({ ...prev, gramsEquivalent: Number(e.target.value) }))}
          inputProps={{ min: 0, step: 0.1 }}
          sx={{ flex: 1 }}
        />
        <Button
          variant="outlined"
          onClick={handleAddServing}
          startIcon={<AddIcon />}
          disabled={!newServing.name || newServing.gramsEquivalent <= 0}
          sx={{ minWidth: 100, height: '56px' }}
        >
          Add
        </Button>
      </Box>

      {formData.commonServings.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Serving Name</TableCell>
                <TableCell>Grams</TableCell>
                <TableCell width={60}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.commonServings.map((serving, index) => (
                <TableRow key={index}>
                  <TableCell>{serving.name}</TableCell>
                  <TableCell>{serving.gramsEquivalent}g</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveServing(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isValid}
        >
          {food ? 'Update Food' : 'Create Food'}
        </Button>
      </Box>
    </Box>
  );
}; 