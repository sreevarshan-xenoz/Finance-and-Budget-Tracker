import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getBudgets, addBudget, updateBudget, deleteBudget } from '../redux/slices/budgetSlice';
import { RootState } from '../redux/store';

const Budgets = () => {
  const dispatch = useDispatch();
  const { budgets, loading } = useSelector((state: RootState) => state.budgets);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  useEffect(() => {
    dispatch(getBudgets());
  }, [dispatch]);
  
  const handleOpenAddDialog = () => {
    setSelectedBudget(null);
    setStartDate(new Date());
    setEndDate(null);
    setOpenDialog(true);
  };
  
  const handleOpenEditDialog = (budget: any) => {
    setSelectedBudget(budget);
    setStartDate(new Date(budget.startDate));
    setEndDate(budget.endDate ? new Date(budget.endDate) : null);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };
  
  const handleDeleteBudget = (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      dispatch(deleteBudget(id));
    }
  };
  
  const formik = useFormik({
    initialValues: {
      name: selectedBudget?.name || '',
      amount: selectedBudget?.amount || 0,
      category: selectedBudget?.category || 'Other',
      subcategory: selectedBudget?.subcategory || '',
      period: selectedBudget?.period || 'monthly',
      isRecurring: selectedBudget?.isRecurring ?? true,
      alertThreshold: selectedBudget?.alertThreshold || 80,
      notes: selectedBudget?.notes || ''
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
      category: Yup.string().required('Category is required'),
      period: Yup.string().required('Period is required'),
      alertThreshold: Yup.number()
        .min(0, 'Threshold must be at least 0%')
        .max(100, 'Threshold cannot exceed 100%')
        .required('Alert threshold is required')
    }),
    onSubmit: (values) => {
      const budgetData = {
        ...values,
        startDate: startDate?.toISOString() || new Date().toISOString(),
        endDate: endDate?.toISOString() || null
      };
      
      if (selectedBudget) {
        dispatch(updateBudget({ id: selectedBudget._id, budgetData }));
      } else {
        dispatch(addBudget(budgetData));
      }
      
      handleCloseDialog();
    }
  });
  
  const categories = [
    'Housing',
    'Transportation',
    'Food',
    'Utilities',
    'Insurance',
    'Healthcare',
    'Savings',
    'Personal',
    'Entertainment',
    'Education',
    'Debt',
    'Other'
  ];
  
  const periods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ];
  
  const calculateProgress = (budget: any) => {
    const spent = budget.currentSpending || 0;
    return (spent / budget.amount) * 100;
  };
  
  const getProgressColor = (progress: number, threshold: number) => {
    if (progress >= 100) return 'error';
    if (progress >= threshold) return 'warning';
    return 'success';
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Budget
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {budgets.length > 0 ? (
            budgets.map((budget) => {
              const progress = calculateProgress(budget);
              const progressColor = getProgressColor(progress, budget.alertThreshold);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={budget._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div" gutterBottom>
                          {budget.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            bgcolor: 'action.hover', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1 
                          }}
                        >
                          {budget.category}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            ${budget.currentSpending?.toFixed(2) || '0.00'} of ${budget.amount.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.min(progress, 100).toFixed(0)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(progress, 100)} 
                          color={progressColor as 'success' | 'warning' | 'error'}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Period: {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {budget.isRecurring ? 'Recurring' : 'One-time'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Alert at: {budget.alertThreshold}%
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenEditDialog(budget)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteBudget(budget._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })
          ) : (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No budgets found. Create your first budget to start tracking your spending.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
      
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedBudget ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Budget Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="amount"
                  name="amount"
                  label="Amount"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  InputProps={{
                    startAdornment: <span>$</span>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.category && Boolean(formik.errors.category)}>
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <FormHelperText>{formik.errors.category}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="subcategory"
                  name="subcategory"
                  label="Subcategory (Optional)"
                  value={formik.values.subcategory}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={formik.touched.period && Boolean(formik.errors.period)}>
                  <InputLabel id="period-label">Period</InputLabel>
                  <Select
                    labelId="period-label"
                    id="period"
                    name="period"
                    value={formik.values.period}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Period"
                  >
                    {periods.map((period) => (
                      <MenuItem key={period.value} value={period.value}>{period.label}</MenuItem>
                    ))}
                  </Select>
                  {formik.touched.period && formik.errors.period && (
                    <FormHelperText>{formik.errors.period}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="recurring-label">Recurring</InputLabel>
                  <Select
                    labelId="recurring-label"
                    id="isRecurring"
                    name="isRecurring"
                    value={formik.values.isRecurring}
                    onChange={formik.handleChange}
                    label="Recurring"
                  >
                    <MenuItem value={true}>Yes</MenuItem>
                    <MenuItem value={false}>No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newDate) => setStartDate(newDate)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date (Optional)"
                    value={endDate}
                    onChange={(newDate) => setEndDate(newDate)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="alertThreshold"
                  name="alertThreshold"
                  label="Alert Threshold (%)"
                  type="number"
                  value={formik.values.alertThreshold}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.alertThreshold && Boolean(formik.errors.alertThreshold)}
                  helperText={formik.touched.alertThreshold && formik.errors.alertThreshold}
                  InputProps={{
                    endAdornment: <span>%</span>
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={() => formik.handleSubmit()} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : selectedBudget ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Budgets; 