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
import { FoodClient, SearchFoodsRequest } from '@/apis/foods/types';
import { searchFoods } from '@/apis/foods/client';
import { formatFoodWithEmoji, getFoodEmoji } from '@/client/utils/foodEmojiUtils';
import { FoodPortion, CommonServing, PREDEFINED_PORTIONS } from './types';

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
            loadFoods();
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
                amount: 1,
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
        onClose();
    };

    const handleClose = () => {
        setSearchQuery('');
        setSelectedFoodPortions(initialSelectedFoodPortions);
        setAllKnownFoods([]);
        setEditingPortionIndex(null);
        onClose();
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
            <Box sx={{ p: 2, border: '1px solid #E0E0E0', borderRadius: 2, bgcolor: '#F9F9F9' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Edit Portion - {formatFoodWithEmoji(food.displayName)}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <TextField
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        inputProps={{ min: 0.1, step: 0.1 }}
                        sx={{ minWidth: 100 }}
                    />

                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel>Unit</InputLabel>
                        <Select
                            value={servingType}
                            onChange={(e) => setServingType(e.target.value as 'grams' | 'common_serving')}
                            label="Unit"
                        >
                            <MenuItem value="grams">Grams</MenuItem>
                            <MenuItem value="common_serving">Serving</MenuItem>
                        </Select>
                    </FormControl>

                    {servingType === 'common_serving' && (
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel>Serving Size</InputLabel>
                            <Select
                                value={servingName}
                                onChange={(e) => setServingName(e.target.value)}
                                label="Serving Size"
                            >
                                {availableServings.map((serving) => (
                                    <MenuItem key={serving.name} value={serving.name}>
                                        {serving.name} ({serving.gramsEquivalent}g)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Total: {gramsEquivalent.toFixed(1)}g
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onCancel} size="small">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" size="small">Save</Button>
                </Box>
            </Box>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, height: '80vh' }
            }}
        >
            <DialogTitle sx={{ fontWeight: 600, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Select Foods
                <IconButton onClick={handleClose} sx={{ mr: -1 }}>
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
                    <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 1 }}>
                        Available Foods
                    </Typography>

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
                    onClick={handleClose}
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
    );
}; 