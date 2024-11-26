'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
} from '@mui/icons-material';

interface BudgetItem {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'planned' | 'actual';
}

export default function BudgetPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [newItem, setNewItem] = useState({
    type: 'expense' as const,
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'planned' as const,
  });

  const categories = {
    income: ['Client Payment', 'Investment', 'Other Income'],
    expense: ['Labor', 'Materials', 'Equipment', 'Permits', 'Subcontractors', 'Other'],
  };

  useEffect(() => {
    fetchBudgetItems();
  }, [projectId]);

  const fetchBudgetItems = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/budget`);
      if (!response.ok) throw new Error('Failed to fetch budget items');
      const data = await response.json();
      setBudgetItems(data);
    } catch (error) {
      console.error('Error fetching budget items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = `/api/projects/${projectId}/budget${editingItem ? `/${editingItem.id}` : ''}`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem || newItem),
      });

      if (!response.ok) throw new Error('Failed to save budget item');
      
      await fetchBudgetItems();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving budget item:', error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this budget item?')) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/budget/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete budget item');
      
      await fetchBudgetItems();
    } catch (error) {
      console.error('Error deleting budget item:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setNewItem({
      type: 'expense',
      category: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'planned',
    });
  };

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setOpenDialog(true);
  };

  const calculateTotals = () => {
    const totals = {
      plannedIncome: 0,
      actualIncome: 0,
      plannedExpense: 0,
      actualExpense: 0,
    };

    budgetItems.forEach((item) => {
      if (item.type === 'income') {
        if (item.status === 'planned') {
          totals.plannedIncome += item.amount;
        } else {
          totals.actualIncome += item.amount;
        }
      } else {
        if (item.status === 'planned') {
          totals.plannedExpense += item.amount;
        } else {
          totals.actualExpense += item.amount;
        }
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Budget Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Item
        </Button>
      </Box>

      {/* Budget Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Income</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary">Planned</Typography>
                <Typography variant="h5" color="success.main">
                  ${totals.plannedIncome.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary">Actual</Typography>
                <Typography variant="h5" color="success.main">
                  ${totals.actualIncome.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Expenses</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography color="text.secondary">Planned</Typography>
                <Typography variant="h5" color="error.main">
                  ${totals.plannedExpense.toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary">Actual</Typography>
                <Typography variant="h5" color="error.main">
                  ${totals.actualExpense.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Items List */}
      <Grid container spacing={3}>
        {budgetItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {item.type === 'income' ? (
                      <IncomeIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <ExpenseIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="h6">
                      ${item.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditItem(item)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  {item.category}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {item.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(item.date).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: item.status === 'actual' ? 'success.main' : 'warning.main',
                    }}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editingItem?.type || newItem.type}
                onChange={(e) => editingItem
                  ? setEditingItem({ ...editingItem, type: e.target.value as BudgetItem['type'] })
                  : setNewItem({ ...newItem, type: e.target.value as BudgetItem['type'] })
                }
                label="Type"
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editingItem?.category || newItem.category}
                onChange={(e) => editingItem
                  ? setEditingItem({ ...editingItem, category: e.target.value })
                  : setNewItem({ ...newItem, category: e.target.value })
                }
                label="Category"
              >
                {categories[editingItem?.type || newItem.type].map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={editingItem?.description || newItem.description}
              onChange={(e) => editingItem
                ? setEditingItem({ ...editingItem, description: e.target.value })
                : setNewItem({ ...newItem, description: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              label="Amount"
              type="number"
              value={editingItem?.amount || newItem.amount}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value));
                editingItem
                  ? setEditingItem({ ...editingItem, amount: value })
                  : setNewItem({ ...newItem, amount: value });
              }}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Date"
              type="date"
              value={editingItem?.date || newItem.date}
              onChange={(e) => editingItem
                ? setEditingItem({ ...editingItem, date: e.target.value })
                : setNewItem({ ...newItem, date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingItem?.status || newItem.status}
                onChange={(e) => editingItem
                  ? setEditingItem({ ...editingItem, status: e.target.value as BudgetItem['status'] })
                  : setNewItem({ ...newItem, status: e.target.value as BudgetItem['status'] })
                }
                label="Status"
              >
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="actual">Actual</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
