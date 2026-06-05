import React from "react";
import { AppBar, Toolbar, BottomNavigation, BottomNavigationAction, Fab, styled } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Import Link component

// Icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -24,
  left: 0,
  right: 0,
  margin: '0 auto',
  backgroundColor: '#D4530A',
  color: '#ffffff',
  border: '3px solid #ffffff',
  boxShadow: '0 4px 14px rgba(212, 83, 10, 0.4)',
  '&:hover': { backgroundColor: '#B54305' },
});

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" color="inherit" sx={{ top: 'auto', bottom: 0, backgroundColor: '#ffffff', borderTop: '0.5px solid #EAE4DC', boxShadow: 'none', pb: 'env(safe-area-inset-bottom)' }}>
      <Toolbar disableGutters sx={{ justifyContent: 'center', minHeight: 64 }}>
        
        <BottomNavigation
          value={location.pathname} 
          showLabels
          sx={{
            width: '100%',
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              color: '#B0A99F',
              minWidth: 'auto',
              padding: '6px 0',
              '&.Mui-selected': {
                color: '#D4530A',
                '& .MuiBottomNavigationAction-label': { fontWeight: 500, fontSize: '10px' }
              }
            }
          }}
        >
          {/* Using component={Link} and to="..." handles navigation natively */}
          <BottomNavigationAction component={Link} to="/" label="Home" value="/" icon={<HomeRoundedIcon sx={{ fontSize: 24 }} />} />
          <BottomNavigationAction component={Link} to="/stats" label="Stats" value="/stats" icon={<BarChartRoundedIcon sx={{ fontSize: 24 }} />} />
          
          {/* Replaced <Box> with an empty, non-button action to avoid the prop error */}
          <BottomNavigationAction disabled sx={{ minWidth: 52, maxWidth: 52, padding: 0 }} />
          
          <BottomNavigationAction component={Link} to="/save" label="Save" value="/save" icon={<SavingsRoundedIcon sx={{ fontSize: 24 }} />} />
          <BottomNavigationAction component={Link} to="/profile" label="Profile" value="/profile" icon={<PersonRoundedIcon sx={{ fontSize: 24 }} />} />
        </BottomNavigation>

        <StyledFab onClick={() => navigate("/record")} aria-label="Add expense or income">
          <AddRoundedIcon sx={{ fontSize: 28 }} />
        </StyledFab>

      </Toolbar>
    </AppBar>
  );
}
