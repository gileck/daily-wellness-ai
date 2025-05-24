import React from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import { useHomeData } from './hooks/useHomeData';
import { TrackActivityDialog } from '@/client/components/TrackActivityDialog';
import { ActivityTypesGrid, QuickPresetsSection, RecentActivitiesSection } from './components';
import { colors } from './utils/colorUtils';

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
    recentlyLoggedActivities,
    fetchActivityTypes,
    activityPresets,
    handleTrackPreset
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
          mb: 4,
          fontWeight: 600,
          fontSize: '28px',
          color: '#1A1A1A',
          textAlign: 'center'
        }}
      >
        Daily Wellness
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

      {/* Activity Types Grid */}
      <ActivityTypesGrid
        activityTypes={activityTypes}
        onActivityClick={openTrackingDialog}
      />

      {/* Quick Presets Section */}
      <QuickPresetsSection
        activityPresets={activityPresets}
        onPresetClick={handleTrackPreset}
      />

      {/* Recent Activities Section */}
      <RecentActivitiesSection
        recentlyLoggedActivities={recentlyLoggedActivities}
        activityTypes={activityTypes}
      />

      {/* Track Activity Dialog */}
      {trackingDialog.activityType && (
        <TrackActivityDialog
          open={trackingDialog.open}
          activityType={trackingDialog.activityType}
          onClose={closeTrackingDialog}
          onTrack={handleTrackActivity}
          isSubmitting={isSubmitting}
          error={error}
          initialValues={trackingDialog.presetValues}
        />
      )}

      {/* Success Snackbar */}
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
