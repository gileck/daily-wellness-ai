import React from 'react';
import { useAuth } from '@/client/context/AuthContext';
import { LoginForm } from './LoginForm';
import { Modal, Paper, Typography } from '@mui/material';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Hide content while checking authentication status
    if (isLoading) {
        return <></>
    }

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return (
            <Modal open={true}>
                <Paper sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    p: 4
                }}>
                    <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
                        Sign In
                    </Typography>
                    <LoginForm />
                </Paper>
            </Modal>
        );
    }

    // Show app content if authenticated
    return <>{children}</>;
};

export default AuthWrapper; 