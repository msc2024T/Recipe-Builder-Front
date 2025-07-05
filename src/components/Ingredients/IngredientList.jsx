import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Delete,
    Category
} from '@mui/icons-material';
import http_service from '../../utils/http_service';

// Styled components
const IngredientContainer = styled(Box)(({ theme }) => ({
    minHeight: '70vh',
    padding: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 16,
    boxShadow: '0 4px 16px rgba(183, 104, 36, 0.1)',
    border: '1px solid rgba(255, 140, 0, 0.1)',
    transition: 'all 0.3s ease',
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
    const navigate = useNavigate();

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            // Replace with your actual ingredients API endpoint
            const response = await http_service.get('/ingredients/');
            setIngredients(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch ingredients. Please try again.');
            console.error('Error fetching ingredients:', err);
            // Mock data for now
            setIngredients([
                {
                    id: 1,
                    name: "Tomatoes",
                    category: "Vegetables",
                    unit: "pieces",
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "Olive Oil",
                    category: "Oils",
                    unit: "ml",
                    created_at: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ingredientId) => {
        navigate(`/ingredients/edit/${ingredientId}`);
    };

    const handleDelete = async (ingredientId) => {
        if (window.confirm('Are you sure you want to delete this ingredient?')) {
            try {
                await http_service.delete(`/ingredients/${ingredientId}/`);
                setIngredients(ingredients.filter(ingredient => ingredient.id !== ingredientId));
            } catch (err) {
                setError('Failed to delete ingredient. Please try again.');
                console.error('Error deleting ingredient:', err);
            }
        }
    };

    const handleAddNew = () => {
        navigate('/ingredients/create');
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
                <Paper
                    elevation={0}
                    sx={{
                        textAlign: 'center',
                        mb: 4,
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 3,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            color: '#ff8c00',
                            fontWeight: 700,
                            mb: 1,
                        }}
                    >
                        <Kitchen sx={{ mr: 2, fontSize: '2rem' }} />
                        My Ingredients
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#666',
                        }}
                    >
                        Manage your ingredient inventory
                    </Typography>
                </Paper>

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
                    <Grid container spacing={3}>
                        {ingredients.map((ingredient) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={ingredient.id}>
                                <StyledCard>
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Stack spacing={2}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Typography
                                                    variant="h6"
                                                    component="h3"
                                                    sx={{
                                                        color: '#ff8c00',
                                                        fontWeight: 700,
                                                        fontSize: '1.1rem',
                                                    }}
                                                >
                                                    {ingredient.name}
                                                </Typography>
                                                <Box>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEdit(ingredient.id)}
                                                            sx={{ color: '#ff8c00' }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(ingredient.id)}
                                                            sx={{ color: '#d32f2f' }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Box>
                                                <Chip
                                                    icon={<Category />}
                                                    label={ingredient.category}
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{
                                                        borderColor: '#ff8c00',
                                                        color: '#ff8c00',
                                                        fontWeight: 500,
                                                    }}
                                                />
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
            </Container>
        </IngredientContainer>
    );
};

export default IngredientList;
