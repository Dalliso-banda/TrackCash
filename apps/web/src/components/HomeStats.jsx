import React, { useEffect, useState } from 'react';
import { Grid, Paper, Box, Typography, Avatar, Skeleton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import client from '../api/client';

export default function DashboardCards() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/dashboard')
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cardsData = data ? [
    {
      title:    `Income (${new Date().toLocaleString('default', { month: 'long' })})`,
      value:    `K ${data.income.total.toLocaleString()}`,
      subText:  data.income.goal ? `Goal: K ${data.income.goal.toLocaleString()}` : 'No goal set',
      subColor: '#2e7d32',
      icon:     <ArrowDownwardIcon sx={{ color: '#00796b', fontSize: '1.2rem' }} />,
      iconBg:   '#e0f2f1',
    },
    {
      title:    `Expenses (${new Date().toLocaleString('default', { month: 'long' })})`,
      value:    `K ${data.expenses.total.toLocaleString()}`,
      subText:  `Available: K ${data.available_cash.toLocaleString()}`,
      subColor: '#c62828',
      icon:     <ArrowUpwardIcon sx={{ color: '#c62828', fontSize: '1.2rem' }} />,
      iconBg:   '#ffebee',
    },
    {
      title:    'Saved this month',
      value:    `K ${data.total_saved.toLocaleString()}`,
      subText:  'Across all goals',
      subColor: '#7b1fa2',
      icon:     <AccountBalanceWalletIcon sx={{ color: '#7b1fa2', fontSize: '1.2rem' }} />,
      iconBg:   '#f3e5f5',
    },
    {
      title:    'Top spend',
      value:    data.expenses.top_category
                  ? data.expenses.top_category.category.charAt(0).toUpperCase() + data.expenses.top_category.category.slice(1)
                  : '—',
      subText:  data.expenses.top_category
                  ? `K ${Number(data.expenses.top_category.total).toLocaleString()} this month`
                  : 'No expenses yet',
      subColor: '#b57c1e',
      icon:     <PieChartIcon sx={{ color: '#b57c1e', fontSize: '1.2rem' }} />,
      iconBg:   '#fff8e1',
    },
  ] : [];

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.default', p: 2 }}>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={6} key={i}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: '20px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: '10px', mb: 1 }} />
                <Skeleton width="70%" height={16} />
                <Skeleton width="50%" height={28} />
                <Skeleton width="60%" height={14} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', p: 2 }}>
      <Grid container spacing={2}>
        {cardsData.map((card, index) => (
          <Grid size={6} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '20px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Avatar variant="rounded" sx={{ bgcolor: card.iconBg, width: 36, height: 36, borderRadius: '10px' }}>
                {card.icon}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {card.title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', my: 0.2 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" sx={{ color: card.subColor, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  {card.subText}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}