import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Budget {
  _id: string;
  name: string;
  amount: number;
  category: string;
  subcategory?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: string;
  endDate?: string;
  isRecurring: boolean;
  alertThreshold: number;
  notes?: string;
  isActive: boolean;
  currentSpending?: number;
}

interface BudgetState {
  budgets: Budget[];
  budget: Budget | null;
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  budgets: [],
  budget: null,
  loading: false,
  error: null
};

// Get all budgets
export const getBudgets = createAsyncThunk(
  'budgets/getBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/budgets');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budgets');
    }
  }
);

// Get single budget
export const getBudget = createAsyncThunk(
  'budgets/getBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/budgets/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budget');
    }
  }
);

// Add new budget
export const addBudget = createAsyncThunk(
  'budgets/addBudget',
  async (budgetData: Partial<Budget>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/budgets', budgetData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add budget');
    }
  }
);

// Update budget
export const updateBudget = createAsyncThunk(
  'budgets/updateBudget',
  async ({ id, budgetData }: { id: string; budgetData: Partial<Budget> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/budgets/${id}`, budgetData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update budget');
    }
  }
);

// Delete budget
export const deleteBudget = createAsyncThunk(
  'budgets/deleteBudget',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/budgets/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete budget');
    }
  }
);

const budgetSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBudget: (state) => {
      state.budget = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all budgets
      .addCase(getBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload.data;
      })
      .addCase(getBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get single budget
      .addCase(getBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budget = action.payload.data;
      })
      .addCase(getBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add budget
      .addCase(addBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.push(action.payload.data);
      })
      .addCase(addBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.map(budget =>
          budget._id === action.payload.data._id ? action.payload.data : budget
        );
        state.budget = action.payload.data;
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.filter(
          budget => budget._id !== action.payload
        );
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearBudget } = budgetSlice.actions;
export default budgetSlice.reducer; 