import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Select, MenuItem, Box, Typography } from '@mui/material';

const API_BASE = 'http://localhost:3002/api';

export default function UserPermissions() {
    const [permissions, setPermissions] = useState<any[]>([]);
    const [userId, setUserId] = useState('');
    const [entityName, setEntityName] = useState('');
    const [ability, setAbility] = useState('view');
    const [geography, setGeography] = useState('');
    const [fieldValue, setFieldValue] = useState('');

    const fetchPermissions = async () => {
        try {
            const res = await axios.get(`${API_BASE}/user-permissions`);
            setPermissions(res.data);
        } catch (e) {
            console.error('Failed to fetch user permissions', e);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleCreate = async () => {
        if (!userId || !entityName || !ability) return;
        try {
            await axios.post(`${API_BASE}/user-permissions`, {
                userId, entityName, ability,
                geography: geography || null,
                fieldValue: fieldValue || null
            });
            setUserId('');
            setEntityName('');
            setAbility('view');
            setGeography('');
            setFieldValue('');
            fetchPermissions();
        } catch (e) {
            console.error('Failed to create user permission', e);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${API_BASE}/user-permissions/${id}`);
            fetchPermissions();
        } catch (e) {
            console.error('Failed to delete user permission', e);
        }
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>User Permissions</Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <TextField label="User ID" value={userId} onChange={e => setUserId(e.target.value)} size="small" />
                <TextField label="Entity Name" value={entityName} onChange={e => setEntityName(e.target.value)} size="small" />
                <Select value={ability} onChange={e => setAbility(e.target.value)} size="small">
                    <MenuItem value="view">View</MenuItem>
                    <MenuItem value="create">Create</MenuItem>
                    <MenuItem value="edit">Edit</MenuItem>
                    <MenuItem value="delete">Delete</MenuItem>
                </Select>
                <TextField label="Geography (opt)" value={geography} onChange={e => setGeography(e.target.value)} size="small" />
                <TextField label="Field Value (opt)" value={fieldValue} onChange={e => setFieldValue(e.target.value)} size="small" />
                <Button variant="contained" onClick={handleCreate}>Add</Button>
            </Box>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>User ID</TableCell>
                        <TableCell>Entity</TableCell>
                        <TableCell>Ability</TableCell>
                        <TableCell>Geography</TableCell>
                        <TableCell>Field Value</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {permissions.map(p => (
                        <TableRow key={p.id}>
                            <TableCell>{p.id}</TableCell>
                            <TableCell>{p.userId}</TableCell>
                            <TableCell>{p.entityName}</TableCell>
                            <TableCell>{p.ability}</TableCell>
                            <TableCell>{p.geography}</TableCell>
                            <TableCell>{p.fieldValue}</TableCell>
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
