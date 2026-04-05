import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Select, MenuItem, Box, Typography } from '@mui/material';

const API_BASE = 'http://localhost:3002/api';

export default function SitePermissions() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [origin, setOrigin] = useState('');
    const [entityName, setEntityName] = useState('');
    const [ability, setAbility] = useState('view');

    const fetchPermissions = async () => {
        try {
            const res = await axios.get(`${API_BASE}/site-permissions`);
            setPermissions(res.data);
        } catch (e) {
            console.error('Failed to fetch site permissions', e);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleCreate = async () => {
        if (!origin || !entityName || !ability) return;
        try {
            await axios.post(`${API_BASE}/site-permissions`, { origin, entityName, ability });
            setOrigin('');
            setEntityName('');
            setAbility('view');
            fetchPermissions();
        } catch (e) {
            console.error('Failed to create site permission', e);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_BASE}/site-permissions/${id}`);
            fetchPermissions();
        } catch (e) {
            console.error('Failed to delete site permission', e);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Site Permissions</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <TextField label="Origin" value={origin} onChange={e => setOrigin(e.target.value)} size="small" />
                <TextField label="Entity Name" value={entityName} onChange={e => setEntityName(e.target.value)} size="small" />
                <Select value={ability} onChange={e => setAbility(e.target.value)} size="small">
                    <MenuItem value="view">View</MenuItem>
                    <MenuItem value="create">Create</MenuItem>
                    <MenuItem value="edit">Edit</MenuItem>
                    <MenuItem value="delete">Delete</MenuItem>
                </Select>
                <Button variant="contained" onClick={handleCreate}>Add</Button>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Origin</TableCell>
                        <TableCell>Entity Name</TableCell>
                        <TableCell>Ability</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {permissions.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>{p.id}</TableCell>
                            <TableCell>{p.origin}</TableCell>
                            <TableCell>{p.entityName}</TableCell>
                            <TableCell>{p.ability}</TableCell>
                            <TableCell>
                                <Button color="error" onClick={() => handleDelete(p.id)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}
