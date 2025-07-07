import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Alert,
    CircularProgress,
    Stack,
    Chip,
    Paper,
    Divider,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    ArrowBack,
    CalendarMonth,
    Restaurant,
    Schedule,
    Edit,
    Delete,
    AccessTime,
    Person,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import http_service from '../../utils/http_service';
import EditMealPlan from './EditMealPlan';
import './MealPlanDetail.css';

// Styled components
const DetailContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
    padding: theme.spacing(3),
}));

const HeaderCard = styled(Card)(({ theme }) => ({
    borderRadius: 20,
    background: 'linear-gradient(135deg, #fff 0%, rgba(255, 248, 240, 0.8) 100%)',
    boxShadow: '0 12px 32px rgba(183, 104, 36, 0.15)',
    border: '1px solid rgba(255, 140, 0, 0.1)',
    marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 12,
    textTransform: 'none',
    fontWeight: 600,
    padding: '8px 20px',
    '&.primary': {
        background: 'linear-gradient(135deg, #ff8c00 0%, #d67200 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #d67200 0%, #b76824 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(183, 104, 36, 0.3)',
        },
    },
    '&.secondary': {
        border: '2px solid #ff8c00',
        color: '#ff8c00',
        backgroundColor: 'transparent',
        '&:hover': {
            backgroundColor: 'rgba(255, 140, 0, 0.05)',
            borderColor: '#d67200',
        },
    },
    '&.danger': {
        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        color: 'white',
        '&:hover': {
            background: 'linear-gradient(135deg, #c82333 0%, #bd2130 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
        },
    },
}));

