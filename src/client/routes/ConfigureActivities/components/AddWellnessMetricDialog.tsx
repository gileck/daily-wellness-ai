import React, { useEffect, useState } from 'react';
import { CreateWellnessMetricPayload, WellnessMetricClient } from '@/apis/wellnessMetrics/types';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Typography, Box, Stack, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PaletteIcon from '@mui/icons-material/Palette';
import { ICON_OPTIONS } from '@/client/utils/activityIcons';

// Default color if none is set - iOS-style blue
const DEFAULT_METRIC_COLOR = '#007AFF'; // iOS system blue
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

// Dialog for Adding/Editing Wellness Metric
interface AddWellnessMetricDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateWellnessMetricPayload | { metricId: string, updates: Partial<Omit<WellnessMetricClient, '_id' | 'userId' | 'isPredefined' | 'predefinedId'>> }) => Promise<void>;
    metricToEdit?: WellnessMetricClient | null;
}

export const AddWellnessMetricDialog: React.FC<AddWellnessMetricDialogProps> = ({ open, onClose, onSubmit, metricToEdit }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState<string>(DEFAULT_METRIC_COLOR);
    const [icon, setIcon] = useState<string>('');
    const [colorPickerOpen, setColorPickerOpen] = useState(false);
    const [customColor, setCustomColor] = useState<string | null>(null);

    const isEditMode = !!metricToEdit;

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
        if (isEditMode && metricToEdit) {
            setName(metricToEdit.name);
            const metricColor = metricToEdit.color || DEFAULT_METRIC_COLOR;
            setColor(metricColor);
            setIcon(metricToEdit.icon || '');
            // If the metric's color is not in predefined colors, set it as custom
            if (!PREDEFINED_COLORS.includes(metricColor)) {
                setCustomColor(metricColor);
            } else {
                setCustomColor(null);
            }
        } else {
            // Reset form for new entry
            setName('');
            setColor(DEFAULT_METRIC_COLOR);
            setIcon('');
            setCustomColor(null);
        }
    }, [open, metricToEdit, isEditMode]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert("Metric Name is required.");
            return;
        }
        if (isEditMode && metricToEdit) {
            const payload = {
                metricId: metricToEdit._id,
                updates: {
                    name: name.trim(),
                    color: color,
                    icon: icon
                }
            };
            await onSubmit(payload);
        } else {
            const payload: CreateWellnessMetricPayload = {
                name: name.trim(),
                isPredefined: false,
                enabled: true,
                color: color,
                icon: icon,
            };
            await onSubmit(payload);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 600, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isEditMode ? 'Edit Wellness Metric' : 'Add New Custom Wellness Metric'}
                <IconButton onClick={onClose} sx={{ mr: -1 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '10px !important', backgroundColor: 'rgba(0,0,0,0.005)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Create a custom wellness metric to track your personal well-being indicators.
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    id="metricName"
                    label="Metric Name"
                    placeholder="e.g., Happiness, Energy Level, Stress"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2.5 }}
                />

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
                        fontWeight: 500
                    }}
                >
                    {isEditMode ? 'Save Metric' : 'Add Wellness Metric'}
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

export default AddWellnessMetricDialog; 