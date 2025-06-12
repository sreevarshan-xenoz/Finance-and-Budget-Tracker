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
  useTheme,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { VictoryPie, VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory';
import { getTransactions } from '../redux/slices/transactionSlice';
import { getBudgets } from '../redux/slices/budgetSlice';
import { getAccounts } from '../redux/slices/accountSlice';
import { RootState } from '../redux/store';
import TransactionDialog from '../components/transactions/TransactionDialog';
import { AnyAction } from '@reduxjs/toolkit';

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
    dispatch(getTransactions({ limit: 5 }) as unknown as AnyAction);
    dispatch(getBudgets() as unknown as AnyAction);
    dispatch(getAccounts() as unknown as AnyAction);
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

  // Calculate net savings
  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRatio = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: 160,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  opacity: 0.9,
                }}
              />
              <CardContent sx={{ position: 'relative', height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    Total Balance
                  </Typography>
                  <AccountBalanceIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                  ${totalBalance.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Across {accounts.length} accounts
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: 0.5 }}>
                    View Details
                  </Typography>
                  <ArrowForwardIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: 160,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  opacity: 0.9,
                }}
              />
              <CardContent sx={{ position: 'relative', height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    Monthly Income
                  </Typography>
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                  ${monthlyIncome.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  This month
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: 0.5 }}>
                    View Details
                  </Typography>
                  <ArrowForwardIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: 160,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                  opacity: 0.9,
                }}
              />
              <CardContent sx={{ position: 'relative', height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    Monthly Expenses
                  </Typography>
                  <TrendingDownIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                  ${monthlyExpenses.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  This month
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: 0.5 }}>
                    View Details
                  </Typography>
                  <ArrowForwardIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: 160,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                  opacity: 0.9,
                }}
              />
              <CardContent sx={{ position: 'relative', height: '100%', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    Net Savings
                  </Typography>
                  <AttachMoneyIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                  ${netSavings.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {savingsRatio.toFixed(0)}% of income
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', mr: 0.5 }}>
                    View Details
                  </Typography>
                  <ArrowForwardIcon sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Spending by Category */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.primary" fontWeight={600}>
                    Spending by Category
                  </Typography>
                  <Box>
                    <Tooltip title="More options">
                      <IconButton size="small">
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ height: 300, mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {pieChartData.length > 0 ? (
                    <VictoryPie
                      data={pieChartData}
                      colorScale={[
                        theme.palette.primary.main,
                        theme.palette.secondary.main,
                        theme.palette.success.main,
                        theme.palette.warning.main,
                        theme.palette.error.main,
                        theme.palette.info.main,
                        alpha(theme.palette.primary.main, 0.7),
                        alpha(theme.palette.secondary.main, 0.7),
                        alpha(theme.palette.success.main, 0.7),
                      ]}
                      innerRadius={70}
                      labelRadius={90}
                      style={{
                        labels: { 
                          fontSize: 12, 
                          fill: theme.palette.text.primary,
                          fontWeight: 500
                        }
                      }}
                      animate={{
                        duration: 1000,
                        easing: "bounce"
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No expense data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Budget Progress */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.primary" fontWeight={600}>
                    Budget Progress
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={handleViewAllBudgets}
                    endIcon={<ArrowForwardIcon />}
                  >
                    View All
                  </Button>
                </Box>
                <Divider />
                <Box sx={{ height: 300, mt: 3 }}>
                  {budgets.length > 0 ? (
                    <VictoryChart
                      theme={VictoryTheme.material}
                      domainPadding={{ x: 20 }}
                      height={280}
                      animate={{
                        duration: 500,
                        onLoad: { duration: 500 }
                      }}
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
                          budget: budget.amount,
                          label: `${((budget.currentSpending || 0) / budget.amount * 100).toFixed(0)}%`
                        }))}
                        style={{
                          data: { 
                            fill: ({ datum }) => {
                              const percentage = (datum.y / datum.budget) * 100;
                              return percentage > 90 
                                ? theme.palette.error.main 
                                : percentage > 70 
                                  ? theme.palette.warning.main 
                                  : theme.palette.primary.main;
                            },
                            width: 20
                          },
                          labels: { fontSize: 10, fontWeight: 'bold' }
                        }}
                        cornerRadius={{ top: 4 }}
                        labels={({ datum }) => `${((datum.y / datum.budget) * 100).toFixed(0)}%`}
                        labelComponent={<VictoryLabel dy={-10} />}
                      />
                    </VictoryChart>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No budget data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Transactions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="text.primary" fontWeight={600}>
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
                    <Button 
                      size="small" 
                      onClick={handleViewAllTransactions}
                      endIcon={<ArrowForwardIcon />}
                    >
                      View All
                    </Button>
                  </Box>
                </Box>
                <Divider />
                
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <Box 
                      key={transaction._id} 
                      sx={{ 
                        py: 2, 
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        '&:last-child': {
                          borderBottom: 'none'
                        },
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.01)'
                        }
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={6} md={4}>
                          <Typography variant="body1" fontWeight={500}>{transaction.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </Typography>
                        </Grid>
                        <Grid item xs={3} md={4} sx={{ textAlign: 'center' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              display: 'inline-block',
                              px: 1.5, 
                              py: 0.5, 
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 500
                            }}
                          >
                            {transaction.category}
                          </Typography>
                        </Grid>
                        <Grid item xs={3} md={4} sx={{ textAlign: 'right' }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: transaction.type === 'income' ? theme.palette.success.main : theme.palette.error.main,
                              fontWeight: 600
                            }}
                          >
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </Typography>
                          {transaction.notes && (
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150, display: 'block', ml: 'auto' }}>
                              {transaction.notes}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      No recent transactions
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />} 
                      sx={{ mt: 2 }}
                      onClick={handleOpenTransactionDialog}
                    >
                      Add Transaction
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
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