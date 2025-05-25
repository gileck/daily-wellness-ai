import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Slider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { WellnessMetricRecord } from '@/apis/wellnessMetrics/types';

interface EditMetricDialogProps {
    open: boolean;
    record: WellnessMetricRecord | null;
    onClose: () => void;
    onSave: (recordId: string, updates: { value?: number | string; notes?: string; timestamp?: Date }) => Promise<boolean>;
    isSubmitting?: boolean;
}

const marks = [
    { value: 0, label: '0' },
    { value: 2, label: '2' },
    { value: 4, label: '4' },
    { value: 6, label: '6' },
    { value: 8, label: '8' },
    { value: 10, label: '10' },
];

export const EditMetricDialog: React.FC<EditMetricDialogProps> = ({
    open,
    record,
    onClose,
    onSave,
    isSubmitting = false,
}) => {
    const [value, setValue] = useState<number | string>('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (record) {
            setValue(record.value);
            setNotes(record.notes || '');
        }
    }, [record]);

    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        setValue(newValue as number);
    };

    const handleSave = async () => {
        if (!record) return;

        const updates: { value?: number | string; notes?: string } = {};

        if (value !== record.value) {
            updates.value = value;
        }

        if (notes !== (record.notes || '')) {
            updates.notes = notes;
        }

        if (Object.keys(updates).length > 0) {
            const success = await onSave(record._id, updates);
            if (success) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!record) return null;

    const isNumericValue = typeof record.value === 'number';

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        Edit {record.metricName}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        sx={{ color: 'grey.500' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {isNumericValue ? (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                Value (0-10 scale)
                            </Typography>
                            <Box sx={{ px: 2, py: 1 }}>
                                <Slider
                                    value={value as number}
                                    onChange={handleSliderChange}
                                    aria-labelledby="metric-value-slider"
                                    step={1}
                                    marks={marks}
                                    min={0}
                                    max={10}
                                    valueLabelDisplay="auto"
                                    sx={{
                                        color: '#007AFF',
                                        '& .MuiSlider-thumb': {
                                            backgroundColor: '#007AFF',
                                            border: '2px solid #ffffff',
                                            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
                                            '&:hover': {
                                                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.4)',
                                            },
                                        },
                                        '& .MuiSlider-track': {
                                            backgroundColor: '#007AFF',
                                            border: 'none',
                                        },
                                        '& .MuiSlider-rail': {
                                            backgroundColor: '#E5E5EA',
                                        },
                                        '& .MuiSlider-mark': {
                                            backgroundColor: '#C7C7CC',
                                            width: 2,
                                            height: 2,
                                        },
                                        '& .MuiSlider-markActive': {
                                            backgroundColor: '#007AFF',
                                        },
                                        '& .MuiSlider-markLabel': {
                                            fontSize: '12px',
                                            color: '#8E8E93',
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    ) : (
                        <TextField
                            label="Value"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            fullWidth
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#007AFF',
                                    },
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#007AFF',
                                },
                            }}
                        />
                    )}

                    <TextField
                        label="Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&.Mui-focused fieldset': {
                                    borderColor: '#007AFF',
                                },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                                color: '#007AFF',
                            },
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 2 }}>
                <Button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                        px: 3,
                        color: '#8E8E93',
                        '&:hover': {
                            backgroundColor: 'rgba(142, 142, 147, 0.1)',
                        },
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    variant="contained"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        backgroundColor: '#007AFF',
                        boxShadow: '0 2px 8px rgba(0, 122, 255, 0.3)',
                        '&:hover': {
                            backgroundColor: '#0056CC',
                            boxShadow: '0 4px 16px rgba(0, 122, 255, 0.4)',
                        },
                        '&:disabled': {
                            backgroundColor: '#C7C7CC',
                            color: '#ffffff',
                        },
                    }}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 