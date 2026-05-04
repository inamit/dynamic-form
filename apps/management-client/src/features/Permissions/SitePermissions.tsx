import { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Select, MenuItem, Box, Typography, Alert, CircularProgress, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useSitePermissions } from '../../hooks/usePermissions';

export default function SitePermissions() {
    const { permissions, loading, error, operationError, addPermission, deletePermission } = useSitePermissions();
    const [origin, setOrigin] = useState('');
    const [entityName, setEntityName] = useState('');
    const [ability, setAbility] = useState('view');
    const [permissionToDelete, setPermissionToDelete] = useState<number | null>(null);

    const handleCreate = async () => {
        if (!origin || !entityName || !ability) return;
        await addPermission({ origin, entityName, ability });
        setOrigin('');
        setEntityName('');
        setAbility('view');
    };

    const handleDeleteConfirm = () => {
        if (permissionToDelete !== null) {
            deletePermission(permissionToDelete);
            setPermissionToDelete(null);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Site Permissions</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {operationError && <Alert severity="error">{operationError}</Alert>}
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

            {permissions.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>No site permissions found</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Add a new site permission above to get started.
                    </Typography>
                </Paper>
            ) : (
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
                aria-labelledby="delete-permission-dialog-title"
                aria-describedby="delete-permission-dialog-description"
            >
                <DialogTitle id="delete-permission-dialog-title">Delete Site Permission?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-permission-dialog-description">
                        Are you sure you want to delete this site permission? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPermissionToDelete(null)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
