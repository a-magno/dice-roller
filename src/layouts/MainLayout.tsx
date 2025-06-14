import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, IconButton, Typography, CssBaseline, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 240;

const navItems = [
  { text: 'Home', path: '/', icon: <HomeIcon /> },
  { text: 'My Sheets', path: '/sheets', icon: <ArticleIcon /> },
  { text: 'Library', path: '/library', icon: <PhotoLibraryIcon /> },
  { text: 'Docs', path: '/docs', icon: <HelpCenterIcon /> },
];

export function MainLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ my: 2 }}>
            SheetForge
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton component={NavLink} to={item.path} sx={{ '&.active': { backgroundColor: 'action.selected' } }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
       <List>
           <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/profile" sx={{ '&.active': { backgroundColor: 'action.selected' } }}>
                  <ListItemIcon><AccountCircleIcon /></ListItemIcon>
                  <ListItemText primary="Profile" />
              </ListItemButton>
          </ListItem>
       </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav" position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SheetForge
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={isDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
