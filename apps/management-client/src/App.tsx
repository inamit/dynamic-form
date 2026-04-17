import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText,
  CssBaseline, Box, ListItemButton, ListItemIcon, Collapse
} from '@mui/material';
import {
  Storage as StorageIcon,
  Dataset as DatasetIcon,
  Security as SecurityIcon,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings as AdminIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import DataSourceList from './features/DataSource/DataSourceList';
import DataSourceForm from './features/DataSource/DataSourceForm';
import EntityList from './features/EntityEditor/EntityList';
import EntityForm from './features/EntityEditor/EntityForm';
import SitePermissions from './features/Permissions/SitePermissions';
import UserPermissions from './features/Permissions/UserPermissions';

const drawerWidth = 260;

function App() {
  const [openPermissions, setOpenPermissions] = useState(false);

  const handlePermissionsClick = () => {
    setOpenPermissions(!openPermissions);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', letterSpacing: 1 }}>
              MANAGEMENT CLIENT
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <List sx={{ px: 2 }}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton component={Link} to="/entities" sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <DatasetIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Entities" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton component={Link} to="/data-sources" sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <StorageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Data Sources" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton onClick={handlePermissionsClick} sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Permissions" />
                  {openPermissions ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              </ListItem>

              <Collapse in={openPermissions} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 3 }}>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton component={Link} to="/permissions/site" sx={{ borderRadius: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <PublicIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Site" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemButton component={Link} to="/permissions/user" sx={{ borderRadius: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <AdminIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="User" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Collapse>
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Routes>
            <Route path="/entities" element={<EntityList />} />
            <Route path="/entities/new" element={<EntityForm />} />
            <Route path="/entities/:id" element={<EntityForm />} />
            <Route path="/data-sources" element={<DataSourceList />} />
            <Route path="/data-sources/new" element={<DataSourceForm />} />
            <Route path="/data-sources/:id" element={<DataSourceForm />} />
            <Route path="/permissions/site" element={<SitePermissions />} />
            <Route path="/permissions/user" element={<UserPermissions />} />
            <Route path="/" element={<Typography paragraph>Select an option from the menu.</Typography>} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
