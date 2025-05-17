import React, { useState } from 'react';
import { ActivityTypeClient } from '@/apis/activity/types';
import { Box, Typography, IconButton, Card, CardContent, Avatar, Chip, Menu, MenuItem } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const PREDEFINED_COLORS = ['#E9D5FF', '#FFF7ED', '#E0F2F7', '#E8F5E9', '#FFEBEE', '#E1F5FE'];
const cardColors = ['#E9D5FF', '#FFF7ED', '#E0F2F7', '#E8F5E9', '#FFEBEE', '#E1F5FE']; // Added more colors
const iconAvatarColors = ['#EDE7F6', '#FFF3E0', '#E0F7FA', '#E8F5E9', '#FFCDD2', '#E3F2FD']; // Corresponding avatar BGs
const iconColors = ['#673AB7', '#FF9800', '#00ACC1', '#4CAF50', '#D32F2F', '#1976D2']; // Corresponding icon colors

interface ActivityTypeCardProps {
    activityType: ActivityTypeClient;
    onEditClick: (activityType: ActivityTypeClient) => void;
    onDeleteClick: (activityTypeId: string) => void;
    index: number;
}

export const ActivityTypeCard: React.FC<ActivityTypeCardProps> = ({ activityType, onEditClick, onDeleteClick, index }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
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
        onDeleteClick(activityType._id);
        handleClose();
    };

    const colorIndex = PREDEFINED_COLORS.indexOf(activityType.color || '') % cardColors.length;
    const currentCardBorderColor = activityType.color || cardColors[index % cardColors.length];
    const currentIconAvatarBgColor = iconAvatarColors[colorIndex >= 0 ? colorIndex : index % iconAvatarColors.length];
    const currentIconColor = iconColors[colorIndex >= 0 ? colorIndex : index % iconColors.length];

    return (
        <Card
            variant="outlined"
            sx={{
                borderColor: currentCardBorderColor,
                borderWidth: 1.5,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: currentIconColor,
                }
            }}
        >
            <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: currentIconAvatarBgColor, width: 48, height: 48 }}>
                        <SettingsIcon sx={{ color: currentIconColor, fontSize: '1.6rem' }} />
                    </Avatar>
                    <IconButton size="small" onClick={handleClick} sx={{ color: 'text.secondary' }}>
                        <MoreVertIcon />
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
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
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
                        <MenuItem onClick={handleEdit} sx={{ gap: 1 }}>
                            <EditIcon fontSize="small" /> Edit
                        </MenuItem>
                        <MenuItem onClick={handleDelete} sx={{ gap: 1, color: 'error.main' }}>
                            <DeleteIcon fontSize="small" /> Delete
                        </MenuItem>
                    </Menu>
                </Box>
                <Typography variant="h6" component="div" fontWeight="600" sx={{ mb: 0.75, color: 'text.primary' }}>
                    {activityType.name}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                    {activityType.fields.map((field, fieldIndex) => (
                        <Chip
                            key={fieldIndex}
                            label={field.name + (field.fieldType === 'Text' ? '' : '*')}
                            size="small"
                            variant="outlined"
                            sx={{
                                borderColor: currentIconAvatarBgColor,
                                color: currentIconColor,
                                backgroundColor: currentIconAvatarBgColor,
                                fontWeight: 500
                            }}
                        />
                    ))}
                    {activityType.fields.length === 0 && (
                        <Typography variant="caption" color="text.disabled">No fields defined.</Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

export default ActivityTypeCard; 