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
    Paper,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Add,
    CalendarMonth,
    Restaurant,
    Schedule,
    Visibility
} from '@mui/icons-material';
import http_service from '../../utils/http_service';
import AddMealPlan from './AddMealPlan';

// Styled components
const MealPlanContainer = styled(Box)(({ theme }) => ({
    minHeight: '70vh',
    padding: theme.spacing(3),
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

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    textTransform: 'none',
    fontWeight: 600,
    padding: '6px 16px',
    background: 'linear-gradient(135deg, #ff8c00 0%, #d67200 100%)',
    color: 'white',
    '&:hover': {
        background: 'linear-gradient(135deg, #d67200 0%, #b76824 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(183, 104, 36, 0.3)',
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
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMealPlans();
    }, []);

    const fetchMealPlans = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await http_service.get('/mealplans/meal-plans/');
            setMealPlans(response.data || []);
        } catch (err) {
            // setError('Failed to fetch meal plans. Please try again.');
            console.error('Error fetching meal plans:', err);
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

    const handleMealPlanAdded = (newMealPlan) => {
        // Add the new meal plan to the list
        setMealPlans(prevPlans => [...prevPlans, newMealPlan]);
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
                <Box textAlign="center" sx={{ mb: 4 }}>
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
                        My Meal Plans
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#a0522d',
                            textShadow: '1px 1px 2px rgba(160, 82, 45, 0.1)',
                        }}
                    >
                        Plan your meals effortlessly and stay organized
                    </Typography>
                </Box>


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
                    <StyledTableContainer component={Paper}>
                        <Table>
                            <StyledTableHead>
                                <TableRow>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CalendarMonth sx={{ color: '#ff8c00', fontSize: '1.2rem' }} />
                                            <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                                Meal Plan
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Schedule sx={{ color: '#ff8c00', fontSize: '1.2rem' }} />
                                            <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                                Start Date
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Schedule sx={{ color: '#ff8c00', fontSize: '1.2rem' }} />
                                            <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                                End Date
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                            Duration
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography variant="h6" sx={{ color: '#ff8c00', fontWeight: 600 }}>
                                            Actions
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </StyledTableHead>
                            <TableBody>
                                {mealPlans.map((mealPlan) => {
                                    const startDate = new Date(mealPlan.start_date);
                                    const endDate = new Date(mealPlan.end_date);
                                    const diffTime = Math.abs(endDate - startDate);
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                                    return (
                                        <StyledTableRow key={mealPlan.id}>
                                            <TableCell>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#333',
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    {mealPlan.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    {startDate.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    {endDate.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${diffDays} day${diffDays === 1 ? '' : 's'}`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 140, 0, 0.1)',
                                                        color: '#ff8c00',
                                                        fontWeight: 600,
                                                        border: '1px solid rgba(255, 140, 0, 0.3)',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <ActionButton
                                                    startIcon={<Visibility />}
                                                    onClick={() => handleView(mealPlan.id)}
                                                    size="small"
                                                >
                                                    View
                                                </ActionButton>
                                            </TableCell>
                                        </StyledTableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </StyledTableContainer>
                )}

                <AddButton
                    onClick={handleAddNew}
                    aria-label="Add new meal plan"
                >
                    <Add />
                </AddButton>

                {/* Add Meal Plan Modal */}
                <AddMealPlan
                    open={showAddModal}
                    onClose={handleCloseModal}
                    onMealPlanAdded={handleMealPlanAdded}
                />
            </Container>
        </MealPlanContainer>
    );
};

export default MealPlanList;
