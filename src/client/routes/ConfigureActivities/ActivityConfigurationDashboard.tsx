import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Alert, Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { AddActivityTypeDialog } from './components/AddActivityTypeDialog';
import { AddWellnessMetricDialog } from './components/AddWellnessMetricDialog';
import { ActivityTypeCard } from './components/ActivityTypeCard';
import { ActivityPresetCard } from './components/ActivityPresetCard';
import { AddActivityPresetDialog } from './components/AddActivityPresetDialog';
import { useActivityConfigurationDashboard } from './hooks/useActivityConfigurationDashboard';
import { useActivityPresets } from './hooks/useActivityPresets';
import { ActivityPresetClient, CreateActivityPresetPayload } from '@/apis/activityPresets/types';

export const ActivityConfigurationDashboard: React.FC = () => {
    const {
        predefinedData,
        userActivityTypes,
        userWellnessMetrics,
        isLoading,
        error,
        isSubmitting,
        openAddActivityDialog,
        editingActivityType,
        openAddMetricDialog,
        fetchData,
        handleTogglePredefined,
        handleSaveActivityType,
        handleSaveWellnessMetric,
        handleDeleteActivityType,
        editingWellnessMetric,
        handleDeleteWellnessMetric,
        handleOpenAddActivityDialog,
        handleCloseAddActivityDialog,
        handleOpenAddMetricDialog,
        handleCloseAddMetricDialog,
        isItemAddedAndEnabled,
    } = useActivityConfigurationDashboard();

    const {
        presets,
        isLoading: presetsLoading,
        isSubmitting: presetsSubmitting,
        handleCreatePreset,
        handleUpdatePreset,
        handleDeletePreset
    } = useActivityPresets();

    const [openAddPresetDialog, setOpenAddPresetDialog] = React.useState(false);
    const [editingPreset, setEditingPreset] = React.useState<ActivityPresetClient | null>(null);

    const handleOpenAddPresetDialog = (presetToEdit?: ActivityPresetClient) => {
        setEditingPreset(presetToEdit || null);
        setOpenAddPresetDialog(true);
    };

    const handleCloseAddPresetDialog = () => {
        setOpenAddPresetDialog(false);
        setEditingPreset(null);
    };

    const handleSavePreset = async (payload: CreateActivityPresetPayload | { presetId: string; updates: Partial<Pick<ActivityPresetClient, 'name' | 'description' | 'presetFields'>> }) => {
        if ('presetId' in payload) {
            await handleUpdatePreset(payload.presetId, payload.updates);
        } else {
            await handleCreatePreset(payload);
        }
    };

    if (isLoading && !userActivityTypes.length && !predefinedData && !userWellnessMetrics.length) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error && !Object.values(isSubmitting).some(s => s) && (!predefinedData || !userActivityTypes.length)) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">
                    {error}
                    <Button onClick={fetchData} sx={{ ml: 2 }} variant="outlined" size="small">Retry</Button>
                </Alert>
            </Container>
        );
    }

    if (!predefinedData && !isLoading) { // Added !isLoading to prevent showing warning during initial load
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="warning">
                    No predefined data available or failed to load.
                    <Button onClick={fetchData} sx={{ ml: 2 }} variant="outlined" size="small">Retry</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: { xs: 3, md: 5 }, color: 'text.primary', fontWeight: 'bold' }}>
                Settings
            </Typography>

            {/* Activity Types Section */}
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 5, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} mb={3.5}>
                    <Box mb={{ xs: 2.5, sm: 0 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: '600', color: 'text.primary' }}>
                            Activity Types
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                            Customize what activities you can track and what fields they include.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenAddActivityDialog()}
                        disabled={Object.values(isSubmitting).some(s => s)}
                        sx={{
                            backgroundColor: '#1A2027',
                            color: 'white',
                            '&:hover': { backgroundColor: '#343A40' },
                            alignSelf: { xs: 'flex-start', sm: 'auto' },
                            px: 2.5, py: 1.25,
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        New Type
                    </Button>
                </Box>

                {error && Object.values(isSubmitting).some(s => s) && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1, rowGap: 2 }}>
                    {isLoading && userActivityTypes.filter(at => at.enabled).length === 0 ? (
                        <Box sx={{ p: 1, width: '100%', display: 'flex', justifyContent: 'center', my: 4 }}> <CircularProgress /> </Box>
                    ) : userActivityTypes.filter(at => at.enabled).length > 0 ? (
                        userActivityTypes
                            .filter(at => at.enabled)
                            .map((activityType) => (
                                <Box sx={{ p: 1, width: { xs: '100%', sm: '50%', md: '33.3333%', lg: '25%' } }} key={activityType._id}>
                                    <ActivityTypeCard
                                        activityType={activityType}
                                        onEditClick={handleOpenAddActivityDialog}
                                        onDeleteClick={handleDeleteActivityType}
                                    />
                                </Box>
                            ))
                    ) : (
                        !isLoading && (
                            <Box sx={{ p: 1, width: '100%' }}>
                                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
                                    <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                                        No activity types are currently enabled.
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                        Enable a predefined activity type from &quot;Available Templates&quot; below or click &quot;New Type&quot; to create your own.
                                    </Typography>
                                </Paper>
                            </Box>
                        )
                    )}
                </Box>
            </Paper>

            {/* Activity Presets Section */}
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 5, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} mb={3.5}>
                    <Box mb={{ xs: 2.5, sm: 0 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: '600', color: 'text.primary' }}>
                            Activity Presets
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                            Create presets with pre-filled field values for quick activity tracking.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenAddPresetDialog()}
                        disabled={Object.values(presetsSubmitting).some(s => s)}
                        sx={{
                            backgroundColor: '#1A2027',
                            color: 'white',
                            '&:hover': { backgroundColor: '#343A40' },
                            alignSelf: { xs: 'flex-start', sm: 'auto' },
                            px: 2.5, py: 1.25,
                            borderRadius: 2,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        New Preset
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -1.5, rowGap: 3 }}>
                    {presetsLoading ? (
                        <Box sx={{ p: 1.5, width: '100%', display: 'flex', justifyContent: 'center', my: 4 }}> <CircularProgress /> </Box>
                    ) : presets.length > 0 ? (
                        presets.map((preset) => (
                            <Box sx={{ p: 1.5, width: { xs: '100%', sm: '50%', md: '33.3333%' } }} key={preset._id}>
                                <ActivityPresetCard
                                    preset={preset}
                                    onEdit={handleOpenAddPresetDialog}
                                    onDelete={handleDeletePreset}
                                />
                            </Box>
                        ))
                    ) : (
                        !presetsLoading && (
                            <Box sx={{ p: 1.5, width: '100%' }}>
                                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
                                    <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                                        No activity presets created yet.
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                        Create presets to quickly track activities with pre-filled field values.
                                    </Typography>
                                </Paper>
                            </Box>
                        )
                    )}
                </Box>
            </Paper>

            {/* Available Templates Section */}
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: '600', color: 'text.primary', mt: 6, mb: 3, textAlign: 'center' }}>
                Available Templates
            </Typography>
            {!isLoading && !predefinedData && (
                <Alert severity="warning" sx={{ mb: 3, justifyContent: 'center' }}>Could not load predefined templates. <Button onClick={fetchData} size="small" sx={{ ml: 1 }}>Retry</Button></Alert>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2, rowGap: 4 }}>
                <Box sx={{ p: 2, width: { xs: '100%', md: '50%' } }}>
                    <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: '500', color: 'text.primary', mb: 2 }}>
                            Predefined Activity Types
                        </Typography>
                        {isLoading && predefinedData?.predefinedActivityTypes.length === 0 && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}
                        {predefinedData && predefinedData.predefinedActivityTypes.length > 0 ? (
                            <List disablePadding>
                                {predefinedData.predefinedActivityTypes.map(item => {
                                    const isAdded = isItemAddedAndEnabled(item, 'activityType');
                                    return (
                                        <ListItem
                                            key={item.id}
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    onClick={() => !isAdded && handleTogglePredefined(item, 'activityType')}
                                                    disabled={isAdded || isSubmitting[item.id] || Object.values(isSubmitting).some(Boolean)}
                                                    color={isAdded ? "success" : "primary"}
                                                    aria-label={isAdded ? "Added" : "Add"}
                                                >
                                                    {isAdded ? <CheckIcon /> : <AddIcon />}
                                                </IconButton>
                                            }
                                            sx={{ borderBottom: '1px solid #E0E0E0', '&:last-child': { borderBottom: 'none' }, py: 1.5 }}
                                        >
                                            <ListItemText
                                                primary={item.name}
                                                secondary={item.description || 'No description'}
                                                primaryTypographyProps={{ fontWeight: '500' }}
                                                secondaryTypographyProps={{ fontSize: '0.8rem' }}
                                            />
                                            {isSubmitting[item.id] && <CircularProgress size={20} sx={{ ml: 1, position: 'absolute', right: 60, top: '50%', marginTop: '-10px' }} />}
                                        </ListItem>
                                    );
                                })}
                            </List>
                        ) : !isLoading && <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center', py: 2 }}>No predefined activity types available.</Typography>}
                    </Paper>
                </Box>

                <Box sx={{ p: 2, width: { xs: '100%', md: '50%' } }}>
                    <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%' }}>
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
                </Box>
            </Box>

            {/* Wellness Metrics Section */}
            <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 1, mt: 4, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <Box display="flex" justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} flexDirection={{ xs: 'column', sm: 'row' }} mb={3.5}>
                    <Box mb={{ xs: 2.5, sm: 0 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: '600', color: 'text.primary' }}>
                            Wellness Metrics
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                            Manage your custom wellness metrics. Predefined metrics can be enabled above.
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
                {userWellnessMetrics.filter(wm => !wm.isPredefined && wm.enabled).length > 0 ? (
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6" component="h4" sx={{ fontWeight: 500, color: 'text.primary', mb: 1.5 }}>Your Custom Metrics</Typography>
                        <List disablePadding>
                            {userWellnessMetrics.filter(wm => !wm.isPredefined && wm.enabled).map(wm => (
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
                                    <ListItemText primary={wm.name} secondary={wm.enabled ? 'Active' : 'Inactive'} primaryTypographyProps={{ fontWeight: '500' }} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                ) : (
                    <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center', py: 2 }}>
                        No custom wellness metrics added yet.
                    </Typography>
                )}
            </Paper>

            <AddActivityTypeDialog
                open={openAddActivityDialog}
                onClose={handleCloseAddActivityDialog}
                onSubmit={handleSaveActivityType}
                activityToEdit={editingActivityType}
            />
            <AddWellnessMetricDialog
                open={openAddMetricDialog}
                onClose={handleCloseAddMetricDialog}
                onSubmit={handleSaveWellnessMetric}
                metricToEdit={editingWellnessMetric}
            />
            <AddActivityPresetDialog
                open={openAddPresetDialog}
                onClose={handleCloseAddPresetDialog}
                onSubmit={handleSavePreset}
                activityTypes={userActivityTypes.filter(at => at.enabled)}
                presetToEdit={editingPreset}
            />
        </Container>
    );
};

export default ActivityConfigurationDashboard; 