import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeList.css';
import AddRecipe from './AddRecipe';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Grid,
    Fab,
    Alert,
    CircularProgress,
    Stack,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Add,
    Restaurant,
    Edit,
    Delete,
    AccessTime,
    Person
} from '@mui/icons-material';
import http_service from '../../utils/http_service';

// Styled components
const RecipeContainer = styled(Box)(({ theme }) => ({
    minHeight: '70vh',
    padding: theme.spacing(3),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '90%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 20,
    margin: theme.spacing(1),
    boxShadow: '0 8px 24px rgba(183, 104, 36, 0.15)',
    border: '1px solid rgba(255, 140, 0, 0.1)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 16px 40px rgba(183, 104, 36, 0.25)',
        borderColor: '#ff8c00',
    },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: 200,
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
    },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
    flexGrow: 1,

    padding: theme.spacing(2),
    '&:last-child': {
        paddingBottom: theme.spacing(2),
    },
}));

const AddButton = styled(Fab)(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
    color: 'white',
    boxShadow: '0 8px 24px rgba(183, 104, 36, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
        transform: 'scale(1.1)',
        boxShadow: '0 12px 32px rgba(183, 104, 36, 0.5)',
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 600,
    '&.edit': {
        color: '#ff8c00',
        borderColor: '#ff8c00',
        '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.1)',
            borderColor: '#d67200',
        },
    },
    '&.delete': {
        color: '#d32f2f',
        borderColor: '#d32f2f',
        '&:hover': {
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            borderColor: '#b71c1c',
        },
    },
}));

const EmptyState = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(8),
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    boxShadow: '0 8px 24px rgba(183, 104, 36, 0.15)',
}));

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Initial fetch of recipes when component mounts
        fetchRecipes();

        // Add a flag to avoid unnecessary refetches when interacting with modals
        let isInteractingWithModal = false;

        // Add event listener for when user returns to the page
        const handleFocus = () => {
            // Only fetch if not currently interacting with a modal
            if (!isInteractingWithModal) {
                console.log('Window focus event - fetching recipes');
                fetchRecipes();
            }
        };

        // Handler for modal interactions
        const handleModalInteractionStart = () => {
            isInteractingWithModal = true;
            console.log('Modal interaction started');
        };

        const handleModalInteractionEnd = () => {
            // Use timeout to avoid immediate focus event handling
            setTimeout(() => {
                isInteractingWithModal = false;
                console.log('Modal interaction ended');
            }, 100);
        };

        // Add custom events for modal interactions
        window.addEventListener('modalInteractionStart', handleModalInteractionStart);
        window.addEventListener('modalInteractionEnd', handleModalInteractionEnd);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('modalInteractionStart', handleModalInteractionStart);
            window.removeEventListener('modalInteractionEnd', handleModalInteractionEnd);
        };
    }, []);

    const fetchRecipes = async () => {

        try {
            setLoading(true);
            setError('');

            const response = await http_service.get('/recipes/recipe/');
            console.log('RecipeList component mounted');
            setRecipes(response.data.data || []);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError('Failed to load recipes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
    };

    const handleRecipeAdded = () => {
        fetchRecipes(); // Refresh the recipe list
    };

    const handleEdit = (recipeId) => {
        navigate(`/recipes/edit/${recipeId}`);
    };

    const handleDelete = async (recipeId) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await http_service.delete(`/recipes/recipe/${recipeId}/`);
                setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
            } catch (err) {
                console.error('Error deleting recipe:', err);
                setError('Failed to delete recipe. Please try again.');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const truncateInstructions = (instructions, maxLength = 60) => {
        if (instructions.length <= maxLength) return instructions;
        return instructions.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <RecipeContainer>
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <Stack spacing={2} alignItems="center">
                            <CircularProgress size={60} sx={{ color: '#ff8c00' }} />
                            <Typography variant="h6" sx={{ color: '#8b4513' }}>
                                Loading your recipes...
                            </Typography>
                        </Stack>
                    </Box>
                </Container>
            </RecipeContainer>
        );
    }

    return (
        <RecipeContainer>
            <Container maxWidth="xl">
                <Stack spacing={4}>
                    {/* Header */}
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
                            Recipe Collection
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: '#a0522d',
                                textShadow: '1px 1px 2px rgba(160, 82, 45, 0.1)',
                            }}
                        >
                            Discover and manage your favorite recipes
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Recipe Grid */}
                    {recipes.length === 0 ? (
                        <EmptyState>
                            <Restaurant sx={{ fontSize: 80, color: '#ff8c00', mb: 2 }} />
                            <Typography variant="h4" sx={{ color: '#8b4513', mb: 2, fontWeight: 600 }}>
                                No Recipes Yet
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                                Start building your recipe collection by adding your first recipe!
                            </Typography>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Add />}
                                onClick={handleAddNew}
                                sx={{
                                    background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
                                    color: 'white',
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 12px rgba(183, 104, 36, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 6px 16px rgba(183, 104, 36, 0.5)',
                                    },
                                }}
                            >
                                Add Your First Recipe
                            </Button>
                        </EmptyState>
                    ) : (
                        <Grid container spacing={1}>
                            {recipes.map((recipe) => (
                                <Grid
                                    item
                                    key={recipe.id}
                                    sx={{
                                        flexBasis: {
                                            xs: '100%',
                                            sm: '50%',
                                            md: '33.33%',
                                            lg: '20%',
                                        },
                                        maxWidth: {
                                            xs: '100%',
                                            sm: '50%',
                                            md: '33.33%',
                                            lg: '20%',
                                        },
                                    }}
                                >
                                    <StyledCard
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Card clicked, navigating to recipe:', recipe.id);
                                            navigate(`/recipes/${recipe.id}`);
                                        }}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <StyledCardMedia
                                            image={recipe.image_url || '/api/placeholder/300/200'}
                                            title={recipe.title}
                                        />
                                        <StyledCardContent>
                                            <Typography
                                                variant="h5"
                                                component="h2"
                                                sx={{
                                                    fontWeight: 700,
                                                    color: '#ff8c00',
                                                    mb: 1,
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                {recipe.title}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#666',
                                                    mb: 2,
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {truncateInstructions(recipe.instructions)}
                                            </Typography>

                                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                                <Chip
                                                    icon={<AccessTime />}
                                                    label={formatDate(recipe.created_at)}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                                        color: '#ff8c00',
                                                        '& .MuiChip-icon': { color: '#ff8c00' },
                                                    }}
                                                />
                                            </Stack>
                                        </StyledCardContent>
                                    </StyledCard>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Stack>

                {/* Floating Add Button */}
                {recipes.length > 0 && (
                    <Tooltip title="Add New Recipe" placement="left">
                        <AddButton onClick={handleAddNew}>
                            <Add />
                        </AddButton>
                    </Tooltip>
                )}
            </Container>

            {/* Add Recipe Modal */}
            <AddRecipe
                open={showAddModal}
                onClose={handleCloseModal}
                onRecipeAdded={handleRecipeAdded}
            />
        </RecipeContainer>
    );
};

export default RecipeList;
