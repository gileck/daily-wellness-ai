import React, { useEffect, useState } from 'react';
import { CreateWellnessMetricPayload, WellnessMetricClient } from '@/apis/wellnessMetrics/types';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

// Dialog for Adding/Editing Wellness Metric
interface AddWellnessMetricDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreateWellnessMetricPayload | { metricId: string, updates: Partial<Omit<WellnessMetricClient, '_id' | 'userId' | 'isPredefined' | 'predefinedId'>> }) => Promise<void>;
    metricToEdit?: WellnessMetricClient | null;
}

export const AddWellnessMetricDialog: React.FC<AddWellnessMetricDialogProps> = ({ open, onClose, onSubmit, metricToEdit }) => {
    const [name, setName] = useState('');
    const isEditMode = !!metricToEdit;

    useEffect(() => {
        if (isEditMode && metricToEdit) {
            setName(metricToEdit.name);
        } else {
            setName('');
        }
    }, [open, metricToEdit, isEditMode]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            alert("Metric Name is required.");
            return;
        }
        if (isEditMode && metricToEdit) {
            const payload = {
                metricId: metricToEdit._id,
                updates: { name: name.trim() }
            };
            await onSubmit(payload);
        } else {
            const payload: CreateWellnessMetricPayload = {
                name: name.trim(),
                isPredefined: false,
                enabled: true,
            };
            await onSubmit(payload);
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 600, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isEditMode ? 'Edit Wellness Metric' : 'Add New Custom Wellness Metric'}
                <IconButton onClick={onClose} sx={{ mr: -1 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '10px !important', backgroundColor: 'rgba(0,0,0,0.005)' }}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="metricName"
                    label="Metric Name (e.g., Happiness, Productivity)"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mt: 1 }}
                />
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.08)', backgroundColor: 'rgba(0,0,0,0.005)', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none', border: '1px solid rgba(0,0,0,0.23)' }}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!name.trim()}
                    startIcon={<SaveIcon />}
                    sx={{
                        backgroundColor: '#1A2027',
                        color: 'white',
                        '&:hover': { backgroundColor: '#343A40' },
                        px: 2.5,
                        py: 1.25,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500
                    }}
                >
                    {isEditMode ? 'Save Metric' : 'Add Wellness Metric'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddWellnessMetricDialog; 