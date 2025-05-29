import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useCustomFoodDialog } from './hooks/useCustomFoodDialog';
import { AIGenerationSection } from './components/AIGenerationSection';
import { BasicInfoSection } from './components/BasicInfoSection';
import { NutritionFieldsSection } from './components/NutritionFieldsSection';
import { ServingsSection } from './components/ServingsSection';
import { CustomFoodDialogProps } from './types';

export const CustomFoodDialog: React.FC<CustomFoodDialogProps> = ({
    open,
    onClose,
    onFoodCreated
}) => {
    const dialog = useCustomFoodDialog(onFoodCreated, onClose);

    return (
        <Dialog
            open={open}
            onClose={dialog.handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, maxHeight: '90vh' }
            }}
        >
            <DialogTitle sx={{ fontWeight: 600, pb: 1, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Add Custom Food
                <IconButton onClick={dialog.handleClose} sx={{ mr: -1 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: '10px !important', px: 2 }}>
                {dialog.error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {dialog.error}
                    </Alert>
                )}

                {/* AI Generation Section */}
                <Box sx={{ mb: 3 }}>
                    <AIGenerationSection
                        onDataGenerated={dialog.handleAIDataGenerated}
                        disabled={dialog.isAnyOperationInProgress}
                    />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box component="form" onSubmit={dialog.handleSubmit}>
                    {/* Basic Information */}
                    <BasicInfoSection
                        formData={dialog.formData}
                        onChange={dialog.handleInputChange}
                        disabled={dialog.isAnyOperationInProgress}
                    />

                    {/* Nutrition Information */}
                    <NutritionFieldsSection
                        nutritionData={dialog.formData.nutritionPer100g}
                        onChange={dialog.handleNutritionChange}
                        disabled={dialog.isAnyOperationInProgress}
                    />

                    {/* Common Servings */}
                    <ServingsSection
                        servings={dialog.formData.commonServings}
                        onAdd={dialog.handleAddServing}
                        onRemove={dialog.handleRemoveServing}
                        disabled={dialog.isAnyOperationInProgress}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 2, py: 2, pt: 1, gap: 2 }}>
                <Button
                    onClick={dialog.handleClose}
                    sx={{ textTransform: 'none' }}
                    disabled={dialog.isAnyOperationInProgress}
                >
                    Cancel
                </Button>
                <Button
                    onClick={dialog.handleSubmit}
                    variant="contained"
                    disabled={!dialog.isValid || dialog.isAnyOperationInProgress}
                    sx={{ textTransform: 'none' }}
                    startIcon={dialog.isLoading ? <CircularProgress size={16} /> : undefined}
                >
                    {dialog.isLoading ? 'Creating...' : 'Create Food'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 