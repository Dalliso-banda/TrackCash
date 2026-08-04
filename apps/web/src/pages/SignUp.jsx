import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, Button, Link, Paper, Alert } from '@mui/material';
import BrandedHeader from '../components/BrandedHeader';
import { registerUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
export default function SignUp() {
     const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      const res = await registerUser({
        name:     data.name,
        email:    data.email,
        password: data.password,
      });
      localStorage.setItem('access_token',  res.data.data.access_token);
      localStorage.setItem('refresh_token', res.data.data.refresh_token);
      login(data.email, data.password); 
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '14px' } };

  return (
    <Box sx={{
      bgcolor: 'background.default',
      minHeight: '100vh',
      animation: 'slideInRight 0.4s ease-out',
      '@keyframes slideInRight': {
        '0%':   { opacity: 0, transform: 'translateX(20px)' },
        '100%': { opacity: 1, transform: 'translateX(0)' },
      },
    }}>
      <BrandedHeader title="Create account" />

      <Box sx={{ px: 2, mt: 8, pb: 4 }}>
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            p: 3, borderRadius: '24px',
            bgcolor: 'background.paper',
            border: '1px solid', borderColor: 'divider',
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
            Join TrackCash to monitor goals and manage everyday expenses
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {serverError}
            </Alert>
          )}

          <TextField
            fullWidth label="Full Name" variant="outlined" margin="dense"
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name} helperText={errors.name?.message}
            sx={fieldSx}
          />

          <TextField
            fullWidth label="Email Address" variant="outlined" margin="dense"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
            })}
            error={!!errors.email} helperText={errors.email?.message}
            sx={fieldSx}
          />

          <TextField
            fullWidth label="Password" type="password" variant="outlined" margin="dense"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
            error={!!errors.password} helperText={errors.password?.message}
            sx={fieldSx}
          />

          <TextField
            fullWidth label="Confirm Password" type="password" variant="outlined" margin="dense"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === passwordValue || 'Passwords do not match',
            })}
            error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message}
            sx={{ ...fieldSx, mb: 3 }}
          />

          <Button
            fullWidth type="submit" variant="contained"
            disabled={isSubmitting} disableElevation
            sx={{
              borderRadius: '20px', py: 1.8,
              fontWeight: 'bold', fontSize: '1.1rem',
              textTransform: 'none', mb: 2,
            }}
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </Button>

          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', textAlign: 'center', mt: 1 }}>
            Already tracking cash?{' '}
            <Link
              component={RouterLink} to="/login" underline="none"
              sx={{ color: 'primary.main', fontWeight: 'bold' }}
            >
              Sign in
            </Link>
          </Typography>

        </Paper>
      </Box>
    </Box>
  );
}