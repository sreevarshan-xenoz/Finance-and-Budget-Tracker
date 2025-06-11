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
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Chip
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Savings as SavingsIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { usePlaidLink } from 'react-plaid-link';
import { 
  getAccounts, 
  createLinkToken, 
  exchangePublicToken, 
  syncTransactions 
} from '../redux/slices/accountSlice';
import { RootState } from '../redux/store';

const Accounts = () => {
  const dispatch = useDispatch();
  const { 
    accounts, 
    loading, 
    linkToken, 
    linkSuccess 
  } = useSelector((state: RootState) => state.accounts);
  
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  
  useEffect(() => {
    dispatch(getAccounts());
  }, [dispatch]);
  
  useEffect(() => {
    if (linkSuccess) {
      setOpenSuccessDialog(true);
      dispatch(getAccounts());
    }
  }, [linkSuccess, dispatch]);
  
  const handleAddAccount = () => {
    dispatch(createLinkToken());
  };
  
  const handleSyncTransactions = () => {
    dispatch(syncTransactions());
  };
  
  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
  };
  
  const { open, ready } = usePlaidLink({
    token: linkToken || '',
    onSuccess: (public_token, metadata) => {
      dispatch(exchangePublicToken(public_token));
    },
    onExit: (err, metadata) => {
      console.log('Link exit:', err, metadata);
    },
  });
  
  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);
  
  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return <CreditCardIcon />;
      case 'depository':
        return <SavingsIcon />;
      default:
        return <AccountBalanceIcon />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance.current, 0);
  };
  
  const groupedAccounts = accounts.reduce((acc: Record<string, any[]>, account) => {
    const institution = account.institution?.name || 'Other';
    if (!acc[institution]) {
      acc[institution] = [];
    }
    acc[institution].push(account);
    return acc;
  }, {});
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Accounts
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleSyncTransactions}
            sx={{ mr: 2 }}
            disabled={loading}
          >
            Sync Transactions
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
            disabled={loading}
          >
            Link Account
          </Button>
        </Box>
      </Box>
      
      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <AccountBalanceIcon sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5">Total Balance</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(getTotalBalance())}
            </Typography>
          </Grid>
          <Grid item>
            <Chip 
              label={`${accounts.length} Accounts`} 
              color="primary" 
              sx={{ bgcolor: 'white', color: 'primary.main' }} 
            />
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {Object.keys(groupedAccounts).length > 0 ? (
            Object.entries(groupedAccounts).map(([institution, institutionAccounts]) => (
              <Grid item xs={12} key={institution}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {institution}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <List>
                      {institutionAccounts.map((account) => (
                        <ListItem key={account._id}>
                          <ListItemIcon>
                            {getAccountIcon(account.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={account.name}
                            secondary={`${account.type}${account.subtype ? ` - ${account.subtype}` : ''}`}
                          />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {formatCurrency(account.balance.current)}
                            </Typography>
                            {account.balance.available !== undefined && (
                              <Typography variant="body2" color="text.secondary">
                                Available: {formatCurrency(account.balance.available)}
                              </Typography>
                            )}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No Accounts Linked
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Link your bank accounts to start tracking your finances.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddAccount}
                >
                  Link Account
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Success Dialog */}
      <Dialog open={openSuccessDialog} onClose={handleCloseSuccessDialog}>
        <DialogTitle>Account Linked Successfully</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Your account has been successfully linked. Your transactions will be imported shortly.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Accounts; 