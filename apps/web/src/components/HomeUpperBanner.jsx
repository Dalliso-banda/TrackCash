import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Skeleton } from '@mui/material';
import client from '../api/client';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

function HomeUpperBanner() {
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/auth/me'),
      client.get('/dashboard'),
    ])
      .then(([userRes, dashRes]) => {
        setUser(userRes.data.data.user);
        setDashboard(dashRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Today's income — sum from recent entries recorded today
  const todayIncome = dashboard?.recent_expenses
    ? null // dashboard doesn't expose today's income directly, so we derive below
    : null;

  const availableCash = dashboard?.available_cash ?? 0;
  const incomeToday = dashboard?.income?.total ?? 0;

  // Format K 1,240.50 → split at decimal
  const [whole, decimal] = Number(availableCash).toFixed(2).split('.');

  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: '#FFFFFF',
        pt: 6,
        pb: 4,
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Top Welcome Row */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body1" sx={{ opacity: 0.8, fontSize: '0.95rem' }}>
            {getGreeting()}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={120} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {user?.name?.split(' ')[0] ?? 'there'} 👋
            </Typography>
          )}
        </Box>

        {loading ? (
          <Skeleton variant="circular" width={44} height={44} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        ) : (
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44, color: '#fff', fontWeight: 'bold' }}>
            {getInitials(user?.name)}
          </Avatar>
        )}
      </Box>

      {/* Available Balance */}
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
          Available cash
        </Typography>

        {loading ? (
          <Skeleton variant="text" width={180} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        ) : (
          <Typography variant="h3" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'baseline' }}>
            K {Number(whole).toLocaleString()}
            <span style={{ fontSize: '1.5rem', marginLeft: '2px' }}>.{decimal}</span>
          </Typography>
        )}

        {loading ? (
          <Skeleton variant="text" width={140} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mt: 0.5 }} />
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5, fontSize: '0.85rem' }}>
            ↑ K {Number(incomeToday).toLocaleString()} income this month
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default HomeUpperBanner;