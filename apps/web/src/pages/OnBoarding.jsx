import React from 'react';
import { Box, Typography, Paper, Avatar, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import PieChartOutlineOutlinedIcon from '@mui/icons-material/PieChartOutlineOutlined';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const features = [
  {
    title:  'Record every kwacha',
    desc:   'Log income and expenses fast',
    icon:   <EditCalendarOutlinedIcon sx={{ color: '#D4530A' }} />,
    iconBg: '#FFF0EA',
  },
  {
    title:  'See your spending patterns',
    desc:   'Charts that make sense',
    icon:   <PieChartOutlineOutlinedIcon sx={{ color: '#00A572' }} />,
    iconBg: '#E6F6F1',
  },
  {
    title:  'Save towards your goals',
    desc:   'Track progress every day',
    icon:   <TrackChangesIcon sx={{ color: '#6A0DAD' }} />,
    iconBg: '#F3E5F5',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      bgcolor: 'background.default',
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <Box sx={{
        bgcolor: 'primary.main',
        color: '#fff',
        pt: 8, pb: 6, px: 4,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}>
        <Avatar variant="rounded" sx={{
          bgcolor: 'rgba(255,255,255,0.15)',
          width: 64, height: 64, borderRadius: '20px',
        }}>
          <Box sx={{ width: 24, height: 16, border: '2px solid #fff', borderRadius: '4px', position: 'relative' }}>
            <Box sx={{ width: 14, height: 10, bgcolor: '#fff', position: 'absolute', right: -4, top: -4, borderRadius: '2px' }} />
          </Box>
        </Avatar>

        <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: '-0.5px' }}>
          TrackCash
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: '240px', lineHeight: 1.4 }}>
          Know exactly where your money comes and goes
        </Typography>
      </Box>

      {/* Feature cards */}
      <Box sx={{ px: 3, mt: 4, display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
        {features.map((feat, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              p: 2, borderRadius: '20px',
              bgcolor: 'background.paper',
              border: '1px solid', borderColor: 'divider',
              display: 'flex', alignItems: 'center', gap: 2,
            }}
          >
            <Avatar variant="rounded" sx={{ bgcolor: feat.iconBg, width: 48, height: 48, borderRadius: '14px' }}>
              {feat.icon}
            </Avatar>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.95rem' }}>
                {feat.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.3 }}>
                {feat.desc}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Footer actions */}
      <Box sx={{ p: 3, pb: 4, textAlign: 'center' }}>
        <Button
          fullWidth variant="contained" disableElevation
          onClick={() => navigate('/signup')}
          sx={{
            borderRadius: '20px', py: 1.8,
            fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'none',
            mb: 2, boxShadow: '0 4px 14px rgba(212,83,10,0.2)',
          }}
        >
          Get started
        </Button>

        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <Link
            component="button"
            onClick={() => navigate('/login')}
            underline="none"
            sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.85rem', verticalAlign: 'baseline' }}
          >
            Sign in
          </Link>
        </Typography>
      </Box>

    </Box>
  );
}