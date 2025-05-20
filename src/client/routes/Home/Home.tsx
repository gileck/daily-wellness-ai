import React from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Snackbar,
  Divider,
  Chip
} from '@mui/material';
import { useHomeData } from './hooks/useHomeData';
import { TrackActivityDialog } from '@/client/components/TrackActivityDialog/TrackActivityDialog';
import { ActivityTypeClient } from '@/apis/activity/types';

// iOS-inspired color palette
const colors = {
  primary: '#007AFF',
  secondary: '#FF2D55',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',
  background: '#F2F2F7',
  surface: '#FFFFFF',
};

// Helper to get a simple color based on activity name/type for variety
// Now returns iOS-inspired colors with subtle variations
const getActivityColor = (activityName: string): string => {
  const baseColors = [
    colors.primary,    // iOS blue
    '#5856D6',         // iOS purple
    colors.secondary,  // iOS pink
    '#4CD964',         // iOS green
    '#FFCC00',         // iOS yellow
    colors.info,       // iOS light blue
    '#FF9500'          // iOS orange
  ];

  let hash = 0;
  for (let i = 0; i < activityName.length; i++) {
    hash = activityName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use the hash to select one of our predefined iOS colors
  const index = Math.abs(hash) % baseColors.length;
  return baseColors[index];
};

// Format relative time (e.g., "2 hours ago")
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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
    successMessage,
    clearSuccessMessage,
    lastLoggedTimes,
    recentlyLoggedActivities,
    fetchActivityTypes
  } = useHomeData();

  if (isLoading && !activityTypes.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        width: '100%',
        backgroundColor: colors.background,
        borderRadius: '16px'
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: '28px',
          color: '#1A1A1A'
        }}
      >
        Track New Activity
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: '8px',
            '& .MuiAlert-icon': {
              color: colors.error
            }
          }}
        >
          {error}
          <Button
            onClick={fetchActivityTypes}
            size="small"
            sx={{
              ml: 2,
              borderRadius: '8px',
              textTransform: 'none',
              color: colors.primary,
              '&:hover': {
                backgroundColor: 'rgba(0, 122, 255, 0.08)'
              }
            }}
          >
            Try Again
          </Button>
        </Alert>
      )}

      {activityTypes.length === 0 && !isLoading && (
        <Alert
          severity="info"
          sx={{
            borderRadius: '8px',
            '& .MuiAlert-icon': {
              color: colors.info
            }
          }}
        >
          No activity types configured or enabled. Please configure them in settings.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, rowGap: 3 }}>
        {activityTypes.map((activity: ActivityTypeClient) => {
          const lastLogged = lastLoggedTimes[activity._id];

          return (
            <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', md: '33.3333%', lg: '25%' } }} key={activity._id}>
              <Card sx={{
                height: '100%',
                borderRadius: '12px',
                boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
                backgroundColor: getActivityColor(activity.name + activity.type),
                color: 'white',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)'
                }
              }}>
                <CardActionArea
                  onClick={() => openTrackingDialog(activity)}
                  sx={{
                    height: '100%',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1
                  }}
                >
                  <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                    padding: 3
                  }}>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{
                        fontWeight: 600,
                        textAlign: 'center',
                        fontSize: '22px'
                      }}
                    >
                      {activity.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: 'center',
                        mt: 1,
                        fontSize: '15px',
                        opacity: 0.9
                      }}
                    >
                      {activity.type}
                    </Typography>

                    {lastLogged && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 'auto',
                          pt: 2,
                          textAlign: 'center',
                          fontSize: '13px',
                          opacity: 0.8,
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '0 0 12px 12px',
                          padding: '6px 0',
                          marginBottom: -3,
                          marginLeft: -3,
                          marginRight: -3,
                          width: 'calc(100% + 48px)'
                        }}
                      >
                        Last logged: {formatRelativeTime(lastLogged)}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Recently Tracked Activities Section */}
      {recentlyLoggedActivities.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: '22px',
              color: '#1A1A1A',
              mb: 2
            }}
          >
            Recently Tracked Activities
          </Typography>

          <Box sx={{ mt: 2 }}>
            {recentlyLoggedActivities.map((item, index) => (
              <Card
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: '10px',
                  boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  overflow: 'visible'
                }}
              >
                <CardContent sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: getActivityColor(item.activityType.name + item.activityType.type),
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        mr: 2
                      }}
                    >
                      {item.activityType.name.substring(0, 2).toUpperCase()}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {item.activityType.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.activityType.type}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={formatRelativeTime(item.timestamp)}
                    sx={{
                      borderRadius: '16px',
                      backgroundColor: 'rgba(0, 122, 255, 0.1)',
                      color: colors.primary,
                      fontWeight: 500,
                      fontSize: '12px'
                    }}
                  />
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {trackingDialog.activityType && (
        <TrackActivityDialog
          open={trackingDialog.open}
          activityType={trackingDialog.activityType}
          onClose={closeTrackingDialog}
          onTrack={handleTrackActivity}
          isSubmitting={isSubmitting}
          error={error}
        />
      )}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={clearSuccessMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '8px'
          }
        }}
      >
        <Alert
          onClose={clearSuccessMessage}
          severity="success"
          sx={{
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            backgroundColor: colors.success,
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};
