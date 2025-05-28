import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Grid,
    FormControlLabel,
    Checkbox,
    Typography,
    Box,
    Avatar,
    Slide,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ActivityTypeClient, ActivityTypeField } from '@/apis/activity/types';
import { TrackedActivityValue, TrackedActivity, UpdateTrackedActivityPayload } from '@/apis/trackedActivities/types';
import { getActivityIconWithProps } from '@/client/utils/activityIcons';
import { FoodSelectionDialog } from '@/client/components/FoodSelectionDialog';
import { FoodClient } from '@/apis/foods/types';
import { getFood } from '@/apis/foods/client';
import { formatFoodWithEmoji } from '@/client/utils/foodEmojiUtils';
import { FoodPortion } from '@/client/components/FoodSelectionDialog/types';

type FormValue = string | number | boolean | Date | null | string[] | FoodPortion[];

interface ActivityDialogProps {
    open: boolean;
    // Common props - activityType is always required
    activityType: ActivityTypeClient;
    onClose: () => void;
    isSubmitting: boolean;
    error?: string | null;
    initialValues?: Record<string, unknown>;
    // For new activities
    onTrack?: (activityType: ActivityTypeClient, values: TrackedActivityValue[], notes?: string, timestamp?: Date) => Promise<void>;
    // For editing activities
    existingActivity?: TrackedActivity | null;
    onEdit?: (activityId: string, updates: UpdateTrackedActivityPayload['updates']) => Promise<boolean>;
}

interface FormState {
    [fieldName: string]: FormValue;
}

// Transition component for smooth animations
const Transition = React.forwardRef(function Transition(
    props: React.ComponentProps<typeof Slide>,
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} timeout={{
        enter: 300,
        exit: 200
    }} />;
});

