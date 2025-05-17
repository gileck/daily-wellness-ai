import React from 'react';
import { Typography, Paper, Box, CircularProgress, Alert, List, ListItem, ListItemText, Divider, Chip, Button } from '@mui/material';
import { useHistoryData } from './hooks/useHistoryData';
import { TrackedActivity, TrackedActivityValue } from '@/apis/trackedActivities/types';

export const HistoryPage = () => {
    const {
        trackedActivities,
        isLoading,
        error,
        // loadMore,
        // hasMore,
        fetchHistory
    } = useHistoryData();

    if (isLoading && trackedActivities.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={0} sx={{ p: 3, width: '100%', backgroundColor: 'transparent' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
                Tracking History
            </Typography>
            <Button onClick={() => fetchHistory(0)} disabled={isLoading} sx={{ mb: 2 }}>Refresh</Button>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {`Error fetching history: ${error}`}
                </Alert>
            )}

            {trackedActivities.length === 0 && !isLoading && !error && (
                <Alert severity="info">No tracked activities found.</Alert>
            )}

            <List>
                {trackedActivities.map((activity: TrackedActivity, index: number) => (
                    <React.Fragment key={activity._id}>
                        <ListItem alignItems="flex-start">
                            <ListItemText
                                primary={`${activity.activityName} - ${new Date(activity.timestamp).toLocaleString()}`}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            Notes: {activity.notes || 'N/A'}
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            {activity.values.map((val: TrackedActivityValue) => (
                                                <Chip
                                                    key={val.fieldName}
                                                    label={`${val.fieldName}: ${String(val.value)}`}
                                                    size="small"
                                                    sx={{ mr: 0.5, mb: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    </>
                                }
                            />
                        </ListItem>
                        {index < trackedActivities.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>

            {/* TODO: Add pagination or infinite scroll (loadMore, hasMore) */}
            {/* {isLoading && trackedActivities.length > 0 && <CircularProgress sx={{mt: 2}} />} */}
        </Paper>
    );
}; 