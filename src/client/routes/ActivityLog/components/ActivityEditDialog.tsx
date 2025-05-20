import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Typography,
    Box
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TrackedActivity, TrackedActivityValue, UpdateTrackedActivityPayload } from '@/apis/trackedActivities/types';

interface ActivityEditDialogProps {
    open: boolean;
    activity: TrackedActivity | null;
    onClose: () => void;
    onSave: (activityId: string, updates: UpdateTrackedActivityPayload['updates']) => Promise<boolean>;
}

export const ActivityEditDialog: React.FC<ActivityEditDialogProps> = ({
    open,
    activity,
    onClose,
    onSave
}) => {
    const [activityName, setActivityName] = useState('');
    const [timestamp, setTimestamp] = useState<Date | null>(null);
    const [notes, setNotes] = useState('');
    const [values, setValues] = useState<TrackedActivityValue[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (activity) {
            setActivityName(activity.activityName);
            setTimestamp(new Date(activity.timestamp));
            setNotes(activity.notes || '');
            setValues([...activity.values]);
        }
    }, [activity]);

    const handleValueChange = (index: number, value: string | number) => {
        const newValues = [...values];
        newValues[index] = {
            ...newValues[index],
            value: value
        };
        setValues(newValues);
    };

    const handleSave = async () => {
        if (!activity) return;

        if (!activityName.trim()) {
            setFormError('Activity name is required');
            return;
        }

        if (!timestamp) {
            setFormError('Timestamp is required');
            return;
        }

        setFormError('');
        setIsProcessing(true);

        try {
            const success = await onSave(activity._id, {
                activityName,
                timestamp,
                notes: notes || undefined,
                values
            });

            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            setFormError('Failed to save changes. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog
            open={open}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)',
                }
            }}
        >
            <DialogTitle>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Edit Activity
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <TextField
                        label="Activity Name"
                        fullWidth
                        value={activityName}
                        onChange={(e) => setActivityName(e.target.value)}
                        variant="outlined"
                        disabled={isProcessing}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            label="Date & Time"
                            value={timestamp}
                            onChange={(newValue) => setTimestamp(newValue)}
                            disabled={isProcessing}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    variant: 'outlined'
                                }
                            }}
                        />
                    </LocalizationProvider>

                    <TextField
                        label="Notes"
                        fullWidth
                        multiline
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        variant="outlined"
                        disabled={isProcessing}
                    />

                    {values.length > 0 && (
                        <Box>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
                                Activity Values
                            </Typography>

                            <Stack spacing={2}>
                                {values.map((val, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: 1,
                                            bgcolor: '#F2F2F7'
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {val.fieldName}:
                                        </Typography>

                                        <TextField
                                            variant="outlined"
                                            size="small"
                                            value={val.value}
                                            onChange={(e) => {
                                                // Try to convert to number if it looks like a number
                                                const inputVal = e.target.value;
                                                const numVal = Number(inputVal);

                                                if (!isNaN(numVal) && inputVal.trim() !== '') {
                                                    handleValueChange(index, numVal);
                                                } else {
                                                    handleValueChange(index, inputVal);
                                                }
                                            }}
                                            disabled={isProcessing}
                                            sx={{
                                                width: '60%',
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: 'white'
                                                }
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    )}

                    {formError && (
                        <Typography color="error" variant="body2">
                            {formError}
                        </Typography>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={isProcessing}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={isProcessing}
                    sx={{
                        ml: 1,
                        bgcolor: '#007AFF',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                            bgcolor: '#0062CC'
                        },
                    }}
                >
                    {isProcessing ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 