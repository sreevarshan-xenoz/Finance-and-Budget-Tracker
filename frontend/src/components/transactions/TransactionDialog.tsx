import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addTransaction, updateTransaction } from '../../redux/slices/transactionSlice';
import { RootState } from '../../redux/store';

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transaction?: {
    _id: string;
    name: string;
    amount: number;
    date: string;
    category: string;
    subcategory?: string;
    type: 'expense' | 'income' | 'transfer';
    notes?: string;
  };
}

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
  'Income',
  'Other'
];

const TransactionDialog: React.FC<TransactionDialogProps> = ({ open, onClose, transaction }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.transactions);
  const [date, setDate] = useState<Date | null>(transaction ? new Date(transaction.date) : new Date());
  
  const isEditing = Boolean(transaction);
  
  const formik = useFormik({
    initialValues: {
      name: transaction?.name || '',
      amount: transaction?.amount || 0,
      category: transaction?.category || 'Other',
      subcategory: transaction?.subcategory || '',
      type: transaction?.type || 'expense',
      notes: transaction?.notes || ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      amount: Yup.number().required('Amount is required').positive('Amount must be positive'),
      category: Yup.string().required('Category is required'),
      type: Yup.string().required('Type is required')
    }),
    onSubmit: (values) => {
      const transactionData = {
        ...values,
        date: date?.toISOString() || new Date().toISOString()
      };
      
      if (isEditing && transaction) {
        dispatch(updateTransaction({ id: transaction._id, transactionData }));
      } else {
        dispatch(addTransaction(transactionData));
      }
      
      handleClose();
    }
  });
  
  const handleClose = () => {
    formik.resetForm();
    setDate(new Date());
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Transaction Name"
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
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
              <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Type"
                >
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
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
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
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
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={() => formik.handleSubmit()} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : isEditing ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDialog; 