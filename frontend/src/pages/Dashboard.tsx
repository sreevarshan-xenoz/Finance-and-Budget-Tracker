import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { VictoryPie, VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory';
import { getTransactions } from '../redux/slices/transactionSlice';
import { getBudgets } from '../redux/slices/budgetSlice';
import { getAccounts } from '../redux/slices/accountSlice';
import { RootState } from '../redux/store';
import TransactionDialog from '../components/transactions/TransactionDialog';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const { transactions, loading: transactionsLoading } = useSelector((state: RootState) => state.transactions);
  const { budgets, loading: budgetsLoading } = useSelector((state: RootState) => state.budgets);
  const { accounts, loading: accountsLoading } = useSelector((state: RootState) => state.accounts);
  
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  
  useEffect(() => {
    dispatch(getTransactions({ limit: 5 }));
    dispatch(getBudgets());
    dispatch(getAccounts());
  }, [dispatch]);
  
  useEffect(() => {
    if (accounts.length > 0) {
      const balance = accounts.reduce((total, account) => total + account.balance.current, 0);
      setTotalBalance(balance);
    }
  }, [accounts]);
  
  useEffect(() => {
    if (transactions.length > 0) {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= firstDayOfMonth;
      });
      
      const income = monthlyTransactions
        .filter(transaction => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0);
      
      const expenses = monthlyTransactions
        .filter(transaction => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0);
      
      setMonthlyIncome(income);
      setMonthlyExpenses(expenses);
    }
  }, [transactions]);
  
  const handleOpenTransactionDialog = () => {
    setOpenTransactionDialog(true);
  };
  
  const handleCloseTransactionDialog = () => {
    setOpenTransactionDialog(false);
  };
  
  const handleViewAllTransactions = () => {
    navigate('/transactions');
  };
  
  const handleViewAllBudgets = () => {
    navigate('/budgets');
  };
  
  const loading = transactionsLoading || budgetsLoading || accountsLoading;
  
  const categoryData = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((acc: Record<string, number>, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {});
  
  const pieChartData = Object.keys(categoryData).map(category => ({
    x: category,
    y: categoryData[category]
  }));
  
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'primary.light',
                color: 'white'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography component="h2" variant="h6" color="inherit">
                  Total Balance
                </Typography>
                <AccountBalanceIcon />
              </Box>
              <Typography component="p" variant="h4" sx={{ mt: 2 }}>
                ${totalBalance.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Across {accounts.length} accounts
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'success.light',
                color: 'white'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography component="h2" variant="h6" color="inherit">
                  Monthly Income
                </Typography>
                <TrendingUpIcon />
              </Box>
              <Typography component="p" variant="h4" sx={{ mt: 2 }}>
                ${monthlyIncome.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                This month
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                bgcolor: 'error.light',
                color: 'white'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography component="h2" variant="h6" color="inherit">
                  Monthly Expenses
                </Typography>
                <TrendingDownIcon />
              </Box>
              <Typography component="p" variant="h4" sx={{ mt: 2 }}>
                ${monthlyExpenses.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                This month
              </Typography>
            </Paper>
          </Grid>
          
          {/* Spending by Category */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 360 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography component="h2" variant="h6" color="primary">
                  Spending by Category
                </Typography>
                <Button size="small" onClick={handleViewAllBudgets}>View All</Button>
              </Box>
              <Divider />
              <Box sx={{ height: 300, mt: 2 }}>
                {pieChartData.length > 0 ? (
                  <VictoryPie
                    data={pieChartData}
                    colorScale="qualitative"
                    innerRadius={70}
                    labelRadius={90}
                    style={{
                      labels: { fontSize: 12, fill: theme.palette.text.primary }
                    }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary">
                      No expense data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Budget Progress */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 360 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography component="h2" variant="h6" color="primary">
                  Budget Progress
                </Typography>
                <Button size="small" onClick={handleViewAllBudgets}>View All</Button>
              </Box>
              <Divider />
              <Box sx={{ height: 300, mt: 2 }}>
                {budgets.length > 0 ? (
                  <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={{ x: 20 }}
                    height={280}
                  >
                    <VictoryAxis
                      tickFormat={(x) => x}
                      style={{
                        tickLabels: { fontSize: 10, padding: 5, angle: -45 }
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      tickFormat={(x) => `$${x}`}
                    />
                    <VictoryBar
                      data={budgets.slice(0, 5).map(budget => ({
                        x: budget.name,
                        y: budget.currentSpending || 0,
                        label: `${((budget.currentSpending || 0) / budget.amount * 100).toFixed(0)}%`
                      }))}
                      style={{
                        data: { fill: theme.palette.primary.main }
                      }}
                    />
                  </VictoryChart>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary">
                      No budget data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Recent Transactions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography component="h2" variant="h6" color="primary">
                  Recent Transactions
                </Typography>
                <Box>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    sx={{ mr: 1 }}
                    onClick={handleOpenTransactionDialog}
                  >
                    Add
                  </Button>
                  <Button size="small" onClick={handleViewAllTransactions}>View All</Button>
                </Box>
              </Box>
              <Divider />
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <Box key={transaction._id} sx={{ py: 2, borderBottom: '1px solid #eee' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={6} md={4}>
                        <Typography variant="body1">{transaction.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(transaction.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} md={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          display: 'inline-block',
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          bgcolor: 'action.hover'
                        }}>
                          {transaction.category}
                        </Typography>
                      </Grid>
                      <Grid item xs={3} md={4} sx={{ textAlign: 'right' }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: transaction.type === 'income' ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="textSecondary">
                    No recent transactions
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <TransactionDialog 
        open={openTransactionDialog} 
        onClose={handleCloseTransactionDialog} 
      />
    </Container>
  );
};

export default Dashboard; 