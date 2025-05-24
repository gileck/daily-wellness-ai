import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Button, Card, CardContent, Snackbar, Checkbox, ListItemIcon, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, Avatar } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';

import { useActivityLogData } from './hooks/useActivityLogData';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { TrackedActivity, TrackedActivityValue, UpdateTrackedActivityPayload } from '@/apis/trackedActivities/types';
import { ActivityTypeClient } from '@/apis/activity/types';
import { getActivityTypes } from '@/apis/activity/client';
import { ActivityActions } from './components/ActivityActions';
import { ActivityDialog } from '@/client/components/TrackActivityDialog';
import { ActivityFilterDialog } from './components/ActivityFilterDialog';
import { getActivityIcon } from '@/client/utils/activityIcons';
import { formatFieldValue } from '@/client/utils/foodDisplayUtils';

const getActivityIconForTrackedActivity = (activity: TrackedActivity): React.ReactElement | null => {
    // Use the icon from the activity type if available
    if (activity.activityType?.icon) {
        console.log(`Using database icon "${activity.activityType.icon}" for activity "${activity.activityName}"`);
        return getActivityIcon(activity.activityType.icon);
    }

    // No database icon found, don't show an icon
    console.log(`No database icon found for activity "${activity.activityName}", not showing icon`);
    return null;
};

const getActivityColor = (activity: TrackedActivity): string => {
    // Use the color from the activity type if available
    if (activity.activityType?.color) {
        console.log(`Using database color "${activity.activityType.color}" for activity "${activity.activityName}"`);
        return activity.activityType.color;
    }
    // Default color
    return '#007AFF';
};

