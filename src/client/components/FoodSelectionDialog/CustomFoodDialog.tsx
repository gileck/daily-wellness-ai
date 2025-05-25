import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
import { CreateFoodRequest } from '@/apis/foods/types';
import { createFood } from '@/apis/foods/client';
import { FoodCategory, NutritionInfo, ServingSize } from '@/server/database/collections/foods/types';

interface CustomFoodDialogProps {
    open: boolean;
    onClose: () => void;
    onFoodCreated: () => void;
}

export const CustomFoodDialog: React.FC<CustomFoodDialogProps> = ({
    open,
    onClose,
    onFoodCreated
}) => {
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const categories: FoodCategory[] = [
        'fruits', 'vegetables', 'grains', 'proteins', 'dairy',
        'nuts_seeds', 'oils_fats', 'beverages', 'sweets', 'condiments', 'other'
    ];

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const createData: CreateFoodRequest = {
                name: formData.name,
                brand: formData.brand || undefined,
                category: formData.category,
                categorySimplified: formData.categorySimplified || undefined,
                nutritionPer100g: formData.nutritionPer100g,
                commonServings: formData.commonServings,
            };

            const result = await createFood(createData);

            if (result.data?.error) {
                setError(result.data.error);
            } else {
                onFoodCreated();
                handleClose();
            }
        } catch (err) {
            setError('Failed to create food');
            console.error('Error creating food:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            brand: '',
            category: '',
            categorySimplified: '',
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
            },
            commonServings: [],
        });
        setNewServing({ name: '', gramsEquivalent: 0 });
        setError(null);
        onClose();
    };

    const isValid = formData.name && formData.category && formData.nutritionPer100g.calories >= 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, maxHeight: '90vh' }
            }}
        >
            <DialogTitle sx={{ fontWeight: 600, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Add Custom Food
                <IconButton onClick={handleClose} sx={{ mr: -1 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: '10px !important' }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
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
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
                <Button
                    onClick={handleClose}
                    sx={{ textTransform: 'none' }}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isValid || isLoading}
                    sx={{ textTransform: 'none' }}
                    startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
                >
                    {isLoading ? 'Creating...' : 'Create Food'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 