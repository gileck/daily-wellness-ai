import React from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useServingsManagement } from '../hooks/useServingsManagement';
import { ServingsSectionProps } from '../types';

export const ServingsSection: React.FC<ServingsSectionProps> = ({
    servings,
    onAdd,
    onRemove,
    disabled = false
}) => {
    const servingsHooks = useServingsManagement(servings, onAdd, onRemove);

    return (
        <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Common Servings
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-end', flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                    label="Serving Name"
                    value={servingsHooks.newServing.name}
                    onChange={(e) => servingsHooks.handleNewServingChange('name', e.target.value)}
                    placeholder="e.g., 1 cup, 1 medium"
                    sx={{ flex: 1 }}
                    disabled={disabled}
                />
                <TextField
                    label="Grams Equivalent"
                    type="number"
                    value={servingsHooks.newServing.gramsEquivalent}
                    onChange={(e) => servingsHooks.handleNewServingChange('gramsEquivalent', Number(e.target.value))}
                    inputProps={{ min: 0, step: 0.1 }}
                    sx={{ flex: 1 }}
                    disabled={disabled}
                />
                <Button
                    variant="outlined"
                    onClick={servingsHooks.handleAddServing}
                    startIcon={<AddIcon />}
                    disabled={!servingsHooks.canAddServing || disabled}
                    sx={{ minWidth: 100, height: '56px' }}
                >
                    Add
                </Button>
            </Box>

            {servings.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Serving Name</TableCell>
                                <TableCell>Grams</TableCell>
                                <TableCell width={60}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {servings.map((serving, index) => (
                                <TableRow key={index}>
                                    <TableCell>{serving.name}</TableCell>
                                    <TableCell>{serving.gramsEquivalent}g</TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => servingsHooks.handleRemoveServing(index)}
                                            color="error"
                                            disabled={disabled}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
}; 