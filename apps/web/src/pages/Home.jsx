import { Box } from '@mui/material';
import BottomNav from '../components/BottomNav';
import HomeUpperBanner from '../components/HomeUpperBanner';
import HomeStats from '../components/HomeStats';
import HomeRecent from '../components/HomeRecent';

export default function Home() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
      <HomeUpperBanner />
      <HomeStats />
      <HomeRecent />
      <BottomNav />
    </Box>
  );
}