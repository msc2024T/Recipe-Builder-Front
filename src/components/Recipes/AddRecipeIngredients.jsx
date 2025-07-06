import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Box,
    Typography,
    Stack,
    IconButton,
    Card,
    CardContent,
    Chip,
    InputAdornment,
    Divider,
    Grid,
    Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Close,
    Search,
    Add,
    Remove,
    Kitchen,
    Save
} from '@mui/icons-material';
import http_service from '../../utils/http_service';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 24,
        maxWidth: 800,
        width: '100%',
        margin: theme.spacing(2),
        maxHeight: '90vh',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 100%)',
    borderBottom: '2px solid rgba(255, 140, 0, 0.2)',
    padding: theme.spacing(2, 3),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
}));

const IngredientCard = styled(Card)(({ theme, selected }) => ({
    cursor: 'pointer',
    borderRadius: 16,
    border: selected ? '2px solid #ff8c00' : '1px solid rgba(0, 0, 0, 0.08)',
    backgroundColor: selected ? 'rgba(255, 140, 0, 0.08)' : 'white',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    height: '100%',
    boxShadow: selected
        ? '0 8px 24px rgba(255, 140, 0, 0.15)'
        : '0 2px 8px rgba(0, 0, 0, 0.06)',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: selected
            ? '0 12px 32px rgba(255, 140, 0, 0.25)'
            : '0 8px 24px rgba(0, 0, 0, 0.12)',
        borderColor: selected ? '#d67200' : 'rgba(255, 140, 0, 0.3)',
    },
    '&:active': {
        transform: 'translateY(-2px)',
    },
}));

const SelectedIngredientCard = styled(Card)(({ theme }) => ({
    borderRadius: 12,
    border: '2px solid #ff8c00',
    backgroundColor: 'rgba(255, 140, 0, 0.05)',
    marginBottom: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: '0 4px 12px rgba(183, 104, 36, 0.4)',
    '&.primary': {
        background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(183, 104, 36, 0.5)',
        },
    },
    '&.secondary': {
        background: 'white',
        color: '#ff8c00',
        border: '2px solid #ff8c00',
        boxShadow: '0 4px 12px rgba(183, 104, 36, 0.2)',
        '&:hover': {
            background: 'rgba(255, 140, 0, 0.1)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(183, 104, 36, 0.3)',
        },
    },
    '&:disabled': {
        background: '#ccc',
        transform: 'none',
        boxShadow: 'none',
    },
}));

