import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface ActivityFilterDialogProps {
    open: boolean;
    onClose: () => void;
    onApply: (filters: {
        selectedActivityNames: string[];
        dateFrom: Date | null;
        dateTo: Date | null;
    }) => void;
    availableActivities: string[];
    currentFilters: {
        selectedActivityNames: string[];
        dateFrom: Date | null;
        dateTo: Date | null;
    };
}

export const ActivityFilterDialog: React.FC<ActivityFilterDialogProps> = ({
    open,
    onClose,
    onApply,
    availableActivities,
    currentFilters
}) => {
    const [selectedActivityNames, setSelectedActivityNames] = useState<string[]>(currentFilters.selectedActivityNames);
    const [dateFrom, setDateFrom] = useState<Date | null>(currentFilters.dateFrom);
    const [dateTo, setDateTo] = useState<Date | null>(currentFilters.dateTo);

    useEffect(() => {
        if (open) {
            setSelectedActivityNames(currentFilters.selectedActivityNames);
            setDateFrom(currentFilters.dateFrom);
            setDateTo(currentFilters.dateTo);
        }
    }, [open, currentFilters]);

    const handleApply = () => {
        onApply({
            selectedActivityNames,
            dateFrom,
            dateTo
        });
    };

    const handleClear = () => {
        setSelectedActivityNames([]);
        setDateFrom(null);
        setDateTo(null);
    };

    const handleActivitySelect = (activityName: string) => {
        setSelectedActivityNames(prev => {
            if (prev.includes(activityName)) {
                return prev.filter(name => name !== activityName);
            } else {
                return [...prev, activityName];
            }
        });
    };

    const handleSelectAllActivities = () => {
        if (selectedActivityNames.length === availableActivities.length) {
            setSelectedActivityNames([]);
        } else {
            setSelectedActivityNames([...availableActivities]);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '12px' }
                }}
            >
                <DialogTitle sx={{ pb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Filter Activities
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                            Activity Types
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleSelectAllActivities}
                                sx={{ borderRadius: '6px', textTransform: 'none' }}
                            >
                                {selectedActivityNames.length === availableActivities.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {availableActivities.map(activity => (
                                <Chip
                                    key={activity}
                                    label={activity}
                                    clickable
                                    variant={selectedActivityNames.includes(activity) ? 'filled' : 'outlined'}
                                    onClick={() => handleActivitySelect(activity)}
                                    sx={{
                                        borderRadius: '16px',
                                        ...(selectedActivityNames.includes(activity) && {
                                            bgcolor: '#007AFF',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#0062CC'
                                            }
                                        })
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500 }}>
                            Date Range
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <DatePicker
                                label="From Date"
                                value={dateFrom}
                                onChange={(newValue) => setDateFrom(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: { flex: 1 }
                                    }
                                }}
                            />

                            <DatePicker
                                label="To Date"
                                value={dateTo}
                                onChange={(newValue) => setDateTo(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: { flex: 1 }
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button
                        onClick={handleClear}
                        variant="outlined"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            mr: 'auto'
                        }}
                    >
                        Clear All
                    </Button>

                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none'
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleApply}
                        variant="contained"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            bgcolor: '#007AFF',
                            '&:hover': {
                                bgcolor: '#0062CC'
                            }
                        }}
                    >
                        Apply Filters
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}; 