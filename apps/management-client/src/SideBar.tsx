import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemText, Box, ListItemButton, ListItemIcon, Collapse, Toolbar
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

const drawerWidth = 260;

export default function SideBar() {
  const [openPermissions, setOpenPermissions] = useState(false);

  const handlePermissionsClick = () => {
    setOpenPermissions(!openPermissions);
  };

  return (
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
  );
}
