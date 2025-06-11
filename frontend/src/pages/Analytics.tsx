import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { 
  VictoryPie, 
  VictoryChart, 
  VictoryBar, 
  VictoryAxis, 
  VictoryTheme,
  VictoryLine,
  VictoryTooltip,
  VictoryLegend
} from 'victory';
import { getTransactions } from '../redux/slices/transactionSlice';
import { RootState } from '../redux/store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `analytics-tab-${index}`,
    'aria-controls': `analytics-tabpanel-${index}`,
  };
};

const Analytics = () => {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector((state: RootState) => state.transactions);
  
  const [timeRange, setTimeRange] = useState('month');
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const endDate = new Date().toISOString();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString();
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString();
        break;
      case 'quarter':
        const quarterAgo = new Date();
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        startDate = quarterAgo.toISOString();
        break;
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        startDate = yearAgo.toISOString();
        break;
      default:
        const defaultMonthAgo = new Date();
        defaultMonthAgo.setMonth(defaultMonthAgo.getMonth() - 1);
        startDate = defaultMonthAgo.toISOString();
    }
    
    dispatch(getTransactions({ startDate, endDate }));
  }, [dispatch, timeRange]);
  
  const handleTimeRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTimeRange(event.target.value as string);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Process data for category spending chart
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
    y: categoryData[category],
    label: `${category}: $${categoryData[category].toFixed(2)}`
  }));
  
  // Process data for income vs expenses chart
  const incomeVsExpenseData = transactions.reduce((acc: Record<string, Record<string, number>>, transaction) => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString('default', { month: 'short' });
    
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else if (transaction.type === 'expense') {
      acc[month].expense += transaction.amount;
    }
    
    return acc;
  }, {});
  
  const incomeData = Object.entries(incomeVsExpenseData).map(([month, data]) => ({
    x: month,
    y: data.income
  }));
  
  const expenseData = Object.entries(incomeVsExpenseData).map(([month, data]) => ({
    x: month,
    y: data.expense
  }));
  
  // Process data for daily spending chart
  const dailySpendingData = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((acc: Record<string, number>, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += transaction.amount;
      return acc;
    }, {});
  
  const dailyChartData = Object.entries(dailySpendingData)
    .map(([date, amount]) => ({
      x: new Date(date),
      y: amount
    }))
    .sort((a, b) => a.x.getTime() - b.x.getTime());
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange as any}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="quarter">Last Quarter</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
              <Tab label="Spending by Category" {...a11yProps(0)} />
              <Tab label="Income vs Expenses" {...a11yProps(1)} />
              <Tab label="Daily Spending" {...a11yProps(2)} />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Paper sx={{ p: 2, height: 500 }}>
              <Typography variant="h6" gutterBottom>
                Spending by Category
              </Typography>
              {pieChartData.length > 0 ? (
                <VictoryPie
                  data={pieChartData}
                  colorScale="qualitative"
                  innerRadius={70}
                  labelRadius={90}
                  style={{
                    labels: { fontSize: 12, fill: "#000000" }
                  }}
                  labelComponent={<VictoryTooltip />}
                  height={400}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No expense data available for the selected time period
                  </Typography>
                </Box>
              )}
            </Paper>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 2, height: 500 }}>
              <Typography variant="h6" gutterBottom>
                Income vs Expenses
              </Typography>
              {incomeData.length > 0 ? (
                <VictoryChart
                  theme={VictoryTheme.material}
                  domainPadding={{ x: 20 }}
                  height={400}
                >
                  <VictoryLegend
                    x={125} y={10}
                    orientation="horizontal"
                    gutter={20}
                    data={[
                      { name: "Income", symbol: { fill: "#4caf50" } },
                      { name: "Expenses", symbol: { fill: "#f44336" } }
                    ]}
                  />
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
                    data={incomeData}
                    style={{ data: { fill: "#4caf50" } }}
                    barWidth={20}
                    x="x"
                    y="y"
                    labelComponent={<VictoryTooltip />}
                  />
                  <VictoryBar
                    data={expenseData}
                    style={{ data: { fill: "#f44336" } }}
                    barWidth={20}
                    x="x"
                    y="y"
                    labelComponent={<VictoryTooltip />}
                  />
                </VictoryChart>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No data available for the selected time period
                  </Typography>
                </Box>
              )}
            </Paper>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 2, height: 500 }}>
              <Typography variant="h6" gutterBottom>
                Daily Spending
              </Typography>
              {dailyChartData.length > 0 ? (
                <VictoryChart
                  theme={VictoryTheme.material}
                  scale={{ x: "time" }}
                  height={400}
                >
                  <VictoryAxis
                    tickFormat={(x) => new Date(x).toLocaleDateString()}
                    style={{
                      tickLabels: { fontSize: 10, padding: 5, angle: -45 }
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(x) => `$${x}`}
                  />
                  <VictoryLine
                    data={dailyChartData}
                    style={{
                      data: { stroke: "#1976d2", strokeWidth: 2 }
                    }}
                  />
                </VictoryChart>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                  <Typography variant="body1" color="text.secondary">
                    No expense data available for the selected time period
                  </Typography>
                </Box>
              )}
            </Paper>
          </TabPanel>
        </Box>
      )}
    </Container>
  );
};

export default Analytics; 