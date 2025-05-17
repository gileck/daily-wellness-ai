import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Grid,
    FormControlLabel,
    Checkbox,
    Typography
} from '@mui/material';
import { ActivityTypeClient, ActivityTypeField } from '@/apis/activity/types';
import { TrackedActivityValue } from '@/apis/trackedActivities/types';

type FormValue = string | number | boolean | Date | null;

interface TrackActivityDialogProps {
    open: boolean;
    activityType: ActivityTypeClient | null;
    onClose: () => void;
    onTrack: (activityType: ActivityTypeClient, values: TrackedActivityValue[], notes?: string) => Promise<void>;
    isSubmitting: boolean;
    error?: string | null;
}

interface FormState {
    [fieldName: string]: FormValue;
}

export const TrackActivityDialog: React.FC<TrackActivityDialogProps> = ({ open, activityType, onClose, onTrack, isSubmitting, error }) => {
    const [formState, setFormState] = useState<FormState>({});
    const [notes, setNotes] = useState<string>('');
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        if (activityType) {
            const initialFormState: FormState = {};
            activityType.fields.forEach(field => {
                initialFormState[field.name] = field.fieldType === 'Boolean' ? false : '';
            });
            setFormState(initialFormState);
            setNotes(''); // Reset notes when activity type changes
            setLocalError(null);
        } else {
            setFormState({});
            setNotes('');
            setLocalError(null);
        }
    }, [activityType]);

    const handleChange = (fieldName: string, value: FormValue, fieldType: ActivityTypeField['fieldType']) => {
        let processedValue: FormValue = value;
        if (fieldType === 'Number') {
            processedValue = value === '' ? '' : Number(value);
        }
        setFormState(prev => ({ ...prev, [fieldName]: processedValue }));
    };

    const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNotes(event.target.value);
    };

    const validateFields = useCallback(() => {
        if (!activityType) return false;
        for (const field of activityType.fields) {
            if (field.required) {
                const value = formState[field.name];
                if (value === '' || value === null || value === undefined) {
                    if (field.fieldType === 'Boolean' && typeof value === 'boolean' && value === false) {
                        continue;
                    }
                    setLocalError(`Field '${field.name}' is required.`);
                    return false;
                }
            }
            if (field.fieldType === 'Number' && formState[field.name] !== '' && typeof formState[field.name] === 'number' && isNaN(formState[field.name] as number)) {
                setLocalError(`Field '${field.name}' must be a number.`);
                return false;
            }
        }
        setLocalError(null);
        return true;
    }, [activityType, formState]);


    const handleSubmit = async () => {
        if (!activityType || !validateFields()) return;

        const values: TrackedActivityValue[] = activityType.fields.map(field => ({
            fieldName: field.name,
            value: formState[field.name],
        }));

        try {
            await onTrack(activityType, values, notes || undefined); // Pass undefined if notes is empty
            // onClose(); // Let the hook handle closing on success
        } catch (e) {
            // Error is handled by the hook and displayed via props
            console.error("Submission error in dialog, but should be caught by hook", e);
        }
    };

    if (!activityType) return null;

    const renderField = (field: ActivityTypeField) => {
        const commonProps = {
            key: field.name,
            label: field.name + (field.required ? ' *' : ''),
            fullWidth: true,
            margin: 'dense' as const,
            value: formState[field.name] || (field.fieldType === 'Boolean' ? false : ''),
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(field.name, e.target.value, field.fieldType),
            error: !!localError && localError.includes(field.name), // Basic error highlighting
        };

        switch (field.fieldType) {
            case 'Boolean':
                return (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={Boolean(formState[field.name])}
                                onChange={(e) => handleChange(field.name, e.target.checked, field.fieldType)}
                            />
                        }
                        label={field.name + (field.required ? ' *' : '')}
                        key={field.name}
                    />
                );
            case 'Number':
                return <TextField {...commonProps} type="number" value={formState[field.name] === '' ? '' : String(formState[field.name])} />;
            case 'Time':
                return <TextField {...commonProps} type="time" InputLabelProps={{ shrink: true }} />;
            case 'Date':
                return <TextField {...commonProps} type="date" InputLabelProps={{ shrink: true }} />;
            case 'Text':
            case 'String':
            default:
                return <TextField {...commonProps} />;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Track: {activityType.name}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {activityType.fields.map(field => (
                        <Grid size={12} key={field.name}>
                            {renderField(field)}
                        </Grid>
                    ))}
                    <Grid size={12}>
                        <TextField
                            label="Notes (Optional)"
                            multiline
                            rows={3}
                            fullWidth
                            margin="dense"
                            value={notes}
                            onChange={handleNotesChange}
                        />
                    </Grid>
                </Grid>
                {(localError || error) && (
                    <Typography color="error" variant="body2" sx={{ mt: 2 }}>{localError || error}</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary" disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleSubmit} color="primary" variant="contained" disabled={isSubmitting || !!localError}>
                    {isSubmitting ? <CircularProgress size={24} /> : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Create an index.ts file for the component
// export { TrackActivityDialog } from './TrackActivityDialog'; 