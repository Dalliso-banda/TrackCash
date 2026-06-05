import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, Button, Link, Paper, Alert } from '@mui/material';
import BrandedHeader from '../components/BrandedHeader';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setErrorMsg(''); 
    try {
      const res = await loginUser(data);
      
      localStorage.setItem('access_token', res.data.data.access_token);
      localStorage.setItem('refresh_token', res.data.data.refresh_token);

      login(data.email, data.password); 
      
      navigate('/');
    } catch (err) {
      console.error("Full Axios Error Object:", err);

      let message = 'Login failed. Please try again.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          message = err.response.data; 
        } else if (err.response.data.message) {
          message = err.response.data.message; 
        }
      } else if (err.message) {
        message = err.message; 
      }

      setErrorMsg(message);
    }
  };

  return (
    <Box 
      sx={{ 
        // Swapped out #fbf7f4 raw code for reactive background tokens
        bgcolor: 'background.default', 
        minHeight: '100vh',
        animation: 'fadeInUp 0.4s ease-out',
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(15px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }}
    >
      <BrandedHeader title="Welcome back" />

      {/* Floating Entry Card Form Area */}
      <Box sx={{ px: 2, mt: 8 }}>
        <Paper 
          elevation={0} 
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ 
            p: 3, 
            borderRadius: '24px', 
            border: '1px solid',
            // Swapped out #ffffff for adaptive theme canvas paper mapping
            bgcolor: 'background.paper',
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
            Enter your credentials to access your cash tracker
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ borderRadius: '14px', mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          {/* Email Input Field */}
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            margin="normal"
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' } }}
          />

          {/* Password Input Field */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '14px' }, mb: 4 }}
          />

          {/* Submit Call-to-Action Action Trigger Button */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              // Swapped out hardcoded orange string for primary system palette keys
              bgcolor: 'primary.main',
              color: '#ffffff', // Kept white text for standard contrast readability
              borderRadius: '20px',
              py: 1.8,
              fontWeight: 'bold',
              fontSize: '1.1rem',
              textTransform: 'none',
              mb: 2,
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            Sign in
          </Button>

          {/* Context Switching Footnote Redirect Anchor Link */}
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', textAlign: 'center', mt: 1 }}>
            New to TrackCash?{' '}
            <Link 
              component={RouterLink} 
              to="/signup" 
              underline="none" 
              sx={{ color: 'primary.main', fontWeight: 'bold' }}
            >
              Create account
            </Link>
          </Typography>

        </Paper>
      </Box>
    </Box>
  );
}
