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
    FormControlLabel,
    Checkbox,
    Chip
} from '@mui/material';
import { ActivityTypeClient, ActivityTypeField } from '@/apis/activity/types';
import { ActivityPresetClient, CreateActivityPresetPayload } from '@/apis/activityPresets/types';
import { FoodSelectionDialog } from '@/client/components/FoodSelectionDialog';
import { FoodClient } from '@/apis/foods/types';
import { searchFoods } from '@/apis/foods/client';
import { formatFoodWithEmoji } from '@/client/utils/foodEmojiUtils';

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
                allFoodIds.push(...fieldValue);
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

    const handleFoodSave = (selectedFoodIds: string[]) => {
        if (currentFoodField) {
            handleFieldValueChange(currentFoodField, selectedFoodIds);
        }
        setFoodDialogOpen(false);
        setCurrentFoodField(null);
    };

    const handleFoodDialogClose = () => {
        setFoodDialogOpen(false);
        setCurrentFoodField(null);
    };

    const renderFieldInput = (field: ActivityTypeField) => {
        const value = formData.presetFields[field.name] || (field.fieldType === 'Boolean' ? false : field.fieldType === 'Foods' ? [] : '');

        const commonProps = {
            key: field.name,
            label: field.name,
            fullWidth: true,
            margin: 'normal' as const,
            value: value,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleFieldValueChange(field.name, e.target.value),
            sx: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                }
            }
        };

        switch (field.fieldType) {
            case 'Boolean':
                return (
                    <Box key={field.name} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={Boolean(value)}
                                    onChange={(e) => handleFieldValueChange(field.name, e.target.checked)}
                                />
                            }
                            label={field.name}
                            sx={{
                                '& .MuiFormControlLabel-label': {
                                    fontSize: '17px',
                                    fontWeight: 400
                                }
                            }}
                        />
                    </Box>
                );
            case 'Number':
                return <TextField {...commonProps} type="number" value={value === '' ? '' : String(value)} onChange={(e) => handleFieldValueChange(field.name, e.target.value === '' ? '' : Number(e.target.value))} />;
            case 'Time':
                return <TextField {...commonProps} type="time" InputLabelProps={{ shrink: true }} />;
            case 'Date':
                return <TextField {...commonProps} type="date" InputLabelProps={{ shrink: true }} />;
            case 'Foods':
                const selectedFoodIds = (value as string[]) || [];
                return (
                    <Box key={field.name}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            {field.name}
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => handleFoodSelection(field.name)}
                            sx={{
                                mb: 1,
                                textTransform: 'none'
                            }}
                        >
                            {selectedFoodIds.length > 0 ? `${selectedFoodIds.length} foods selected` : 'Select Foods'}
                        </Button>
                        {selectedFoodIds.length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selectedFoodIds.slice(0, 3).map((foodId) => {
                                    const food = foodsCache.get(foodId);
                                    return (
                                        <Chip
                                            key={foodId}
                                            label={food?.displayName ? formatFoodWithEmoji(food.displayName) : 'Loading...'}
                                            size="small"
                                            sx={{ fontSize: '0.75rem' }}
                                        />
                                    );
                                })}
                                {selectedFoodIds.length > 3 && (
                                    <Chip
                                        label={`+${selectedFoodIds.length - 3} more`}
                                        size="small"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                );
            case 'Text':
            case 'String':
            default:
                return <TextField {...commonProps} />;
        }
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
                            {selectedActivityType.fields.map((field) => renderFieldInput(field))}
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
                onSave={(selectedFoodPortions) => {
                    const foodIds = selectedFoodPortions.map(portion => portion.foodId);
                    handleFoodSave(foodIds);
                }}
                initialSelectedFoodPortions={[]}
            />
        </>
    );
}; 