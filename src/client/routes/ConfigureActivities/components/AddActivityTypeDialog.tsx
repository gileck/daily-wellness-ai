import React, { useEffect, useState } from 'react';
import { CreateActivityTypePayload, ActivityTypeField, ActivityFieldTypeValues, ActivityFieldTypeEnum, UpdateActivityTypePayload, ActivityTypeClient } from '@/apis/activity/types';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Button, Typography, Box, Stack, Checkbox, FormControlLabel, Paper, Tooltip, FormControl, InputLabel, Select } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PaletteIcon from '@mui/icons-material/Palette';
import { ICON_OPTIONS } from '@/client/utils/activityIcons';

// Default color if none is set - iOS-style blue
const DEFAULT_ACTIVITY_COLOR = '#007AFF'; // iOS system blue
const PREDEFINED_COLORS = [
    '#007AFF', // iOS blue
    '#5856D6', // iOS purple  
    '#FF2D55', // iOS pink/red
    '#FF9500', // iOS orange
    '#34C759', // iOS green
    '#8E8E93', // iOS gray
]; // 6 main colors for quick selection

// Extended colors for the more colors dialog
const EXTENDED_COLORS = [
    '#007AFF', '#5856D6', '#FF2D55', '#FF9500', '#34C759', '#8E8E93', // Main 6
    '#5AC8FA', '#AF52DE', '#FF3B30', '#FFCC00', '#30D158', '#FF9F0A', // Additional recommended
    '#1976D2', '#9C27B0', '#F44336', '#FF5722', '#4CAF50', '#2196F3',
    '#673AB7', '#3F51B5', '#009688', '#795548', '#607D8B', '#E91E63'
]; // 24 total colors including the main 6

// Dialog for Adding/Editing Activity Type
export interface AddActivityTypeDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateActivityTypePayload | { updates: UpdateActivityTypePayload, activityTypeId: string }) => Promise<void>;
    activityToEdit?: ActivityTypeClient | null;
}

// Color Picker Dialog Component
interface ColorPickerDialogProps {
    open: boolean;
    onClose: () => void;
    onColorSelect: (color: string) => void;
    currentColor: string;
}

