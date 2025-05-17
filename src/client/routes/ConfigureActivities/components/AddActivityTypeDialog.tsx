import React, { useEffect, useState } from 'react';
import { CreateActivityTypePayload, ActivityTypeField, ActivityFieldTypeValues, ActivityFieldTypeEnum, UpdateActivityTypePayload, ActivityTypeClient } from '@/apis/activity/types';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Button, Typography, Box, Stack, Checkbox, FormControlLabel, Paper, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import PaletteIcon from '@mui/icons-material/Palette';

// Default color if none is set
const DEFAULT_ACTIVITY_COLOR = '#E9D5FF'; // Light Purple, from previous card colors
const PREDEFINED_COLORS = ['#E9D5FF', '#FFF7ED', '#E0F2F7', '#E8F5E9', '#FFEBEE', '#E1F5FE']; // Added more

// Dialog for Adding/Editing Activity Type
export interface AddActivityTypeDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateActivityTypePayload | { updates: UpdateActivityTypePayload, activityTypeId: string }) => Promise<void>;
    activityToEdit?: ActivityTypeClient | null;
}

export const AddActivityTypeDialog: React.FC<AddActivityTypeDialogProps> = ({ open, onClose, onSubmit, activityToEdit }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [fields, setFields] = useState<ActivityTypeField[]>([]);
    const [color, setColor] = useState<string>(DEFAULT_ACTIVITY_COLOR);

    const isEditMode = !!activityToEdit;

    useEffect(() => {
        if (isEditMode && activityToEdit) {
            setName(activityToEdit.name);
            setType(activityToEdit.type);
            setFields(activityToEdit.fields.map(f => ({ ...f, required: f.required || false })));
            setColor(activityToEdit.color || DEFAULT_ACTIVITY_COLOR);
        } else {
            // Reset form for new entry
            setName('');
            setType('');
            setFields([]);
            setColor(DEFAULT_ACTIVITY_COLOR);
        }
    }, [open, activityToEdit, isEditMode]);

    const handleAddField = () => {
        setFields([...fields, { name: '', fieldType: 'Text', required: false }]);
    };

    const handleRemoveField = (index: number) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const handleFieldChange = (index: number, propertyName: keyof ActivityTypeField, value: string | boolean) => {
        const newFields = fields.map((field, i) => {
            if (i === index) {
                return { ...field, [propertyName]: value };
            }
            return field;
        });
        setFields(newFields);
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
                    {PREDEFINED_COLORS.map((c) => (
                        <Box
                            key={c}
                            onClick={() => setColor(c)}
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: c,
                                cursor: 'pointer',
                                border: c === color ? '3px solid #1976d2' : '3px solid transparent',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    borderColor: c === color ? '#1976d2' : '#909090',
                                }
                            }}
                        />
                    ))}
                    {/* Custom Color Picker Button */}
                    <Tooltip title="Select custom color">
                        <Box
                            component="label"
                            htmlFor="custom-activity-color-input"
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: `3px solid ${!PREDEFINED_COLORS.includes(color) ? '#1976d2' : '#bdbdbd'}`, // Blue if custom, grey if not
                                backgroundColor: !PREDEFINED_COLORS.includes(color) ? color : 'transparent',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    borderColor: '#1976d2', // Always blue on hover
                                }
                            }}
                        >
                            <input
                                id="custom-activity-color-input"
                                type="color"
                                value={color} // Ensures picker opens with current color
                                onChange={(e) => setColor(e.target.value)}
                                style={{ width: 0, height: 0, opacity: 0, position: 'absolute' }}
                            />
                            {PREDEFINED_COLORS.includes(color) && ( // Only show icon if a predefined color is selected
                                <PaletteIcon sx={{ color: '#757575' }} />
                            )}
                        </Box>
                    </Tooltip>
                </Stack>

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
        </Dialog>
    );
};

export default AddActivityTypeDialog; 