import React from 'react';
import {
  Paper,
  Typography,
  Alert,
  Button,
  Snackbar,
  LinearProgress,
  Box
} from '@mui/material';
import { useHomeData } from './hooks/useHomeData';
import { TrackActivityDialog } from '@/client/components/TrackActivityDialog';
import { TrackMetricDialog } from '@/client/components/TrackMetricDialog';
import { ActivityTypesGrid, QuickPresetsSection, RecentActivitiesSection, WellnessMetricsSection } from './components';
import { colors } from './utils/colorUtils';

export const Home = () => {
  const {
    activityTypes,
    wellnessMetrics,
    isLoading,
    isRefreshing,
    error,
    trackingDialog,
    metricDialog,
    openTrackingDialog,
    closeTrackingDialog,
    openMetricDialog,
    closeMetricDialog,
    handleTrackActivity,
    handleTrackMetric,
    isSubmitting,
    successMessage,
    clearSuccessMessage,
    recentlyLoggedActivities,
    fetchActivityTypes,
    activityPresets,
    handleTrackPreset
  } = useHomeData();

  // Show progress bar during initial loading
  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: 0
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '800px',
            position: 'relative'
          }}
        >
          <LinearProgress
            sx={{
              height: 3,
              borderRadius: '4px',
              '& .MuiLinearProgress-bar': {
                backgroundColor: colors.primary
              }
            }}
          />
        </Box>
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
        borderRadius: '16px',
        position: 'relative'
      }}
    >
      {/* Progress overlay when refreshing data */}
      {isRefreshing && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <LinearProgress
            sx={{
              height: 3,
              borderRadius: '16px 16px 0 0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: colors.primary
              }
            }}
          />
        </Box>
      )}

      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 2,
          fontWeight: 600,
          fontSize: '24px',
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

      {activityTypes.length === 0 && (
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

      {/* Wellness Metrics Section */}
      <WellnessMetricsSection
        wellnessMetrics={wellnessMetrics}
        onMetricClick={openMetricDialog}
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

      {/* Track Metric Dialog */}
      {metricDialog.metric && (
        <TrackMetricDialog
          open={metricDialog.open}
          metric={metricDialog.metric}
          onClose={closeMetricDialog}
          onTrack={handleTrackMetric}
          isSubmitting={isSubmitting}
          error={error}
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
