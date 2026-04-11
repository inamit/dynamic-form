import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Alert, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDataSources } from '../../hooks/useDataSources';

export default function DataSourceList() {
  const { dataSources, loading, error, operationError, deleteDataSource } = useDataSources();

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>Data Sources</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {operationError && <Alert severity="error" sx={{ mb: 2 }}>{operationError}</Alert>}

      <Button variant="contained" component={Link} to="/data-sources/new" sx={{ mb: 2 }}>
        Add Data Source
      </Button>
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
                  <Button size="small" color="error" onClick={() => deleteDataSource(ds.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