const ColorPickerDialog: React.FC<ColorPickerDialogProps> = ({ open, onClose, onColorSelect, currentColor }) => {
    const [customColor, setCustomColor] = useState(currentColor);

    const handleColorSelect = (color: string) => {
        onColorSelect(color);
        onClose();
    };

    const handleCustomColorSelect = () => {
        onColorSelect(customColor);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 600, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Choose Color
                <IconButton onClick={onClose} sx={{ mr: -1 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '10px !important' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>Recommended Colors</Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: 1,
                        mb: 3
                    }}
                >
                    {EXTENDED_COLORS.map((color) => (
                        <Box
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: color,
                                cursor: 'pointer',
                                border: color === currentColor ? '3px solid #1976d2' : '3px solid transparent',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    borderColor: color === currentColor ? '#1976d2' : '#909090',
                                }
                            }}
                        />
                    ))}
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>Custom Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    />
                    <TextField
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        placeholder="#000000"
                        size="small"
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleCustomColorSelect}
                        sx={{ textTransform: 'none' }}
                    >
                        Use Color
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export const AddActivityTypeDialog: React.FC<AddActivityTypeDialogProps> = ({ open, onClose, onSubmit, activityToEdit }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [fields, setFields] = useState<ActivityTypeField[]>([]);
    const [color, setColor] = useState<string>(DEFAULT_ACTIVITY_COLOR);
    const [icon, setIcon] = useState<string>('');
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [customColor, setCustomColor] = useState<string | null>(null);

    const isEditMode = !!activityToEdit;

    // Create display colors array that includes custom color if selected
    const getDisplayColors = () => {
        if (customColor && !PREDEFINED_COLORS.includes(customColor)) {
            // Replace the last predefined color with the custom color
            const displayColors = [...PREDEFINED_COLORS];
            displayColors[displayColors.length - 1] = customColor;
            return displayColors;
        }
        return PREDEFINED_COLORS;
    };

    const handleColorSelect = (selectedColor: string) => {
        setColor(selectedColor);
        // If this color is not in the original predefined colors, mark it as custom
        if (!PREDEFINED_COLORS.includes(selectedColor)) {
            setCustomColor(selectedColor);
        }
    };

    const isCustomColor = (colorToCheck: string) => {
        return customColor === colorToCheck && !PREDEFINED_COLORS.includes(colorToCheck);
    };

    useEffect(() => {
        if (isEditMode && activityToEdit) {
            setName(activityToEdit.name);
            setType(activityToEdit.type);
            setFields(activityToEdit.fields.map(f => ({ ...f, required: f.required || false })));
            const activityColor = activityToEdit.color || DEFAULT_ACTIVITY_COLOR;
            setColor(activityColor);
            setIcon(activityToEdit.icon || '');
            // If the activity's color is not in predefined colors, set it as custom
            if (!PREDEFINED_COLORS.includes(activityColor)) {
                setCustomColor(activityColor);
            } else {
                setCustomColor(null);
            }
        } else {
            // Reset form for new entry
            setName('');
            setType('');
            setFields([]);
            setColor(DEFAULT_ACTIVITY_COLOR);
            setIcon('');
            setCustomColor(null);
        }
    }, [open, activityToEdit, isEditMode]);

    const handleAddField = () => {
        setFields([...fields, { name: '', fieldType: 'Text', required: false }]);
    };

    const handleRemoveField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const handleFieldChange = (index: number, propertyName: keyof ActivityTypeField, value: string | boolean | string[]) => {
        const newFields = fields.map((field, i) => {
            if (i === index) {
                const updatedField = { ...field, [propertyName]: value };
                // If changing field type to non-Options, clear the options
                if (propertyName === 'fieldType' && value !== 'Options') {
                    delete updatedField.options;
                }
                // If changing to Options, initialize with empty options array
                if (propertyName === 'fieldType' && value === 'Options') {
                    updatedField.options = [];
                }
                return updatedField;
            }
            return field;
        });
        setFields(newFields);
    };

    const handleOptionsChange = (fieldIndex: number, newOptions: string[]) => {
        const newFields = fields.map((field, i) => {
            if (i === fieldIndex) {
                return { ...field, options: newOptions };
            }
            return field;
        });
        setFields(newFields);
    };

    const addOption = (fieldIndex: number) => {
        const field = fields[fieldIndex];
        if (field && field.fieldType === 'Options') {
            const newOptions = [...(field.options || []), ''];
            handleOptionsChange(fieldIndex, newOptions);
        }
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const field = fields[fieldIndex];
        if (field && field.fieldType === 'Options' && field.options) {
            const newOptions = field.options.filter((_, i) => i !== optionIndex);
            handleOptionsChange(fieldIndex, newOptions);
        }
    };

    const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
        const field = fields[fieldIndex];
        if (field && field.fieldType === 'Options' && field.options) {
            const newOptions = [...field.options];
            newOptions[optionIndex] = value;
            handleOptionsChange(fieldIndex, newOptions);
        }
    };

    const handleSubmit = async () => {
        const processedFields = fields.map(f => ({ ...f, name: f.name.trim() })).filter(f => f.name);
        if (!name.trim()) {
            alert("Activity Type Name is required.");
            return;
        }

        if (isEditMode && activityToEdit) {
            const payload: { updates: UpdateActivityTypePayload, activityTypeId: string } = {
                activityTypeId: activityToEdit._id,
                updates: {
                    name: name.trim(),
                    type: type,
                    fields: processedFields,
                    color: color,
                    icon: icon,
                }
            };
            await onSubmit(payload);
        } else {
            const payload: CreateActivityTypePayload = {
                name: name.trim(),
                type: type,
                fields: processedFields,
                color: color,
                isPredefined: false,
                enabled: true,
                icon: icon,
            };
            await onSubmit(payload);
        }
        onClose();
    };

    const fixedCategories = ['Exercise', 'Work', 'Hobby', 'Mindfulness', 'Social', 'Chores', 'Learning', 'Other'];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 600, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isEditMode ? 'Edit Activity Type' : 'Create New Activity Type'}
                <IconButton onClick={onClose} sx={{ mr: -1 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '10px !important', backgroundColor: 'rgba(0,0,0,0.005)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Define what fields to collect when tracking this type of activity.
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Activity Type Name"
                    placeholder="e.g., Workout, Meditation, Reading"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2.5 }}
                />
                <TextField
                    select
                    margin="dense"
                    id="type"
                    label="Activity Category"
                    fullWidth
                    variant="outlined"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    sx={{ mb: 2.5 }}
                >
                    {fixedCategories.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>

                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>Color</Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center' }}>
                    {getDisplayColors().map((c) => (
                        <Box
                            key={c}
                            onClick={() => handleColorSelect(c)}
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: c,
                                cursor: 'pointer',
                                border: c === color ? '3px solid #1976d2' : '3px solid transparent',
                                transition: 'all 0.2s ease-in-out',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                    borderColor: c === color ? '#1976d2' : '#909090',
                                }
                            }}
                        >
                            {isCustomColor(c) && (
                                <PaletteIcon
                                    sx={{
                                        fontSize: 14,
                                        color: 'white',
                                        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))'
                                    }}
                                />
                            )}
                        </Box>
                    ))}
                    {/* More Colors Button */}
                    <Tooltip title="More colors">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setColorPickerOpen(true)}
                            sx={{
                                minWidth: 'auto',
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                padding: 0,
                                border: '2px solid #bdbdbd',
                                '&:hover': {
                                    borderColor: '#1976d2',
                                }
                            }}
                        >
                            <MoreHorizIcon sx={{ fontSize: 16, color: '#757575' }} />
                        </Button>
                    </Tooltip>
                </Stack>

                <FormControl fullWidth sx={{ mb: 2.5 }}>
                    <InputLabel id="icon-select-label">Icon</InputLabel>
                    <Select
                        labelId="icon-select-label"
                        value={icon}
                        label="Icon"
                        onChange={(e) => setIcon(e.target.value)}
                        renderValue={(selected) => {
                            const selectedIcon = ICON_OPTIONS.find(option => option.name === selected);
                            if (selectedIcon) {
                                const IconComponent = selectedIcon.component;
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconComponent sx={{ fontSize: 20 }} />
                                        {selectedIcon.label}
                                    </Box>
                                );
                            }
                            return 'Select an icon';
                        }}
                    >
                        <MenuItem value="">
                            <Typography color="text.secondary">No icon</Typography>
                        </MenuItem>
                        {ICON_OPTIONS.map((option) => {
                            const IconComponent = option.component;
                            return (
                                <MenuItem key={option.name} value={option.name}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <IconComponent sx={{ fontSize: 20 }} />
                                        {option.label}
                                    </Box>
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Fields</Typography>
                    <Button onClick={handleAddField} startIcon={<AddIcon />} variant="outlined" size="small" color="primary" sx={{ textTransform: 'none', fontWeight: 500 }}>
                        Add Field
                    </Button>
                </Box>

                {fields.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderStyle: 'dashed', borderColor: 'rgba(0,0,0,0.23)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 2, mt: 1, mb: 2 }}>
                        <Typography color="text.secondary" sx={{ mb: 1.5 }}>No fields added yet. Click &quot;Add Field&quot; to get started.</Typography>
                        <Button onClick={handleAddField} startIcon={<AddIcon />} variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                            Add Field
                        </Button>
                    </Paper>
                ) : (
                    fields.map((field, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, position: 'relative' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight="medium">Field {index + 1}</Typography>
                                <IconButton onClick={() => handleRemoveField(index)} size="small" sx={{ position: 'absolute', top: 8, right: 8 }} disabled={fields.length === 1 && !fields[0].name && !isEditMode}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <TextField
                                margin="dense"
                                label="Field Name"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={field.name}
                                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                size="small"
                                sx={{ mb: 1.5 }}
                            />
                            <TextField
                                select
                                margin="dense"
                                label="Type"
                                fullWidth
                                variant="outlined"
                                value={field.fieldType}
                                onChange={(e) => handleFieldChange(index, 'fieldType', e.target.value as ActivityFieldTypeEnum)}
                                size="small"
                                sx={{ mb: 1 }}
                            >
                                {ActivityFieldTypeValues.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={field.required || false}
                                        onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Required field"
                                sx={{ mt: 0.5 }}
                            />

                            {/* Options section for Options field type */}
                            {field.fieldType === 'Options' && (
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>Options</Typography>
                                        <Button
                                            onClick={() => addOption(index)}
                                            size="small"
                                            variant="outlined"
                                            sx={{ textTransform: 'none', fontSize: '12px' }}
                                        >
                                            Add Option
                                        </Button>
                                    </Box>

                                    {field.options && field.options.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {field.options.map((option, optionIndex) => (
                                                <Box key={optionIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TextField
                                                        size="small"
                                                        placeholder={`Option ${optionIndex + 1}`}
                                                        value={option}
                                                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                                        fullWidth
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeOption(index, optionIndex)}
                                                        sx={{ color: 'error.main' }}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                                            No options added. Click &ldquo;Add Option&rdquo; to start.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    ))
                )}
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.005)', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', border: '1px solid rgba(0,0,0,0.23)' }}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!name.trim()}
                    startIcon={<SaveIcon />}
                    sx={{
                        backgroundColor: '#1A2027',
                        color: 'white',
                        '&:hover': { backgroundColor: '#343A40' },
                        px: 2.5,
                        py: 1.25,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                    }}
                >
                    {isEditMode ? 'Save Activity Type' : 'Save Activity Type'}
                </Button>
            </DialogActions>

            <ColorPickerDialog
                open={colorPickerOpen}
                onClose={() => setColorPickerOpen(false)}
                onColorSelect={handleColorSelect}
                currentColor={color}
            />
        </Dialog>
    );
};

export default AddActivityTypeDialog; 