const StatsChip = styled(Chip)(({ theme }) => ({
    borderRadius: 12,
    fontWeight: 600,
    padding: '4px 8px',
    '&.duration': {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        color: '#388e3c',
        border: '1px solid rgba(76, 175, 80, 0.3)',
    },
    '&.recipes': {
        backgroundColor: 'rgba(255, 140, 0, 0.1)',
        color: '#ff8c00',
        border: '1px solid rgba(255, 140, 0, 0.3)',
    },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(183, 104, 36, 0.15)',
    border: '1px solid rgba(255, 140, 0, 0.1)',
    background: 'white',
    overflow: 'hidden',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.1) 0%, rgba(255, 140, 0, 0.05) 100%)',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: 'rgba(255, 140, 0, 0.03)',
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const MealPlanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mealPlan, setMealPlan] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMealPlanDetail();
        }
    }, [id]);

    const fetchMealPlanDetail = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch meal plan details
            const mealPlanResponse = await http_service.get(`/mealplans/meal-plans/${id}/`);
            setMealPlan(mealPlanResponse.data);

            // Fetch recipes for this meal plan (don't treat empty list as error)
            try {
                const recipesResponse = await http_service.get(`/mealplans/meal-plans/${id}/recipes/`);
                // Extract the nested recipe objects from the meal plan recipe relationships
                const recipeRelationships = recipesResponse.data || [];
                const extractedRecipes = recipeRelationships.map(relationship => ({
                    ...relationship.recipe,
                    // Add the image_url from the relationship level if it exists
                    image_url: relationship.image_url || relationship.recipe.image_url
                }));
                setRecipes(extractedRecipes);
            } catch (recipeErr) {
                // If recipes endpoint fails, just set empty array - don't show error
                console.warn('Could not fetch recipes for meal plan:', recipeErr);
                setRecipes([]);
            }

        } catch (err) {
            setError('Failed to fetch meal plan details. Please try again.');
            console.error('Error fetching meal plan detail:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleEdit = () => {
        setEditModalOpen(true);
    };

    const handleEditClose = () => {
        setEditModalOpen(false);
    };

    const handleMealPlanUpdated = () => {
        // Refresh the meal plan details
        fetchMealPlanDetail();
        setEditModalOpen(false);
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await http_service.delete(`/mealplans/meal-plans/${id}/`);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to delete meal plan. Please try again.');
            console.error('Error deleting meal plan:', err);
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    const handleViewRecipe = (recipeId) => {
        navigate(`/recipes/${recipeId}`);
    };

    const handleAddRecipes = () => {
        // Navigate to dashboard and switch to recipes tab, or open a modal to add recipes
        // For now, we'll navigate to dashboard
        navigate('/dashboard', { state: { activeTab: 0 } }); // 0 is recipes tab
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const calculateDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    if (loading) {
        return (
            <DetailContainer>
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress size={60} sx={{ color: '#ff8c00' }} />
                    </Box>
                </Container>
            </DetailContainer>
        );
    }

    if (error && !mealPlan) {
        return (
            <DetailContainer>
                <Container maxWidth="lg">
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleBack}
                        sx={{ mt: 2 }}
                    >
                        Back to Dashboard
                    </Button>
                </Container>
            </DetailContainer>
        );
    }

    if (!mealPlan) {
        return (
            <DetailContainer>
                <Container maxWidth="lg">
                    <Typography variant="h6" color="textSecondary" textAlign="center">
                        Meal plan not found
                    </Typography>
                    <Box textAlign="center" mt={2}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBack}
                        >
                            Back to Dashboard
                        </Button>
                    </Box>
                </Container>
            </DetailContainer>
        );
    }

    const duration = calculateDuration(mealPlan.start_date, mealPlan.end_date);

    return (
        <DetailContainer className="meal-plan-detail-container">
            <Container maxWidth="md">
                <Stack spacing={4}>
                    {/* Header with back button */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={handleBack}
                            sx={{ color: '#ff8c00', fontWeight: 600 }}
                        >
                            Back to Dashboard
                        </Button>

                        <Stack direction="row" spacing={2}>
                            <Tooltip title="Edit Meal Plan">
                                <IconButton
                                    onClick={handleEdit}
                                    sx={{ color: '#ff8c00' }}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Meal Plan">
                                <IconButton
                                    onClick={() => setDeleteDialogOpen(true)}
                                    sx={{ color: '#d32f2f' }}
                                >
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Meal Plan Info Card */}
                    <HeaderCard className="header-card">
                        <CardContent sx={{ p: 4 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        component="h1"
                                        sx={{
                                            color: '#8b4513',
                                            fontWeight: 700,
                                            mb: 2,
                                            textShadow: '2px 2px 4px rgba(139, 69, 19, 0.1)',
                                        }}
                                    >
                                        {mealPlan.title}
                                    </Typography>

                                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                        <StatsChip
                                            icon={<Schedule />}
                                            label={`${duration} day${duration === 1 ? '' : 's'}`}
                                            className="duration"
                                        />
                                        <StatsChip
                                            icon={<Restaurant />}
                                            label={`${recipes.length} recipe${recipes.length === 1 ? '' : 's'}`}
                                            className="recipes"
                                        />
                                    </Stack>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3, borderColor: 'rgba(255, 140, 0, 0.2)' }} />

                            {/* Date Information */}
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <CalendarMonth sx={{ color: '#ff8c00', mr: 2 }} />
                                        <Typography variant="body1" sx={{ color: '#8b4513', fontWeight: 600 }}>
                                            Start Date
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem', ml: 4 }}>
                                        {formatDate(mealPlan.start_date)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <CalendarMonth sx={{ color: '#ff8c00', mr: 2 }} />
                                        <Typography variant="body1" sx={{ color: '#8b4513', fontWeight: 600 }}>
                                            End Date
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem', ml: 4 }}>
                                        {formatDate(mealPlan.end_date)}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {mealPlan.description && (
                                <>
                                    <Divider sx={{ my: 3, borderColor: 'rgba(255, 140, 0, 0.2)' }} />
                                    <Typography variant="h6" sx={{ color: '#8b4513', fontWeight: 600, mb: 2 }}>
                                        Description
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                                        {mealPlan.description}
                                    </Typography>
                                </>
                            )}
                        </CardContent>
                    </HeaderCard>

                    {/* Recipes Section */}
                    <Box mb={4}>
                        <Typography
                            variant="h6"
                            className="section-title"
                            sx={{
                                color: '#8b4513',
                                fontWeight: 700,
                                mb: 3,
                                textShadow: '2px 2px 4px rgba(139, 69, 19, 0.1)',
                            }}
                        >
                            Recipes ({recipes.length})
                        </Typography>

                        {recipes.length === 0 ? (
                            <Paper
                                elevation={0}
                                className="empty-state"
                                sx={{
                                    textAlign: 'center',
                                    p: 6,
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: 3,
                                    border: '1px solid rgba(255, 140, 0, 0.1)',
                                }}
                            >
                                <Restaurant className="empty-state-icon" sx={{ fontSize: '4rem', color: '#ddd', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                                    No recipes added yet
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#999', mb: 3 }}>
                                    This meal plan doesn't have any recipes assigned to it. Add some delicious recipes to get started!
                                </Typography>
                                <ActionButton
                                    className="primary"
                                    startIcon={<Restaurant />}
                                    onClick={handleAddRecipes}
                                    sx={{ px: 4, py: 1.5 }}
                                >
                                    Add Recipes
                                </ActionButton>
                            </Paper>
                        ) : (
                            <TableContainer
                                component={Paper}
                                className="recipe-table-container"
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid rgba(255, 140, 0, 0.1)',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                                    overflow: 'hidden'
                                }}
                            >
                                <Table className="recipe-table">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: 'rgba(255, 140, 0, 0.05)' }}>
                                            <TableCell sx={{ fontWeight: 600, color: '#8b4513', py: 2 }}>
                                                Recipe
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#8b4513', py: 2 }}>
                                                Instructions
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#8b4513', py: 2 }}>
                                                Author
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#8b4513', py: 2 }}>
                                                Date Added
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: '#8b4513', py: 2, textAlign: 'center' }}>
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recipes.map((recipe) => (
                                            <TableRow
                                                key={recipe.id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 140, 0, 0.02)'
                                                    },
                                                    transition: 'background-color 0.2s ease'
                                                }}
                                            >
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={2}>
                                                        {recipe.image_url ? (
                                                            <Box
                                                                component="img"
                                                                src={recipe.image_url}
                                                                alt={recipe.title}
                                                                className="recipe-image"
                                                                sx={{
                                                                    width: 60,
                                                                    height: 60,
                                                                    objectFit: 'cover',
                                                                    borderRadius: 2,
                                                                    border: '2px solid rgba(255, 140, 0, 0.2)',
                                                                }}
                                                            />
                                                        ) : (
                                                            <Avatar
                                                                className="recipe-image"
                                                                sx={{
                                                                    bgcolor: 'rgba(255, 140, 0, 0.1)',
                                                                    color: '#ff8c00',
                                                                    width: 60,
                                                                    height: 60,
                                                                }}
                                                            >
                                                                <Restaurant />
                                                            </Avatar>
                                                        )}
                                                        <Box>
                                                            <Typography
                                                                variant="h6"
                                                                className="recipe-title"
                                                                sx={{
                                                                    color: '#8b4513',
                                                                    fontWeight: 600,
                                                                    lineHeight: 1.2,
                                                                    fontSize: '1.1rem'
                                                                }}
                                                            >
                                                                {recipe.title}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: '#666',
                                                            lineHeight: 1.4,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            maxWidth: '300px',
                                                        }}
                                                    >
                                                        {recipe.instructions || 'No instructions provided'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {recipe.created_by ? (
                                                        <Chip
                                                            icon={<Person />}
                                                            label={recipe.created_by.first_name}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                                                color: '#1976d2',
                                                                border: '1px solid rgba(33, 150, 243, 0.3)',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Unknown
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {recipe.created_at ? (
                                                        <Chip
                                                            icon={<AccessTime />}
                                                            label={new Date(recipe.created_at).toLocaleDateString()}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                                color: '#388e3c',
                                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Unknown
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" justifyContent="center" gap={1}>
                                                        <Tooltip title="View Recipe">
                                                            <IconButton
                                                                onClick={() => handleViewRecipe(recipe.id)}
                                                                sx={{
                                                                    color: '#ff8c00',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                                                        transform: 'scale(1.1)',
                                                                    },
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                <Visibility />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        open={deleteDialogOpen}
                        onClose={() => setDeleteDialogOpen(false)}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #fff 0%, rgba(255, 248, 240, 0.8) 100%)',
                            }
                        }}
                    >
                        <DialogTitle sx={{ color: '#8b4513', fontWeight: 600 }}>
                            Delete Meal Plan
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{ color: '#666', fontSize: '1rem' }}>
                                Are you sure you want to delete "{mealPlan?.title}"? This action cannot be undone.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, pt: 1 }}>
                            <Button
                                onClick={() => setDeleteDialogOpen(false)}
                                sx={{ color: '#666' }}
                            >
                                Cancel
                            </Button>
                            <ActionButton
                                className="danger"
                                onClick={handleDelete}
                                disabled={deleting}
                                startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Delete />}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </ActionButton>
                        </DialogActions>
                    </Dialog>

                    {/* Edit Meal Plan Modal */}
                    <EditMealPlan
                        open={editModalOpen}
                        onClose={handleEditClose}
                        onMealPlanUpdated={handleMealPlanUpdated}
                        mealPlan={mealPlan}
                    />
                </Stack>
            </Container>
        </DetailContainer>
    );
};

export default MealPlanDetail;
