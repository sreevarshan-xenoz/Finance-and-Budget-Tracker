import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Account {
  _id: string;
  plaidAccountId: string;
  name: string;
  officialName?: string;
  type: string;
  subtype?: string;
  balance: {
    available: number;
    current: number;
    limit?: number;
  };
  mask?: string;
  institution?: {
    name: string;
    institutionId: string;
  };
}

interface AccountState {
  accounts: Account[];
  account: Account | null;
  loading: boolean;
  error: string | null;
  linkToken: string | null;
  linkSuccess: boolean;
}

const initialState: AccountState = {
  accounts: [],
  account: null,
  loading: false,
  error: null,
  linkToken: null,
  linkSuccess: false
};

// Get all accounts
export const getAccounts = createAsyncThunk(
  'accounts/getAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/plaid/accounts');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch accounts');
    }
  }
);

// Get single account
export const getAccount = createAsyncThunk(
  'accounts/getAccount',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/plaid/accounts/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch account');
    }
  }
);

// Create link token
export const createLinkToken = createAsyncThunk(
  'accounts/createLinkToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/plaid/create-link-token');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create link token');
    }
  }
);

// Exchange public token
export const exchangePublicToken = createAsyncThunk(
  'accounts/exchangePublicToken',
  async (publicToken: string, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/plaid/exchange-public-token', { publicToken });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to exchange public token');
    }
  }
);

// Sync transactions
export const syncTransactions = createAsyncThunk(
  'accounts/syncTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/plaid/sync-transactions');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to sync transactions');
    }
  }
);

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAccount: (state) => {
      state.account = null;
    },
    resetLinkSuccess: (state) => {
      state.linkSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all accounts
      .addCase(getAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.data;
      })
      .addCase(getAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get single account
      .addCase(getAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload.data;
      })
      .addCase(getAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create link token
      .addCase(createLinkToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLinkToken.fulfilled, (state, action) => {
        state.loading = false;
        state.linkToken = action.payload.link_token;
      })
      .addCase(createLinkToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Exchange public token
      .addCase(exchangePublicToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exchangePublicToken.fulfilled, (state) => {
        state.loading = false;
        state.linkSuccess = true;
      })
      .addCase(exchangePublicToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Sync transactions
      .addCase(syncTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncTransactions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(syncTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearAccount, resetLinkSuccess } = accountSlice.actions;
export default accountSlice.reducer; 