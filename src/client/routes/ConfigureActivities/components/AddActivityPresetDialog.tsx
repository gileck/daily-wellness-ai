import React, { useState, useEffect, useCallback } from 'react';
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
    Box,
    Typography,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import { ActivityTypeClient } from '@/apis/activity/types';
import { ActivityPresetClient, CreateActivityPresetPayload } from '@/apis/activityPresets/types';
import { FoodSelectionDialog } from '@/client/components/FoodSelectionDialog';
import { FoodClient } from '@/apis/foods/types';
import { searchFoods } from '@/apis/foods/client';
import { ActivityFieldRenderer } from '@/client/components/ActivityFieldRenderer';
import { FoodPortion } from '@/client/components/FoodSelectionDialog/types';

interface AddActivityPresetDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateActivityPresetPayload | { presetId: string; updates: Partial<Pick<ActivityPresetClient, 'name' | 'description' | 'presetFields'>> }) => Promise<void>;
    activityTypes: ActivityTypeClient[];
    presetToEdit?: ActivityPresetClient | null;
}

export const AddActivityPresetDialog: React.FC<AddActivityPresetDialogProps> = ({
    open,
    onClose,
    onSubmit,
    activityTypes,
    presetToEdit
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        activityTypeId: '',
        presetFields: {} as Record<string, unknown>
    });
    const [selectedActivityType, setSelectedActivityType] = useState<ActivityTypeClient | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [foodDialogOpen, setFoodDialogOpen] = useState(false);
    const [currentFoodField, setCurrentFoodField] = useState<string | null>(null);
    const [foodsCache, setFoodsCache] = useState<Map<string, FoodClient>>(new Map());

    useEffect(() => {
        if (presetToEdit) {
            setFormData({
                name: presetToEdit.name,
                description: presetToEdit.description || '',
                activityTypeId: presetToEdit.activityTypeId,
                presetFields: presetToEdit.presetFields
            });
            const activityType = activityTypes.find(at => at._id === presetToEdit.activityTypeId);
            setSelectedActivityType(activityType || null);
        } else {
            setFormData({
                name: '',
                description: '',
                activityTypeId: '',
                presetFields: {}
            });
            setSelectedActivityType(null);
        }
        setError(null);
    }, [presetToEdit, activityTypes, open]);

    const fetchFoodsForDisplay = useCallback(async (foodIds: string[]) => {
        const uncachedIds = foodIds.filter(id => !foodsCache.has(id));
        if (uncachedIds.length === 0) return;

        try {
            const result = await searchFoods({
                filters: {},
                limit: 1000
            });

            const relevantFoods = result.data.foods.filter(food => uncachedIds.includes(food.id));
            const newCache = new Map(foodsCache);
            relevantFoods.forEach(food => newCache.set(food.id, food));
            setFoodsCache(newCache);
        } catch (error) {
            console.error('Error fetching foods for display:', error);
        }
    }, [foodsCache]);

    // Fetch foods when food fields change
    useEffect(() => {
        if (!selectedActivityType) return;

        const foodFields = selectedActivityType.fields.filter(field => field.fieldType === 'Foods');
        const allFoodIds: string[] = [];

        foodFields.forEach(field => {
            const fieldValue = formData.presetFields[field.name];
            if (Array.isArray(fieldValue)) {
                // Handle both old format (string[]) and new format (FoodPortion[])
                if (fieldValue.length > 0) {
                    if (typeof fieldValue[0] === 'string') {
                        // Old format: string[]
                        allFoodIds.push(...(fieldValue as string[]));
                    } else {
                        // New format: FoodPortion[]
                        allFoodIds.push(...(fieldValue as FoodPortion[]).map(portion => portion.foodId));
                    }
                }
            }
        });

        if (allFoodIds.length > 0) {
            fetchFoodsForDisplay(allFoodIds);
        }
    }, [formData.presetFields, selectedActivityType, fetchFoodsForDisplay]);

    const handleActivityTypeChange = (activityTypeId: string) => {
        const activityType = activityTypes.find(at => at._id === activityTypeId);
        setSelectedActivityType(activityType || null);
        setFormData(prev => ({
            ...prev,
            activityTypeId,
            presetFields: activityType ?
                activityType.fields.reduce((acc, field) => ({
                    ...acc,
                    [field.name]: field.fieldType === 'Boolean' ? false : field.fieldType === 'Foods' ? [] : ''
                }), {}) :
                {}
        }));
    };

    const handleFieldValueChange = (fieldName: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            presetFields: {
                ...prev.presetFields,
                [fieldName]: value
            }
        }));
    };

    const handleFoodSelection = (fieldName: string) => {
        setCurrentFoodField(fieldName);
        setFoodDialogOpen(true);
    };

    const handleFoodSave = (selectedFoodPortions: FoodPortion[]) => {
        if (currentFoodField) {
            handleFieldValueChange(currentFoodField, selectedFoodPortions);
        }
        setFoodDialogOpen(false);
        setCurrentFoodField(null);
    };

    const handleFoodDialogClose = () => {
        setFoodDialogOpen(false);
        setCurrentFoodField(null);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.activityTypeId) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (presetToEdit) {
                await onSubmit({
                    presetId: presetToEdit._id,
                    updates: {
                        name: formData.name,
                        description: formData.description,
                        presetFields: formData.presetFields
                    }
                });
            } else {
                await onSubmit({
                    name: formData.name,
                    description: formData.description,
                    activityTypeId: formData.activityTypeId,
                    presetFields: formData.presetFields
                });
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save preset');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {presetToEdit ? 'Edit Activity Preset' : 'Create Activity Preset'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Preset Name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description (optional)"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        multiline
                        rows={2}
                    />

                    <FormControl fullWidth margin="normal" required disabled={!!presetToEdit}>
                        <InputLabel>Activity Type</InputLabel>
                        <Select
                            value={formData.activityTypeId}
                            onChange={(e) => handleActivityTypeChange(e.target.value)}
                            label="Activity Type"
                        >
                            {activityTypes.map((activityType) => (
                                <MenuItem key={activityType._id} value={activityType._id}>
                                    {activityType.name} ({activityType.type})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedActivityType && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Preset Field Values
                            </Typography>
                            <Grid container spacing={2}>
                                {selectedActivityType.fields.map((field) => (
                                    <Grid size={12} key={field.name}>
                                        <ActivityFieldRenderer
                                            field={field}
                                            value={formData.presetFields[field.name] || (field.fieldType === 'Boolean' ? false : field.fieldType === 'Foods' ? [] : '')}
                                            onChange={handleFieldValueChange}
                                            onFoodSelection={handleFoodSelection}
                                            foodsCache={foodsCache}
                                            activityColor={selectedActivityType.color}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting || !formData.name.trim() || !formData.activityTypeId}
                    >
                        {isSubmitting ? <CircularProgress size={20} /> : (presetToEdit ? 'Update' : 'Create')}
                    </Button>
                </DialogActions>
            </Dialog>

            <FoodSelectionDialog
                open={foodDialogOpen}
                onClose={handleFoodDialogClose}
                onSave={handleFoodSave}
                initialSelectedFoodPortions={
                    currentFoodField 
                        ? (() => {
                            const fieldValue = formData.presetFields[currentFoodField];
                            
                            // Handle both formats: string[] and FoodPortion[]
                            if (Array.isArray(fieldValue)) {
                                if (fieldValue.length > 0 && typeof fieldValue[0] === 'string') {
                                    // Convert string[] to FoodPortion[]
                                    return (fieldValue as string[]).map(foodId => ({
                                        foodId,
                                        amount: 100,
                                        servingType: 'grams' as const,
                                        gramsEquivalent: 100
                                    }));
                                } else {
                                    // Already FoodPortion[]
                                    return fieldValue as FoodPortion[];
                                }
                            }
                            return [];
                        })()
                        : []
                }
            />
        </>
    );
}; 