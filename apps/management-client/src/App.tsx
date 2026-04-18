import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, CssBaseline, Box
} from '@mui/material';
import DataSourceList from './features/DataSource/DataSourceList';
import DataSourceForm from './features/DataSource/DataSourceForm';
import EntityList from './features/EntityEditor/EntityList';
import EntityForm from './features/EntityEditor/EntityForm';
import SitePermissions from './features/Permissions/SitePermissions';
import UserPermissions from './features/Permissions/UserPermissions';
import SideBar from './SideBar';

function App() {
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
        <SideBar />
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
