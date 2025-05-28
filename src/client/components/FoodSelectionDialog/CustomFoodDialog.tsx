import React, { useState, useEffect } from 'react';
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
    CircularProgress,
    LinearProgress,
    Chip,
    Divider
} from '@mui/material';
import { 
    Add as AddIcon, 
    Delete as DeleteIcon, 
    Close as CloseIcon,
    AutoAwesome as AutoAwesomeIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { CreateFoodRequest } from '@/apis/foods/types';
import { createFood, generateFoodData } from '@/apis/foods/client';
import { FoodCategory, NutritionInfo, ServingSize } from '@/server/database/collections/foods/types';
import { getAllModels } from '@/server/ai/models';
import { 
    DEFAULT_NUTRITION, 
    VALID_FOOD_CATEGORIES, 
    FOOD_CATEGORY_LABELS 
} from '@/common/utils/foodUtils';

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
        nutritionPer100g: { ...DEFAULT_NUTRITION } as NutritionInfo,
        commonServings: [] as ServingSize[],
    });

    // AI Generation state
    const [showAISection, setShowAISection] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiDescription, setAiDescription] = useState('');
    const [aiContext, setAiContext] = useState('');
    const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
    const [lastGenerationCost, setLastGenerationCost] = useState<number | null>(null);
    const [hasGeneratedData, setHasGeneratedData] = useState(false);

    const [newServing, setNewServing] = useState({ name: '', gramsEquivalent: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load available models
    const availableModels = getAllModels();

    // Load model preference from localStorage
    useEffect(() => {
        const savedModel = localStorage.getItem('preferredAIModel');
        if (savedModel && availableModels.some(model => model.id === savedModel)) {
            setSelectedModel(savedModel);
        }
    }, [availableModels]);

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

    // AI Generation functions
    const handleAIGenerate = async () => {
        if (!aiDescription.trim()) {
            setError('Please enter a food description');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            const result = await generateFoodData({
                foodDescription: aiDescription.trim(),
                additionalContext: aiContext.trim() || undefined,
                modelId: selectedModel
            });

            if (result.data?.error) {
                setError(result.data.error);
            } else if (result.data?.suggestedFood) {
                const suggestedFood = result.data.suggestedFood;
                
                // Populate form with AI-generated data
                setFormData(prev => ({
                    ...prev,
                    name: suggestedFood.name,
                    brand: suggestedFood.brand || '',
                    category: suggestedFood.category,
                    categorySimplified: suggestedFood.categorySimplified || '',
                    nutritionPer100g: suggestedFood.nutritionPer100g,
                    commonServings: suggestedFood.commonServings
                }));

                setLastGenerationCost(result.data.aiCost.totalCost);
                setHasGeneratedData(true);

                // Save model preference
                localStorage.setItem('preferredAIModel', selectedModel);
            }
        } catch (err) {
            setError('Failed to generate food data');
            console.error('Error generating food data:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearAndRegenerate = () => {
        setFormData(prev => ({
            ...prev,
            name: '',
            brand: '',
            category: '',
            categorySimplified: '',
            nutritionPer100g: { ...DEFAULT_NUTRITION },
            commonServings: []
        }));
        setHasGeneratedData(false);
        setLastGenerationCost(null);
    };

    const handleCloseAI = () => {
        setShowAISection(false);
        setAiDescription('');
        setAiContext('');
        setLastGenerationCost(null);
        setHasGeneratedData(false);
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
            nutritionPer100g: { ...DEFAULT_NUTRITION },
            commonServings: [],
        });
        setNewServing({ name: '', gramsEquivalent: 0 });
        setError(null);
        setShowAISection(false);
        setAiDescription('');
        setAiContext('');
        setLastGenerationCost(null);
        setHasGeneratedData(false);
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

                {/* AI Generation Section */}
                <Box sx={{ mb: 3 }}>
                    {!showAISection ? (
                        <Button
                            variant="outlined"
                            startIcon={<AutoAwesomeIcon />}
                            onClick={() => setShowAISection(true)}
                            sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.50',
                                    borderColor: 'primary.dark'
                                }
                            }}
                            disabled={isGenerating}
                        >
                            Generate with AI
                        </Button>
                    ) : (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AutoAwesomeIcon color="primary" />
                                    Generate with AI
                                </Typography>
                                <IconButton size="small" onClick={handleCloseAI}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Food Description"
                                    value={aiDescription}
                                    onChange={(e) => setAiDescription(e.target.value)}
                                    placeholder="e.g., 'grilled chicken breast', 'chocolate chip cookies', 'quinoa salad'"
                                    disabled={isGenerating}
                                    required
                                />

                                <TextField
                                    fullWidth
                                    label="Additional Context (optional)"
                                    value={aiContext}
                                    onChange={(e) => setAiContext(e.target.value)}
                                    placeholder="e.g., 'homemade', 'organic', 'store-bought brand name'"
                                    disabled={isGenerating}
                                    multiline
                                    rows={2}
                                />

                                <FormControl fullWidth disabled={isGenerating}>
                                    <InputLabel>AI Model</InputLabel>
                                    <Select
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        label="AI Model"
                                    >
                                        {availableModels.map((model) => (
                                            <MenuItem key={model.id} value={model.id}>
                                                {model.name} ({model.provider})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAIGenerate}
                                        disabled={!aiDescription.trim() || isGenerating}
                                        startIcon={isGenerating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {isGenerating ? 'Generating...' : 'Generate'}
                                    </Button>

                                    {hasGeneratedData && (
                                        <Button
                                            variant="outlined"
                                            onClick={handleClearAndRegenerate}
                                            startIcon={<ClearIcon />}
                                            disabled={isGenerating}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Clear & Regenerate
                                        </Button>
                                    )}

                                    {lastGenerationCost !== null && (
                                        <Chip
                                            label={`Cost: $${lastGenerationCost.toFixed(4)}`}
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>

                                {isGenerating && (
                                    <LinearProgress sx={{ borderRadius: 1 }} />
                                )}

                                {hasGeneratedData && (
                                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                                        Food data generated successfully! You can edit the fields below or generate new data.
                                    </Alert>
                                )}
                            </Box>
                        </Paper>
                    )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={handleSubmit}>
                    {/* Basic Information */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth
                            label="Food Name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            disabled={isGenerating}
                        />
                        <TextField
                            fullWidth
                            label="Brand (optional)"
                            value={formData.brand}
                            onChange={(e) => handleInputChange('brand', e.target.value)}
                            disabled={isGenerating}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                            fullWidth
                            label="Category"
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            required
                            disabled={isGenerating}
                        />
                        <FormControl fullWidth disabled={isGenerating}>
                            <InputLabel>Simplified Category (optional)</InputLabel>
                            <Select
                                value={formData.categorySimplified}
                                onChange={(e) => handleInputChange('categorySimplified', e.target.value)}
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
                            disabled={isGenerating}
                        />
                        <TextField
                            label="Protein (g)"
                            type="number"
                            value={formData.nutritionPer100g.protein}
                            onChange={(e) => handleNutritionChange('protein', Number(e.target.value))}
                            required
                            inputProps={{ min: 0, step: 0.1 }}
                            sx={{ minWidth: 120, flex: '1 1 auto' }}
                            disabled={isGenerating}
                        />
                        <TextField
                            label="Carbs (g)"
                            type="number"
                            value={formData.nutritionPer100g.carbs}
                            onChange={(e) => handleNutritionChange('carbs', Number(e.target.value))}
                            required
                            inputProps={{ min: 0, step: 0.1 }}
                            sx={{ minWidth: 120, flex: '1 1 auto' }}
                            disabled={isGenerating}
                        />
                        <TextField
                            label="Fat (g)"
                            type="number"
                            value={formData.nutritionPer100g.fat}
                            onChange={(e) => handleNutritionChange('fat', Number(e.target.value))}
                            required
                            inputProps={{ min: 0, step: 0.1 }}
                            sx={{ minWidth: 120, flex: '1 1 auto' }}
                            disabled={isGenerating}
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
                            disabled={isGenerating}
                        />
                        <TextField
                            label="Sugar (g)"
                            type="number"
                            value={formData.nutritionPer100g.sugar || 0}
                            onChange={(e) => handleNutritionChange('sugar', Number(e.target.value))}
                            inputProps={{ min: 0, step: 0.1 }}
                            sx={{ minWidth: 120, flex: '1 1 auto' }}
                            disabled={isGenerating}
                        />
                        <TextField
                            label="Sodium (mg)"
                            type="number"
                            value={formData.nutritionPer100g.sodium || 0}
                            onChange={(e) => handleNutritionChange('sodium', Number(e.target.value))}
                            inputProps={{ min: 0, step: 0.1 }}
                            sx={{ minWidth: 120, flex: '1 1 auto' }}
                            disabled={isGenerating}
                        />
                        <TextField
                            label="Cholesterol (mg)"
                            type="number"
                            value={formData.nutritionPer100g.cholesterol || 0}
                            onChange={(e) => handleNutritionChange('cholesterol', Number(e.target.value))}
                            inputProps={{ min: 0, step: 0.1 }}
                            sx={{ minWidth: 120, flex: '1 1 auto' }}
                            disabled={isGenerating}
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
                            disabled={isGenerating}
                        />
                        <TextField
                            label="Grams Equivalent"
                            type="number"
                            value={newServing.gramsEquivalent}
                            onChange={(e) => setNewServing(prev => ({ ...prev, gramsEquivalent: Number(e.target.value) }))}
                            inputProps={{ min: 0, step: 0.1 }}
                            sx={{ flex: 1 }}
                            disabled={isGenerating}
                        />
                        <Button
                            variant="outlined"
                            onClick={handleAddServing}
                            startIcon={<AddIcon />}
                            disabled={!newServing.name || newServing.gramsEquivalent <= 0 || isGenerating}
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
                                                    disabled={isGenerating}
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
                    disabled={isLoading || isGenerating}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!isValid || isLoading || isGenerating}
                    sx={{ textTransform: 'none' }}
                    startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
                >
                    {isLoading ? 'Creating...' : 'Create Food'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 