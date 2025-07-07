import React, { useState, useEffect } from 'react';
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
    Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Close,
    CalendarMonth,
    Title,
    Save,
    DateRange,
    Edit
} from '@mui/icons-material';
import http_service from '../../utils/http_service';
import './EditMealPlan.css';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 24,
        maxWidth: 500,
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
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
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

const EditMealPlan = ({ open, onClose, onMealPlanUpdated, mealPlan }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const {
        register,
        formState: { errors },
        reset,
        handleSubmit,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
        mode: 'onChange',
    });

    // Initialize form with meal plan data
    useEffect(() => {
        if (mealPlan && open) {
            setValue('title', mealPlan.title);
            setValue('start_date', mealPlan.start_date);
            setValue('end_date', mealPlan.end_date);
        }
    }, [mealPlan, open, setValue]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            reset();
            setMessage('');
            setError('');
        }
    }, [open, reset]);

    // Handle form submission
    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const formatDate = (dateString) => {
                if (!dateString) return null;
                if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    return dateString;
                }
                const date = new Date(dateString);
                return date.toISOString().split('T')[0];
            };

            const updateData = {
                title: data.title.trim(),
                start_date: formatDate(data.start_date),
                end_date: formatDate(data.end_date),
            };

            console.log('Updating meal plan with payload:', updateData);

            await http_service.put(`/mealplans/meal-plans/${mealPlan.id}/`, updateData);

            setMessage('Meal plan updated successfully!');

            // Call the callback to refresh the data
            if (onMealPlanUpdated) {
                onMealPlanUpdated();
            }

            // Close the modal after a short delay
            setTimeout(() => {
                onClose();
            }, 1500);

        } catch (err) {
            console.error('Error updating meal plan:', err);
            setError('Failed to update meal plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            className="edit-meal-plan-modal"
        >
            <StyledDialogTitle>
                <Box display="flex" alignItems="center">
                    <Edit sx={{ mr: 2, color: '#ff8c00' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#8b4513' }}>
                        Edit Meal Plan
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#666' }}>
                    <Close />
                </IconButton>
            </StyledDialogTitle>

            <StyledDialogContent>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <Typography variant="h6" sx={{ color: '#8b4513', fontWeight: 600, mb: 2 }}>
                            Update Meal Plan Details
                        </Typography>

                        <StyledTextField
                            label="Meal Plan Title"
                            fullWidth
                            {...register('title')}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Title sx={{ color: '#ff8c00' }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <StyledTextField
                                    label="Start Date"
                                    type="date"
                                    fullWidth
                                    {...register('start_date')}
                                    error={!!errors.start_date}
                                    helperText={errors.start_date?.message}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarMonth sx={{ color: '#ff8c00' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <StyledTextField
                                    label="End Date"
                                    type="date"
                                    fullWidth
                                    {...register('end_date')}
                                    error={!!errors.end_date}
                                    helperText={errors.end_date?.message}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <DateRange sx={{ color: '#ff8c00' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </Box>

                {/* Error/Success Messages */}
                {error && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}
                {message && (
                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                        {message}
                    </Alert>
                )}
            </StyledDialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%', justifyContent: 'flex-end' }}>
                    <ActionButton
                        className="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        className="primary"
                        onClick={handleSubmit(onSubmit)}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    >
                        {loading ? 'Updating...' : 'Update Meal Plan'}
                    </ActionButton>
                </Stack>
            </DialogActions>
        </StyledDialog>
    );
};

export default EditMealPlan;
