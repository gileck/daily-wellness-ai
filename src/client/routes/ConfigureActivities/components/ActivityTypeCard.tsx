import React, { useState } from 'react';
import { ActivityTypeClient } from '@/apis/activity/types';
import { Box, Typography, IconButton, Card, CardContent, Avatar, Chip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getActivityIconWithProps } from '@/client/utils/activityIcons';

// Component to render activity icon in the avatar
const ActivityIconAvatar: React.FC<{ activityType: ActivityTypeClient }> = ({ activityType }) => {
    const iconElement = getActivityIconWithProps(activityType.icon, {
        sx: { color: 'white', fontSize: '1.2rem' }
    });

    if (iconElement) {
        return iconElement;
    }

    // Fallback to SettingsIcon
    return <SettingsIcon sx={{ color: 'white', fontSize: '1.2rem' }} />;
};

// Default color if none is set
const DEFAULT_COLOR = '#007AFF';

interface ActivityTypeCardProps {
    activityType: ActivityTypeClient;
    onEditClick: (activityType: ActivityTypeClient) => void;
    onDeleteClick: (activityTypeId: string) => void;
}

export const ActivityTypeCard: React.FC<ActivityTypeCardProps> = ({ activityType, onEditClick, onDeleteClick }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        onEditClick(activityType);
        handleClose();
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
        handleClose();
    };

    const handleConfirmDelete = () => {
        onDeleteClick(activityType._id);
        setIsDeleteDialogOpen(false);
    };

    const handleCancelDelete = () => {
        setIsDeleteDialogOpen(false);
    };

    const handleCardClick = () => {
        onEditClick(activityType);
    };

    // Use the actual color from the database or fallback to default
    const activityColor = activityType.color || DEFAULT_COLOR;

    // Create a lighter version of the color for the background
    const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const lightBackgroundColor = hexToRgba(activityColor, 0.1);

    return (
        <>
            <Card
                variant="outlined"
                onClick={handleCardClick}
                sx={{
                    borderColor: activityColor,
                    borderWidth: 1.5,
                    borderRadius: 2,
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'none',
                    backgroundColor: lightBackgroundColor,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: `0 4px 12px ${hexToRgba(activityColor, 0.25)}`,
                        transform: 'translateY(-2px)',
                        borderColor: activityColor,
                    }
                }}
            >
                <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Avatar sx={{ bgcolor: activityColor, width: 36, height: 36 }}>
                            <ActivityIconAvatar activityType={activityType} />
                        </Avatar>
                        <IconButton
                            size="small"
                            onClick={handleMenuClick}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { backgroundColor: hexToRgba(activityColor, 0.1) }
                            }}
                        >
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    overflow: 'visible',
                                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                    mt: 1.5,
                                    '&::before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: 'background.paper',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={(e) => { e.stopPropagation(); handleEdit(); }} sx={{ gap: 1 }}>
                                <EditIcon fontSize="small" /> Edit
                            </MenuItem>
                            <MenuItem onClick={(e) => { e.stopPropagation(); handleDelete(); }} sx={{ gap: 1, color: 'error.main' }}>
                                <DeleteIcon fontSize="small" /> Delete
                            </MenuItem>
                        </Menu>
                    </Box>
                    <Typography variant="subtitle1" component="div" fontWeight="600" sx={{ mb: 1, color: 'text.primary', lineHeight: 1.2 }}>
                        {activityType.name}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {activityType.fields.slice(0, 3).map((field, fieldIndex) => (
                            <Chip
                                key={fieldIndex}
                                label={field.name}
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderColor: activityColor,
                                    color: 'text.secondary',
                                    backgroundColor: 'transparent',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    height: 20
                                }}
                            />
                        ))}
                        {activityType.fields.length > 3 && (
                            <Chip
                                label={`+${activityType.fields.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                    borderColor: activityColor,
                                    color: 'text.secondary',
                                    backgroundColor: 'transparent',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    height: 20
                                }}
                            />
                        )}
                        {activityType.fields.length === 0 && (
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                                No fields
                            </Typography>
                        )}
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
                        Delete Activity Type
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete the &quot;{activityType.name}&quot; activity type? This action cannot be undone.
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

export default ActivityTypeCard; 