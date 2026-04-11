import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { useEntities } from '../../hooks/useEntities';

export default function EntityList() {
  const { entities, loading, error, operationError, deleteEntity } = useEntities();

  if (loading) return <CircularProgress />;

  return (
    <div>
      <Typography variant="h4" gutterBottom>Entities</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {operationError && <Alert severity="error" sx={{ mb: 2 }}>{operationError}</Alert>}

      <Button variant="contained" component={Link} to="/entities/new" sx={{ mb: 2 }}>
        Add Entity
      </Button>
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
                  <Button component={Link} to={`/entities/${e.id}`} size="small" color="primary">Edit</Button>
                  <Button size="small" color="secondary" onClick={() => window.open(`http://localhost:5174/?entity=${e.name}`, '_blank')}>Preview</Button>
                  <Button size="small" color="error" onClick={() => deleteEntity(e.id!)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
