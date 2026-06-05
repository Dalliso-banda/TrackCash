import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, InputBase, Grid, ButtonBase, Button, Alert } from '@mui/material';
import BrandedHeader from '../components/BrandedHeader';
import client from '../api/client';

import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';

export default function RecordExpense() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'food',          label: 'Food',      icon: <RestaurantIcon /> },
    { id: 'home',          label: 'Home',       icon: <HomeIcon /> },
    { id: 'phone',         label: 'Phone',      icon: <PhoneAndroidIcon /> },
    { id: 'transport',     label: 'Transport',  icon: <DirectionsBusIcon /> },
    { id: 'savings',       label: 'Savings',    icon: <AccountBalanceWalletIcon /> },
    { id: 'miscellaneous', label: 'Misc',       icon: <MoreHorizIcon /> },
  ];

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { amount: '0.00', category: 'food', note: '' }
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await client.post('/expenses', {
        amount: parseFloat(data.amount),
        category: data.category,
        note: data.note || undefined,
        recorded_at: new Date().toISOString(),
      });
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to log expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
      <BrandedHeader title="Record expense" />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2, mt: 8 ,p:4}}>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>{errorMsg}</Alert>
        )}

        {/* Amount */}
        <Box sx={{ mt: -4, mb: 3 }}>
          <Paper elevation={0} sx={{
            p: 3, borderRadius: '24px', textAlign: 'center',
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              How much did you spend?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold', mr: 0.5 }}>K</Typography>
              <Controller
                name="amount"
                control={control}
                rules={{ required: true, validate: (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 }}
                render={({ field }) => (
                  <InputBase
                    {...field}
                    inputProps={{ inputMode: 'decimal' }}
                    sx={{ fontSize: '2.8rem', fontWeight: 'bold', width: 'auto', color: 'text.primary' }}
                  />
                )}
              />
            </Box>
            {errors.amount && (
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                Enter a valid amount
              </Typography>
            )}
          </Paper>
        </Box>

        {/* Category */}
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1.5 }}>
          Category
        </Typography>
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
             <Grid size={4} key={cat.id}>
                <ButtonBase
                  type="button"
                  onClick={() => setValue('category', cat.id)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: isSelected ? 'primary.main' : 'background.paper',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    color: isSelected ? '#ffffff' : 'text.secondary',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.icon}
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {cat.label}
                  </Typography>
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>

        {/* Note */}
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1.5 }}>
          Note
        </Typography>
        <Paper elevation={0} sx={{
          p: 1.8, borderRadius: '16px', mb: 4,
          bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <EditIcon sx={{ color: 'text.disabled', fontSize: '1.2rem' }} />
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <InputBase
                {...field}
                placeholder='Add a note (e.g. "Ice cream at Manda Hill")'
                fullWidth
                sx={{ fontSize: '0.95rem', color: 'text.primary' }}
              />
            )}
          />
        </Paper>

        <Button
          fullWidth type="submit" variant="contained"
          disabled={isSubmitting} disableElevation
          sx={{
            borderRadius: '20px', py: 1.8,
            fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'none',
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save expense'}
        </Button>

      </Box>
    </Box>
  );
}