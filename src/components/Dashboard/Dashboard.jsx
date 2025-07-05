import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RecipeList from '../Recipes/RecipeList';
import IngredientList from '../Ingredients/IngredientList';
import MealPlanList from '../MealPlans/MealPlanList';
import {
    Box,
    Container,
    Typography,
    AppBar,
    Toolbar,
    Avatar,
    Chip,
    Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    Restaurant,
    Kitchen,
    CalendarMonth,
    Logout
} from '@mui/icons-material';
import logo from '../../assets/images/logo-icon.png';

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    background: '#efefef',
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

const TabContainer = styled(Box)(({ theme }) => ({
    background: '#efefef',
    padding: theme.spacing(3, 0),
    borderBottom: '2px solid rgba(255, 140, 0, 0.1)',
}));

const TabButtonGroup = styled(Stack)(({ theme }) => ({
    background: 'rgba(255, 140, 0, 0.08)',
    padding: theme.spacing(1),
    borderRadius: '16px',
    gap: theme.spacing(1),
    border: '2px solid rgba(255, 140, 0, 0.15)',
    boxShadow: '0 4px 12px rgba(183, 104, 36, 0.15)',
}));

const TabButton = styled(Box)(({ theme, active }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 3),
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '1rem',
    textTransform: 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '56px',
    ...(active ? {
        background: 'linear-gradient(135deg, #ff8c00 0%, #d67200 100%)',
        color: 'white',
        boxShadow: '0 6px 20px rgba(183, 104, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        transform: 'translateY(-2px)',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            animation: 'shimmer 2s infinite',
        },
    } : {
        background: 'rgba(255, 255, 255, 0.9)',
        color: '#666',
        border: '1px solid rgba(255, 140, 0, 0.2)',
        '&:hover': {
            background: 'rgba(255, 140, 0, 0.1)',
            color: '#ff8c00',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(183, 104, 36, 0.25)',
            borderColor: '#ff8c00',
        },
    }),
    '@keyframes shimmer': {
        '0%': { left: '-100%' },
        '100%': { left: '100%' },
    },
}));

const LogoutButton = styled('button')(({ theme }) => ({
    background: 'linear-gradient(135deg, #ff8c00 0%, #b76824 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 600,
    boxShadow: '0 2px 4px rgba(183, 104, 36, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #d67200 0%, #a05a1e 100%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(183, 104, 36, 0.5)',
    },
}));

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`dashboard-tabpanel-${index}`}
            aria-labelledby={`dashboard-tab-${index}`}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

const Dashboard = () => {
    const [tabValue, setTabValue] = useState(0);
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');



    const handleLogout = async () => {
        try {
            // Optional: Call logout endpoint if your backend has one
            // await http_service.post('/users/logout/');

            // Clear local storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');

            // Navigate to login
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout API fails, clear local storage and redirect
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            navigate('/login');
        }
    };

    const handleTabChange = (newValue) => {
        setTabValue(newValue);
    };

    const tabs = [
        { icon: <Restaurant />, label: 'Recipes', value: 0 },
        { icon: <Kitchen />, label: 'Ingredients', value: 1 },
        { icon: <CalendarMonth />, label: 'Meal Plans', value: 2 },
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
                        <LogoutButton onClick={handleLogout}>
                            <Logout sx={{ fontSize: '1rem' }} />
                            Logout
                        </LogoutButton>
                    </Stack>
                </Toolbar>
            </StyledAppBar>

            <TabContainer>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="center">
                        <TabButtonGroup direction="row">
                            {tabs.map((tab) => (
                                <TabButton
                                    key={tab.value}
                                    active={tabValue === tab.value}
                                    onClick={() => handleTabChange(tab.value)}
                                >
                                    {tab.icon}
                                    <Typography variant="body1" sx={{ fontWeight: 'inherit' }}>
                                        {tab.label}
                                    </Typography>
                                </TabButton>
                            ))}
                        </TabButtonGroup>
                    </Stack>
                </Container>
            </TabContainer>

            <TabPanel value={tabValue} index={0}>
                <RecipeList />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <IngredientList />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <MealPlanList />
            </TabPanel>
        </DashboardContainer>
    );
};

export default Dashboard;
