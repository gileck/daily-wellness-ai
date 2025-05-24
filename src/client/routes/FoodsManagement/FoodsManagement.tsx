import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { searchFoods, createFood, updateFood, deleteFood } from '@/apis/foods/client';
import { FoodClient, CreateFoodRequest, UpdateFoodRequest } from '@/apis/foods/types';
import { FoodCategory } from '@/server/database/collections/foods/types';
import { FoodForm } from './FoodForm';
import { formatFoodWithEmoji } from '@/client/utils/foodEmojiUtils';

export const FoodsManagement = () => {
    const [foods, setFoods] = useState<FoodClient[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [sourceFilter, setSourceFilter] = useState<'usda' | 'user' | ''>('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingFood, setEditingFood] = useState<FoodClient | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const categories: FoodCategory[] = [
        'fruits', 'vegetables', 'grains', 'proteins', 'dairy',
        'nuts_seeds', 'oils_fats', 'beverages', 'sweets', 'condiments', 'other'
    ];

    const loadFoods = async () => {
        setLoading(true);
        setError('');

        try {
            const filters = {
                query: searchQuery || undefined,
                category: categoryFilter || undefined,
                source: sourceFilter || undefined,
            };

            const result = await searchFoods({ filters, limit: 50 });

            if (result.data?.error) {
                setError(result.data.error);
            } else {
                setFoods(result.data?.foods || []);
            }
        } catch (error) {
            console.error('Error loading foods:', error);
            setError('Failed to load foods');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFoods();
    }, [searchQuery, categoryFilter, sourceFilter]);

    const handleCreateFood = async (foodData: CreateFoodRequest) => {
        try {
            const result = await createFood(foodData);

            if (result.data?.error) {
                setError(result.data.error);
            } else {
                setSuccess('Food created successfully');
                setOpenDialog(false);
                loadFoods();
            }
        } catch (error) {
            console.error('Error creating food:', error);
            setError('Failed to create food');
        }
    };

    const handleUpdateFood = async (id: string, updates: UpdateFoodRequest['updates']) => {
        try {
            const result = await updateFood({ id, updates });

            if (result.data?.error) {
                setError(result.data.error);
            } else {
                setSuccess('Food updated successfully');
                setOpenDialog(false);
                setEditingFood(null);
                loadFoods();
            }
        } catch (error) {
            console.error('Error updating food:', error);
            setError('Failed to update food');
        }
    };

    const handleDeleteFood = async (id: string) => {
        if (!confirm('Are you sure you want to delete this food?')) return;

        try {
            const result = await deleteFood({ id });

            if (result.data?.error) {
                setError(result.data.error);
            } else {
                setSuccess('Food deleted successfully');
                loadFoods();
            }
        } catch (error) {
            console.error('Error deleting food:', error);
            setError('Failed to delete food');
        }
    };

    const handleEditClick = (food: FoodClient) => {
        setEditingFood(food);
        setOpenDialog(true);
    };

    const handleAddClick = () => {
        setEditingFood(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingFood(null);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Foods Management
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {/* Search and Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        label="Search foods"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                        sx={{ minWidth: 250 }}
                    />

                    <FormControl sx={{ minWidth: 150 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value="">All Categories</MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category.replace('_', ' ').toUpperCase()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Source</InputLabel>
                        <Select
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value as 'usda' | 'user' | '')}
                            label="Source"
                        >
                            <MenuItem value="">All Sources</MenuItem>
                            <MenuItem value="usda">USDA</MenuItem>
                            <MenuItem value="user">User Created</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddClick}
                        sx={{ ml: 'auto' }}
                    >
                        Add Food
                    </Button>
                </Box>
            </Paper>

            {/* Foods Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Brand</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Calories (per 100g)</TableCell>
                            <TableCell>Protein (g)</TableCell>
                            <TableCell>Carbs (g)</TableCell>
                            <TableCell>Fat (g)</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : foods.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No foods found
                                </TableCell>
                            </TableRow>
                        ) : (
                            foods.map((food) => (
                                <TableRow key={food.id}>
                                    <TableCell>{formatFoodWithEmoji(food.displayName)}</TableCell>
                                    <TableCell>{food.brand || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={food.categorySimplified || food.category}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={food.source.toUpperCase()}
                                            size="small"
                                            color={food.source === 'user' ? 'primary' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>{food.nutritionPer100g.calories}</TableCell>
                                    <TableCell>{food.nutritionPer100g.protein}</TableCell>
                                    <TableCell>{food.nutritionPer100g.carbs}</TableCell>
                                    <TableCell>{food.nutritionPer100g.fat}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleEditClick(food)}
                                            disabled={food.source === 'usda'}
                                            title={food.source === 'usda' ? 'USDA foods cannot be edited' : 'Edit food'}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => handleDeleteFood(food.id)}
                                            disabled={food.source === 'usda'}
                                            title={food.source === 'usda' ? 'USDA foods cannot be deleted' : 'Delete food'}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingFood ? 'Edit Food' : 'Add New Food'}
                </DialogTitle>
                <DialogContent>
                    <FoodForm
                        food={editingFood}
                        onSubmit={editingFood ?
                            async (updates) => handleUpdateFood(editingFood.id, updates as UpdateFoodRequest['updates']) :
                            async (data) => handleCreateFood(data as CreateFoodRequest)
                        }
                        onCancel={handleCloseDialog}
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
}; 