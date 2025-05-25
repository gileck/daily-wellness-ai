import React from 'react';
import { Box, Paper, Typography, Button, Alert, CircularProgress, List, ListItem, ListItemText, IconButton, ListItemIcon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { AddWellnessMetricDialog } from './AddWellnessMetricDialog';
import { useActivityConfigurationDashboard } from '../hooks/useActivityConfigurationDashboard';
import { getActivityIconWithProps } from '@/client/utils/activityIcons';

export const MetricsTab: React.FC = () => {
    const {
        predefinedData,
        userWellnessMetrics,
        isLoading,
        error,
        isSubmitting,
        openAddMetricDialog,
        editingWellnessMetric,
        fetchData,
        handleTogglePredefined,
        handleSaveWellnessMetric,
        handleDeleteWellnessMetric,
        handleOpenAddMetricDialog,
        handleCloseAddMetricDialog,
        isItemAddedAndEnabled,
    } = useActivityConfigurationDashboard();

    if (isLoading && !userWellnessMetrics.length && !predefinedData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !Object.values(isSubmitting).some(s => s) && (!predefinedData || !userWellnessMetrics.length)) {
        return (
            <Alert severity="error">
                {error}
                <Button onClick={fetchData} sx={{ ml: 2 }} variant="outlined" size="small">Retry</Button>
            </Alert>
        );
    }

    return (
        <Box>
            {/* Wellness Metrics Section */}
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 5, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} mb={3.5}>
                    <Box mb={{ xs: 2.5, sm: 0 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: '600', color: 'text.primary' }}>
                            Wellness Metrics
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                            Manage your custom wellness metrics. Predefined metrics can be enabled below.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenAddMetricDialog()}
                        disabled={Object.values(isSubmitting).some(s => s)}
                        sx={{
                            alignSelf: { xs: 'flex-start', sm: 'auto' },
                            px: 2.5, py: 1.25,
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Add Custom Metric
                    </Button>
                </Box>
                {userWellnessMetrics.filter(wm => wm.enabled).length > 0 ? (
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" component="h4" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>Your Metrics</Typography>
                        <List disablePadding>
                            {userWellnessMetrics.filter(wm => wm.enabled).map(wm => (
                                <ListItem
                                    key={wm._id}
                                    sx={{ borderBottom: '1px solid #E0E0E0', '&:last-child': { borderBottom: 'none' }, py: 1 }}
                                    secondaryAction={
                                        <Box>
                                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenAddMetricDialog(wm)} sx={{ mr: 0.5 }}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteWellnessMetric(wm._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: wm.color || '#007AFF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}
                                        >
                                            {wm.icon ? getActivityIconWithProps(wm.icon, { sx: { fontSize: 18 } }) : wm.name.charAt(0).toUpperCase()}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText primary={wm.name} secondary={wm.enabled ? 'Active' : 'Inactive'} primaryTypographyProps={{ fontWeight: '500' }} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                ) : (
                    <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center', py: 2 }}>
                        No wellness metrics added yet.
                    </Typography>
                )}
            </Paper>

            {/* Predefined Wellness Metrics Section */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600', color: 'text.primary', mt: 6, mb: 3, textAlign: 'center' }}>
                Available Templates
            </Typography>
            {!isLoading && !predefinedData && (
                <Alert severity="warning" sx={{ mb: 3, justifyContent: 'center' }}>Could not load predefined templates. <Button onClick={fetchData} size="small" sx={{ ml: 1 }}>Retry</Button></Alert>
            )}

            <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: '500', color: 'text.primary', mb: 2 }}>
                    Predefined Wellness Metrics
                </Typography>
                {isLoading && predefinedData?.predefinedWellnessMetrics.length === 0 && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}
                {predefinedData && predefinedData.predefinedWellnessMetrics.length > 0 ? (
                    <List disablePadding>
                        {predefinedData.predefinedWellnessMetrics.map(item => {
                            const isAdded = isItemAddedAndEnabled(item, 'wellnessMetric');
                            return (
                                <ListItem
                                    key={item.id}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => !isAdded && handleTogglePredefined(item, 'wellnessMetric')}
                                            disabled={isAdded || isSubmitting[item.id] || Object.values(isSubmitting).some(Boolean)}
                                            color={isAdded ? "success" : "primary"}
                                            aria-label={isAdded ? "Added" : "Add"}
                                        >
                                            {isAdded ? <CheckIcon /> : <AddIcon />}
                                        </IconButton>
                                    }
                                    sx={{ borderBottom: '1px solid #E0E0E0', '&:last-child': { borderBottom: 'none' }, py: 1.5 }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Box
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '50%',
                                                backgroundColor: item.color || '#007AFF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}
                                        >
                                            {item.icon ? getActivityIconWithProps(item.icon, { sx: { fontSize: 18 } }) : item.name.charAt(0).toUpperCase()}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.name}
                                        primaryTypographyProps={{ fontWeight: '500' }}
                                    />
                                    {isSubmitting[item.id] && <CircularProgress size={20} sx={{ ml: 1, position: 'absolute', right: 60, top: '50%', marginTop: '-10px' }} />}
                                </ListItem>
                            );
                        })}
                    </List>
                ) : !isLoading && <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center', py: 2 }}>No predefined wellness metrics available.</Typography>}
            </Paper>

            <AddWellnessMetricDialog
                open={openAddMetricDialog}
                onClose={handleCloseAddMetricDialog}
                onSubmit={handleSaveWellnessMetric}
                metricToEdit={editingWellnessMetric}
            />
        </Box>
    );
}; 