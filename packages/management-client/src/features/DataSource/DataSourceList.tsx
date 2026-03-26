import { useEffect, useState } from "react";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface DataSource {
  id: number;
  name: string;
  apiUrl: string;
  apiType: string;
}

export default function DataSourceList() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);

  useEffect(() => {
    fetchDataSources();
  }, []);

  const fetchDataSources = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/data-sources');
      setDataSources(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/data-sources/${id}`);
      fetchDataSources();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Data Sources</Typography>
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
                  <Button size="small" color="error" onClick={() => handleDelete(ds.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
