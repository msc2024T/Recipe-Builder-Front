import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import http_service from '../../utils/http_service';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Avatar,
    Alert,
    CircularProgress,
    Stack,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { PersonAdd, Email, Lock, Person } from '@mui/icons-material';
import logo from '../../assets/images/logo.png';

// Styled components
const SignupContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg,rgb(238, 193, 70) 0%,rgb(238, 146, 65) 50%,rgb(207, 126, 33) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
}));

const SignupPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: 24,
    boxShadow: '0 12px 32px rgba(183, 104, 36, 0.3)',
    background: 'white',
    border: '2px solid rgba(255, 140, 0, 0.1)',
    maxWidth: 500,
    width: '100%',
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

const SubmitButton = styled(Button)(({ theme }) => ({
    padding: '12px 24px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: '0 4px 12px rgba(183, 104, 36, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(183, 104, 36, 0.5)',
    },
    '&:disabled': {
        background: '#ccc',
        transform: 'none',
        boxShadow: 'none',
    },
}));

// Validation schema
const schema = yup.object().shape({
    first_name: yup
        .string()
        .min(2, 'First name must be at least 2 characters')
        .required('First name is required'),
    last_name: yup
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .required('Last name is required'),
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .required('Password is required'),
});

const Signup = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await http_service.post('/users/signup/', {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: data.password
            });

            setMessage('Account created successfully!');
            reset(); // Reset form using react-hook-form

            console.log('Signup successful:', response.data);

            // Redirect to login page after successful signup
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Signup failed. Please try again.';
            setError(errorMessage);
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SignupContainer>
            <Container maxWidth="sm">
                <SignupPaper elevation={8}>
                    <Stack spacing={3} alignItems="center">
                        <img
                            src={logo}
                            alt="Recipe Builder"
                            style={{ width: 'auto', height: 45 }}
                        />
                        <Box textAlign="center">
                            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: '#ff8c00', mb: 1 }}>
                                Create Account
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#666' }}>
                                Join Recipe Builder today
                            </Typography>
                        </Box>

                        <Divider sx={{ width: '100%', borderColor: 'rgba(255, 140, 0, 0.2)' }} />

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                            <Stack spacing={3}>
                                <StyledTextField
                                    fullWidth
                                    label="First Name"
                                    type="text"
                                    {...register('first_name')}
                                    error={!!errors.first_name}
                                    helperText={errors.first_name?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: <Person sx={{ color: '#ff8c00', mr: 1 }} />,
                                    }}
                                />

                                <StyledTextField
                                    fullWidth
                                    label="Last Name"
                                    type="text"
                                    {...register('last_name')}
                                    error={!!errors.last_name}
                                    helperText={errors.last_name?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: <Person sx={{ color: '#ff8c00', mr: 1 }} />,
                                    }}
                                />

                                <StyledTextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: <Email sx={{ color: '#ff8c00', mr: 1 }} />,
                                    }}
                                />

                                <StyledTextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: <Lock sx={{ color: '#ff8c00', mr: 1 }} />,
                                    }}
                                />

                                {error && (
                                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                {message && (
                                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                                        {message}
                                    </Alert>
                                )}

                                <SubmitButton
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </SubmitButton>
                            </Stack>
                        </Box>

                        <Divider sx={{ width: '100%', borderColor: 'rgba(255, 140, 0, 0.2)' }} />

                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: '#ff8c00',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Login here
                            </Link>
                        </Typography>
                    </Stack>
                </SignupPaper>
            </Container>
        </SignupContainer>
    );
};

export default Signup;