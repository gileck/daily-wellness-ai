import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Button, Card, CardContent, Snackbar, Checkbox, ListItemIcon, Chip, Avatar } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';

import { useActivityLogData } from './hooks/useActivityLogData';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { TrackedActivity, TrackedActivityValue, UpdateTrackedActivityPayload } from '@/apis/trackedActivities/types';
import { WellnessMetricRecord } from '@/apis/wellnessMetrics/types';
import { ActivityTypeClient } from '@/apis/activity/types';
import { getActivityTypes } from '@/apis/activity/client';
import { ActivityActions } from './components/ActivityActions';
import { ActivityDialog } from '@/client/components/TrackActivityDialog';
import { ActivityFilterDialog } from './components/ActivityFilterDialog';
import { MetricRecordItem } from './components/MetricRecordItem';
import { EditMetricDialog } from '@/client/components/EditMetricDialog';
import { getActivityIcon } from '@/client/utils/activityIcons';
import { formatFieldValue } from '@/client/utils/foodDisplayUtils';

// Combined type for timeline items
type TimelineItem = {
    type: 'activity' | 'metric';
    timestamp: Date;
    data: TrackedActivity | WellnessMetricRecord;
};

const getActivityIconForTrackedActivity = (activity: TrackedActivity): React.ReactElement | null => {
    // Use the icon from the activity type if available
    if (activity.activityType?.icon) {
        return getActivityIcon(activity.activityType.icon);
    }

    // No database icon found, don't show an icon
    console.log(`No database icon found for activity "${activity.activityName}", not showing icon`);
    return null;
};

const getActivityColor = (activity: TrackedActivity): string => {
    // Use the color from the activity type if available
    if (activity.activityType?.color) {
        return activity.activityType.color;
    }
    // Default color
    return '#007AFF';
};

