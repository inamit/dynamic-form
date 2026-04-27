import { useState } from 'react';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useEntities } from '../../hooks/useEntities';

export default function EntityList() {
  const { entities, loading, error, operationError, deleteEntity } = useEntities();
  const [entityToDelete, setEntityToDelete] = useState<{id: number, name: string} | null>(null);

  if (loading) return <CircularProgress />;

  const handleDeleteConfirm = () => {
    if (entityToDelete) {
      deleteEntity(entityToDelete.id);
      setEntityToDelete(null);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Entities</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {operationError && <Alert severity="error" sx={{ mb: 2 }}>{operationError}</Alert>}

      <Button variant="contained" component={Link} to="/entities/new" sx={{ mb: 2 }}>
        Add Entity
      </Button>

      {entities.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>No entities found</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Get started by creating a new entity to define your data models and endpoints.
          </Typography>
          <Button variant="outlined" component={Link} to="/entities/new">
            Create your first entity
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Data Source</TableCell>
                <TableCell>Fields Count</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entities.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.id}</TableCell>
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{(e as any).dataSource?.name || 'N/A'}</TableCell>
                  <TableCell>{e.fields?.length || 0}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button component={Link} to={`/entities/${e.id}`} size="small" color="primary">Edit</Button>
                      <Button size="small" color="secondary" onClick={() => window.open(`http://localhost:5174/?entity=${e.name}`, '_blank')}>Preview</Button>
                      <Button size="small" color="error" onClick={() => setEntityToDelete({ id: e.id!, name: e.name })}>Delete</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={Boolean(entityToDelete)}
        onClose={() => setEntityToDelete(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Entity?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the entity "{entityToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntityToDelete(null)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
