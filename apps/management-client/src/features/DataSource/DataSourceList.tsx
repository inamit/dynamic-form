import { useState } from 'react';
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDataSources } from '../../hooks/useDataSources';

export default function DataSourceList() {
  const { dataSources, loading, error, operationError, deleteDataSource } = useDataSources();
  const [dataSourceToDelete, setDataSourceToDelete] = useState<{id: number, name: string} | null>(null);

  if (loading) return <CircularProgress />;

  const handleDeleteConfirm = () => {
    if (dataSourceToDelete) {
      deleteDataSource(dataSourceToDelete.id);
      setDataSourceToDelete(null);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Data Sources</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {operationError && <Alert severity="error" sx={{ mb: 2 }}>{operationError}</Alert>}

      <Button variant="contained" component={Link} to="/data-sources/new" sx={{ mb: 2 }}>
        Add Data Source
      </Button>

      {dataSources.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>No data sources found</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Get started by adding a data source to fetch and manage data for your entities.
          </Typography>
          <Button variant="outlined" component={Link} to="/data-sources/new">
            Add your first data source
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataSources.map((ds) => (
                <TableRow key={ds.id}>
                  <TableCell>{ds.id}</TableCell>
                  <TableCell>{ds.name}</TableCell>
                  <TableCell>{ds.apiUrl}</TableCell>
                  <TableCell>{ds.apiType}</TableCell>
                  <TableCell>
                    <Button component={Link} to={`/data-sources/${ds.id}`} size="small" color="primary">Edit</Button>
                    <Button size="small" color="error" onClick={() => setDataSourceToDelete({ id: ds.id!, name: ds.name })}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={Boolean(dataSourceToDelete)}
        onClose={() => setDataSourceToDelete(null)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Data Source?</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the data source "{dataSourceToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDataSourceToDelete(null)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