export const ActivityLogPage = () => {
    const [selectedActivity, setSelectedActivity] = useState<TrackedActivity | null>(null);
    const [selectedMetricRecord, setSelectedMetricRecord] = useState<WellnessMetricRecord | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isEditMetricDialogOpen, setIsEditMetricDialogOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
    const [isEditMode, setIsEditMode] = useState(false);
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
        wellnessMetricRecords,
        isLoading,
        error,
        fetchActivities,
        updateActivity,
        removeActivity,
        duplicateActivity,
        updateMetricRecord,
        removeMetricRecord
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

    // Create combined timeline of activities and metrics
    const timelineItems = useMemo(() => {
        const items: TimelineItem[] = [];

        // Add activities
        trackedActivities.forEach(activity => {
            items.push({
                type: 'activity',
                timestamp: new Date(activity.timestamp),
                data: activity
            });
        });

        // Add wellness metric records
        wellnessMetricRecords.forEach(record => {
            items.push({
                type: 'metric',
                timestamp: new Date(record.timestamp),
                data: record
            });
        });

        // Sort by timestamp (newest first)
        return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [trackedActivities, wellnessMetricRecords]);

    const filteredTimelineItems = useMemo(() => {
        console.log(`Total timeline items: ${timelineItems.length}`);

        return timelineItems.filter(item => {
            // For activities, apply existing filters
            if (item.type === 'activity') {
                const activity = item.data as TrackedActivity;

                // Filter by activity name
                if (filters.selectedActivityNames.length > 0 && !filters.selectedActivityNames.includes(activity.activityName)) {
                    return false;
                }
            }

            // Filter by date range (applies to both activities and metrics)
            if (filters.dateFrom && isBefore(item.timestamp, startOfDay(filters.dateFrom))) {
                return false;
            }
            if (filters.dateTo && isAfter(item.timestamp, endOfDay(filters.dateTo))) {
                return false;
            }

            return true;
        });
    }, [timelineItems, filters]);

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
        const success = await removeActivity(activityId);
        if (success) {
            setSnackbarMessage('Activity deleted successfully');
            setIsSnackbarOpen(true);
        }
        return success;
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
        const activityItems = filteredTimelineItems.filter(item => item.type === 'activity');
        if (selectedActivities.size === activityItems.length) {
            setSelectedActivities(new Set());
        } else {
            setSelectedActivities(new Set(activityItems.map(item => item.data._id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedActivities.size === 0) return;

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
    const activityItemsCount = filteredTimelineItems.filter(item => item.type === 'activity').length;

    // Find the activity type for the selected activity
    const selectedActivityType = selectedActivity && activityTypes.find(
        type => type.name === selectedActivity.activityName
    );

    const handleEditMetricClick = (record: WellnessMetricRecord) => {
        setSelectedMetricRecord(record);
        setIsEditMetricDialogOpen(true);
    };

    const handleEditMetricClose = () => {
        setIsEditMetricDialogOpen(false);
        setSelectedMetricRecord(null);
    };

    const handleUpdateMetricRecord = async (recordId: string, updates: { value?: number | string; notes?: string; timestamp?: Date }) => {
        const success = await updateMetricRecord(recordId, updates);
        if (success) {
            setSnackbarMessage('Metric record updated successfully');
            setIsSnackbarOpen(true);
        }
        return success;
    };

    const handleDeleteMetricRecord = async (recordId: string) => {
        const success = await removeMetricRecord(recordId);
        if (success) {
            setSnackbarMessage('Metric record deleted successfully');
            setIsSnackbarOpen(true);
        }
        return success;
    };

    if (isLoading && trackedActivities.length === 0 && wellnessMetricRecords.length === 0) {
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
                    Filter {hasActiveFilters && `(${filteredTimelineItems.length})`}
                </Button>
            </Box>

            {isEditMode && activityItemsCount > 0 && (
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
                        {selectedActivities.size === activityItemsCount ? 'Deselect All' : 'Select All'}
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

            {filteredTimelineItems.length === 0 && !isLoading && !error && (
                <Alert
                    severity="info"
                    sx={{
                        mb: 3,
                        borderRadius: '8px',
                        '& .MuiAlert-icon': { color: '#5AC8FA' }
                    }}
                >
                    {hasActiveFilters ? 'No activities or metrics match the current filters.' : 'No activities or metrics found.'}
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
                        {filteredTimelineItems.map((item: TimelineItem, index: number) => (
                            <React.Fragment key={item.data._id}>
                                {item.type === 'activity' ? (
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
                                                    checked={selectedActivities.has(item.data._id)}
                                                    onChange={() => handleSelectActivity(item.data._id)}
                                                    sx={{
                                                        color: '#007AFF',
                                                        '&.Mui-checked': {
                                                            color: '#007AFF',
                                                        },
                                                    }}
                                                />
                                            </ListItemIcon>
                                        )}

                                        {getActivityIconForTrackedActivity(item.data as TrackedActivity) && (
                                            <Avatar
                                                sx={{
                                                    bgcolor: getActivityColor(item.data as TrackedActivity),
                                                    width: 40,
                                                    height: 40,
                                                    mr: 2,
                                                    mt: 0.5
                                                }}
                                            >
                                                {getActivityIconForTrackedActivity(item.data as TrackedActivity)}
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
                                                        {(item.data as TrackedActivity).activityName}
                                                    </Typography>
                                                    <ActivityActions
                                                        activity={item.data as TrackedActivity}
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
                                                        {format(item.timestamp, 'PPP p')}
                                                    </Typography>
                                                    {(item.data as TrackedActivity).notes && (
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
                                                            {(item.data as TrackedActivity).notes}
                                                        </Typography>
                                                    )}
                                                    <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {(item.data as TrackedActivity).values.map((val: TrackedActivityValue) => {
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
                                ) : (
                                    <MetricRecordItem
                                        record={item.data as WellnessMetricRecord}
                                        onEdit={handleEditMetricClick}
                                        onDelete={handleDeleteMetricRecord}
                                    />
                                )}
                                {index < filteredTimelineItems.length - 1 && <Divider />}
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

            <EditMetricDialog
                open={isEditMetricDialogOpen}
                record={selectedMetricRecord}
                onClose={handleEditMetricClose}
                onSave={handleUpdateMetricRecord}
                isSubmitting={false}
            />

            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Box>
    );
}; 