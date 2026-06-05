import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Avatar, Skeleton } from '@mui/material';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SavingsIcon from '@mui/icons-material/Savings';
import client from '../api/client';

const CATEGORY_MAP = {
  food:          { icon: <FastfoodIcon sx={{ fontSize: '1.25rem', color: '#D74205' }} />, iconBg: '#ffebee' },
  transport:     { icon: <DirectionsBusIcon sx={{ fontSize: '1.25rem', color: '#1565c0' }} />, iconBg: '#e3f2fd' },
  home:          { icon: <HomeIcon sx={{ fontSize: '1.25rem', color: '#2e7d32' }} />, iconBg: '#e8f5e9' },
  phone:         { icon: <PhoneAndroidIcon sx={{ fontSize: '1.25rem', color: '#6a1b9a' }} />, iconBg: '#f3e5f5' },
  savings:       { icon: <SavingsIcon sx={{ fontSize: '1.25rem', color: '#00796b' }} />, iconBg: '#e0f2f1' },
  miscellaneous: { icon: <MoreHorizIcon sx={{ fontSize: '1.25rem', color: '#b57c1e' }} />, iconBg: '#fff8e1' },
};

const formatTime = (dateStr) => {
  const date      = new Date(dateStr);
  const now       = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString())
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  if (date.toDateString() === yesterday.toDateString())
    return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function RecentExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    client.get('/expenses', { params: { page: 1, limit: 5 } })
      .then((res) => setExpenses(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', px: 2, pb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1.5, fontSize: '1.1rem' }}>
        Recent expenses
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>

        {/* Skeletons */}
        {loading && [1, 2, 3].map((i) => (
          <Paper key={i} elevation={0} sx={{
            p: 1.5, borderRadius: '20px',
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '14px' }} />
              <Box>
                <Skeleton width={100} height={18} />
                <Skeleton width={60} height={14} />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Skeleton width={50} height={18} />
              <Skeleton width={70} height={14} />
            </Box>
          </Paper>
        ))}

        {/* Empty state */}
        {!loading && expenses.length === 0 && (
          <Paper elevation={0} sx={{
            p: 3, borderRadius: '20px', textAlign: 'center',
            bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
          }}>
            <ShoppingCartIcon sx={{ fontSize: '2rem', color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No expenses recorded yet
            </Typography>
          </Paper>
        )}

        {/* Expense rows */}
        {!loading && expenses.map((item) => {
          const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.miscellaneous;
          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                p: 1.5, borderRadius: '20px',
                bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar variant="rounded" sx={{ bgcolor: cat.iconBg, width: 44, height: 44, borderRadius: '14px' }}>
                  {cat.icon}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
                    {item.note || item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main', lineHeight: 1.2 }}>
                  - K {Number(item.amount).toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.2 }}>
                  {formatTime(item.recorded_at)}
                </Typography>
              </Box>
            </Paper>
          );
        })}

      </Box>
    </Box>
  );
}