import React, { useState } from 'react';
import { Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Button, Card, CardContent, Snackbar } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useActivityLogData } from './hooks/useActivityLogData';
import { format } from 'date-fns';
import { TrackedActivity, TrackedActivityValue, UpdateTrackedActivityPayload } from '@/apis/trackedActivities/types';
import { ActivityActions } from './components/ActivityActions';
import { ActivityEditDialog } from './components/ActivityEditDialog';

export const ActivityLogPage = () => {
    const [selectedActivity, setSelectedActivity] = useState<TrackedActivity | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

    const {
        trackedActivities,
        isLoading,
        error,
        fetchActivities,
        updateActivity,
        removeActivity,
        duplicateActivity
    } = useActivityLogData();

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

            <Button
                onClick={() => fetchActivities()}
                disabled={isLoading}
                variant="contained"
                startIcon={<RefreshIcon />}
                sx={{
                    mb: 3,
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

            {trackedActivities.length === 0 && !isLoading && !error && (
                <Alert
                    severity="info"
                    sx={{
                        mb: 3,
                        borderRadius: '8px',
                        '& .MuiAlert-icon': { color: '#5AC8FA' }
                    }}
                >
                    No activities found.
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
                        {trackedActivities.map((activity: TrackedActivity, index: number) => (
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
                                                            color: 'text.primary'
                                                        }}
                                                    >
                                                        {activity.notes}
                                                    </Typography>
                                                )}
                                                <Box sx={{ mt: 1.5 }}>
                                                    {activity.values.map((val: TrackedActivityValue) => (
                                                        <Box
                                                            key={val.fieldName}
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                mb: 0.5,
                                                                p: 1,
                                                                borderRadius: '6px',
                                                                bgcolor: '#F2F2F7',
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="body2"
                                                                component="span"
                                                                sx={{
                                                                    fontSize: '15px',
                                                                    fontWeight: 500,
                                                                    color: 'text.secondary',
                                                                }}
                                                            >
                                                                {val.fieldName}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                component="span"
                                                                sx={{
                                                                    fontSize: '15px',
                                                                    fontWeight: 400,
                                                                }}
                                                            >
                                                                {String(val.value)}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </>
                                        }
                                    />
                                </ListItem>
                                {index < trackedActivities.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </CardContent>
            </Card>

            <ActivityEditDialog
                open={isEditDialogOpen}
                activity={selectedActivity}
                onClose={handleEditClose}
                onSave={handleUpdateActivity}
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