import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ActivityPresetClient } from '@/apis/activityPresets/types';
import { formatFieldValue } from '@/client/utils/foodDisplayUtils';

interface ActivityPresetCardProps {
    preset: ActivityPresetClient;
    onEdit: (preset: ActivityPresetClient) => void;
    onDelete: (presetId: string) => void;
}

export const ActivityPresetCard: React.FC<ActivityPresetCardProps> = ({
    preset,
    onEdit,
    onDelete
}) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        onDelete(preset._id);
        setIsDeleteDialogOpen(false);
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
    };

    return (
        <>
            <Card
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
                    }
                }}
            >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {preset.name}
                        </Typography>
                        <Box>
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onEdit(preset); }}
                                sx={{ mr: 1, color: 'primary.main' }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
                                sx={{ color: 'error.main' }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {preset.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {preset.description}
                        </Typography>
                    )}

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Preset Fields:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(preset.presetFields).map(([fieldName, fieldValue]) => {
                                const formattedValue = formatFieldValue(fieldName, fieldValue);
                                return (
                                    <Box key={fieldName} sx={{ display: 'inline-block' }}>
                                        {React.isValidElement(formattedValue) ? (
                                            formattedValue
                                        ) : (
                                            <Chip
                                                label={formattedValue}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 2,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                            Used {preset.usageCount} times
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Last used: {new Date(preset.lastUsedAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            <Dialog
                open={isDeleteDialogOpen}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        minWidth: '300px',
                        maxWidth: '400px',
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Delete Activity Preset
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete the &quot;{preset.name}&quot; preset? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleCancelDelete}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                        sx={{
                            ml: 1,
                            bgcolor: 'error.main',
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                                bgcolor: 'error.dark',
                            },
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}; 