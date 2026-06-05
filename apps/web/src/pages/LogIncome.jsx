import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, InputBase, Grid, ButtonBase, Button, Alert } from '@mui/material';
import BrandedHeader from '../components/BrandedHeader';
import client from '../api/client';

import HandymanIcon from '@mui/icons-material/Handyman';
import WorkIcon from '@mui/icons-material/Work';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import EditIcon from '@mui/icons-material/Edit';

const INCOME_TYPES = [
  { id: 'daily_wage',  label: 'Daily wage',   icon: <HandymanIcon /> },
  { id: 'contract',    label: 'Contract job',  icon: <WorkIcon /> },
  { id: 'side_hustle', label: 'Side hustle',   icon: <ShoppingBagIcon /> },
  { id: 'gift',        label: 'Gift / other',  icon: <CardGiftcardIcon /> },
];

export default function LogIncome() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: { amount: '0.00', type: 'daily_wage', expected_amount: '', note: '' }
  });

  const selectedType = watch('type');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await client.post('/income', {
        amount:          parseFloat(data.amount),
        type:            data.type,
        expected_amount: data.expected_amount ? parseFloat(data.expected_amount) : undefined,
        note:            data.note || undefined,
        recorded_at:     new Date().toISOString(),
      });
      navigate('/');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to log income.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
      <BrandedHeader title="Record income" />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2 ,p:4 ,mt:8 }}>

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
              Amount received
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
              <Typography variant="h4" sx={{ color: '#00a572', fontWeight: 'bold', mr: 0.5 }}>K</Typography>
              <Controller
                name="amount"
                control={control}
                rules={{ required: true, validate: (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0 }}
                render={({ field }) => (
                  <InputBase
                    {...field}
                    inputProps={{ inputMode: 'decimal' }}
                    sx={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#00a572', width: 'auto' }}
                  />
                )}
              />
            </Box>
          </Paper>
        </Box>

        {/* Income type */}
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1.5 }}>
          Income type
        </Typography>
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {INCOME_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <Grid size={6} key={type.id}>
                <ButtonBase
                  type="button"
                  onClick={() => setValue('type', type.id)}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: isSelected ? '#00a572' : 'background.paper',
                    border: '1px solid',
                    borderColor: isSelected ? '#00a572' : 'divider',
                    color: isSelected ? '#ffffff' : 'text.secondary',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {type.icon}
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{type.label}</Typography>
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>

        {/* Expected amount */}
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1.5 }}>
          Expected today (optional)
        </Typography>
        <Paper elevation={0} sx={{
          p: 1.8, borderRadius: '16px', mb: 3,
          bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <TrackChangesIcon sx={{ color: 'text.disabled', fontSize: '1.3rem' }} />
          <Typography variant="body1" sx={{ fontWeight: 500, mr: 0.5, color: 'text.primary' }}>K</Typography>
          <Controller
            name="expected_amount"
            control={control}
            render={({ field }) => (
              <InputBase
                {...field}
                fullWidth
                placeholder="0.00"
                inputProps={{ inputMode: 'decimal' }}
                sx={{ fontSize: '0.95rem', fontWeight: 500, color: 'text.primary' }}
              />
            )}
          />
        </Paper>

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
                placeholder='e.g. "Construction job, Kabulonga"'
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
            bgcolor: '#00a572', color: '#ffffff',
            borderRadius: '20px', py: 1.8,
            fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'none',
            '&:hover': { bgcolor: '#00875c' },
          }}
        >
          {isSubmitting ? 'Saving...' : 'Save income'}
        </Button>

      </Box>
    </Box>
  );
}