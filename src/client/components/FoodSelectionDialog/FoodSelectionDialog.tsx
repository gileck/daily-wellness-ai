import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Checkbox,
    IconButton,
    Typography,
    Box,
    InputAdornment,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FoodClient, SearchFoodsRequest } from '@/apis/foods/types';
import { searchFoods, getFood } from '@/apis/foods/client';
import { formatFoodWithEmoji, getFoodEmoji } from '@/client/utils/foodEmojiUtils';
import { FoodPortion, CommonServing, PREDEFINED_PORTIONS } from './types';
import { CustomFoodDialog } from './CustomFoodDialog';

interface FoodSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (selectedFoodPortions: FoodPortion[]) => void;
    initialSelectedFoodPortions?: FoodPortion[];
}

export const FoodSelectionDialog: React.FC<FoodSelectionDialogProps> = ({
    open,
    onClose,
    onSave,
    initialSelectedFoodPortions = []
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [foods, setFoods] = useState<FoodClient[]>([]);
    const [allKnownFoods, setAllKnownFoods] = useState<FoodClient[]>([]);
    const [selectedFoodPortions, setSelectedFoodPortions] = useState<FoodPortion[]>(initialSelectedFoodPortions);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingPortionIndex, setEditingPortionIndex] = useState<number | null>(null);
    const [customFoodDialogOpen, setCustomFoodDialogOpen] = useState(false);

    const selectedFoodIds = useMemo(() => {
        return new Set(selectedFoodPortions.map(portion => portion.foodId));
    }, [selectedFoodPortions]);

    const highlightSearchTerm = (text: string, searchTerm: string) => {
        if (!searchTerm || !text) return text;

        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
            if (regex.test(part)) {
                return <strong key={index}>{part}</strong>;
            }
            return part;
        });
    };

    const loadInitiallySelectedFoods = async (selectedPortions: FoodPortion[]) => {
        if (selectedPortions.length === 0) return;

        try {
            const uniqueFoodIds = [...new Set(selectedPortions.map(portion => portion.foodId))];
            const foodPromises = uniqueFoodIds.map(foodId => getFood({ id: foodId }));
            const results = await Promise.all(foodPromises);

            const loadedFoods: FoodClient[] = [];
            results.forEach(result => {
                if (result.data.food) {
                    loadedFoods.push(result.data.food);
                }
            });

            // Add these foods to allKnownFoods
            setAllKnownFoods(prev => {
                const existingIds = new Set(prev.map(f => f.id));
                const uniqueNewFoods = loadedFoods.filter(f => !existingIds.has(f.id));
                return [...prev, ...uniqueNewFoods];
            });
        } catch (error) {
            console.error('Error loading initially selected foods:', error);
        }
    };

    const loadFoods = async (query: string = '') => {
        setIsLoading(true);
        setError(null);
        try {
            const request: SearchFoodsRequest = {
                filters: { query },
                limit: 100
            };
            const result = await searchFoods(request);

            // Sort results based on search term position
            let sortedFoods = result.data.foods;
            if (query.trim()) {
                const searchTerm = query.toLowerCase().trim();
                sortedFoods = [...result.data.foods].sort((a, b) => {
                    const aIndex = a.name.toLowerCase().indexOf(searchTerm);
                    const bIndex = b.name.toLowerCase().indexOf(searchTerm);

                    // If one contains the term and the other doesn't, prioritize the one that contains it
                    if (aIndex === -1 && bIndex !== -1) return 1;
                    if (aIndex !== -1 && bIndex === -1) return -1;

                    // If both contain the term, sort by position (earlier positions first)
                    if (aIndex !== -1 && bIndex !== -1) {
                        return aIndex - bIndex;
                    }

                    // If neither contains the term, maintain original order
                    return 0;
                });
            }

            setFoods(sortedFoods);

            // Merge new foods with existing known foods
            setAllKnownFoods(prev => {
                const newFoods = result.data.foods;
                const existingIds = new Set(prev.map(f => f.id));
                const uniqueNewFoods = newFoods.filter(f => !existingIds.has(f.id));
                return [...prev, ...uniqueNewFoods];
            });
        } catch (err) {
            setError('Failed to load foods');
            console.error('Error loading foods:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            // Load foods for the search and load initially selected foods
            loadFoods();
            loadInitiallySelectedFoods(initialSelectedFoodPortions);
            setSelectedFoodPortions(initialSelectedFoodPortions);
        }
    }, [open, initialSelectedFoodPortions]);

    useEffect(() => {
        if (open) {
            const timeoutId = setTimeout(() => {
                loadFoods(searchQuery);
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [searchQuery, open]);

    const handleToggleFood = (foodId: string) => {
        const isSelected = selectedFoodIds.has(foodId);
        if (isSelected) {
            // Remove the food portion
            setSelectedFoodPortions(prev => prev.filter(portion => portion.foodId !== foodId));
        } else {
            // Add new food portion with default values
            const newPortion: FoodPortion = {
                foodId,
                amount: 100,
                servingType: 'grams',
                gramsEquivalent: 100
            };
            setSelectedFoodPortions(prev => [...prev, newPortion]);
        }
    };

    const handleRemoveSelected = (foodId: string) => {
        setSelectedFoodPortions(prev => prev.filter(portion => portion.foodId !== foodId));
    };

    const handleUpdatePortion = (index: number, updatedPortion: FoodPortion) => {
        setSelectedFoodPortions(prev => {
            const newPortions = [...prev];
            newPortions[index] = updatedPortion;
            return newPortions;
        });
        setEditingPortionIndex(null);
    };

    const handleSave = () => {
        onSave(selectedFoodPortions);
        handleClose();
    };

    const handleCancel = () => {
        setSearchQuery('');
        setSelectedFoodPortions(initialSelectedFoodPortions);
        setAllKnownFoods([]);
        setEditingPortionIndex(null);
        onClose();
    };

    const handleClose = () => {
        setSearchQuery('');
        setAllKnownFoods([]);
        setEditingPortionIndex(null);
        onClose();
    };

    const handleCustomFoodCreated = () => {
        // Reload foods to include the newly created custom food
        loadFoods(searchQuery);
    };

    const getAvailableServings = (food: FoodClient): CommonServing[] => {
        const combined = [...food.commonServings];
        // Add predefined portions that aren't already present
        PREDEFINED_PORTIONS.forEach(predefined => {
            if (!combined.some(serving => serving.name === predefined.name)) {
                combined.push(predefined);
            }
        });
        return combined;
    };

    const PortionEditor: React.FC<{
        portion: FoodPortion;
        food: FoodClient;
        onSave: (portion: FoodPortion) => void;
        onCancel: () => void;
    }> = ({ portion, food, onSave, onCancel }) => {
        const [amount, setAmount] = useState(portion.amount);
        const [servingType, setServingType] = useState<'grams' | 'common_serving'>(portion.servingType);
        const [servingName, setServingName] = useState(portion.servingName || '');
        const [gramsEquivalent, setGramsEquivalent] = useState(portion.gramsEquivalent);

        const availableServings = getAvailableServings(food);

        useEffect(() => {
            if (servingType === 'grams') {
                setGramsEquivalent(amount);
            } else if (servingName) {
                const serving = availableServings.find(s => s.name === servingName);
                if (serving) {
                    setGramsEquivalent(amount * serving.gramsEquivalent);
                }
            }
        }, [amount, servingType, servingName, availableServings]);

        const handleSave = () => {
            const updatedPortion: FoodPortion = {
                foodId: portion.foodId,
                amount,
                servingType,
                servingName: servingType === 'common_serving' ? servingName : undefined,
                gramsEquivalent
            };
            onSave(updatedPortion);
        };

        return (
            <Box sx={{
                p: 2,
                border: '1px solid #E3F2FD',
                borderRadius: 2,
                bgcolor: '#FAFBFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2', fontSize: { xs: '14px', sm: '14px' } }}>
                        Edit Portion - {formatFoodWithEmoji(food.displayName)}
                    </Typography>
                    <Typography variant="caption" sx={{
                        bgcolor: '#E3F2FD',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        color: '#1976D2',
                        fontWeight: 500,
                        fontSize: { xs: '11px', sm: '12px' }
                    }}>
                        Total: {gramsEquivalent.toFixed(1)}g
                    </Typography>
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: 1.5 },
                    mb: 2,
                    alignItems: { xs: 'stretch', sm: 'flex-end' }
                }}>
                    <TextField
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        inputProps={{ min: 0.1, step: 0.1 }}
                        size="small"
                        sx={{
                            width: { xs: '100%', sm: 80 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                height: { xs: 48, sm: 40 }
                            },
                            '& .MuiInputLabel-root': {
                                fontSize: { xs: '16px', sm: '14px' }
                            }
                        }}
                    />

                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 90 } }}>
                        <InputLabel sx={{ fontSize: { xs: '16px', sm: '14px' } }}>Unit</InputLabel>
                        <Select
                            value={servingType}
                            onChange={(e) => setServingType(e.target.value as 'grams' | 'common_serving')}
                            label="Unit"
                            sx={{
                                borderRadius: 1.5,
                                height: { xs: 48, sm: 40 },
                                '& .MuiSelect-select': {
                                    fontSize: { xs: '16px', sm: '14px' }
                                }
                            }}
                        >
                            <MenuItem value="grams">Grams</MenuItem>
                            <MenuItem value="common_serving">Serving</MenuItem>
                        </Select>
                    </FormControl>

                    {servingType === 'common_serving' && (
                        <FormControl size="small" sx={{ width: { xs: '100%', sm: 140 } }}>
                            <InputLabel sx={{ fontSize: { xs: '16px', sm: '14px' } }}>Serving Size</InputLabel>
                            <Select
                                value={servingName}
                                onChange={(e) => setServingName(e.target.value)}
                                label="Serving Size"
                                sx={{
                                    borderRadius: 1.5,
                                    height: { xs: 48, sm: 40 },
                                    '& .MuiSelect-select': {
                                        fontSize: { xs: '16px', sm: '14px' }
                                    }
                                }}
                            >
                                {availableServings.map((serving) => (
                                    <MenuItem key={serving.name} value={serving.name}>
                                        {serving.name} ({serving.gramsEquivalent}g)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}

                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        ml: { xs: 0, sm: 'auto' },
                        mt: { xs: 1, sm: 0 },
                        width: { xs: '100%', sm: 'auto' }
                    }}>
                        <Button
                            onClick={onCancel}
                            size="small"
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                minWidth: { xs: 'auto', sm: 60 },
                                flex: { xs: 1, sm: 'none' },
                                height: { xs: 44, sm: 32 },
                                fontSize: { xs: '16px', sm: '14px' },
                                color: '#666',
                                borderColor: '#DDD',
                                '&:hover': {
                                    borderColor: '#BBB',
                                    bgcolor: '#F5F5F5'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            size="small"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                minWidth: { xs: 'auto', sm: 60 },
                                flex: { xs: 1, sm: 'none' },
                                height: { xs: 44, sm: 32 },
                                fontSize: { xs: '16px', sm: '14px' },
                                bgcolor: '#1976D2',
                                '&:hover': {
                                    bgcolor: '#1565C0'
                                }
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleCancel}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, height: '80vh' }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Select Foods
                    <IconButton onClick={handleCancel} sx={{ mr: -1 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: '10px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Search foods..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    {selectedFoodPortions.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
                                Selected Foods ({selectedFoodPortions.length})
                            </Typography>
                            <Box sx={{
                                border: '1px solid #E0E0E0',
                                borderRadius: 2,
                                maxHeight: '300px',
                                overflow: 'auto'
                            }}>
                                <List sx={{ py: 0 }}>
                                    {selectedFoodPortions.map((portion, index) => {
                                        const food = allKnownFoods.find(f => f.id === portion.foodId);
                                        if (!food) return null;

                                        if (editingPortionIndex === index) {
                                            return (
                                                <ListItem key={portion.foodId} sx={{ p: 0 }}>
                                                    <PortionEditor
                                                        portion={portion}
                                                        food={food}
                                                        onSave={(updatedPortion) => handleUpdatePortion(index, updatedPortion)}
                                                        onCancel={() => setEditingPortionIndex(null)}
                                                    />
                                                </ListItem>
                                            );
                                        }

                                        return (
                                            <React.Fragment key={portion.foodId}>
                                                <ListItem sx={{ py: 1, px: 2 }}>
                                                    <ListItemText
                                                        primary={formatFoodWithEmoji(food.displayName)}
                                                        secondary={
                                                            <Typography variant="caption" color="text.secondary">
                                                                {portion.amount} {portion.servingType === 'grams' ? 'g' : portion.servingName}
                                                                ({portion.gramsEquivalent.toFixed(1)}g total)
                                                            </Typography>
                                                        }
                                                    />
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setEditingPortionIndex(index)}
                                                            sx={{ color: 'primary.main' }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveSelected(portion.foodId)}
                                                            sx={{ color: 'error.main' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </ListItem>
                                                {index < selectedFoodPortions.length - 1 && <Divider />}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            </Box>
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                Available Foods
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setCustomFoodDialogOpen(true)}
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 1.5,
                                    fontSize: '12px',
                                    py: 0.5,
                                    px: 1.5,
                                    minWidth: 'auto',
                                    borderColor: '#1976D2',
                                    color: '#1976D2',
                                    '&:hover': {
                                        borderColor: '#1565C0',
                                        bgcolor: '#F3F8FF'
                                    }
                                }}
                            >
                                Add Custom Food
                            </Button>
                        </Box>

                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <List sx={{ height: '100%', overflow: 'auto' }}>
                                {foods.map((food) => (
                                    <ListItem key={food.id} disablePadding>
                                        <ListItemButton onClick={() => handleToggleFood(food.id)}>
                                            <Checkbox
                                                checked={selectedFoodIds.has(food.id)}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                            <ListItemText
                                                primary={
                                                    <>
                                                        {getFoodEmoji(food.displayName) && (
                                                            <span style={{ marginRight: 4 }}>{getFoodEmoji(food.displayName)}</span>
                                                        )}
                                                        {highlightSearchTerm(food.name, searchQuery)}
                                                    </>
                                                }
                                                secondary={
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {food.category}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                            {food.nutritionPer100g.calories} cal/100g
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                                {foods.length === 0 && !isLoading && (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography color="text.secondary">
                                            {searchQuery ? 'No foods found for your search' : 'No foods available'}
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
                    <Button
                        onClick={handleCancel}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={selectedFoodPortions.length === 0}
                        sx={{ textTransform: 'none' }}
                    >
                        Save Selection ({selectedFoodPortions.length})
                    </Button>
                </DialogActions>
            </Dialog>

            <CustomFoodDialog
                open={customFoodDialogOpen}
                onClose={() => setCustomFoodDialogOpen(false)}
                onFoodCreated={handleCustomFoodCreated}
            />
        </>
    );
}; 