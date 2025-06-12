import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  Badge,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  PieChart as PieChartIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Savings as SavingsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    padding: theme.spacing(2),
  },
}));

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{
  open?: boolean;
}>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

const Layout: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };
  
  const handleProfile = () => {
    navigate('/settings');
    handleClose();
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/transactions' },
    { text: 'Budgets', icon: <SavingsIcon />, path: '/budgets' },
    { text: 'Accounts', icon: <AccountBalanceIcon />, path: '/accounts' },
    { text: 'Analytics', icon: <PieChartIcon />, path: '/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Finance Tracker
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Notifications">
                <IconButton
                  size="large"
                  aria-label="notifications"
                  aria-controls="menu-notifications"
                  aria-haspopup="true"
                  onClick={handleNotificationMenu}
                  color="inherit"
                  sx={{ mr: 1 }}
                >
                  <StyledBadge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </StyledBadge>
                </IconButton>
              </Tooltip>
              
              <Menu
                id="menu-notifications"
                anchorEl={notificationAnchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(notificationAnchorEl)}
                onClose={handleNotificationClose}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 3,
                  sx: { 
                    width: 320,
                    maxHeight: 360,
                    borderRadius: 2,
                    mt: 1.5
                  }
                }}
              >
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
                </Box>
                <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} color="primary.main">
                      Budget Alert
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your "Groceries" budget is at 85% of its limit
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} color="primary.main">
                      New Transaction
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      A new transaction of $45.99 was recorded
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleNotificationClose} sx={{ py: 1.5 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500} color="primary.main">
                      Account Connected
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your bank account was successfully connected
                    </Typography>
                  </Box>
                </MenuItem>
                <Box sx={{ p: 1.5, borderTop: '1px solid rgba(0, 0, 0, 0.06)', textAlign: 'center' }}>
                  <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                    View all notifications
                  </Typography>
                </Box>
              </Menu>
              
              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <Avatar sx={{ 
                    bgcolor: theme.palette.secondary.main,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                TransitionComponent={Fade}
                PaperProps={{
                  elevation: 3,
                  sx: { 
                    minWidth: 180,
                    borderRadius: 2,
                    mt: 1.5
                  }
                }}
              >
                <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <Avatar sx={{ 
                    width: 56, 
                    height: 56, 
                    mx: 'auto', 
                    mb: 1,
                    bgcolor: theme.palette.secondary.main,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={600}>{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
                <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, ml: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Finance Tracker
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <Box sx={{ p: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isSelected = location.pathname === item.path;
              
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    selected={isSelected}
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 2,
                      py: 1,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{ 
                        fontWeight: isSelected ? 600 : 400,
                      }} 
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
              <Avatar sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: theme.palette.secondary.main,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {user.name.charAt(0)}
              </Avatar>
              <Box sx={{ ml: 2 }}>
                <Typography variant="body2" fontWeight={500}>
                  {user.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
};

export default Layout; 