export const ActivityLogPage = () => {
    const [selectedActivity, setSelectedActivity] = useState<TrackedActivity | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<(() => Promise<void>) | null>(null);
    const [deleteMessage, setDeleteMessage] = useState<string>('');
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [activityTypes, setActivityTypes] = useState<ActivityTypeClient[]>([]);
    const [filters, setFilters] = useState<{
        selectedActivityNames: string[];
        dateFrom: Date | null;
        dateTo: Date | null;
    }>({
        selectedActivityNames: [],
        dateFrom: null,
        dateTo: null
    });

    const {
        trackedActivities,
        isLoading,
        error,
        fetchActivities,
        updateActivity,
        removeActivity,
        duplicateActivity
    } = useActivityLogData();

    // Fetch activity types
    useEffect(() => {
        const fetchActivityTypesData = async () => {
            try {
                const response = await getActivityTypes();
                setActivityTypes(response.data.activityTypes);
            } catch (error) {
                console.error('Failed to fetch activity types:', error);
            }
        };
        fetchActivityTypesData();
    }, []);

    const uniqueActivityNames = useMemo(() => {
        return Array.from(new Set(trackedActivities.map(activity => activity.activityName))).sort();
    }, [trackedActivities]);

    const filteredActivities = useMemo(() => {
        console.log(`Total tracked activities received: ${trackedActivities.length}`);

        // Debug: Log the first few activities to see ActivityType data
        trackedActivities.slice(0, 3).forEach((activity, index) => {
            console.log(`Activity ${index + 1}: "${activity.activityName}"`, {
                activityType: activity.activityType,
                hasIcon: !!activity.activityType?.icon,
                hasColor: !!activity.activityType?.color
            });
        });

        return trackedActivities.filter(activity => {
            // Filter by activity name
            if (filters.selectedActivityNames.length > 0 && !filters.selectedActivityNames.includes(activity.activityName)) {
                return false;
            }

            // Filter by date range
            const activityDate = new Date(activity.timestamp);
            if (filters.dateFrom && isBefore(activityDate, startOfDay(filters.dateFrom))) {
                return false;
            }
            if (filters.dateTo && isAfter(activityDate, endOfDay(filters.dateTo))) {
                return false;
            }

            return true;
        });
    }, [trackedActivities, filters]);

    const handleEditClick = (activity: TrackedActivity) => {
        setSelectedActivity(activity);
        setIsEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setIsEditDialogOpen(false);
        setSelectedActivity(null);
    };

    const handleUpdateActivity = async (activityId: string, updates: UpdateTrackedActivityPayload['updates']) => {
        const success = await updateActivity(activityId, updates);
        if (success) {
            setSnackbarMessage('Activity updated successfully');
            setIsSnackbarOpen(true);
        }
        return success;
    };

    const handleDeleteActivity = async (activityId: string) => {
        setDeleteMessage('Are you sure you want to delete this activity? This action cannot be undone.');
        setDeleteAction(() => async () => {
            const success = await removeActivity(activityId);
            if (success) {
                setSnackbarMessage('Activity deleted successfully');
                setIsSnackbarOpen(true);
            }
        });
        setIsDeleteConfirmOpen(true);
        return true;
    };

    const handleDuplicateActivity = async (activityId: string) => {
        const success = await duplicateActivity(activityId);
        if (success) {
            setSnackbarMessage('Activity duplicated successfully');
            setIsSnackbarOpen(true);
        }
        return success;
    };

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
    };

    const handleSelectActivity = (activityId: string) => {
        setSelectedActivities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(activityId)) {
                newSet.delete(activityId);
            } else {
                newSet.add(activityId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedActivities.size === filteredActivities.length) {
            setSelectedActivities(new Set());
        } else {
            setSelectedActivities(new Set(filteredActivities.map(activity => activity._id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedActivities.size === 0) return;

        setDeleteMessage(`Are you sure you want to delete ${selectedActivities.size} ${selectedActivities.size === 1 ? 'activity' : 'activities'}? This action cannot be undone.`);
        setDeleteAction(() => async () => {
            let successCount = 0;
            for (const activityId of selectedActivities) {
                const success = await removeActivity(activityId);
                if (success) {
                    successCount++;
                }
            }

            if (successCount > 0) {
                setSnackbarMessage(`${successCount} ${successCount === 1 ? 'activity' : 'activities'} deleted successfully`);
                setIsSnackbarOpen(true);
                setSelectedActivities(new Set());
            }
        });
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (deleteAction) {
            await deleteAction();
        }
        setIsDeleteConfirmOpen(false);
        setDeleteAction(null);
        setDeleteMessage('');
    };

    const handleCancelDelete = () => {
        setIsDeleteConfirmOpen(false);
        setDeleteAction(null);
        setDeleteMessage('');
    };

    const handleToggleEditMode = () => {
        setIsEditMode(prev => !prev);
        if (isEditMode) {
            setSelectedActivities(new Set());
        }
    };

    const handleOpenFilterDialog = () => {
        setIsFilterDialogOpen(true);
    };

    const handleCloseFilterDialog = () => {
        setIsFilterDialogOpen(false);
    };

    const handleApplyFilters = (newFilters: typeof filters) => {
        setFilters(newFilters);
        setIsFilterDialogOpen(false);
    };

    const hasActiveFilters = filters.selectedActivityNames.length > 0 || filters.dateFrom || filters.dateTo;

    // Find the activity type for the selected activity
    const selectedActivityType = selectedActivity && activityTypes.find(
        type => type.name === selectedActivity.activityName
    );

    if (isLoading && trackedActivities.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress sx={{ color: '#007AFF' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, maxWidth: '800px', mx: 'auto' }}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    mb: 3,
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#000000'
                }}
            >
                Activity Log
            </Typography>

            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                    onClick={() => fetchActivities()}
                    disabled={isLoading}
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    sx={{
                        bgcolor: '#007AFF',
                        borderRadius: '8px',
                        textTransform: 'none',
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                            bgcolor: '#0062CC'
                        },
                        fontSize: '16px',
                        fontWeight: 500,
                    }}
                >
                    Refresh
                </Button>

                <Button
                    onClick={handleToggleEditMode}
                    variant={isEditMode ? "contained" : "outlined"}
                    startIcon={<EditIcon />}
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '16px',
                        fontWeight: 500,
                        ...(isEditMode ? {
                            bgcolor: '#FF9500',
                            '&:hover': {
                                bgcolor: '#E6850E'
                            }
                        } : {
                            borderColor: '#FF9500',
                            color: '#FF9500',
                            '&:hover': {
                                borderColor: '#E6850E',
                                bgcolor: 'rgba(255, 149, 0, 0.04)'
                            }
                        })
                    }}
                >
                    {isEditMode ? 'Exit Edit' : 'Edit'}
                </Button>

                <Button
                    onClick={handleOpenFilterDialog}
                    variant={hasActiveFilters ? "contained" : "outlined"}
                    startIcon={<FilterListIcon />}
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '16px',
                        fontWeight: 500,
                        ...(hasActiveFilters ? {
                            bgcolor: '#34C759',
                            '&:hover': {
                                bgcolor: '#2DB84D'
                            }
                        } : {
                            borderColor: '#34C759',
                            color: '#34C759',
                            '&:hover': {
                                borderColor: '#2DB84D',
                                bgcolor: 'rgba(52, 199, 89, 0.04)'
                            }
                        })
                    }}
                >
                    Filter {hasActiveFilters && `(${filteredActivities.length})`}
                </Button>
            </Box>

            {isEditMode && filteredActivities.length > 0 && (
                <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        onClick={handleSelectAll}
                        variant="outlined"
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontSize: '16px',
                            fontWeight: 500,
                        }}
                    >
                        {selectedActivities.size === filteredActivities.length ? 'Deselect All' : 'Select All'}
                    </Button>

                    {selectedActivities.size > 0 && (
                        <Button
                            onClick={handleBulkDelete}
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontSize: '16px',
                                fontWeight: 500,
                            }}
                        >
                            Delete Selected ({selectedActivities.size})
                        </Button>
                    )}
                </Box>
            )}

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: '8px',
                        '& .MuiAlert-icon': { color: '#FF3B30' }
                    }}
                >
                    {`Error fetching activities: ${error}`}
                </Alert>
            )}

            {filteredActivities.length === 0 && !isLoading && !error && (
                <Alert
                    severity="info"
                    sx={{
                        mb: 3,
                        borderRadius: '8px',
                        '& .MuiAlert-icon': { color: '#5AC8FA' }
                    }}
                >
                    {hasActiveFilters ? 'No activities match the current filters.' : 'No activities found.'}
                </Alert>
            )}

            <Card
                sx={{
                    borderRadius: '12px',
                    boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    bgcolor: '#FFFFFF'
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    <List sx={{ width: '100%' }}>
                        {filteredActivities.map((activity: TrackedActivity, index: number) => (
                            <React.Fragment key={activity._id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.03)'
                                        }
                                    }}
                                >
                                    {isEditMode && (
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: 2 }}>
                                            <Checkbox
                                                checked={selectedActivities.has(activity._id)}
                                                onChange={() => handleSelectActivity(activity._id)}
                                                sx={{
                                                    color: '#007AFF',
                                                    '&.Mui-checked': {
                                                        color: '#007AFF',
                                                    },
                                                }}
                                            />
                                        </ListItemIcon>
                                    )}

                                    {getActivityIconForTrackedActivity(activity) && (
                                        <Avatar
                                            sx={{
                                                bgcolor: getActivityColor(activity),
                                                width: 40,
                                                height: 40,
                                                mr: 2,
                                                mt: 0.5
                                            }}
                                        >
                                            {getActivityIconForTrackedActivity(activity)}
                                        </Avatar>
                                    )}

                                    <ListItemText
                                        primary={
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontSize: '17px',
                                                        fontWeight: 500,
                                                        color: '#007AFF'
                                                    }}
                                                >
                                                    {activity.activityName}
                                                </Typography>
                                                <ActivityActions
                                                    activity={activity}
                                                    onEdit={handleEditClick}
                                                    onDelete={handleDeleteActivity}
                                                    onDuplicate={handleDuplicateActivity}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    sx={{
                                                        display: 'block',
                                                        color: 'text.secondary',
                                                        fontSize: '15px',
                                                        mb: 1
                                                    }}
                                                >
                                                    {format(new Date(activity.timestamp), 'PPP p')}
                                                </Typography>
                                                {activity.notes && (
                                                    <Typography
                                                        component="p"
                                                        variant="body2"
                                                        sx={{
                                                            mt: 1,
                                                            fontSize: '15px',
                                                            color: 'text.primary',
                                                            mb: 1.5
                                                        }}
                                                    >
                                                        {activity.notes}
                                                    </Typography>
                                                )}
                                                <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {activity.values.map((val: TrackedActivityValue) => {
                                                        const formattedValue = formatFieldValue(val.fieldName, val.value);

                                                        // If it's a React node (food chips), render directly
                                                        if (React.isValidElement(formattedValue)) {
                                                            return (
                                                                <Box key={val.fieldName} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                    <Typography variant="body2" sx={{ fontSize: '13px', color: '#007AFF', fontWeight: 500 }}>
                                                                        {val.fieldName}:
                                                                    </Typography>
                                                                    {formattedValue}
                                                                </Box>
                                                            );
                                                        }

                                                        // Otherwise render as chip
                                                        return (
                                                            <Chip
                                                                key={val.fieldName}
                                                                label={formattedValue}
                                                                variant="outlined"
                                                                size="small"
                                                                sx={{
                                                                    borderColor: '#007AFF',
                                                                    color: '#007AFF',
                                                                    fontSize: '13px',
                                                                    '& .MuiChip-label': {
                                                                        px: 1.5
                                                                    }
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            </>
                                        }
                                    />
                                </ListItem>
                                {index < filteredActivities.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </CardContent>
            </Card>

            {selectedActivityType && (
                <ActivityDialog
                    open={isEditDialogOpen}
                    activityType={selectedActivityType}
                    existingActivity={selectedActivity}
                    onClose={handleEditClose}
                    onEdit={handleUpdateActivity}
                    isSubmitting={false}
                />
            )}

            <ActivityFilterDialog
                open={isFilterDialogOpen}
                onClose={handleCloseFilterDialog}
                onApply={handleApplyFilters}
                availableActivities={uniqueActivityNames}
                currentFilters={filters}
            />

            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />

            <Dialog
                open={isDeleteConfirmOpen}
                onClose={handleCancelDelete}
                aria-labelledby="delete-confirm-dialog-title"
                aria-describedby="delete-confirm-dialog-description"
            >
                <DialogTitle id="delete-confirm-dialog-title">
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-confirm-dialog-description">
                        {deleteMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}; 