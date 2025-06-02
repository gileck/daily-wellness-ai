import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
    Paper,
    Divider,
    Chip,
    IconButton
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ActivityTypeClient } from '@/apis/activity/types';
import { useAuth } from '@/client/context/AuthContext';

interface GenerateUrlDialogProps {
    open: boolean;
    onClose: () => void;
    activityType: ActivityTypeClient | null;
}

export const GenerateUrlDialog: React.FC<GenerateUrlDialogProps> = ({
    open,
    onClose,
    activityType
}) => {
    const { user } = useAuth();
    const [copiedUrl, setCopiedUrl] = useState(false);

    const generateUrl = () => {
        if (!user || !activityType) return '';

        const baseUrl = 'https://daily-wellness-ai.vercel.app';
        return `${baseUrl}/api/external/${user.id}/${activityType._id}`;
    };

    const generateExampleJson = () => {
        if (!activityType) return '';

        const exampleFields: Record<string, unknown> = {};

        activityType.fields.forEach(field => {
            if (field.fieldType === 'Number') {
                exampleFields[field.name] = 100;
            } else if (field.fieldType === 'Boolean') {
                exampleFields[field.name] = true;
            } else if (field.fieldType === 'Date') {
                exampleFields[field.name] = new Date().toISOString();
            } else {
                exampleFields[field.name] = `example ${field.name}`;
            }
        });

        const exampleBody = {
            ...exampleFields,
            notes: "Optional notes about this activity"
        };

        return JSON.stringify(exampleBody, null, 2);
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedUrl(true);
            setTimeout(() => setCopiedUrl(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
        }
    };

    const handleClose = () => {
        setCopiedUrl(false);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Generate External Tracking URL
                {activityType && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        For activity: <strong>{activityType.name}</strong>
                    </Typography>
                )}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Generate a URL that can be used by external applications (like iOS Shortcuts) to track this activity automatically.
                </Typography>

                {activityType && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Generated URL
                        </Typography>

                        <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle2">
                                    Endpoint URL:
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => copyToClipboard(generateUrl())}
                                    color={copiedUrl ? "success" : "default"}
                                >
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-all',
                                    bgcolor: 'white',
                                    p: 1,
                                    borderRadius: 1,
                                    border: '1px solid #ddd'
                                }}
                            >
                                {generateUrl()}
                            </Typography>
                        </Paper>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Usage Instructions
                        </Typography>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                                <strong>Method:</strong> POST<br />
                                <strong>Content-Type:</strong> application/json
                            </Typography>
                        </Alert>

                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Activity Fields:
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                            {activityType.fields.map((field) => (
                                <Chip
                                    key={field.name}
                                    label={`${field.name} (${field.fieldType})`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 1, mb: 1 }}
                                />
                            ))}
                        </Box>

                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Example Request Body:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f8f8f8' }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Typography
                                    variant="body2"
                                    component="pre"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        overflow: 'auto',
                                        flex: 1,
                                        margin: 0
                                    }}
                                >
                                    {generateExampleJson()}
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => copyToClipboard(generateExampleJson())}
                                >
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Paper>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            <strong>Note:</strong> All activity fields can be included directly in the JSON body.
                            The timestamp field is optional - if not provided, the current time will be used automatically.
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 