const AddRecipeIngredients = ({ open, onClose, recipeId, onIngredientsAdded }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [allIngredients, setAllIngredients] = useState([]);
    const [existingRecipeIngredients, setExistingRecipeIngredients] = useState([]);
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (open) {
            fetchAllIngredients();
            fetchExistingRecipeIngredients();
            setSelectedIngredients([]);
            setSearchTerm('');
            setError('');
            setMessage('');
        }
    }, [open]);

    useEffect(() => {
        // Filter ingredients based on search term and exclude already added ingredients
        let availableIngredients = allIngredients;

        // Get IDs of ingredients already in the recipe
        const existingIngredientIds = existingRecipeIngredients.map(recipeIngredient =>
            recipeIngredient.ingredient.id
        );

        // Filter out ingredients that are already in the recipe
        availableIngredients = availableIngredients.filter(ingredient =>
            !existingIngredientIds.includes(ingredient.id)
        );

        // Apply search filter
        if (searchTerm.trim() === '') {
            setFilteredIngredients(availableIngredients);
        } else {
            const filtered = availableIngredients.filter(ingredient =>
                ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredIngredients(filtered);
        }
    }, [searchTerm, allIngredients, existingRecipeIngredients]);

    const fetchAllIngredients = async () => {
        try {
            setLoading(true);
            const response = await http_service.get('/recipes/ingredient/');
            setAllIngredients(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch ingredients. Please try again.');
            console.error('Error fetching ingredients:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingRecipeIngredients = async () => {
        try {
            const response = await http_service.get(`/recipes/recipe/${recipeId}/ingredient/`);
            setExistingRecipeIngredients(response.data.data || []);
        } catch (err) {
            console.error('Error fetching existing recipe ingredients:', err);
            // Don't set error state as this is not critical for the modal functionality
        }
    };

    const handleIngredientSelect = (ingredient) => {
        const isAlreadySelected = selectedIngredients.some(
            selected => selected.ingredient.id === ingredient.id
        );

        if (!isAlreadySelected) {
            setSelectedIngredients(prev => [
                ...prev,
                {
                    ingredient,
                    quantity: ''
                }
            ]);
        }
    };

    const handleIngredientRemove = (ingredientId) => {
        setSelectedIngredients(prev =>
            prev.filter(selected => selected.ingredient.id !== ingredientId)
        );
    };

    const handleQuantityChange = (ingredientId, quantity) => {
        setSelectedIngredients(prev =>
            prev.map(selected =>
                selected.ingredient.id === ingredientId
                    ? { ...selected, quantity }
                    : selected
            )
        );
    };

    const handleSubmit = async () => {
        if (selectedIngredients.length === 0) {
            setError('Please select at least one ingredient.');
            return;
        }

        const invalidQuantities = selectedIngredients.filter(
            selected => !selected.quantity || selected.quantity.trim() === ''
        );

        if (invalidQuantities.length > 0) {
            setError('Please specify quantities for all selected ingredients.');
            return;
        }

        setSubmitting(true);
        setError('');
        setMessage('');

        try {
            // Create the payload for the API
            const ingredientsPayload = selectedIngredients.map(selected => ({
                ingredient_id: selected.ingredient.id,
                quantity: selected.quantity
            }));

            const response = await http_service.post(`/recipes/recipe/${recipeId}/ingredient/`,
                ingredientsPayload
            );

            setMessage('Ingredients added successfully!');
            onIngredientsAdded();

            // Close modal after short delay
            setTimeout(() => {
                onClose();
                setMessage('');
            }, 1500);

        } catch (err) {
            setError('Failed to add ingredients. Please try again.');
            console.error('Error adding ingredients to recipe:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const isIngredientSelected = (ingredientId) => {
        return selectedIngredients.some(selected => selected.ingredient.id === ingredientId);
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <StyledDialogTitle>
                <Box display="flex" alignItems="center" gap={2}>
                    <Kitchen sx={{ fontSize: 32, color: '#ff8c00' }} />
                    <Box>
                        <Typography
                            variant="h5"
                            component="h2"
                            sx={{
                                fontWeight: 700,
                                color: '#ff8c00',
                                lineHeight: 1.2,
                                mb: 0.5
                            }}
                        >
                            Add Ingredients to Recipe
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Select ingredients and specify quantity
                        </Typography>
                    </Box>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: '#ff8c00',
                        '&:hover': { background: 'rgba(255, 140, 0, 0.1)' }
                    }}
                >
                    <Close />
                </IconButton>
            </StyledDialogTitle>

            <StyledDialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

                {/* Search Bar */}
                <TextField
                    fullWidth
                    placeholder="Search ingredients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 3, mt: 3 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: '#ff8c00' }} />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Selected Ingredients */}
                {selectedIngredients.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#ff8c00', mb: 2, fontWeight: 600 }}>
                            Selected Ingredients ({selectedIngredients.length})
                        </Typography>
                        {selectedIngredients.map((selected) => (
                            <SelectedIngredientCard key={selected.ingredient.id}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        {selected.ingredient.image_url && (
                                            <Box
                                                component="img"
                                                src={selected.ingredient.image_url}
                                                alt={selected.ingredient.name}
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                }}
                                            />
                                        )}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                                {selected.ingredient.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                Unit: {selected.ingredient.unit}
                                            </Typography>
                                        </Box>
                                        <TextField
                                            label="Quantity"
                                            value={selected.quantity}
                                            onChange={(e) => handleQuantityChange(selected.ingredient.id, e.target.value)}
                                            sx={{ width: 150 }}
                                            size="small"
                                        />
                                        <IconButton
                                            onClick={() => handleIngredientRemove(selected.ingredient.id)}
                                            sx={{ color: '#d32f2f' }}
                                        >
                                            <Remove />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </SelectedIngredientCard>
                        ))}
                        <Divider sx={{ my: 2 }} />
                    </Box>
                )}

                {/* Available Ingredients */}
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#333',
                            mb: 3,
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            letterSpacing: '-0.025em'
                        }}
                    >
                        Available Ingredients
                        {filteredIngredients.length > 0 && (
                            <Typography
                                component="span"
                                sx={{
                                    ml: 1,
                                    color: '#999',
                                    fontWeight: 400,
                                    fontSize: '0.9rem'
                                }}
                            >
                                ({filteredIngredients.length})
                            </Typography>
                        )}
                    </Typography>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" py={6}>
                        <CircularProgress size={40} sx={{ color: '#ff8c00' }} />
                    </Box>
                ) : (
                    <Grid container spacing={2} sx={{ maxHeight: 360, overflowY: 'auto', pr: 1 }}>
                        {filteredIngredients.map((ingredient) => (
                            <Grid item xs={6} sm={4} md={3} key={ingredient.id}>
                                <IngredientCard
                                    selected={isIngredientSelected(ingredient.id)}
                                    onClick={() => handleIngredientSelect(ingredient)}
                                >
                                    <CardContent sx={{ p: 2.5, textAlign: 'center', position: 'relative' }}>
                                        {ingredient.image_url ? (
                                            <Box
                                                component="img"
                                                src={ingredient.image_url}
                                                alt={ingredient.name}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    objectFit: 'cover',
                                                    borderRadius: 2,
                                                    mb: 1.5,
                                                    border: '1px solid rgba(0, 0, 0, 0.08)',
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 2,
                                                    mb: 1.5,
                                                    backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 12px auto',
                                                }}
                                            >
                                                <Kitchen sx={{ fontSize: 24, color: '#ff8c00' }} />
                                            </Box>
                                        )}

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#333',
                                                mb: 0.5,
                                                fontSize: '0.9rem',
                                                lineHeight: 1.3,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                            title={ingredient.name}
                                        >
                                            {ingredient.name}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#666',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {ingredient.unit}
                                        </Typography>

                                        {isIngredientSelected(ingredient.id) && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: '50%',
                                                    backgroundColor: '#ff8c00',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 4px rgba(255, 140, 0, 0.3)',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'white',
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </CardContent>
                                </IngredientCard>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {!loading && filteredIngredients.length === 0 && (
                    <Box
                        textAlign="center"
                        py={6}
                        sx={{
                            backgroundColor: 'rgba(0, 0, 0, 0.02)',
                            borderRadius: 3,
                            border: '1px dashed rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Kitchen sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                fontWeight: 500,
                                mb: 0.5
                            }}
                        >
                            {searchTerm.trim() !== ''
                                ? 'No ingredients found matching your search.'
                                : existingRecipeIngredients.length > 0
                                    ? 'All available ingredients have been added.'
                                    : 'No ingredients available.'
                            }
                        </Typography>
                        {searchTerm.trim() !== '' && (
                            <Typography
                                variant="body2"
                                sx={{ color: '#999' }}
                            >
                                Try a different search term
                            </Typography>
                        )}
                    </Box>
                )}
            </StyledDialogContent>

            <DialogActions sx={{ p: 3, gap: 2 }}>
                <ActionButton
                    className="secondary"
                    onClick={onClose}
                    disabled={submitting}
                >
                    Cancel
                </ActionButton>
                <ActionButton
                    className="primary"
                    onClick={handleSubmit}
                    disabled={submitting || selectedIngredients.length === 0}
                    startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
                >
                    {submitting ? 'Adding...' : `Add ${selectedIngredients.length} Ingredient${selectedIngredients.length !== 1 ? 's' : ''}`}
                </ActionButton>
            </DialogActions>
        </StyledDialog>
    );
};

export default AddRecipeIngredients;
