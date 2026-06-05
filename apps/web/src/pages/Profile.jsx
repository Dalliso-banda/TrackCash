import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Paper, List, ListItemButton, ListItemIcon,
  ListItemText, Switch, Divider, Skeleton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Button, Snackbar, Alert
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeModeContext';
import client from '../api/client';

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const CURRENCIES = ['ZMW', 'USD', 'ZAR', 'KES'];

export default function ProfileView() {
  const { logout } = useAuth();
  const { mode, toggleThemeMode } = useThemeMode();

  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState({ open: false, message: '', severity: 'success' });
  const [reminders, setReminders] = useState(() => localStorage.getItem('pref_reminders') !== 'false');

  // Edit profile dialog
  const [editOpen, setEditOpen]     = useState(false);
  const [editName, setEditName]     = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Currency dialog
  const [currencyOpen, setCurrencyOpen] = useState(false);

  // Income goal dialog
  const [goalOpen, setGoalOpen]     = useState(false);
  const [goalValue, setGoalValue]   = useState('');
  const [goalSaving, setGoalSaving] = useState(false);

  const showToast = (message, severity = 'success') =>
    setToast({ open: true, message, severity });

  useEffect(() => {
    client.get('/auth/me')
      .then((res) => {
        const u = res.data.data.user;
        setUser(u);
        setEditName(u.name);
        setGoalValue(u.monthly_income_goal || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Preferences ───────────────────────────────────────────────────────────
  const handleReminders = (e) => {
    const v = e.target.checked;
    setReminders(v);
    localStorage.setItem('pref_reminders', v);
    showToast(v ? 'Daily reminders on' : 'Daily reminders off');
  };

  // ── Edit profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    setEditSaving(true);
    try {
      await client.patch('/auth/me', { name: editName.trim() });
      setUser((prev) => ({ ...prev, name: editName.trim() }));
      setEditOpen(false);
      showToast('Profile updated');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Currency ──────────────────────────────────────────────────────────────
  const handleCurrencySelect = async (currency) => {
    try {
      await client.patch('/auth/me', { currency });
      setUser((prev) => ({ ...prev, currency }));
      setCurrencyOpen(false);
      showToast(`Currency set to ${currency}`);
    } catch {
      showToast('Failed to update currency', 'error');
    }
  };

  // ── Income goal ───────────────────────────────────────────────────────────
  const handleSaveGoal = async () => {
    if (!goalValue || isNaN(goalValue)) return;
    setGoalSaving(true);
    try {
      await client.patch('/auth/me', { monthly_income_goal: parseFloat(goalValue) });
      setUser((prev) => ({ ...prev, monthly_income_goal: parseFloat(goalValue) }));
      setGoalOpen(false);
      showToast('Income goal updated');
    } catch {
      showToast('Failed to update goal', 'error');
    } finally {
      setGoalSaving(false);
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        client.get('/expenses', { params: { page: 1, limit: 1000 } }),
        client.get('/income',   { params: { page: 1, limit: 1000 } }),
      ]);

      const expenses = expRes.data.data;
      const income   = incRes.data.data;

      const rows = [
        ['Type', 'Amount', 'Category/Type', 'Note', 'Date'],
        ...expenses.map(e => ['Expense', e.amount, e.category, e.note || '', e.recorded_at]),
        ...income.map(i =>   ['Income',  i.amount, i.type,     i.note || '', i.recorded_at]),
      ];

      const csv  = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `trackcash-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported successfully');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const switchSx = {
    '& .MuiSwitch-switchBase.Mui-checked': { color: '#00a572' },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#00a572' },
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>

      {/* ── Header ── */}
      <Box sx={{
        bgcolor: 'primary.main', color: '#fff', pt: 7, pb: 5,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>
        {loading ? (
          <Skeleton variant="circular" width={72} height={72} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
        ) : (
          <Avatar sx={{ bgcolor: '#fbc2b5', color: '#1a1a1a', width: 72, height: 72, fontSize: '1.6rem', fontWeight: 'bold', mb: 2, border: '2px solid rgba(255,255,255,0.4)' }}>
            {getInitials(user?.name)}
          </Avatar>
        )}
        {loading ? (
          <Skeleton variant="text" width={140} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 0.5 }} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>{user?.name}</Typography>
        )}
        {loading ? (
          <Skeleton variant="text" width={180} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.75, fontSize: '0.85rem' }}>{user?.email}</Typography>
        )}
      </Box>

      <Box sx={{ px: 2, mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ── Account ── */}
        <Box>
          <Typography variant="caption" sx={{ color: '#b0a99f', fontWeight: 'bold', letterSpacing: '1px', px: 1, mb: 1, display: 'block' }}>
            ACCOUNT
          </Typography>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f0e6df', overflow: 'hidden' }}>
            <List disablePadding>

              <ListItemButton sx={{ py: 1.8 }} onClick={() => setEditOpen(true)}>
                <ListItemIcon sx={{ minWidth: 40 }}><PersonOutlinedIcon sx={{ color: '#757575' }} /></ListItemIcon>
                <ListItemText primary="Edit profile" slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }} />
                <ChevronRightIcon sx={{ color: '#c0c0c0', fontSize: '1.2rem' }} />
              </ListItemButton>
              <Divider sx={{ borderColor: '#fbf7f4' }} />

              <ListItemButton sx={{ py: 1.8 }} onClick={() => setCurrencyOpen(true)}>
                <ListItemIcon sx={{ minWidth: 40 }}><PaymentsIcon sx={{ color: '#757575' }} /></ListItemIcon>
                <ListItemText primary="Currency" slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }} />
                <Typography variant="body2" sx={{ color: '#b0a99f', mr: 1 }}>
                  {loading ? '...' : user?.currency || 'ZMW'}
                </Typography>
                <ChevronRightIcon sx={{ color: '#c0c0c0', fontSize: '1.2rem' }} />
              </ListItemButton>
              <Divider sx={{ borderColor: '#fbf7f4' }} />

              <ListItemButton sx={{ py: 1.8 }} onClick={() => setGoalOpen(true)}>
                <ListItemIcon sx={{ minWidth: 40 }}><TrackChangesIcon sx={{ color: '#757575' }} /></ListItemIcon>
                <ListItemText primary="Monthly income goal" slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }} />
                <Typography variant="body2" sx={{ color: '#b0a99f', mr: 1 }}>
                  {loading ? '...' : user?.monthly_income_goal ? `K ${Number(user.monthly_income_goal).toLocaleString()}` : 'Not set'}
                </Typography>
                <ChevronRightIcon sx={{ color: '#c0c0c0', fontSize: '1.2rem' }} />
              </ListItemButton>

            </List>
          </Paper>
        </Box>

        {/* ── Preferences ── */}
        <Box>
          <Typography variant="caption" sx={{ color: '#b0a99f', fontWeight: 'bold', letterSpacing: '1px', px: 1, mb: 1, display: 'block' }}>
            PREFERENCES
          </Typography>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f0e6df', overflow: 'hidden' }}>
            <List disablePadding>

              <ListItemButton sx={{ py: 1.5 }} disableRipple>
                <ListItemIcon sx={{ minWidth: 40 }}><NotificationsNoneIcon sx={{ color: '#757575' }} /></ListItemIcon>
                <ListItemText primary="Daily reminders" slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }} />
                <Switch checked={reminders} onChange={handleReminders} sx={switchSx} />
              </ListItemButton>
              <Divider sx={{ borderColor: '#fbf7f4' }} />

              <ListItemButton sx={{ py: 1.5 }} disableRipple>
                <ListItemIcon sx={{ minWidth: 40 }}><DarkModeIcon sx={{ color: '#757575' }} /></ListItemIcon>
                <ListItemText primary="Dark mode" slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }} />
                <Switch checked={mode === 'dark'} onChange={toggleThemeMode} sx={switchSx} />
              </ListItemButton>

            </List>
          </Paper>
        </Box>

        {/* ── Actions ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f0e6df', overflow: 'hidden' }}>
            <ListItemButton sx={{ py: 1.8 }} onClick={handleExport}>
              <ListItemIcon sx={{ minWidth: 40 }}><FileDownloadIcon sx={{ color: '#757575' }} /></ListItemIcon>
              <ListItemText primary="Export my data" slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }} />
              <ChevronRightIcon sx={{ color: '#c0c0c0', fontSize: '1.2rem' }} />
            </ListItemButton>
          </Paper>

          <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f0e6df', overflow: 'hidden' }}>
            <ListItemButton onClick={logout} sx={{ py: 1.8 }}>
              <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon sx={{ color: '#c62828' }} /></ListItemIcon>
              <ListItemText primary="Sign out" slotProps={{ primary: { variant: 'body2', fontWeight: 'bold', color: '#c62828' } }} />
            </ListItemButton>
          </Paper>
        </Box>

      </Box>

      {/* ── Edit profile dialog ── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { borderRadius: '20px', px: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edit profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth autoFocus label="Full name" value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: '#a0a0a0', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSaveProfile} disabled={editSaving} variant="contained" disableElevation
            sx={{ bgcolor: '#D74205', borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#b53503' } }}>
            {editSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Currency dialog ── */}
      <Dialog open={currencyOpen} onClose={() => setCurrencyOpen(false)} PaperProps={{ sx: { borderRadius: '20px', minWidth: 260 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Select currency</DialogTitle>
        <List disablePadding sx={{ pb: 2 }}>
          {CURRENCIES.map((c) => (
            <ListItemButton key={c} onClick={() => handleCurrencySelect(c)}
              sx={{ px: 3, py: 1.5, bgcolor: user?.currency === c ? '#fbf0ec' : 'transparent' }}>
              <ListItemText
                primary={c}
                slotProps={{ primary: { fontWeight: user?.currency === c ? 'bold' : 400, color: user?.currency === c ? '#D74205' : '#1a1a1a' } }}
              />
              {user?.currency === c && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D74205' }} />}
            </ListItemButton>
          ))}
        </List>
      </Dialog>

      {/* ── Income goal dialog ── */}
      <Dialog open={goalOpen} onClose={() => setGoalOpen(false)} PaperProps={{ sx: { borderRadius: '20px', px: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Monthly income goal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth autoFocus label="Amount (K)" type="number" value={goalValue}
            onChange={(e) => setGoalValue(e.target.value)}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setGoalOpen(false)} sx={{ color: '#a0a0a0', textTransform: 'none' }}>Cancel</Button>
          <Button onClick={handleSaveGoal} disabled={goalSaving} variant="contained" disableElevation
            sx={{ bgcolor: '#D74205', borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#b53503' } }}>
            {goalSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open} autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ borderRadius: '12px', width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      <BottomNav />
    </Box>
  );
}