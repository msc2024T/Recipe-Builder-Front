import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
    IconButton,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Checkbox,
    FormControlLabel,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Close,
    CalendarMonth,
    Title,
    Save,
    DateRange,
    Restaurant,
    CheckCircle,
    RadioButtonUnchecked,
    Search
} from '@mui/icons-material';
import http_service from '../../utils/http_service';

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 24,
        maxWidth: 600,
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

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 12,
        '&:hover fieldset': {
            borderColor: '#ff8c00',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#ff8c00',
        },
    },
    '& .MuiInputLabel-root': {
        '&.Mui-focused': {
            color: '#ff8c00',
        },
    },
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

// Validation schema
const schema = yup.object().shape({
    title: yup
        .string()
        .min(3, 'Meal plan title must be at least 3 characters')
        .max(100, 'Meal plan title must not exceed 100 characters')
        .required('Meal plan title is required'),
    start_date: yup
        .string()
        .required('Start date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
        .test('not-past', 'Start date cannot be in the past', function (value) {
            if (!value) return false;
            const today = new Date().toISOString().split('T')[0];
            return value >= today;
        }),
    end_date: yup
        .string()
        .required('End date is required')
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
        .test('after-start', 'End date must be after start date', function (value) {
            const { start_date } = this.parent;
            if (!value || !start_date) return false;
            return value >= start_date;
        }),
});

const AddMealPlan = ({ open, onClose, onMealPlanAdded }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1); // 1: Plan Details, 2: Select Recipes, 3: Processing
    const [createdMealPlan, setCreatedMealPlan] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipes, setSelectedRecipes] = useState([]);
    const [loadingRecipes, setLoadingRecipes] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [processingStep, setProcessingStep] = useState(0); // 0: idle, 1: creating plan, 2: adding recipes, 3: complete
    // Create a ref for tracking if component is mounted
    const isMountedRef = useRef(true);
    // Track if modal is open to prevent unnecessary API calls
    const wasOpenRef = useRef(false);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Handle modal open/close states to prevent unwanted API calls
    useEffect(() => {
        if (open && !wasOpenRef.current) {
            // Modal is opening
            wasOpenRef.current = true;
            setCurrentStep(1);
            setCreatedMealPlan(null);
            setSelectedRecipes([]);
            setSearchQuery('');
            setProcessingStep(0);
            window.dispatchEvent(new CustomEvent('modalInteractionStart'));
        } else if (!open && wasOpenRef.current) {
            // Modal is closing
            wasOpenRef.current = false;
            window.dispatchEvent(new CustomEvent('modalInteractionEnd'));
        }
    }, [open]);

    const {
        register,
        formState: { errors },
        reset,
        handleSubmit,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });

    // Watch form values to provide better UX
    const watchedStartDate = watch('start_date');

    // Fetch recipes for step 2
    const fetchRecipes = async () => {
        try {
            setLoadingRecipes(true);
            const response = await http_service.get('/recipes/recipe/');
            setRecipes(response.data.data || []);
        } catch (err) {
            console.error('Error fetching recipes:', err);
            setError('Failed to load recipes. You can add them later.');
        } finally {
            setLoadingRecipes(false);
        }
    };

    const onSubmit = async (data) => {
        // Step 1: Just validate and move to next step
        setError('');
        setCurrentStep(2);
        await fetchRecipes();
    };

    // New function to handle the complete meal plan creation process
    const handleFinishWizard = async () => {
        if (selectedRecipes.length === 0) {
            setError('Please select at least one recipe for your meal plan.');
            return;
        }

        setCurrentStep(3); // Move to processing step
        setProcessingStep(1); // Start creating plan
        setError('');

        try {
            // Step 1: Create the meal plan
            const formData = watch(); // Get current form data

            const formatDate = (dateString) => {
                if (!dateString) return null;
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    return dateString;
                }
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };

            const payload = {
                title: formData.title.trim(),
                start_date: formatDate(formData.start_date),
                end_date: formatDate(formData.end_date),
            };

            console.log('Creating meal plan with payload:', payload);

            const response = await http_service.post('/mealplans/meal-plans/', payload);
            setCreatedMealPlan(response.data);

            // Call the callback to refresh the meal plan list
            if (onMealPlanAdded) {
                onMealPlanAdded(response.data);
            }

            setProcessingStep(2); // Move to adding recipes

            let recipe_list = selectedRecipes.map(recipe => ({
                recipe_id: recipe.id,
            }));

            // Step 2: Add selected recipes to the meal plan
            await http_service.post(`/mealplans/meal-plans/${response.data.id}/recipes/`, recipe_list);
            setProcessingStep(3); // Complete

            // Clean up form and close modal after a short delay
            reset();
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (err) {
            let errorMessage = 'Failed to create meal plan. Please try again.';

            if (err.response?.data) {
                const errorData = err.response.data;
                if (errorData.start_date || errorData.end_date || errorData.title) {
                    const fieldErrors = [];
                    if (errorData.start_date) {
                        fieldErrors.push(`Start Date: ${Array.isArray(errorData.start_date) ? errorData.start_date[0] : errorData.start_date}`);
                    }
                    if (errorData.end_date) {
                        fieldErrors.push(`End Date: ${Array.isArray(errorData.end_date) ? errorData.end_date[0] : errorData.end_date}`);
                    }
                    if (errorData.title) {
                        fieldErrors.push(`Title: ${Array.isArray(errorData.title) ? errorData.title[0] : errorData.title}`);
                    }
                    errorMessage = fieldErrors.join('\n');
                } else {
                    errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
                }
            }

            setError(errorMessage);
            setCurrentStep(2); // Go back to recipe selection
            setProcessingStep(0);
            console.error('Meal plan creation error:', err);
        }
    };

    const handleClose = (e) => {
        // Prevent any default behavior and stop propagation
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Signal that we're in a modal interaction
        window.dispatchEvent(new CustomEvent('modalInteractionStart'));

        // Clean up form state
        reset();
        setMessage('');
        setError('');
        setCurrentStep(1);
        setCreatedMealPlan(null);
        setSelectedRecipes([]);
        setSearchQuery('');
        setProcessingStep(0);

        // Close the dialog with a small delay to ensure our event handling is complete
        setTimeout(() => {
            onClose();
            window.dispatchEvent(new CustomEvent('modalInteractionEnd'));
        }, 50);
    };

    // Handle recipe selection
    const handleRecipeToggle = (recipe) => {
        setSelectedRecipes(prev => {
            const isSelected = prev.find(r => r.id === recipe.id);
            if (isSelected) {
                return prev.filter(r => r.id !== recipe.id);
            } else {
                return [...prev, recipe];
            }
        });
    };

    // Go back to previous step
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError('');
        }
    };

    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return '';
        return new Date(date).toISOString().split('T')[0];
    };

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                },
            }}
        >
            <StyledDialogTitle>
                <Box display="flex" alignItems="center" gap={2} >
                    {currentStep === 1 ? (
                        <>
                            <CalendarMonth sx={{ color: '#ff8c00', fontSize: 28 }} />
                            <Box>
                                <Typography variant="h5" sx={{ color: '#ff8c00', fontWeight: 700 }}>
                                    Create Meal Plan
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Step 1 of 2: Plan Details
                                </Typography>
                            </Box>
                        </>
                    ) : currentStep === 2 ? (
                        <>
                            <Restaurant sx={{ color: '#ff8c00', fontSize: 28 }} />
                            <Box>
                                <Typography variant="h5" sx={{ color: '#ff8c00', fontWeight: 700 }}>
                                    Select Recipes
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Step 2 of 2: Choose recipes for your meal plan
                                </Typography>
                            </Box>
                        </>
                    ) : (
                        <>
                            <CircularProgress sx={{ color: '#ff8c00' }} size={28} />
                            <Box>
                                <Typography variant="h5" sx={{ color: '#ff8c00', fontWeight: 700 }}>
                                    Creating Meal Plan
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Please wait while we set up your meal plan...
                                </Typography>
                            </Box>
                        </>
                    )}
                </Box>
                <IconButton
                    onClick={handleClose}
                    disabled={currentStep === 3}
                    sx={{
                        color: '#ff8c00',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 140, 0, 0.1)',
                        },
                        '&:disabled': {
                            color: '#ccc',
                        },
                    }}
                >
                    <Close />
                </IconButton>
            </StyledDialogTitle>

            <StyledDialogContent>
                {currentStep === 1 ? (
                    // Step 1: Create Meal Plan Form
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
                        <Stack spacing={3}>
                            {/* Alert Messages */}
                            {message && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiAlert-icon': {
                                            color: '#ff8c00',
                                        },
                                    }}
                                >
                                    {message}
                                </Alert>
                            )}

                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* Meal Plan Title */}
                            <StyledTextField
                                {...register('title')}
                                label="Meal Plan Title"
                                placeholder="Enter a descriptive meal plan title..."
                                fullWidth
                                error={!!errors.title}
                                helperText={errors.title?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Title sx={{ color: '#ff8c00' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiFormHelperText-root': {
                                        marginLeft: 0,
                                    },
                                }}
                            />

                            {/* Start Date */}
                            <StyledTextField
                                {...register('start_date')}
                                label="Start Date"
                                type="date"
                                fullWidth
                                error={!!errors.start_date}
                                helperText={errors.start_date?.message}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: getTodayDate(),
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRange sx={{ color: '#ff8c00' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiFormHelperText-root': {
                                        marginLeft: 0,
                                    },
                                }}
                            />

                            {/* End Date */}
                            <StyledTextField
                                {...register('end_date')}
                                label="End Date"
                                type="date"
                                fullWidth
                                error={!!errors.end_date}
                                helperText={errors.end_date?.message}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                inputProps={{
                                    min: watchedStartDate || getTodayDate(),
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DateRange sx={{ color: '#ff8c00' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiFormHelperText-root': {
                                        marginLeft: 0,
                                    },
                                }}
                            />

                            <Box sx={{ pt: 2 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#666',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                    }}
                                >
                                    Next, you'll be able to select recipes for your meal plan
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                ) : currentStep === 2 ? (
                    // Step 2: Add Recipes
                    <Box sx={{ mt: 2 }}>
                        <Stack spacing={3}>
                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* Selected Recipes Section */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#4caf50',
                                        fontWeight: 600,
                                        mb: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    Selected Recipes
                                    {selectedRecipes.length > 0 && (
                                        <Chip
                                            label={selectedRecipes.length}
                                            size="small"
                                            sx={{
                                                backgroundColor: '#4caf50',
                                                color: 'white',
                                                fontWeight: 600,
                                                minWidth: 24,
                                                height: 24,
                                            }}
                                        />
                                    )}
                                </Typography>

                                {selectedRecipes.length > 0 ? (
                                    <Box sx={{
                                        maxHeight: 180,
                                        overflowY: 'auto',
                                        borderRadius: 2,
                                        border: '2px solid #4caf50',
                                        backgroundColor: 'rgba(76, 175, 80, 0.02)',
                                        boxShadow: '0 1px 3px rgba(76, 175, 80, 0.2)',
                                        mb: 3,
                                    }}>
                                        {selectedRecipes.map((recipe, index) => (
                                            <Box
                                                key={recipe.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    p: 2,
                                                    borderBottom: index < selectedRecipes.length - 1 ? '1px solid rgba(76, 175, 80, 0.1)' : 'none',
                                                    backgroundColor: 'rgba(76, 175, 80, 0.06)',
                                                }}
                                            >
                                                {/* Recipe Image */}
                                                <Box
                                                    sx={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        mr: 2,
                                                        flexShrink: 0,
                                                        backgroundColor: '#f8f8f8',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    {recipe.image_url ? (
                                                        <Box
                                                            component="img"
                                                            src={recipe.image_url}
                                                            alt={recipe.title}
                                                            sx={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Restaurant sx={{ fontSize: 20, color: '#ccc' }} />
                                                    )}
                                                </Box>

                                                {/* Recipe Info */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#2c2c2c',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {recipe.title}
                                                    </Typography>
                                                </Box>

                                                {/* Remove Button */}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRecipeToggle(recipe)}
                                                    sx={{
                                                        color: '#4caf50',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                        },
                                                    }}
                                                >
                                                    <Close sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            border: '2px dashed #ddd',
                                            borderRadius: 2,
                                            backgroundColor: '#fafafa',
                                            p: 3,
                                            textAlign: 'center',
                                            mb: 3,
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#999',
                                                fontStyle: 'italic',
                                            }}
                                        >
                                            Please select at least one recipe from the available recipes below.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Available Recipes Section */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: '#ff8c00',
                                        fontWeight: 600,
                                        mb: 2,
                                    }}
                                >
                                    Available Recipes
                                </Typography>

                                {/* Search Bar */}
                                <TextField
                                    fullWidth
                                    placeholder="Search recipes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: 'white',
                                            '&:hover fieldset': {
                                                borderColor: '#ff8c00',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#ff8c00',
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ color: '#ff8c00' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {loadingRecipes ? (
                                    <Box display="flex" justifyContent="center" py={3}>
                                        <CircularProgress sx={{ color: '#ff8c00' }} />
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        maxHeight: 300,
                                        overflowY: 'auto',
                                        borderRadius: 2,
                                        border: '1px solid #e0e0e0',
                                        backgroundColor: 'white',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                    }}>
                                        {recipes
                                            .filter(recipe => !selectedRecipes.find(selected => selected.id === recipe.id))
                                            .filter(recipe =>
                                                recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                            )
                                            .map((recipe, index, filteredRecipes) => (
                                                <Box
                                                    key={recipe.id}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        p: 2.5,
                                                        cursor: 'pointer',
                                                        borderBottom: index < filteredRecipes.length - 1 ? '1px solid #f0f0f0' : 'none',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(76, 175, 80, 0.05)',
                                                        },
                                                        transition: 'background-color 0.2s ease',
                                                    }}
                                                    onClick={() => handleRecipeToggle(recipe)}
                                                >
                                                    {/* Recipe Image */}
                                                    <Box
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            borderRadius: 2,
                                                            overflow: 'hidden',
                                                            mr: 3,
                                                            flexShrink: 0,
                                                            backgroundColor: '#f8f8f8',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        {recipe.image_url ? (
                                                            <Box
                                                                component="img"
                                                                src={recipe.image_url}
                                                                alt={recipe.title}
                                                                sx={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                }}
                                                            />
                                                        ) : (
                                                            <Restaurant sx={{ fontSize: 28, color: '#ccc' }} />
                                                        )}
                                                    </Box>

                                                    {/* Recipe Info */}
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: '#2c2c2c',
                                                                mb: 0.5,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                            }}
                                                        >
                                                            {recipe.title}
                                                        </Typography>
                                                        {recipe.description && (
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: '#666',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap',
                                                                    lineHeight: 1.4,
                                                                }}
                                                            >
                                                                {recipe.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            ))}
                                    </Box>
                                )}

                                {!loadingRecipes && recipes
                                    .filter(recipe => !selectedRecipes.find(selected => selected.id === recipe.id))
                                    .filter(recipe =>
                                        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (recipe.description && recipe.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                    ).length === 0 && (
                                        <Box
                                            sx={{
                                                border: '1px solid #e0e0e0',
                                                borderRadius: 2,
                                                backgroundColor: 'white',
                                                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                                                p: 4,
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Restaurant sx={{ fontSize: 48, color: '#ddd', mb: 2 }} />
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: '#666',
                                                    mb: 1,
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {searchQuery ? 'No recipes found' : (recipes.length === 0 ? 'No recipes available' : 'All recipes selected')}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#999',
                                                    fontStyle: 'italic',
                                                }}
                                            >
                                                {searchQuery
                                                    ? `No recipes match "${searchQuery}". Try a different search term.`
                                                    : (recipes.length === 0
                                                        ? 'You can add recipes to your meal plan later from the meal plan details.'
                                                        : 'You have selected all available recipes for this meal plan.'
                                                    )
                                                }
                                            </Typography>
                                        </Box>
                                    )}
                            </Box>
                        </Stack>
                    </Box>
                ) : (
                    // Step 3: Processing
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Stack spacing={4} alignItems="center">
                            {/* Processing Steps */}
                            <Box sx={{ width: '100%', maxWidth: 400 }}>
                                <Typography variant="h6" sx={{ mb: 3, color: '#ff8c00', fontWeight: 600 }}>
                                    Creating Your Meal Plan
                                </Typography>

                                <Stack spacing={2}>
                                    {/* Step 1: Creating Plan */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {processingStep >= 1 ? (
                                            processingStep === 1 ? (
                                                <CircularProgress size={24} sx={{ color: '#ff8c00' }} />
                                            ) : (
                                                <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
                                            )
                                        ) : (
                                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #ddd' }} />
                                        )}
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: processingStep >= 1 ? '#333' : '#999',
                                                fontWeight: processingStep >= 1 ? 600 : 400
                                            }}
                                        >
                                            Creating meal plan...
                                        </Typography>
                                    </Box>

                                    {/* Step 2: Adding Recipes */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {processingStep >= 2 ? (
                                            processingStep === 2 ? (
                                                <CircularProgress size={24} sx={{ color: '#ff8c00' }} />
                                            ) : (
                                                <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
                                            )
                                        ) : (
                                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #ddd' }} />
                                        )}
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: processingStep >= 2 ? '#333' : '#999',
                                                fontWeight: processingStep >= 2 ? 600 : 400
                                            }}
                                        >
                                            Adding {selectedRecipes.length} recipe{selectedRecipes.length === 1 ? '' : 's'}...
                                        </Typography>
                                    </Box>

                                    {/* Step 3: Complete */}
                                    {processingStep === 3 && (
                                        <Box sx={{ mt: 3 }}>
                                            <Alert
                                                severity="success"
                                                sx={{
                                                    borderRadius: 2,
                                                    '& .MuiAlert-icon': {
                                                        color: '#4caf50',
                                                    },
                                                }}
                                            >
                                                Meal plan created successfully! The modal will close automatically.
                                            </Alert>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2, width: '100%' }}>
                                    {error}
                                </Alert>
                            )}
                        </Stack>
                    </Box>
                )}
            </StyledDialogContent>

            <DialogActions sx={{ padding: '16px 24px' }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    {currentStep === 1 ? (
                        // Step 1 buttons
                        <>
                            <ActionButton
                                className="secondary"
                                onClick={handleClose}
                                sx={{ flex: 1 }}
                            >
                                Cancel
                            </ActionButton>
                            <ActionButton
                                className="primary"
                                onClick={handleSubmit(onSubmit)}
                                sx={{ flex: 1 }}
                            >
                                Next: Select Recipes
                            </ActionButton>
                        </>
                    ) : currentStep === 2 ? (
                        // Step 2 buttons
                        <>
                            <ActionButton
                                className="secondary"
                                onClick={handleBack}
                                sx={{ flex: 1 }}
                            >
                                Back
                            </ActionButton>
                            <ActionButton
                                className="primary"
                                onClick={handleFinishWizard}
                                disabled={selectedRecipes.length === 0}
                                sx={{ flex: 1 }}
                            >
                                Finish & Create Plan
                            </ActionButton>
                        </>
                    ) : (
                        // Step 3 - Processing (no buttons)
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                                Please wait while we create your meal plan...
                            </Typography>
                        </Box>
                    )}
                </Stack>
            </DialogActions>
        </StyledDialog>
    );
};

export default AddMealPlan;
