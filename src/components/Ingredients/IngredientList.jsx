import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Fab,
    Alert,
    CircularProgress,
    Stack,
    Chip,
    IconButton,
    Tooltip,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Add,
    Kitchen,
    Edit,
    Delete
} from '@mui/icons-material';
import http_service from '../../utils/http_service';
import AddIngredient from './AddIngredient';
import EditIngredient from './EditIngredient';

// Styled components
const IngredientContainer = styled(Box)(({ theme }) => ({
    minHeight: '70vh',
    padding: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: 260,
    width: 220,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(183, 104, 36, 0.1)',
    border: '1px solid rgba(255, 140, 0, 0.1)',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(183, 104, 36, 0.2)',
    },
}));

const AddButton = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    background: 'linear-gradient(135deg, #ff8c00 0%, #d67200 100%)',
    color: 'white',
    '&:hover': {
        background: 'linear-gradient(135deg, #d67200 0%, #b76824 100%)',
        transform: 'scale(1.1)',
    },
    zIndex: 1000,
}));

const IngredientList = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    useEffect(() => {
        fetchIngredients();
    }, []);

    // Updated to use the correct API endpoint for ingredients
    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const response = await http_service.get('/recipes/ingredient/'); // Updated API endpoint
            setIngredients(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch ingredients. Please try again.');
            console.error('Error fetching ingredients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ingredient) => {
        setSelectedIngredient(ingredient);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedIngredient(null);
    };

    const handleIngredientUpdated = (updatedIngredient) => {
        setIngredients(ingredients.map(ingredient =>
            ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
        ));
    };

    const handleDelete = async (ingredientId) => {
        if (window.confirm('Are you sure you want to delete this ingredient?')) {
            try {
                await http_service.delete(`/recipes/ingredient/${ingredientId}/`);
                setIngredients(ingredients.filter(ingredient => ingredient.id !== ingredientId));
            } catch (err) {
                setError('Failed to delete ingredient. Please try again.');
                console.error('Error deleting ingredient:', err);
            }
        }
    };

    const handleAddNew = () => {
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
    };

    const handleIngredientAdded = (newIngredient) => {
        setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
    };

    if (loading) {
        return (
            <IngredientContainer>
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress size={60} sx={{ color: '#ff8c00' }} />
                    </Box>
                </Container>
            </IngredientContainer>
        );
    }

    return (
        <IngredientContainer>
            <Container maxWidth="lg">
                <Box textAlign="center">
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            color: '#8b4513',
                            fontWeight: 700,
                            mb: 1,
                            textShadow: '2px 2px 4px rgba(139, 69, 19, 0.1)',
                        }}
                    >
                        Ingredient Collection
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#a0522d',
                            textShadow: '1px 1px 2px rgba(160, 82, 45, 0.1)',
                            mb: 3,
                        }}
                    >
                        Manage your ingredient inventory
                    </Typography>
                </Box>


                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {ingredients.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            textAlign: 'center',
                            p: 6,

                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 3,
                        }}
                    >
                        <Kitchen sx={{ fontSize: '4rem', color: '#ddd', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                            No ingredients found
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#999', mb: 3 }}>
                            Start building your ingredient inventory by adding your first ingredient.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleAddNew}
                            sx={{
                                background: 'linear-gradient(135deg, #ff8c00 0%, #d67200 100%)',
                                borderRadius: 2,
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #d67200 0%, #b76824 100%)',
                                },
                            }}
                        >
                            Add Your First Ingredient
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3} justifyContent="flex-start">
                        {ingredients.map((ingredient) => (
                            <Grid item key={ingredient.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <StyledCard>
                                    {ingredient.image_url && (
                                        <Box
                                            component="img"
                                            src={ingredient.image_url}
                                            alt={ingredient.name}
                                            sx={{
                                                width: '100%',
                                                height: 150,
                                                objectFit: 'cover',
                                                borderRadius: '16px 16px 0 0',
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <CardContent sx={{ flexGrow: 1, p: 1.5, minHeight: 90 }}>
                                        <Stack spacing={1.5}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Typography
                                                    variant="h6"
                                                    component="h3"
                                                    sx={{
                                                        color: '#ff8c00',
                                                        fontWeight: 700,
                                                        fontSize: '1.1rem',
                                                        lineHeight: 1.2,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '70%',
                                                    }}
                                                >
                                                    {ingredient.name}
                                                </Typography>
                                                <Box>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEdit(ingredient)}
                                                            sx={{ color: '#ff8c00', p: 0.5 }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(ingredient.id)}
                                                            sx={{ color: '#d32f2f', p: 0.5 }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#666',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Unit: {ingredient.unit}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: '#999',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                Added: {new Date(ingredient.created_at).toLocaleDateString()}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <AddButton
                    onClick={handleAddNew}
                    aria-label="Add new ingredient"
                >
                    <Add />
                </AddButton>

                {/* Add Ingredient Modal */}
                <AddIngredient
                    open={showAddModal}
                    onClose={handleCloseModal}
                    onIngredientAdded={handleIngredientAdded}
                />

                {/* Edit Ingredient Modal */}
                <EditIngredient
                    open={showEditModal}
                    onClose={handleCloseEditModal}
                    ingredient={selectedIngredient}
                    onIngredientUpdated={handleIngredientUpdated}
                />
            </Container>
        </IngredientContainer>
    );
};

export default IngredientList;
