import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Transaction {
  _id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  subcategory?: string;
  type: 'expense' | 'income' | 'transfer';
  notes?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  isManual: boolean;
}

interface TransactionState {
  transactions: Transaction[];
  transaction: Transaction | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: TransactionState = {
  transactions: [],
  transaction: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1
};

// Get all transactions with pagination
export const getTransactions = createAsyncThunk(
  'transactions/getTransactions',
  async (params: { page?: number; limit?: number; category?: string; startDate?: string; endDate?: string }, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, category, startDate, endDate } = params;
      let url = `/api/transactions?page=${page}&limit=${limit}`;
      
      if (category) url += `&category=${category}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transactions');
    }
  }
);

// Get single transaction
export const getTransaction = createAsyncThunk(
  'transactions/getTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/transactions/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transaction');
    }
  }
);

// Add new transaction
export const addTransaction = createAsyncThunk(
  'transactions/addTransaction',
  async (transactionData: Partial<Transaction>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/transactions', transactionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add transaction');
    }
  }
);

// Update transaction
export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transactionData }: { id: string; transactionData: Partial<Transaction> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/transactions/${id}`, transactionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update transaction');
    }
  }
);

// Delete transaction
export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/transactions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete transaction');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransaction: (state) => {
      state.transaction = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all transactions
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data;
        state.totalPages = action.payload.pagination.totalPages;
        state.currentPage = action.payload.pagination.currentPage;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get single transaction
      .addCase(getTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload.data;
      })
      .addCase(getTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add transaction
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload.data);
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.map(transaction =>
          transaction._id === action.payload.data._id ? action.payload.data : transaction
        );
        state.transaction = action.payload.data;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(
          transaction => transaction._id !== action.payload
        );
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearTransaction } = transactionSlice.actions;
export default transactionSlice.reducer; 