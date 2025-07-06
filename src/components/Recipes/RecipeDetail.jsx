import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    Alert,
    CircularProgress,
    Stack,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    Edit,
    Delete,
    AccessTime,
    Restaurant,
    Share,
    Add,
    EditOutlined,
    DeleteOutlined,
    Kitchen,
    Person
} from '@mui/icons-material';
import http_service from '../../utils/http_service';
import AddRecipeIngredients from './AddRecipeIngredients';
import EditRecipe from './EditRecipe';

// Styled components
const DetailContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
    padding: theme.spacing(3),
}));

const RecipeCard = styled(Card)(({ theme }) => ({
    borderRadius: 24,
    boxShadow: '0 12px 32px rgba(183, 104, 36, 0.15)',
    border: '1px solid rgba(255, 140, 0, 0.1)',
    overflow: 'hidden',
}));

const RecipeImage = styled(CardMedia)(({ theme }) => ({
    height: 400,
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
}));

const ContentSection = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 4px 16px rgba(183, 104, 36, 0.1)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 12,
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: 600,
    textTransform: 'none',
    '&.primary': {
        background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 16px rgba(183, 104, 36, 0.4)',
        },
    },
    '&.secondary': {
        background: 'white',
        color: '#ff8c00',
        border: '2px solid #ff8c00',
        '&:hover': {
            background: 'rgba(255, 140, 0, 0.1)',
            transform: 'translateY(-2px)',
        },
    },
}));

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddIngredientsModal, setShowAddIngredientsModal] = useState(false);
    const [showEditRecipeModal, setShowEditRecipeModal] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');

    useEffect(() => {
        fetchRecipeDetail()
        fetchRecipeIngredients();
    }, [id]);



    const fetchRecipeDetail = async () => {
        try {
            const response = await http_service.get(`/recipes/recipe/${id}/`);
            console.log('Recipe detail response:', response.data);
            setRecipe(response.data.data);
        } catch (err) {
            console.error('Error fetching recipe detail:', err);
            setError('Failed to load recipe. Please try again.');
        }
    };

    const fetchRecipeIngredients = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await http_service.get(`/recipes/recipe/${id}/ingredient/`);
            console.log('Recipe ingredients response:', response.data);

            const ingredientsData = response.data.data || [];
            setIngredients(ingredientsData);


        } catch (err) {
            console.error('Error fetching recipe ingredients:', err);
            // Fallback to fetching recipe details only
            await fetchRecipeDetail();
        } finally {
            setLoading(false);
        }
    };



    const handleEdit = () => {
        setShowEditRecipeModal(true);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await http_service.delete(`/recipes/recipe/${id}/`);
                navigate('/dashboard');
            } catch (err) {
                console.error('Error deleting recipe:', err);
                setError('Failed to delete recipe. Please try again.');
            }
        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.title,
                    text: `Check out this recipe: ${recipe.title}`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
        }
    };

    const handleAddIngredients = () => {
        setShowAddIngredientsModal(true);
    };

    const handleCloseIngredientsModal = () => {
        setShowAddIngredientsModal(false);
    };

    const handleIngredientsAdded = () => {
        // Refresh the ingredients list (which will also update recipe if needed)
        fetchRecipeIngredients();
    };

    const handleCloseEditRecipeModal = () => {
        setShowEditRecipeModal(false);
    };

    const handleRecipeUpdated = (updatedRecipe) => {
        // Update the local recipe state with the updated data
        setRecipe(updatedRecipe);
        // Optionally refresh ingredients to ensure consistency
        fetchRecipeIngredients();
    };

    const handleEditIngredient = (recipeIngredient) => {
        setEditingIngredient(recipeIngredient);
        setEditQuantity(recipeIngredient.quantity.toString());
    };

    const handleCloseEditModal = () => {
        setEditingIngredient(null);
        setEditQuantity('');
    };

    const handleSaveEdit = async () => {
        if (!editQuantity.trim()) {
            setError('Please specify a quantity.');
            return;
        }

        try {
            await http_service.put(`/recipes/recipe/${id}/ingredient/${editingIngredient.id}/`, {
                quantity: editQuantity
            });

            // Refresh the ingredients list (which will also update recipe if needed)
            fetchRecipeIngredients();
            handleCloseEditModal();
        } catch (err) {
            console.error('Error updating ingredient:', err);
            setError('Failed to update ingredient. Please try again.');
        }
    };

    const handleDeleteIngredient = async (recipeIngredientId) => {
        if (window.confirm('Are you sure you want to remove this ingredient from the recipe?')) {
            try {
                await http_service.delete(`/recipes/recipe/${id}/ingredient/${recipeIngredientId}/`);

                // Refresh the ingredients list (which will also update recipe if needed)
                fetchRecipeIngredients();
            } catch (err) {
                console.error('Error deleting ingredient:', err);
                setError('Failed to remove ingredient. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <DetailContainer>
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <Stack spacing={2} alignItems="center">
                            <CircularProgress size={60} sx={{ color: '#ff8c00' }} />
                            <Typography variant="h6" sx={{ color: '#8b4513' }}>
                                Loading recipe...
                            </Typography>
                        </Stack>
                    </Box>
                </Container>
            </DetailContainer>
        );
    }

    if (error) {
        return (
            <DetailContainer>
                <Container maxWidth="md">
                    <Stack spacing={3}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBack}
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            Back to Recipes
                        </Button>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                        </Alert>
                    </Stack>
                </Container>
            </DetailContainer>
        );
    }

    if (!recipe) {
        return (
            <DetailContainer>
                <Container maxWidth="lg">
                    <Stack spacing={3}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBack}
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            Back to Recipes
                        </Button>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Recipe not found.
                        </Alert>
                    </Stack>
                </Container>
            </DetailContainer>
        );
    }

    return (
        <DetailContainer>
            <Container maxWidth="md">
                <Stack spacing={4}>
                    {/* Header with back button */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBack}
                            sx={{ color: '#ff8c00', fontWeight: 600 }}
                        >
                            Back to Recipes
                        </Button>

                        <Stack direction="row" spacing={2}>
                            <Tooltip title="Share Recipe">
                                <IconButton
                                    onClick={handleShare}
                                    sx={{ color: '#ff8c00' }}
                                >
                                    <Share />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Recipe">
                                <IconButton
                                    onClick={handleEdit}
                                    sx={{ color: '#ff8c00' }}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Recipe">
                                <IconButton
                                    onClick={handleDelete}
                                    sx={{ color: '#d32f2f' }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>

                    {/* Recipe Card */}
                    <RecipeCard>
                        {recipe.image_url && (
                            <RecipeImage
                                image={recipe.image_url}
                                title={recipe.title}
                            />
                        )}

                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                {/* Title and Meta Info */}
                                <Box>
                                    <Typography
                                        variant="h3"
                                        component="h1"
                                        sx={{
                                            color: '#ff8c00',
                                            fontWeight: 700,
                                            mb: 2,
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {recipe.title}
                                    </Typography>

                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        <Chip
                                            icon={<AccessTime />}
                                            label={`Created ${formatDate(recipe.created_at)}`}
                                            sx={{
                                                backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                                color: '#ff8c00',
                                                '& .MuiChip-icon': { color: '#ff8c00' },
                                            }}
                                        />
                                        <Chip
                                            icon={<Restaurant />}
                                            label="Recipe"
                                            sx={{
                                                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                                                color: '#8b4513',
                                                '& .MuiChip-icon': { color: '#8b4513' },
                                            }}
                                        />
                                        {recipe.created_by && (
                                            <Chip
                                                icon={<Person />}
                                                label={`By ${recipe.created_by.first_name} ${recipe.created_by.last_name}`}
                                                sx={{
                                                    backgroundColor: 'rgba(154, 162, 240, 0.1)',
                                                    color: 'rgba(8, 25, 182, 0.82)',
                                                    '& .MuiChip-icon': { color: 'rgba(0, 16, 158, 0.71)' },
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Ingredients */}
                                <ContentSection>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: '#8b4513',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Ingredients
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Add />}
                                            onClick={handleAddIngredients}
                                            sx={{
                                                color: '#ff8c00',
                                                borderColor: '#ff8c00',
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                '&:hover': {
                                                    background: 'rgba(255, 140, 0, 0.1)',
                                                    borderColor: '#d67200',
                                                },
                                            }}
                                        >
                                            Add Ingredients
                                        </Button>
                                    </Box>
                                    {ingredients.length > 0 ? (
                                        <Stack spacing={2}>
                                            {ingredients.map((recipeIngredient, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2,
                                                        p: 2,
                                                        borderRadius: 2,
                                                        backgroundColor: 'rgba(255, 140, 0, 0.05)',
                                                        border: '1px solid rgba(255, 140, 0, 0.1)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255, 140, 0, 0.08)',
                                                        },
                                                    }}
                                                >
                                                    {recipeIngredient.image_url ? (
                                                        <Box
                                                            component="img"
                                                            src={recipeIngredient.image_url}
                                                            alt={recipeIngredient.ingredient.name}
                                                            sx={{
                                                                width: 60,
                                                                height: 60,
                                                                objectFit: 'cover',
                                                                borderRadius: 2,
                                                                border: '1px solid #ddd',
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                width: 60,
                                                                height: 60,
                                                                borderRadius: 2,
                                                                backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px solid #ddd',
                                                            }}
                                                        >
                                                            <Kitchen sx={{ fontSize: 24, color: '#ff8c00' }} />
                                                        </Box>
                                                    )}
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: '#ff8c00',
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            {recipeIngredient.ingredient.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#666',
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            Quantity: {recipeIngredient.quantity || 'Not specified'}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: '#666',
                                                            }}
                                                        >
                                                            Unit: {recipeIngredient.ingredient.unit}
                                                        </Typography>
                                                    </Box>
                                                    <Stack direction="row" spacing={1}>
                                                        <Tooltip title="Edit Quantity">
                                                            <IconButton
                                                                onClick={() => handleEditIngredient(recipeIngredient)}
                                                                sx={{
                                                                    color: '#ff8c00',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                                                    },
                                                                }}
                                                                size="small"
                                                            >
                                                                <EditOutlined fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Remove Ingredient">
                                                            <IconButton
                                                                onClick={() => handleDeleteIngredient(recipeIngredient.id)}
                                                                sx={{
                                                                    color: '#d32f2f',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                                    },
                                                                }}
                                                                size="small"
                                                            >
                                                                <DeleteOutlined fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                </Box>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Box
                                            sx={{
                                                textAlign: 'center',
                                                py: 4,
                                                px: 2,
                                                backgroundColor: 'rgba(255, 140, 0, 0.05)',
                                                borderRadius: 2,
                                                border: '2px dashed rgba(255, 140, 0, 0.2)',
                                            }}
                                        >
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: '#666',
                                                    mb: 2,
                                                }}
                                            >
                                                No ingredients added to this recipe yet.
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<Add />}
                                                onClick={handleAddIngredients}
                                                sx={{
                                                    background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
                                                    color: 'white',
                                                    borderRadius: 2,
                                                    px: 3,
                                                    py: 1,
                                                    fontWeight: 600,
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
                                                        transform: 'translateY(-2px)',
                                                    },
                                                }}
                                            >
                                                Add Ingredients
                                            </Button>
                                        </Box>
                                    )}
                                </ContentSection>

                                {/* Instructions */}
                                <ContentSection>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            color: '#8b4513',
                                            fontWeight: 600,
                                            mb: 2,
                                        }}
                                    >
                                        Instructions
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: '#333',
                                            lineHeight: 1.8,
                                            fontSize: '1.1rem',
                                            whiteSpace: 'pre-line',
                                        }}
                                    >
                                        {recipe.instructions}
                                    </Typography>
                                </ContentSection>

                                {/* Additional recipe details can be added here */}
                                {recipe.description && (
                                    <ContentSection>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                color: '#8b4513',
                                                fontWeight: 600,
                                                mb: 2,
                                            }}
                                        >
                                            Description
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: '#333',
                                                lineHeight: 1.8,
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            {recipe.description}
                                        </Typography>
                                    </ContentSection>
                                )}


                            </Stack>
                        </CardContent>
                    </RecipeCard>
                </Stack>
            </Container>

            {/* Add Recipe Ingredients Modal */}
            <AddRecipeIngredients
                open={showAddIngredientsModal}
                onClose={handleCloseIngredientsModal}
                recipeId={id}
                onIngredientsAdded={handleIngredientsAdded}
            />

            {/* Edit Ingredient Modal */}
            <Dialog
                open={!!editingIngredient}
                onClose={handleCloseEditModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    }
                }}
            >
                <DialogTitle sx={{
                    pb: 1,
                    color: '#333',
                    fontWeight: 600,
                    fontSize: '1.25rem'
                }}>
                    Edit Ingredient Quantity
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    {editingIngredient && (
                        <Box>
                            <Box display="flex" alignItems="center" gap={2} mb={3}>
                                {editingIngredient.ingredient.image_url ? (
                                    <Box
                                        component="img"
                                        src={editingIngredient.ingredient.image_url}
                                        alt={editingIngredient.ingredient.name}
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            border: '1px solid #ddd',
                                        }}
                                    />
                                ) : (
                                    <Box
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid #ddd',
                                        }}
                                    >
                                        <Kitchen sx={{ fontSize: 24, color: '#ff8c00' }} />
                                    </Box>
                                )}
                                <Box>
                                    <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                        {editingIngredient.ingredient.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                        Unit: {editingIngredient.ingredient.unit}
                                    </Typography>
                                </Box>
                            </Box>

                            <TextField
                                fullWidth
                                label="Quantity"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                                placeholder="Enter quantity"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#ff8c00',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#ff8c00',
                                    },
                                }}
                            />
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={handleCloseEditModal}
                        sx={{
                            color: '#666',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveEdit}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
                            },
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Recipe Modal */}
            <EditRecipe
                open={showEditRecipeModal}
                onClose={handleCloseEditRecipeModal}
                recipe={recipe}
                onRecipeUpdated={handleRecipeUpdated}
            />
        </DetailContainer>
    );
};

export default RecipeDetail;
