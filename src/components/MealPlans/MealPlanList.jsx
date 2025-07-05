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
    Paper,
    Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Add,
    CalendarMonth,
    Edit,
    Delete,
    Restaurant,
    Schedule
} from '@mui/icons-material';
import http_service from '../../utils/http_service';

// Styled components
const MealPlanContainer = styled(Box)(({ theme }) => ({
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

const MealPlanList = () => {
    const [mealPlans, setMealPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchMealPlans();
    }, []);

    const fetchMealPlans = async () => {
        try {
            setLoading(true);
            // Replace with your actual meal plans API endpoint
            const response = await http_service.get('/meal-plans/');
            setMealPlans(response.data.data || []);
        } catch (err) {
            setError('Failed to fetch meal plans. Please try again.');
            console.error('Error fetching meal plans:', err);
            // Mock data for now
            setMealPlans([
                {
                    id: 1,
                    name: "Weekly Family Meal Plan",
                    start_date: "2025-07-07",
                    end_date: "2025-07-13",
                    meals_count: 21,
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    name: "Healthy Diet Plan",
                    start_date: "2025-07-14",
                    end_date: "2025-07-20",
                    meals_count: 15,
                    created_at: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (mealPlanId) => {
        navigate(`/meal-plans/edit/${mealPlanId}`);
    };

    const handleDelete = async (mealPlanId) => {
        if (window.confirm('Are you sure you want to delete this meal plan?')) {
            try {
                await http_service.delete(`/meal-plans/${mealPlanId}/`);
                setMealPlans(mealPlans.filter(plan => plan.id !== mealPlanId));
            } catch (err) {
                setError('Failed to delete meal plan. Please try again.');
                console.error('Error deleting meal plan:', err);
            }
        }
    };

    const handleAddNew = () => {
        navigate('/meal-plans/create');
    };

    const handleView = (mealPlanId) => {
        navigate(`/meal-plans/view/${mealPlanId}`);
    };

    if (loading) {
        return (
            <MealPlanContainer>
                <Container maxWidth="lg">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress size={60} sx={{ color: '#ff8c00' }} />
                    </Box>
                </Container>
            </MealPlanContainer>
        );
    }

    return (
        <MealPlanContainer>
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
                        <CalendarMonth sx={{ mr: 2, fontSize: '2rem' }} />
                        My Meal Plans
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#666',
                        }}
                    >
                        Plan your meals for the week
                    </Typography>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {mealPlans.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            textAlign: 'center',
                            p: 6,
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 3,
                        }}
                    >
                        <CalendarMonth sx={{ fontSize: '4rem', color: '#ddd', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                            No meal plans found
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#999', mb: 3 }}>
                            Start planning your meals by creating your first meal plan.
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
                            Create Your First Meal Plan
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {mealPlans.map((mealPlan) => (
                            <Grid item xs={12} sm={6} md={4} key={mealPlan.id}>
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
                                                        flex: 1,
                                                        mr: 1,
                                                    }}
                                                >
                                                    {mealPlan.name}
                                                </Typography>
                                                <Box>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEdit(mealPlan.id)}
                                                            sx={{ color: '#ff8c00' }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDelete(mealPlan.id)}
                                                            sx={{ color: '#d32f2f' }}
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>

                                            <Divider sx={{ borderColor: 'rgba(255, 140, 0, 0.2)' }} />

                                            <Box>
                                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                                    <Schedule sx={{ fontSize: '1rem', color: '#666' }} />
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ color: '#666', fontWeight: 500 }}
                                                    >
                                                        Duration
                                                    </Typography>
                                                </Stack>
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: '#333', ml: 3 }}
                                                >
                                                    {new Date(mealPlan.start_date).toLocaleDateString()} - {new Date(mealPlan.end_date).toLocaleDateString()}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Chip
                                                    icon={<Restaurant />}
                                                    label={`${mealPlan.meals_count} meals`}
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
                                                variant="caption"
                                                sx={{
                                                    color: '#999',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                Created: {new Date(mealPlan.created_at).toLocaleDateString()}
                                            </Typography>

                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleView(mealPlan.id)}
                                                sx={{
                                                    borderColor: '#ff8c00',
                                                    color: '#ff8c00',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                                        borderColor: '#d67200',
                                                    },
                                                }}
                                            >
                                                View Plan
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <AddButton
                    onClick={handleAddNew}
                    aria-label="Add new meal plan"
                >
                    <Add />
                </AddButton>
            </Container>
        </MealPlanContainer>
    );
};

export default MealPlanList;
