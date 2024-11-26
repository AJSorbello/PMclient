'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  Build as ToolIcon,
  Category as MaterialIcon,
} from '@mui/icons-material';

interface Resource {
  id: string;
  name: string;
  type: 'human' | 'material' | 'tool';
  description: string;
  quantity: number;
  unit: string;
  status: 'available' | 'in-use' | 'unavailable';
  assignedTo?: string;
  cost: number;
}

export default function ResourcesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [newResource, setNewResource] = useState({
    name: '',
    type: 'material' as const,
    description: '',
    quantity: 1,
    unit: '',
    status: 'available' as const,
    assignedTo: '',
    cost: 0,
  });

  const units = {
    human: ['hours', 'days', 'months'],
    material: ['pieces', 'kg', 'liters', 'm²', 'm³'],
    tool: ['pieces', 'sets'],
  };

  useEffect(() => {
    fetchResources();
  }, [projectId]);

  const fetchResources = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/resources`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = `/api/projects/${projectId}/resources${
        editingResource ? `/${editingResource.id}` : ''
      }`;
      const method = editingResource ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingResource || newResource),
      });

      if (!response.ok) throw new Error('Failed to save resource');

      await fetchResources();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/resources/${resourceId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete resource');

      await fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingResource(null);
    setNewResource({
      name: '',
      type: 'material',
      description: '',
      quantity: 1,
      unit: '',
      status: 'available',
      assignedTo: '',
      cost: 0,
    });
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setOpenDialog(true);
  };

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'human':
        return <PersonIcon />;
      case 'tool':
        return <ToolIcon />;
      default:
        return <MaterialIcon />;
    }
  };

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in-use':
        return 'warning';
      default:
        return 'error';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Resources</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Resource
        </Button>
      </Box>

      <Grid container spacing={3}>
        {resources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getTypeIcon(resource.type)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {resource.name}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditResource(resource)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography color="text.secondary" gutterBottom>
                  {resource.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={`${resource.quantity} ${resource.unit}`}
                    variant="outlined"
                  />
                  <Chip
                    label={resource.status}
                    color={getStatusColor(resource.status)}
                  />
                </Box>

                {resource.assignedTo && (
                  <Typography variant="body2" color="text.secondary">
                    Assigned to: {resource.assignedTo}
                  </Typography>
                )}

                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  ${resource.cost.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingResource ? 'Edit Resource' : 'Add Resource'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={editingResource?.name || newResource.name}
              onChange={(e) => editingResource
                ? setEditingResource({ ...editingResource, name: e.target.value })
                : setNewResource({ ...newResource, name: e.target.value })
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={editingResource?.type || newResource.type}
                onChange={(e) => {
                  const type = e.target.value as Resource['type'];
                  if (editingResource) {
                    setEditingResource({ ...editingResource, type, unit: units[type][0] });
                  } else {
                    setNewResource({ ...newResource, type, unit: units[type][0] });
                  }
                }}
                label="Type"
              >
                <MenuItem value="human">Human Resource</MenuItem>
                <MenuItem value="material">Material</MenuItem>
                <MenuItem value="tool">Tool</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={editingResource?.description || newResource.description}
              onChange={(e) => editingResource
                ? setEditingResource({ ...editingResource, description: e.target.value })
                : setNewResource({ ...newResource, description: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
            />

            <TextField
              label="Quantity"
              type="number"
              value={editingResource?.quantity || newResource.quantity}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value));
                editingResource
                  ? setEditingResource({ ...editingResource, quantity: value })
                  : setNewResource({ ...newResource, quantity: value });
              }}
              fullWidth
              inputProps={{ min: 0 }}
            />

            <FormControl fullWidth>
              <InputLabel>Unit</InputLabel>
              <Select
                value={editingResource?.unit || newResource.unit}
                onChange={(e) => editingResource
                  ? setEditingResource({ ...editingResource, unit: e.target.value })
                  : setNewResource({ ...newResource, unit: e.target.value })
                }
                label="Unit"
              >
                {units[editingResource?.type || newResource.type].map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingResource?.status || newResource.status}
                onChange={(e) => editingResource
                  ? setEditingResource({ ...editingResource, status: e.target.value as Resource['status'] })
                  : setNewResource({ ...newResource, status: e.target.value as Resource['status'] })
                }
                label="Status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="in-use">In Use</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Assigned To"
              value={editingResource?.assignedTo || newResource.assignedTo}
              onChange={(e) => editingResource
                ? setEditingResource({ ...editingResource, assignedTo: e.target.value })
                : setNewResource({ ...newResource, assignedTo: e.target.value })
              }
              fullWidth
            />

            <TextField
              label="Cost"
              type="number"
              value={editingResource?.cost || newResource.cost}
              onChange={(e) => {
                const value = Math.max(0, Number(e.target.value));
                editingResource
                  ? setEditingResource({ ...editingResource, cost: value })
                  : setNewResource({ ...newResource, cost: value });
              }}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingResource ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
