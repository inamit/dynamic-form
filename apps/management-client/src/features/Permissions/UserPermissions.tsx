import { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Select, MenuItem, Box, Typography, Alert, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useUserPermissions } from '../../hooks/usePermissions';

export default function UserPermissions() {
    const { permissions, loading, error, operationError, addPermission, deletePermission } = useUserPermissions();
    const [userId, setUserId] = useState('');
    const [entityName, setEntityName] = useState('');
    const [ability, setAbility] = useState('view');
    const [geography, setGeography] = useState('');
    const [fieldValue, setFieldValue] = useState('');
    const [permissionToDelete, setPermissionToDelete] = useState<number | string | null>(null);

    const handleCreate = async () => {
        if (!userId || !entityName || !ability) return;
        await addPermission({
            userId,
            entityName,
            ability,
            geography: geography || null,
            fieldValue: fieldValue || null
        });
        setUserId('');
        setEntityName('');
        setAbility('view');
        setGeography('');
        setFieldValue('');
    };

    const handleDeleteConfirm = async () => {
        if (permissionToDelete !== null) {
            await deletePermission(permissionToDelete as number);
            setPermissionToDelete(null);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>User Permissions</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {operationError && <Alert severity="error">{operationError}</Alert>}
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

            {permissions.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>No user permissions found</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Get started by adding a user permission above to control access.
                    </Typography>
                </Paper>
            ) : (
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
                                    <Button color="error" onClick={() => setPermissionToDelete(p.id)}>Delete</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Dialog
                open={permissionToDelete !== null}
                onClose={() => setPermissionToDelete(null)}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">Delete User Permission?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to delete this user permission? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPermissionToDelete(null)} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
