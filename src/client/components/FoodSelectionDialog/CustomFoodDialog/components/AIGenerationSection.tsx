import React from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    TextField,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    LinearProgress,
    Chip,
    IconButton,
} from '@mui/material';
import {
    AutoAwesome as AutoAwesomeIcon,
    Close as CloseIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material';
import { useAIGeneration } from '../hooks/useAIGeneration';
import { AIGenerationSectionProps } from '../types';

export const AIGenerationSection: React.FC<AIGenerationSectionProps> = ({
    onDataGenerated,
    disabled = false
}) => {
    const aiGeneration = useAIGeneration(onDataGenerated);

    const handleModelChange = (event: SelectChangeEvent) => {
        aiGeneration.handleModelChange(event.target.value);
    };

    if (!aiGeneration.showAISection) {
        return (
            <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={aiGeneration.handleShowAISection}
                sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                        backgroundColor: 'primary.50',
                        borderColor: 'primary.dark'
                    }
                }}
                disabled={disabled || aiGeneration.isGenerating}
            >
                Generate with AI
            </Button>
        );
    }

    return (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon color="primary" />
                    Generate with AI
                </Typography>
                <IconButton size="small" onClick={aiGeneration.handleCloseAI}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    fullWidth
                    label="Food Description"
                    value={aiGeneration.aiDescription}
                    onChange={(e) => aiGeneration.handleDescriptionChange(e.target.value)}
                    placeholder="e.g., 'grilled chicken breast', 'chocolate chip cookies', 'quinoa salad'"
                    disabled={disabled || aiGeneration.isGenerating}
                    required
                />

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Select
                        value={aiGeneration.selectedModel}
                        onChange={handleModelChange}
                        size="small"
                        variant="standard"
                        disabled={disabled || aiGeneration.isGenerating}
                        sx={{
                            minWidth: 140,
                            '& .MuiInput-underline:before': {
                                borderBottom: 'none'
                            },
                            '& .MuiInput-underline:after': {
                                borderBottom: 'none'
                            },
                            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                                borderBottom: 'none'
                            },
                            '& .MuiSelect-select': {
                                py: 0.5,
                                fontSize: '0.875rem'
                            }
                        }}
                    >
                        {aiGeneration.availableModels.map((model) => (
                            <MenuItem
                                key={model.id}
                                value={model.id}
                                sx={{ fontSize: '0.875rem' }}
                            >
                                {model.name}
                            </MenuItem>
                        ))}
                    </Select>

                    <Button
                        size="small"
                        variant="text"
                        onClick={aiGeneration.handleToggleAdditionalContext}
                        disabled={disabled || aiGeneration.isGenerating}
                        sx={{
                            textTransform: 'none',
                            minWidth: 'auto',
                            ml: 1,
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            '& .MuiButton-endIcon': {
                                ml: '4px'
                            }
                        }}
                        endIcon={aiGeneration.showAdditionalContext ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    >
                        Additional context
                    </Button>
                </Box>

                {aiGeneration.showAdditionalContext && (
                    <TextField
                        fullWidth
                        label="Additional Context (optional)"
                        value={aiGeneration.aiContext}
                        onChange={(e) => aiGeneration.handleContextChange(e.target.value)}
                        placeholder="e.g., 'homemade', 'organic', 'store-bought brand name'"
                        disabled={disabled || aiGeneration.isGenerating}
                        multiline
                        rows={2}
                        size="small"
                    />
                )}

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        onClick={aiGeneration.handleAIGenerate}
                        disabled={!aiGeneration.aiDescription.trim() || disabled || aiGeneration.isGenerating}
                        startIcon={aiGeneration.isGenerating ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        {aiGeneration.isGenerating ? 'Generating...' : (aiGeneration.hasGeneratedData ? 'Regenerate' : 'Generate')}
                    </Button>

                    {aiGeneration.lastGenerationCost !== null && (
                        <Chip
                            label={`Cost: $${aiGeneration.lastGenerationCost.toFixed(4)}`}
                            size="small"
                            color="success"
                            variant="outlined"
                        />
                    )}
                </Box>

                {aiGeneration.isGenerating && (
                    <LinearProgress sx={{ borderRadius: 1 }} />
                )}

                {aiGeneration.hasGeneratedData && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                        Food data generated successfully!
                    </Alert>
                )}

                {aiGeneration.error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {aiGeneration.error}
                    </Alert>
                )}
            </Box>
        </Paper>
    );
}; 