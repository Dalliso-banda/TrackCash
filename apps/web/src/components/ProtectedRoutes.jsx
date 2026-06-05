import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show a clean loading spinner while verifying local storage sessions
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#fbf7f4' }}>
        <CircularProgress sx={{ color: '#D74205' }} />
      </Box>
    );
  }

  // Redirect to onboarding page if the user is unauthenticated
  if (!user) {
    return <Navigate to="/landing-page" replace />;
  }

  return children;
}
