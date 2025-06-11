import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { logout } from '../redux/slices/authSlice';
import { RootState } from '../redux/store';

const Settings = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Profile form
  const profileForm = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required')
    }),
    onSubmit: (values) => {
      // In a real app, dispatch an action to update the user profile
      console.log('Update profile:', values);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
  });
  
  // Password form
  const passwordForm = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password')
    }),
    onSubmit: (values) => {
      // In a real app, dispatch an action to change the password
      console.log('Change password:', values);
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
      passwordForm.resetForm();
    }
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    budgetAlerts: true,
    weeklyReports: true,
    newFeatures: false
  });
  
  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked
    });
  };
  
  // Account deletion
  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };
  
  const handleDeleteAccount = () => {
    // In a real app, dispatch an action to delete the account
    console.log('Delete account');
    handleCloseDeleteDialog();
    dispatch(logout());
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {profileSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Profile updated successfully!
              </Alert>
            )}
            
            <Box component="form" onSubmit={profileForm.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={profileForm.values.name}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.touched.name && Boolean(profileForm.errors.name)}
                    helperText={profileForm.touched.name && profileForm.errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    value={profileForm.values.email}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.touched.email && Boolean(profileForm.errors.email)}
                    helperText={profileForm.touched.email && profileForm.errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Update Profile'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          
          {/* Password Settings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Password changed successfully!
              </Alert>
            )}
            
            <Box component="form" onSubmit={passwordForm.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="currentPassword"
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    value={passwordForm.values.currentPassword}
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    error={passwordForm.touched.currentPassword && Boolean(passwordForm.errors.currentPassword)}
                    helperText={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="newPassword"
                    name="newPassword"
                    label="New Password"
                    type="password"
                    value={passwordForm.values.newPassword}
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    error={passwordForm.touched.newPassword && Boolean(passwordForm.errors.newPassword)}
                    helperText={passwordForm.touched.newPassword && passwordForm.errors.newPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    value={passwordForm.values.confirmPassword}
                    onChange={passwordForm.handleChange}
                    onBlur={passwordForm.handleBlur}
                    error={passwordForm.touched.confirmPassword && Boolean(passwordForm.errors.confirmPassword)}
                    helperText={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Change Password'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive emails about account activity" 
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="emailNotifications"
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Budget Alerts" 
                  secondary="Get notified when you're approaching budget limits" 
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="budgetAlerts"
                    checked={notifications.budgetAlerts}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Weekly Reports" 
                  secondary="Receive weekly spending summaries" 
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="weeklyReports"
                    checked={notifications.weeklyReports}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="New Features" 
                  secondary="Get updates about new app features" 
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    name="newFeatures"
                    checked={notifications.newFeatures}
                    onChange={handleNotificationChange}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
          
          {/* Account Settings */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={handleLogout}
              >
                Log Out
              </Button>
              
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleOpenDeleteDialog}
              >
                Delete Account
              </Button>
            </Box>
            
            <Dialog
              open={openDeleteDialog}
              onClose={handleCloseDeleteDialog}
            >
              <DialogTitle>Delete Account?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This action cannot be undone. All your data, including transactions, budgets, and account information will be permanently deleted.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                <Button onClick={handleDeleteAccount} color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings; 