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
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Login as LoginIcon, Email, Lock } from '@mui/icons-material';
import logo from '../../assets/images/logo.png';

// Styled components
const LoginContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg,rgb(238, 193, 70) 0%,rgb(238, 146, 65) 50%,rgb(207, 126, 33) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
}));

const LoginPaper = styled(Paper)(({ theme }) => ({
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
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters long')
        .required('Password is required'),
    is_remembered: yup.boolean().default(false),
});

const Login = () => {
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
            const response = await http_service.post('/users/login/', {
                email: data.email,
                password: data.password,
                is_remembered: data.is_remembered || false,
            });

            // setMessage('Login successful!');

            // Store tokens if provided
            if (response.data.data.access) {
                localStorage.setItem('authToken', response.data.data.access);
            }

            if (response.data.data.refresh) {
                localStorage.setItem('refreshToken', response.data.data.refresh);
            }

            // Store user data if provided
            if (response.data.data.user) {
                localStorage.setItem('userData', JSON.stringify(response.data.data.user));
            }

            console.log('Login successful:', response.data);

            // Redirect to dashboard 
            navigate('/dashboard');


        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Login failed. Please try again.';
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginContainer>
            <Container maxWidth="sm">
                <LoginPaper elevation={8}>
                    <Stack spacing={3} alignItems="center">
                        <img
                            src={logo}
                            alt="Recipe Builder"
                            style={{ width: 'auto', height: 45 }}
                        />
                        <Box textAlign="center">
                            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: '#ff8c00', mb: 1 }}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#666' }}>
                                Sign in to your account
                            </Typography>
                        </Box>

                        <Divider sx={{ width: '100%', borderColor: 'rgba(255, 140, 0, 0.2)' }} />

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
                            <Stack spacing={3}>
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

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            {...register('is_remembered')}
                                            disabled={loading}
                                            sx={{
                                                color: '#ff8c00',
                                                '&.Mui-checked': {
                                                    color: '#ff8c00',
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" sx={{ color: '#666' }}>
                                            Remember me
                                        </Typography>
                                    }
                                    sx={{ alignSelf: 'flex-start' }}
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
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </SubmitButton>
                            </Stack>
                        </Box>

                        <Divider sx={{ width: '100%', borderColor: 'rgba(255, 140, 0, 0.2)' }} />

                        <Typography variant="body2" sx={{ color: '#666' }}>
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                style={{
                                    color: '#ff8c00',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Sign up here
                            </Link>
                        </Typography>
                    </Stack>
                </LoginPaper>
            </Container>
        </LoginContainer>
    );
};

export default Login;
