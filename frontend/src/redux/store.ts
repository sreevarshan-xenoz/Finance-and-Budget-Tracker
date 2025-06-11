import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';
import budgetReducer from './slices/budgetSlice';
import accountReducer from './slices/accountSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
};

const rootReducer = combineReducers({
  auth: authReducer,
  transactions: transactionReducer,
  budgets: budgetReducer,
  accounts: accountReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 