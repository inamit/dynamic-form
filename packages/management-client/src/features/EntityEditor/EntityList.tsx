import { useEffect, useState } from "react";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function EntityList() {
  const [entities, setEntities] = useState<any[]>([]);

  useEffect(() => {
    fetchEntities();
  }, []);

  const fetchEntities = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/config');
      setEntities(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/config/${id}`);
      fetchEntities();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Entities</Typography>
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
                <TableCell>{e.dataSource?.name || 'N/A'}</TableCell>
                <TableCell>{e.fields?.length || 0}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/entities/${e.id}`} size="small" color="primary">Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(e.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