// Helper function to format date for datetime-local input in local time
const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const ActivityDialog: React.FC<ActivityDialogProps> = ({
    open,
    activityType,
    existingActivity,
    onClose,
    onTrack,
    onEdit,
    isSubmitting,
    error,
    initialValues
}) => {
    const [formState, setFormState] = useState<FormState>({});
    const [notes, setNotes] = useState<string>('');
    const [timestamp, setTimestamp] = useState<Date>(new Date());
    const [localError, setLocalError] = useState<string | null>(null);
    const [foodDialogOpen, setFoodDialogOpen] = useState(false);
    const [currentFoodField, setCurrentFoodField] = useState<string | null>(null);
    const [foodsCache, setFoodsCache] = useState<Map<string, FoodClient>>(new Map());
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const isEditMode = !!existingActivity;

    useEffect(() => {
        if (isEditMode && existingActivity) {
            // Initialize form for editing existing activity
            const initialFormState: FormState = {};

            // Use existing activity values to populate form
            existingActivity.values.forEach(value => {
                initialFormState[value.fieldName] = value.value as FormValue;
            });

            setFormState(initialFormState);
            setNotes(existingActivity.notes || '');
            setTimestamp(new Date(existingActivity.timestamp));
            setLocalError(null);
            setHasAttemptedSubmit(false);
        } else if (activityType) {
            // Initialize form for new activity
            const initialFormState: FormState = {};
            activityType.fields.forEach(field => {
                if (initialValues && field.name in initialValues) {
                    let fieldValue = initialValues[field.name] as FormValue;

                    // Convert string[] food IDs to FoodPortion[] format for Foods fields
                    if (field.fieldType === 'Foods' && Array.isArray(fieldValue)) {
                        if (fieldValue.length > 0 && typeof fieldValue[0] === 'string') {
                            // Convert from string[] to FoodPortion[]
                            fieldValue = (fieldValue as string[]).map(foodId => ({
                                foodId,
                                amount: 1,
                                servingType: 'grams' as const,
                                servingName: '',
                                gramsEquivalent: 1
                            }));
                        }
                    }

                    initialFormState[field.name] = fieldValue;
                } else {
                    if (field.fieldType === 'Boolean') {
                        initialFormState[field.name] = false;
                    } else if (field.fieldType === 'Foods') {
                        initialFormState[field.name] = [];
                    } else {
                        initialFormState[field.name] = '';
                    }
                }
            });
            setFormState(initialFormState);
            setNotes('');
            setTimestamp(new Date());
            setLocalError(null);
            setHasAttemptedSubmit(false);
        } else {
            setFormState({});
            setNotes('');
            setTimestamp(new Date());
            setLocalError(null);
            setHasAttemptedSubmit(false);
        }
    }, [activityType, initialValues, isEditMode, existingActivity]);

    const fetchFoodsForDisplay = useCallback(async (foodIds: string[]) => {
        const uncachedIds = foodIds.filter(id => !foodsCache.has(id));
        if (uncachedIds.length === 0) return;

        try {
            const foodPromises = uncachedIds.map(id => getFood({ id }));
            const results = await Promise.all(foodPromises);

            const newCache = new Map(foodsCache);
            results.forEach((result: Awaited<ReturnType<typeof getFood>>) => {
                if (result.data.food) {
                    newCache.set(result.data.food.id, result.data.food);
                }
            });
            setFoodsCache(newCache);
        } catch (error) {
            console.error('Error fetching foods for display:', error);
        }
    }, [foodsCache]);

    // Fetch foods when food fields change
    useEffect(() => {
        if (!activityType) return;

        const foodFields = activityType.fields.filter(field => field.fieldType === 'Foods');
        const allFoodIds: string[] = [];

        foodFields.forEach(field => {
            const fieldValue = formState[field.name];
            if (Array.isArray(fieldValue)) {
                // Check if it's FoodPortion[] or string[]
                if (fieldValue.length > 0 && typeof fieldValue[0] === 'object' && 'foodId' in fieldValue[0]) {
                    // It's FoodPortion[]
                    allFoodIds.push(...(fieldValue as FoodPortion[]).map(portion => portion.foodId));
                } else {
                    // It's string[] (legacy)
                    allFoodIds.push(...(fieldValue as string[]));
                }
            }
        });

        if (allFoodIds.length > 0) {
            fetchFoodsForDisplay(allFoodIds);
        }
    }, [formState, activityType, fetchFoodsForDisplay]);

    const handleChange = (fieldName: string, value: FormValue, fieldType: ActivityTypeField['fieldType']) => {
        let processedValue: FormValue = value;
        if (fieldType === 'Number') {
            processedValue = value === '' ? '' : Number(value);
        }
        setFormState(prev => ({ ...prev, [fieldName]: processedValue }));

        // Clear local error when user starts typing to enable submit button
        if (hasAttemptedSubmit && localError) {
            setLocalError(null);
        }
    };

    const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNotes(event.target.value);

        // Clear local error when user starts typing to enable submit button
        if (hasAttemptedSubmit && localError) {
            setLocalError(null);
        }
    };

    const handleFoodSelection = (fieldName: string) => {
        setCurrentFoodField(fieldName);
        setFoodDialogOpen(true);
    };

    const handleFoodSave = (selectedFoodPortions: FoodPortion[]) => {
        if (currentFoodField) {
            setFormState(prev => ({ ...prev, [currentFoodField]: selectedFoodPortions }));

            // Clear local error when user makes changes to enable submit button
            if (hasAttemptedSubmit && localError) {
                setLocalError(null);
            }
        }
        setFoodDialogOpen(false);
        setCurrentFoodField(null);
    };

    const handleFoodDialogClose = () => {
        setFoodDialogOpen(false);
        setCurrentFoodField(null);
    };

    const validateFields = useCallback(() => {
        if (!activityType) return false;
        for (const field of activityType.fields) {
            if (field.required) {
                const value = formState[field.name];
                if (value === '' || value === null || value === undefined) {
                    if (field.fieldType === 'Boolean' && typeof value === 'boolean' && value === false) {
                        continue;
                    }
                    if (field.fieldType === 'Foods' && Array.isArray(value) && value.length === 0) {
                        setLocalError(`Field '${field.name}' is required.`);
                        return false;
                    }
                    if (field.fieldType !== 'Foods') {
                        setLocalError(`Field '${field.name}' is required.`);
                        return false;
                    }
                }
            }
            if (field.fieldType === 'Number' && formState[field.name] !== '' && typeof formState[field.name] === 'number' && isNaN(formState[field.name] as number)) {
                setLocalError(`Field '${field.name}' must be a number.`);
                return false;
            }
        }
        setLocalError(null);
        return true;
    }, [activityType, formState]);

    // Re-validate whenever form state changes to clear errors when fields become valid
    useEffect(() => {
        if (hasAttemptedSubmit && activityType && Object.keys(formState).length > 0) {
            validateFields();
        }
    }, [formState, validateFields, activityType, hasAttemptedSubmit]);

    const handleSubmit = async () => {
        setHasAttemptedSubmit(true);
        if (!activityType || !validateFields()) return;

        if (isEditMode && existingActivity && onEdit) {
            // Edit mode
            const values: TrackedActivityValue[] = activityType.fields.map(field => ({
                fieldName: field.name,
                value: formState[field.name],
            }));

            try {
                const success = await onEdit(existingActivity._id, {
                    timestamp,
                    notes: notes || undefined,
                    values
                });
                if (success) {
                    onClose();
                }
            } catch (e) {
                console.error("Submission error in edit dialog, but should be caught by hook", e);
            }
        } else if (!isEditMode && onTrack) {
            // Track mode
            const values: TrackedActivityValue[] = activityType.fields.map(field => ({
                fieldName: field.name,
                value: formState[field.name],
            }));

            try {
                await onTrack(activityType, values, notes || undefined, timestamp);
            } catch (e) {
                console.error("Submission error in track dialog, but should be caught by hook", e);
            }
        }
    };

    if (!activityType) return null;

    const renderField = (field: ActivityTypeField) => {
        const commonProps = {
            key: field.name,
            label: field.name + (field.required ? ' *' : ''),
            fullWidth: true,
            margin: 'dense' as const,
            value: formState[field.name] || (field.fieldType === 'Boolean' ? false : ''),
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(field.name, e.target.value, field.fieldType),
            error: hasAttemptedSubmit && !!localError && localError.includes(field.name),
            sx: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: activityType?.color || '#007AFF',
                        borderWidth: '2px'
                    }
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
                                    checked={Boolean(formState[field.name])}
                                    onChange={(e) => handleChange(field.name, e.target.checked, field.fieldType)}
                                    sx={{
                                        color: activityType?.color || '#007AFF',
                                        '&.Mui-checked': {
                                            color: activityType?.color || '#007AFF',
                                        }
                                    }}
                                />
                            }
                            label={field.name + (field.required ? ' *' : '')}
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
                return <TextField {...commonProps} type="number" value={formState[field.name] === '' ? '' : String(formState[field.name])} />;
            case 'Time':
                return <TextField {...commonProps} type="time" InputLabelProps={{ shrink: true }} />;
            case 'Date':
                return <TextField {...commonProps} type="date" InputLabelProps={{ shrink: true }} />;
            case 'Foods':
                const selectedFoodPortions = (formState[field.name] as FoodPortion[]) || [];
                return (
                    <Box key={field.name}>
                        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            {field.name + (field.required ? ' *' : '')}
                        </Typography>

                        {selectedFoodPortions.length > 0 && (
                            <Box sx={{
                                border: '1px solid #E0E0E0',
                                borderRadius: '8px',
                                mb: 1,
                                maxHeight: '200px',
                                overflow: 'auto'
                            }}>
                                <List sx={{ py: 0 }}>
                                    {selectedFoodPortions.map((portion, index) => {
                                        const food = foodsCache.get(portion.foodId);
                                        return (
                                            <React.Fragment key={`${portion.foodId}-${index}`}>
                                                <ListItem sx={{ py: 1, px: 2 }}>
                                                    <ListItemText
                                                        primary={food?.displayName ? formatFoodWithEmoji(food.displayName) : `Food ID: ${portion.foodId}`}
                                                        secondary={
                                                            <Typography variant="caption" color="text.secondary">
                                                                {portion.amount} {portion.servingType === 'grams' ? 'g' : portion.servingName}
                                                                ({portion.gramsEquivalent?.toFixed(1) || 0}g)
                                                            </Typography>
                                                        }
                                                        primaryTypographyProps={{
                                                            sx: { fontSize: '14px' }
                                                        }}
                                                    />
                                                </ListItem>
                                                {index < selectedFoodPortions.length - 1 && <Divider />}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            </Box>
                        )}

                        <Button
                            variant="outlined"
                            onClick={() => handleFoodSelection(field.name)}
                            sx={{
                                textTransform: 'none',
                                borderColor: activityType?.color || '#007AFF',
                                color: activityType?.color || '#007AFF',
                                '&:hover': {
                                    borderColor: activityType?.color || '#007AFF',
                                    backgroundColor: `${activityType?.color || '#007AFF'}10`
                                }
                            }}
                        >
                            {selectedFoodPortions.length > 0 ? 'Add More Foods' : 'Select Foods'}
                        </Button>
                    </Box>
                );
            case 'Options':
                return (
                    <FormControl key={field.name} fullWidth margin="dense" error={hasAttemptedSubmit && !!localError && localError.includes(field.name)}>
                        <InputLabel id={`${field.name}-label`}>
                            {field.name + (field.required ? ' *' : '')}
                        </InputLabel>
                        <Select
                            labelId={`${field.name}-label`}
                            value={formState[field.name] || ''}
                            label={field.name + (field.required ? ' *' : '')}
                            onChange={(e) => handleChange(field.name, e.target.value, field.fieldType)}
                            sx={{
                                borderRadius: '8px',
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: activityType?.color || '#007AFF',
                                    borderWidth: '2px'
                                }
                            }}
                        >
                            {!field.required && (
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                            )}
                            {field.options?.map((option, index) => (
                                <MenuItem key={index} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            case 'Text':
            case 'String':
            default:
                return <TextField {...commonProps} />;
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                TransitionComponent={Transition}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        p: 0,
                        bgcolor: activityType.color || '#007AFF',
                        color: 'white',
                        position: 'relative'
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 3,
                        gap: 2
                    }}>
                        <Avatar
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                width: 48,
                                height: 48
                            }}
                        >
                            {getActivityIconWithProps(activityType.icon)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontSize: '22px',
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                    mb: 0.5
                                }}
                            >
                                {isEditMode ? 'Edit Activity' : 'Track Activity'}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontSize: '15px',
                                    opacity: 0.9,
                                    fontWeight: 400
                                }}
                            >
                                {activityType.name}
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            disabled={isSubmitting}
                            sx={{
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={2.5} sx={{ mt: 2 }}>
                        <Grid size={12}>
                            <TextField
                                label="Activity Date & Time"
                                type="datetime-local"
                                fullWidth
                                margin="dense"
                                value={formatDateTimeLocal(timestamp)}
                                onChange={(e) => setTimestamp(new Date(e.target.value))}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        minHeight: '56px',
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: activityType?.color || '#007AFF',
                                            borderWidth: '2px'
                                        }
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        padding: '16.5px 14px',
                                        minHeight: '1.4375em',
                                        '@media (max-width: 768px)': {
                                            fontSize: '16px',
                                            padding: '16.5px 14px',
                                            lineHeight: '1.4375em',
                                            minHeight: '1.4375em',
                                            '&::-webkit-datetime-edit': {
                                                padding: '0',
                                                lineHeight: '1.4375em'
                                            },
                                            '&::-webkit-datetime-edit-fields-wrapper': {
                                                padding: '0'
                                            }
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        {activityType.fields.map(field => (
                            <Grid size={12} key={field.name}>
                                {renderField(field)}
                            </Grid>
                        ))}
                        <Grid size={12}>
                            <TextField
                                label="Notes (Optional)"
                                multiline
                                rows={3}
                                fullWidth
                                margin="dense"
                                value={notes}
                                onChange={handleNotesChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: activityType?.color || '#007AFF',
                                            borderWidth: '2px'
                                        }
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    {(hasAttemptedSubmit && (localError || error)) && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: '#FFF5F5',
                                borderRadius: '8px',
                                borderLeft: '4px solid #FF3B30'
                            }}
                        >
                            <Typography
                                color="#FF3B30"
                                variant="body2"
                                sx={{
                                    fontSize: '15px',
                                    fontWeight: 500
                                }}
                            >
                                {localError || error}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
                    <Button
                        onClick={onClose}
                        disabled={isSubmitting}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            py: 1.5,
                            fontSize: '17px',
                            fontWeight: 500,
                            minWidth: '100px',
                            color: '#6B7280',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting || (hasAttemptedSubmit && !!localError)}
                        sx={{
                            bgcolor: activityType?.color || '#007AFF',
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 4,
                            py: 1.5,
                            fontSize: '17px',
                            fontWeight: 600,
                            minWidth: '120px',
                            boxShadow: '0px 2px 8px rgba(0, 122, 255, 0.25)',
                            '&:hover': {
                                bgcolor: activityType?.color ? `${activityType.color}CC` : '#0062CC',
                                boxShadow: '0px 4px 16px rgba(0, 122, 255, 0.35)'
                            },
                            '&:disabled': {
                                bgcolor: '#E5E7EB',
                                color: '#9CA3AF'
                            }
                        }}
                    >
                        {isSubmitting ? <CircularProgress size={20} color="inherit" /> : (isEditMode ? 'Save Changes' : 'Add')}
                    </Button>
                </DialogActions>
            </Dialog>

            <FoodSelectionDialog
                open={foodDialogOpen}
                onClose={handleFoodDialogClose}
                onSave={handleFoodSave}
                initialSelectedFoodPortions={currentFoodField ? (formState[currentFoodField] as FoodPortion[]) || [] : []}
            />
        </>
    );
};

// Keep backward compatibility
export const TrackActivityDialog = ActivityDialog;

// Create an index.ts file for the component
// export { TrackActivityDialog } from './TrackActivityDialog'; 