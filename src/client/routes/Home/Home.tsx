import React from 'react';
import {
  Paper,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardActionArea,
  CardContent
} from '@mui/material';
import { useHomeData } from './hooks/useHomeData';
import { TrackActivityDialog } from '@/client/components/TrackActivityDialog';
import { ActivityTypeClient } from '@/apis/activity/types';

// Helper to get a simple color based on activity name/type for variety
const getActivityColor = (activityName: string): string => {
  let hash = 0;
  for (let i = 0; i < activityName.length; i++) {
    hash = activityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - color.length) + color;
};

export const Home = () => {
  const {
    activityTypes,
    isLoading,
    error,
    trackingDialog,
    openTrackingDialog,
    closeTrackingDialog,
    handleTrackActivity,
    isSubmitting,
    fetchActivityTypes // For a potential refresh button
  } = useHomeData();

  if (isLoading && !activityTypes.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, width: '100%', backgroundColor: 'transparent' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Track New Activity
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={fetchActivityTypes} size="small" sx={{ ml: 2 }}>Try Again</Button>
        </Alert>
      )}

      {activityTypes.length === 0 && !isLoading && (
        <Alert severity="info">No activity types configured or enabled. Please configure them in settings.</Alert>
      )}

      <Grid container spacing={3}>
        {activityTypes.map((activity: ActivityTypeClient) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={activity._id}>
            <Card sx={{
              height: '100%',
              backgroundColor: getActivityColor(activity.name + activity.type), // Basic color hashing
              color: 'white' // Assuming dark colors from hash, might need contrast logic
            }}>
              <CardActionArea onClick={() => openTrackingDialog(activity)} sx={{ height: '100%' }}>
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {activity.name}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                    {activity.type} {/* Displaying type for more context */}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {trackingDialog.activityType && (
        <TrackActivityDialog
          open={trackingDialog.open}
          activityType={trackingDialog.activityType}
          onClose={closeTrackingDialog}
          onTrack={handleTrackActivity}
          isSubmitting={isSubmitting}
          error={error} // Pass error related to submission from hook
        />
      )}
    </Paper>
  );
};
