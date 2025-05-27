import React from 'react';
import {
    TextField,
    FormControlLabel,
    Checkbox,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { ActivityFieldRendererProps, ActivityFieldValue } from './types';
import { FoodPortion } from '@/client/components/FoodSelectionDialog/types';
import { formatFoodWithEmoji } from '@/client/utils/foodEmojiUtils';

export const ActivityFieldRenderer: React.FC<ActivityFieldRendererProps> = ({
    field,
    value,
    onChange,
    onFoodSelection,
    foodsCache = new Map(),
    error = false,
    activityColor = '#007AFF'
}) => {
    const commonProps = {
        label: field.name + (field.required ? ' *' : ''),
        fullWidth: true,
        margin: 'dense' as const,
        value: value || (field.fieldType === 'Boolean' ? false : ''),
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
            onChange(field.name, e.target.value),
        error,
        sx: {
            '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: activityColor,
                    borderWidth: '2px'
                }
            }
        }
    };

    const handleChange = (newValue: ActivityFieldValue) => {
        onChange(field.name, newValue);
    };

    switch (field.fieldType) {
        case 'Boolean':
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={Boolean(value)}
                                onChange={(e) => handleChange(e.target.checked)}
                                sx={{
                                    color: activityColor,
                                    '&.Mui-checked': {
                                        color: activityColor,
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
            return (
                <TextField 
                    {...commonProps} 
                    type="number" 
                    value={value === '' ? '' : String(value)}
                    onChange={(e) => handleChange(e.target.value === '' ? '' : Number(e.target.value))}
                />
            );

        case 'Time':
            return <TextField {...commonProps} type="time" InputLabelProps={{ shrink: true }} />;

        case 'Date':
            return <TextField {...commonProps} type="date" InputLabelProps={{ shrink: true }} />;

        case 'Foods':
            // Normalize the data to FoodPortion[] format for consistent rendering
            let displayFoodPortions: FoodPortion[];
            let isPortionsFormat = false;
            
            const arrayValue = (value as (string | FoodPortion)[]) || [];
            
            // Auto-detect data format based on the content
            if (arrayValue.length > 0 && typeof arrayValue[0] === 'object' && 'foodId' in arrayValue[0]) {
                // Already in FoodPortion[] format
                displayFoodPortions = arrayValue as FoodPortion[];
                isPortionsFormat = true;
            } else {
                // Convert from string[] to FoodPortion[] format for display
                const selectedFoodIds = arrayValue as string[];
                displayFoodPortions = selectedFoodIds.map(foodId => ({
                    foodId,
                    amount: 100,
                    servingType: 'grams' as const,
                    gramsEquivalent: 100
                }));
                isPortionsFormat = false;
            }

            return (
                <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                        {field.name + (field.required ? ' *' : '')}
                    </Typography>

                    {displayFoodPortions.length > 0 && (
                        <Box sx={{
                            border: '1px solid #E0E0E0',
                            borderRadius: '8px',
                            mb: 1,
                            maxHeight: '200px',
                            overflow: 'auto'
                        }}>
                            <List sx={{ py: 0 }}>
                                {displayFoodPortions.map((portion, index) => {
                                    const food = foodsCache.get(portion.foodId) as { displayName?: string } | undefined;
                                    return (
                                        <React.Fragment key={`${portion.foodId}-${index}`}>
                                            <ListItem sx={{ py: 1, px: 2 }}>
                                                <ListItemText
                                                    primary={food?.displayName ? formatFoodWithEmoji(food.displayName) : `Food ID: ${portion.foodId}`}
                                                                                            secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {isPortionsFormat 
                                                    ? `${portion.amount} ${portion.servingType === 'grams' ? 'g' : portion.servingName} (${portion.gramsEquivalent?.toFixed(1) || 0}g)`
                                                    : `${portion.amount} ${portion.servingType} (${portion.gramsEquivalent}g)`
                                                }
                                            </Typography>
                                        }
                                                    primaryTypographyProps={{
                                                        sx: { fontSize: '14px' }
                                                    }}
                                                />
                                            </ListItem>
                                            {index < displayFoodPortions.length - 1 && <Divider />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        </Box>
                    )}

                    <Button
                        variant="outlined"
                        onClick={() => onFoodSelection?.(field.name)}
                        sx={{
                            textTransform: 'none',
                            borderColor: activityColor,
                            color: activityColor,
                            '&:hover': {
                                borderColor: activityColor,
                                backgroundColor: `${activityColor}10`
                            }
                        }}
                    >
                        {displayFoodPortions.length > 0 ? 'Add More Foods' : 'Select Foods'}
                    </Button>
                </Box>
            );

        case 'Options':
            return (
                <FormControl fullWidth margin="dense" error={error}>
                    <InputLabel id={`${field.name}-label`}>
                        {field.name + (field.required ? ' *' : '')}
                    </InputLabel>
                    <Select
                        labelId={`${field.name}-label`}
                        value={value || ''}
                        label={field.name + (field.required ? ' *' : '')}
                        onChange={(e) => handleChange(e.target.value)}
                        sx={{
                            borderRadius: '8px',
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: activityColor,
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