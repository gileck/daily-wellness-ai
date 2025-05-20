import React, { useState } from 'react';
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TrackedActivity } from '@/apis/trackedActivities/types';

interface ActivityActionsProps {
    activity: TrackedActivity;
    onEdit: (activity: TrackedActivity) => void;
    onDelete: (activityId: string) => Promise<boolean>;
    onDuplicate: (activityId: string) => Promise<boolean>;
}

export const ActivityActions: React.FC<ActivityActionsProps> = ({
    activity,
    onEdit,
    onDelete,
    onDuplicate
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event?: React.MouseEvent<HTMLElement>) => {
        if (event) {
            event.stopPropagation();
        }
        setAnchorEl(null);
    };

    const handleEdit = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleMenuClose();
        onEdit(activity);
    };

    const handleDeleteClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleMenuClose();
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        setIsProcessing(true);
        try {
            await onDelete(activity._id);
        } finally {
            setIsProcessing(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleDuplicate = async (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        handleMenuClose();
        setIsProcessing(true);
        try {
            await onDuplicate(activity._id);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <IconButton
                aria-label="More actions"
                aria-controls="activity-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                size="small"
                sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' }
                }}
            >
                <MoreVertIcon />
            </IconButton>

            <Menu
                id="activity-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={() => handleMenuClose()}
                elevation={3}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        borderRadius: '10px',
                        minWidth: '180px',
                        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.08)',
                    }
                }}
            >
                <MenuItem onClick={handleEdit} disabled={isProcessing}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Edit" />
                </MenuItem>

                <MenuItem onClick={handleDuplicate} disabled={isProcessing}>
                    <ListItemIcon>
                        <ContentCopyIcon fontSize="small" sx={{ color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Duplicate" />
                </MenuItem>

                <MenuItem onClick={handleDeleteClick} disabled={isProcessing}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
                    </ListItemIcon>
                    <ListItemText primary="Delete" sx={{ color: 'error.main' }} />
                </MenuItem>
            </Menu>

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
                        Delete Activity
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete the &quot;{activity.activityName}&quot; activity? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setIsDeleteDialogOpen(false)}
                        disabled={isProcessing}
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
                        disabled={isProcessing}
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
                        {isProcessing ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}; 