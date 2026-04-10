import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText, CssBaseline, Box, ListItemButton } from '@mui/material';
import DataSourceList from './features/DataSource/DataSourceList';
import DataSourceForm from './features/DataSource/DataSourceForm';
import EntityList from './features/EntityEditor/EntityList';
import EntityForm from './features/EntityEditor/EntityForm';
import SitePermissions from './features/Permissions/SitePermissions';
import UserPermissions from './features/Permissions/UserPermissions';

const drawerWidth = 240;

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              Management Client
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
          <Box sx={{ overflow: 'auto' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/entities">
                  <ListItemText primary="Entities" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/data-sources">
                  <ListItemText primary="Data Sources" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/permissions/site">
                  <ListItemText primary="Site Permissions" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/permissions/user">
                  <ListItemText primary="User Permissions" />
                </ListItemButton>
              </ListItem>
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
