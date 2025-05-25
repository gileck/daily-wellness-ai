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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { WellnessMetricClient } from '@/apis/wellnessMetrics/types';
import { getActivityIconWithProps } from '@/client/utils/activityIcons';

interface TrackMetricDialogProps {
    open: boolean;
    metric: WellnessMetricClient | null;
    onClose: () => void;
    onTrack: (metric: WellnessMetricClient, value: number | string, notes?: string) => Promise<void>;
    isSubmitting?: boolean;
    error?: string | null;
}

// Create marks for the slider
const marks = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
];

export const TrackMetricDialog: React.FC<TrackMetricDialogProps> = ({
    open,
    metric,
    onClose,
    onTrack,
    isSubmitting = false,
    error = null,
}) => {
    const [value, setValue] = useState<number>(5);
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        if (open && metric) {
            setValue(5); // Reset to middle value
            setNotes('');
        }
    }, [open, metric]);

    const handleSubmit = async () => {
        if (!metric) return;

        await onTrack(metric, value, notes.trim() || undefined);
        onClose();
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    };

    const handleSliderChange = (_event: Event, newValue: number | number[]) => {
        setValue(newValue as number);
    };

    if (!metric) return null;

    const metricColor = metric.color || '#1976d2';
    const metricIcon = metric.icon ? getActivityIconWithProps(metric.icon, { sx: { color: 'white', fontSize: 20 } }) : <TrendingUpIcon sx={{ color: 'white', fontSize: 20 }} />;

    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: metricColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {metricIcon}
                        </Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            Track {metric.name}
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{ color: 'grey.500' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                            Value (0-10 scale)
                        </Typography>
                        <Box sx={{ px: 2, py: 1 }}>
                            <Slider
                                value={value}
                                onChange={handleSliderChange}
                                aria-labelledby="metric-value-slider"
                                step={1}
                                marks={marks}
                                min={0}
                                max={10}
                                valueLabelDisplay="auto"
                                sx={{
                                    color: metricColor,
                                    '& .MuiSlider-mark': {
                                        backgroundColor: metricColor,
                                        height: 8,
                                        width: 2,
                                    },
                                    '& .MuiSlider-markLabel': {
                                        fontSize: '0.75rem',
                                        color: 'text.secondary',
                                    },
                                    '& .MuiSlider-thumb': {
                                        height: 20,
                                        width: 20,
                                        backgroundColor: metricColor,
                                        '&:hover': {
                                            boxShadow: `0px 0px 0px 8px ${metricColor}29`,
                                        },
                                    },
                                    '& .MuiSlider-track': {
                                        height: 4,
                                    },
                                    '& .MuiSlider-rail': {
                                        height: 4,
                                        backgroundColor: '#e0e0e0',
                                    },
                                }}
                            />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', textAlign: 'center' }}>
                            Current value: {value}
                        </Typography>
                    </Box>

                    <TextField
                        label="Notes (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onKeyPress={handleKeyPress}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add any notes about this metric..."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                            }
                        }}
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        backgroundColor: metricColor,
                        '&:hover': {
                            backgroundColor: metricColor,
                            filter: 'brightness(0.9)',
                        },
                    }}
                >
                    {isSubmitting ? 'Tracking...' : 'Track Metric'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 