import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { WellnessMetricRecord } from '@/apis/wellnessMetrics/types';

interface MetricActionsProps {
    record: WellnessMetricRecord;
    onEdit: (record: WellnessMetricRecord) => void;
    onDelete: (recordId: string) => Promise<boolean>;
}

export const MetricActions: React.FC<MetricActionsProps> = ({ record, onEdit, onDelete }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        onEdit(record);
        handleClose();
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(record._id);
        } finally {
            setIsDeleting(false);
            handleClose();
        }
    };

    return (
        <>
            <IconButton
                aria-label="more"
                aria-controls="metric-menu"
                aria-haspopup="true"
                onClick={handleClick}
                size="small"
                sx={{ color: 'text.secondary' }}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="metric-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleEdit}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDelete} disabled={isDeleting}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{isDeleting ? 'Deleting...' : 'Delete'}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}; 