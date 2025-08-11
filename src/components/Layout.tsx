import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Box,
  Container,
  Switch,
  FormControlLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
  Tooltip,
  Badge,
  Chip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
  Search as SearchIcon,
  LocalHospital,
  Security,
  Storage,
  Analytics,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import SearchBar from './SearchBar';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`healthcare-tabpanel-${index}`}
      aria-labelledby={`healthcare-tab-${index}`}
      {...other}
    >
      {value === index && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Box sx={{ py: 3 }}>{children}</Box>
        </motion.div>
      )}
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { darkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const tabs = [
    {
      label: 'Clean Room Setup',
      icon: <Security />,
      description: 'Federation Management',
    },
    {
      label: 'Data Ingestion',
      icon: <Storage />,
      description: 'Push Healthcare Data',
    },
    {
      label: 'Exploration Dashboard',
      icon: <Analytics />,
      description: 'Analyze Merged Data',
    },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'var(--gradient-surface)' }}>
      {/* AppBar with gradient background and glassmorphism */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'var(--gradient-primary)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo and Title with animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ display: 'flex', alignItems: 'center', marginRight: 24 }}
          >
            <LocalHospital sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #ffffff, #e3f2fd)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Healthcare Data Clean Room Elite
            </Typography>
          </motion.div>

          <Box sx={{ flexGrow: 1 }} />

          {/* Connection Status */}
          <Tooltip title={isOnline ? 'Connected to API' : 'API Offline'}>
            <Chip
              label={isOnline ? 'ONLINE' : 'OFFLINE'}
              color={isOnline ? 'success' : 'error'}
              size="small"
              sx={{ mr: 2, fontWeight: 600 }}
            />
          </Tooltip>

          {/* Search Bar */}
          <SearchBar />

          {/* Theme Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              sx={{ ml: 1 }}
              onClick={toggleTheme}
              color="inherit"
            >
              <motion.div
                key={darkMode ? 'dark' : 'light'}
                initial={{ rotate: 180, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </motion.div>
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Navigation Tabs */}
        {!isMobile && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Container maxWidth="xl">
              <Tabs
                value={activeTab}
                onChange={onTabChange}
                aria-label="healthcare tabs"
                sx={{
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    background: 'linear-gradient(90deg, #ffffff, #e3f2fd)',
                  },
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    icon={tab.icon}
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {tab.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tab.description}
                        </Typography>
                      </Box>
                    }
                    id={`healthcare-tab-${index}`}
                    aria-controls={`healthcare-tabpanel-${index}`}
                    sx={{
                      minHeight: 80,
                      textTransform: 'none',
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-selected': {
                        color: 'white',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Container>
          </Box>
        )}
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Box sx={{ width: 280 }}>
          <List>
            {tabs.map((tab, index) => (
              <ListItem
                key={index}
                onClick={() => {
                  onTabChange({} as any, index);
                  handleDrawerToggle();
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ mr: 2 }}>{tab.icon}</Box>
                <ListItemText
                  primary={tab.label}
                  secondary={tab.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 0 }}>
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          py: 2,
          px: 3,
          borderTop: '1px solid',
          borderColor: 'divider',
          background: darkMode
            ? 'linear-gradient(135deg, hsl(210, 11%, 12%) 0%, hsl(210, 11%, 9%) 100%)'
            : 'linear-gradient(135deg, hsl(0, 0%, 100%) 0%, hsl(210, 11%, 96%) 100%)',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © 2024 Healthcare Data Clean Room Elite v2.1.0
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography
                variant="body2"
                component="a"
                href="#"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Documentation
              </Typography>
              <Typography
                variant="body2"
                component="a"
                href="#"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                API Reference
              </Typography>
              <Typography
                variant="body2"
                component="a"
                href="#"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Privacy Policy
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export { TabPanel };
export default Layout;