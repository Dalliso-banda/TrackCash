import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function BrandedHeader({ title }) {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        bgcolor: 'primary.main', // Uses your custom #D74205 color
        color: '#ffffff', 
        pt: 2, 
        pb: 2, // Keeps the bottom padding room for overlay layout elements
        px: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2 
      }}
    >
      {/* Universal back action router button */}
      <IconButton 
        onClick={() => navigate(-1)} // Takes the user back one page automatically
        sx={{ 
          color: '#ffffff', 
          bgcolor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          p: 1.5,
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.25)' }
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
        {title} {/* Dynamically renders whatever text value you pass in */}
      </Typography>
    </Box>
  );
}
