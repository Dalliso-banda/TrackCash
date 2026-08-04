import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import BottomNav from '../components/BottomNav';
import client from '../api/client';

const CATEGORY_OPTIONS = ['food', 'home', 'phone', 'transport', 'savings', 'miscellaneous'];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const YEAR_OPTIONS = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];

const formatCurrency = (value) => `K ${Number(value || 0).toLocaleString()}`;
const toTitleCase = (value = '') => value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export default function BudgetingPage() {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ total_budget: 0, total_spent: 0, remaining: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({
    category: 'food',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    note: '',
  });
  // Items dialog / management
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemSaving, setItemSaving] = useState(false);
  const [itemForm, setItemForm] = useState({ name: '', price: '', quantity: 1, note: '' });
  const [availableCash, setAvailableCash] = useState(null);

  const loadBudgets = async (selectedMonth = month, selectedYear = year) => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/budgets', { params: { month: selectedMonth, year: selectedYear } });
      const payload = res.data.data || {};
      setBudgets(payload.budgets || []);
      setSummary(payload.summary || { total_budget: 0, total_spent: 0, remaining: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets(month, year);
    // fetch available cash from dashboard
    client.get('/dashboard').then((res) => {
      setAvailableCash(res.data.data.available_cash);
    }).catch(() => setAvailableCash(null));
  }, [month, year]);

  const openCreateDialog = () => {
    setEditingBudget(null);
    setForm({ category: 'food', amount: '', month, year, note: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (budget) => {
    setEditingBudget(budget);
    setForm({
      category: budget.category,
      amount: String(budget.amount),
      month: budget.month,
      year: budget.year,
      note: budget.note || '',
    });
    setDialogOpen(true);
  };

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        category: form.category,
        amount: Number(form.amount),
        month: Number(form.month),
        year: Number(form.year),
        note: form.note,
      };

      if (editingBudget) {
        await client.patch(`/budgets/${editingBudget.id}`, payload);
      } else {
        await client.post('/budgets', payload);
      }

      setDialogOpen(false);
      loadBudgets(Number(form.month), Number(form.year));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budget) => {
    if (!window.confirm('Delete this budget entry?')) return;
    setError('');
    try {
      await client.delete(`/budgets/${budget.id}`);
      loadBudgets(month, year);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete budget');
    }
  };

  // ---- Items management ----
  const openItemsDialog = (budget) => {
    setCurrentBudget(budget);
    setItems([]);
    setItemsDialogOpen(true);
    loadItems(budget.id);
  };

  const closeItemsDialog = () => {
    setItemsDialogOpen(false);
    setCurrentBudget(null);
    setItemForm({ name: '', price: '', quantity: 1, note: '' });
  };

  const loadItems = async (budgetId) => {
    setItemsLoading(true);
    try {
      const res = await client.get(`/budgets/${budgetId}/items`);
      setItems(res.data.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load items');
    } finally {
      setItemsLoading(false);
    }
  };

  const handleItemField = (f) => (e) => setItemForm((p) => ({ ...p, [f]: e.target.value }));

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!currentBudget) return;
    setItemSaving(true);
    try {
      const payload = { name: itemForm.name, price: Number(itemForm.price), quantity: Number(itemForm.quantity), note: itemForm.note };
      await client.post(`/budgets/${currentBudget.id}/items`, payload);
      setItemForm({ name: '', price: '', quantity: 1, note: '' });
      loadItems(currentBudget.id);
      loadBudgets(month, year);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save item');
    } finally {
      setItemSaving(false);
    }
  };

  const handleItemDelete = async (it) => {
    if (!currentBudget) return;
    if (!window.confirm('Delete this item?')) return;
    try {
      await client.delete(`/budgets/${currentBudget.id}/items/${it.id}`);
      loadItems(currentBudget.id);
      loadBudgets(month, year);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete item');
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 12 }}>
      <Box sx={{ bgcolor: 'primary.main', color: '#fff', pt: 7, pb: 4, px: 3 }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1 }}>
          <AccountBalanceWalletOutlinedIcon />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Budgeting
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Set monthly limits for your main spending categories and keep an eye on how much is left.
        </Typography>
      </Box>

      <Box sx={{ px: 2, mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f0e6df', p: 2 }}>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <TextField
              select
              label="Month"
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {MONTH_OPTIONS.map((value) => (
                <MenuItem key={value} value={value}>{value}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Year"
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              size="small"
              sx={{ minWidth: 120 }}
            >
              {YEAR_OPTIONS.map((value) => (
                <MenuItem key={value} value={value}>{value}</MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
            <Paper elevation={0} sx={{ flex: 1, borderRadius: '16px', bgcolor: '#fff8f4', p: 1.5, minWidth: 140 }}>
              <Typography variant="caption" color="text.secondary">Budget</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(summary.total_budget)}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ flex: 1, borderRadius: '16px', bgcolor: '#f5fbf8', p: 1.5, minWidth: 140 }}>
              <Typography variant="caption" color="text.secondary">Spent</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(summary.total_spent)}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ flex: 1, borderRadius: '16px', bgcolor: '#f4f8ff', p: 1.5, minWidth: 140 }}>
              <Typography variant="caption" color="text.secondary">Remaining</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(summary.remaining)}</Typography>
            </Paper>
            <Paper elevation={0} sx={{ flex: 1, borderRadius: '16px', bgcolor: '#fff', p: 1.5, minWidth: 160 }}>
              <Typography variant="caption" color="text.secondary">Available cash</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{availableCash == null ? '...' : formatCurrency(availableCash)}</Typography>
            </Paper>
          </Stack>

          <Button variant="contained" startIcon={<AddCircleOutlineOutlinedIcon />} onClick={openCreateDialog} disableElevation sx={{ borderRadius: '999px', textTransform: 'none' }}>
            Add budget
          </Button>
        </Paper>

        {error ? <Alert severity="error" sx={{ borderRadius: '16px' }}>{error}</Alert> : null}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : budgets.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: '16px' }}>
            No budgets for this month yet. Add one to start tracking your categories.
          </Alert>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid #f0e6df', overflow: 'hidden' }}>
            <List disablePadding>
              {budgets.map((budget, index) => (
                <React.Fragment key={budget.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{toTitleCase(budget.category)}</Typography>
                        <Chip label={`${budget.percentage}% used`} size="small" sx={{ bgcolor: '#fff2ec', color: '#d74205' }} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Budget {formatCurrency(budget.amount)} • Spent {formatCurrency(budget.spent)} • Left {formatCurrency(budget.remaining)}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, budget.percentage)}
                        sx={{ height: 8, borderRadius: 999, bgcolor: '#f2eee9', '& .MuiLinearProgress-bar': { bgcolor: budget.percentage >= 100 ? '#d32f2f' : '#00a572' } }}
                      />
                    </Box>
                      <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                      <Button size="small" onClick={() => openItemsDialog(budget)} sx={{ textTransform: 'none' }}>Manage items</Button>
                      <IconButton edge="end" onClick={() => openEditDialog(budget)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDelete(budget)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </ListItem>
                  {index < budgets.length - 1 ? <Divider /> : null}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} PaperProps={{ sx: { borderRadius: '20px', px: 1, minWidth: { xs: 280, sm: 360 } } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>{editingBudget ? 'Update budget' : 'Create budget'}</DialogTitle>
        <DialogContent>
          <Box component="form" id="budget-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField select label="Category" value={form.category} onChange={handleFieldChange('category')} required>
              {CATEGORY_OPTIONS.map((category) => (
                <MenuItem key={category} value={category}>{toTitleCase(category)}</MenuItem>
              ))}
            </TextField>
            <TextField label="Budget amount (K)" type="number" value={form.amount} onChange={handleFieldChange('amount')} required inputProps={{ min: 1, step: '0.01' }} />
            <Stack direction="row" spacing={1.5}>
              <TextField select label="Month" value={form.month} onChange={handleFieldChange('month')} required sx={{ flex: 1 }}>
                {MONTH_OPTIONS.map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Year" value={form.year} onChange={handleFieldChange('year')} required sx={{ flex: 1 }}>
                {YEAR_OPTIONS.map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField label="Note (optional)" value={form.note} onChange={handleFieldChange('note')} multiline minRows={2} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#a0a0a0', textTransform: 'none' }}>Cancel</Button>
          <Button form="budget-form" type="submit" disabled={saving} variant="contained" disableElevation sx={{ bgcolor: '#D74205', borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#b53503' } }}>
            {saving ? 'Saving...' : editingBudget ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Items dialog */}
      <Dialog open={itemsDialogOpen} onClose={closeItemsDialog} PaperProps={{ sx: { borderRadius: '20px', px: 1, minWidth: { xs: 300, sm: 420 } } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Manage items — {currentBudget ? toTitleCase(currentBudget.category) : ''}</DialogTitle>
        <DialogContent>
          {itemsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={22} /></Box>
          ) : (
            <List disablePadding sx={{ mb: 1 }}>
              {items.map((it) => (
                <ListItem key={it.id} secondaryAction={(
                  <Stack direction="row" spacing={0.5}>
                    <Button size="small" onClick={() => handleItemDelete(it)}>Delete</Button>
                  </Stack>
                )}>
                  <ListItemText primary={`${it.name} — ${formatCurrency(it.price)} x ${it.quantity}`} secondary={it.note} />
                </ListItem>
              ))}
              {items.length === 0 && <ListItem><ListItemText primary="No items yet" /></ListItem>}
            </List>
          )}

          <Box component="form" onSubmit={handleItemSubmit} sx={{ display: 'flex', gap: 1, flexDirection: 'column', mt: 1 }}>
            <TextField label="Item name" value={itemForm.name} onChange={handleItemField('name')} required />
            <Stack direction="row" spacing={1}>
              <TextField label="Price (K)" type="number" value={itemForm.price} onChange={handleItemField('price')} required sx={{ flex: 1 }} inputProps={{ step: '0.01' }} />
              <TextField label="Qty" type="number" value={itemForm.quantity} onChange={handleItemField('quantity')} required sx={{ width: 100 }} inputProps={{ min: 1 }} />
            </Stack>
            <TextField label="Note (optional)" value={itemForm.note} onChange={handleItemField('note')} multiline minRows={2} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={closeItemsDialog} sx={{ color: '#a0a0a0', textTransform: 'none' }}>Close</Button>
          <Button onClick={handleItemSubmit} disabled={itemSaving} variant="contained" disableElevation sx={{ bgcolor: '#D74205', borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#b53503' } }}>{itemSaving ? 'Saving...' : 'Add item'}</Button>
        </DialogActions>
      </Dialog>

      <BottomNav />
    </Box>
  );
}
