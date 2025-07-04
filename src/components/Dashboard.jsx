import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    CardActions,
    Grid,
    AppBar,
    Toolbar,
    Avatar,
    IconButton,
    Chip,
    Paper,
    Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Restaurant,
    Add,
    Favorite,
    ShoppingCart,
    Logout
} from '@mui/icons-material';
import logo from '../assets/images/logo-icon.png';

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: 'linear-gradient(135deg,rgb(238, 193, 70) 0%,rgb(238, 146, 65) 50%,rgb(207, 126, 33) 100%)',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: 'white',
    color: '#ff8c00',
    boxShadow: '0 4px 8px rgba(183, 104, 36, 0.2)',
    borderBottom: '3px solid #ff8c00',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

const StyledCard = styled(Card)(({ theme }) => ({
    background: 'white',
    borderRadius: '20px 20px 8px 8px',
    border: '1px solid #e0e0e0',
    borderBottom: '4px solid #ff8c00',
    boxShadow: '0 2px 8px rgba(183, 104, 36, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
    textAlign: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    overflow: 'hidden',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #ff8c00 0%, #ffa500 50%, #ff8c00 100%)',
        transform: 'scaleX(0)',
        transition: 'transform 0.3s ease',
    },
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '-1px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '6px',
        background: 'linear-gradient(90deg, #ff8c00, #ffa500, #ff8c00)',
        borderRadius: '0 0 8px 8px',
        opacity: 0,
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(255, 140, 0, 0.4)',
    },
    '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 12px 32px rgba(183, 104, 36, 0.25), 0 4px 16px rgba(0, 0, 0, 0.1)',
        borderBottomColor: '#d67200',
        borderColor: '#ff8c00',
        '&::before': {
            transform: 'scaleX(1)',
        },
        '&::after': {
            opacity: 1,
            transform: 'translateX(-50%) translateY(2px)',
        },
    },
    '&:active': {
        transform: 'translateY(-4px) scale(1.01)',
        transition: 'all 0.1s ease',
    },
}));

const CardHeader = styled(CardContent)(({ theme }) => ({
    padding: '1.5rem 1.5rem 1rem',
    background: 'linear-gradient(135deg, rgba(255, 140, 0, 0.03) 0%, rgba(255, 245, 230, 0.5) 100%)',
    borderBottom: '1px solid rgba(255, 140, 0, 0.1)',
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '40px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #ff8c00, transparent)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
    },
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
    flex: 1,
    padding: '1rem 1.5rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
}));

const TabButton = styled(Button)(({ theme }) => ({
    marginTop: 'auto',
    padding: '0.875rem 2rem',
    background: 'linear-gradient(135deg, #ff8c00 0%, #d67200 100%)',
    color: 'white',
    borderRadius: '12px',
    fontWeight: 700,
    fontSize: '0.95rem',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
        transition: 'left 0.5s ease',
    },
    '&:hover': {
        background: 'linear-gradient(135deg, #e67600 0%, #c56600 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(183, 104, 36, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)',
        '&::before': {
            left: '100%',
        },
    },
    '&:active': {
        transform: 'translateY(0)',
        boxShadow: '0 4px 12px rgba(183, 104, 36, 0.3), 0 2px 6px rgba(0, 0, 0, 0.1)',
    },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
    color: 'white',
    boxShadow: '0 2px 4px rgba(183, 104, 36, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(183, 104, 36, 0.5)',
    },
}));

const Dashboard = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const dashboardItems = [
        {
            title: 'My Recipes',
            description: 'View and manage your saved recipes',
            icon: <Restaurant sx={{ fontSize: '1.5rem' }} />,
            action: 'View Recipes',
        },
        {
            title: 'Create Recipe',
            description: 'Add a new recipe to your collection',
            icon: <Add sx={{ fontSize: '1.5rem' }} />,
            action: 'Create New',
        },
        {
            title: 'Favorites',
            description: 'Quick access to your favorite recipes',
            icon: <Favorite sx={{ fontSize: '1.5rem' }} />,
            action: 'View Favorites',
        },
        {
            title: 'Shopping List',
            description: 'Generate shopping lists from your recipes',
            icon: <ShoppingCart sx={{ fontSize: '1.5rem' }} />,
            action: 'Create List',
        },
    ];

    return (
        <DashboardContainer>
            <StyledAppBar position="static">
                <Toolbar>
                    <LogoContainer sx={{ flexGrow: 1 }}>
                        <Avatar
                            src={logo}
                            alt="Recipe Builder"
                            sx={{ width: 40, height: 40 }}
                        />
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#ff8c00' }}>
                            Recipe Builder
                        </Typography>
                    </LogoContainer>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                            label={`Welcome, ${userData.first_name || 'User'}!`}
                            variant="outlined"
                            sx={{
                                color: '#666',
                                borderColor: '#ff8c00',
                                fontWeight: 500,
                            }}
                        />
                        <LogoutButton
                            variant="contained"
                            startIcon={<Logout />}
                            onClick={handleLogout}
                        >
                            Logout
                        </LogoutButton>
                    </Stack>
                </Toolbar>
            </StyledAppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper
                    elevation={0}
                    sx={{
                        textAlign: 'center',
                        mb: 4,
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            color: '#8b4513',
                            fontWeight: 700,
                            mb: 1,
                            textShadow: '1px 1px 2px rgba(139, 69, 19, 0.1)',
                        }}
                    >
                        Welcome to Recipe Builder!
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#a0522d',
                            textShadow: '1px 1px 2px rgba(160, 82, 45, 0.1)',
                        }}
                    >
                        Start creating amazing recipes and organize your cooking adventures.
                    </Typography>
                </Paper>

                <Grid container spacing={3}>
                    {dashboardItems.map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <StyledCard>
                                <CardHeader>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={1}>
                                        <Box sx={{ color: '#ff8c00' }}>{item.icon}</Box>
                                        <Typography
                                            variant="h5"
                                            component="h3"
                                            sx={{
                                                color: '#ff8c00',
                                                fontWeight: 700,
                                                textShadow: '0 1px 2px rgba(255, 140, 0, 0.1)',
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                    </Stack>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#7a7a7a',
                                            fontWeight: 500,
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {item.description}
                                    </Typography>
                                </CardHeader>
                                <StyledCardActions>
                                    <TabButton variant="contained" fullWidth>
                                        {item.action}
                                    </TabButton>
                                </StyledCardActions>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </DashboardContainer>
    );
};

export default Dashboard;
