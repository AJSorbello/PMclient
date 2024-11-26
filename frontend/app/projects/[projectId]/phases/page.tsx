'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragHandle as DragHandleIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Phase {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  order: number;
  tasks: Task[];
  documents: Document[];
}

interface Task {
  id: string;
  title: string;
  status: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
}

export default function PhasesPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'not_started',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchPhases();
  }, [projectId]);

  const fetchPhases = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/phases`);
      if (!response.ok) throw new Error('Failed to fetch phases');
      const data = await response.json();
      setPhases(data);
    } catch (error) {
      console.error('Error fetching phases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (phase?: Phase) => {
    if (phase) {
      setEditingPhase(phase);
      setFormData({
        name: phase.name,
        description: phase.description,
        status: phase.status,
        startDate: phase.startDate || '',
        endDate: phase.endDate || '',
      });
    } else {
      setEditingPhase(null);
      setFormData({
        name: '',
        description: '',
        status: 'not_started',
        startDate: '',
        endDate: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPhase(null);
  };

  const handleSubmit = async () => {
    try {
      const url = editingPhase
        ? `/api/projects/${projectId}/phases/${editingPhase.id}`
        : `/api/projects/${projectId}/phases`;
      
      const response = await fetch(url, {
        method: editingPhase ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save phase');
      
      await fetchPhases();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving phase:', error);
    }
  };

  const handleDelete = async (phaseId: string) => {
    if (!confirm('Are you sure you want to delete this phase?')) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/phases/${phaseId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete phase');
      
      await fetchPhases();
    } catch (error) {
      console.error('Error deleting phase:', error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(phases);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedPhases = items.map((phase, index) => ({
      ...phase,
      order: index,
    }));

    setPhases(updatedPhases);

    try {
      const response = await fetch(`/api/projects/${projectId}/phases/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phases: updatedPhases }),
      });

      if (!response.ok) throw new Error('Failed to reorder phases');
    } catch (error) {
      console.error('Error reordering phases:', error);
      await fetchPhases(); // Revert to server state if error
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'not_started':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Project Phases</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Phase
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="phases">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <Grid container spacing={3}>
                {phases.map((phase, index) => (
                  <Draggable
                    key={phase.id}
                    draggableId={phase.id}
                    index={index}
                  >
                    {(provided) => (
                      <Grid
                        item
                        xs={12}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <IconButton
                                size="small"
                                {...provided.dragHandleProps}
                                sx={{ mr: 1 }}
                              >
                                <DragHandleIcon />
                              </IconButton>
                              <Typography variant="h6" component="div">
                                {phase.name}
                              </Typography>
                              <Box sx={{ flexGrow: 1 }} />
                              <Chip
                                label={phase.status.replace('_', ' ')}
                                color={getStatusColor(phase.status) as any}
                                size="small"
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {phase.description}
                            </Typography>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="body2">
                                Tasks: {phase.tasks.length}
                              </Typography>
                              <Typography variant="body2">
                                Documents: {phase.documents.length}
                              </Typography>
                            </Stack>
                          </CardContent>
                          <CardActions>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenDialog(phase)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              color="error"
                              onClick={() => handleDelete(phase.id)}
                            >
                              Delete
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Grid>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPhase ? 'Edit Phase' : 'Add Phase'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="not_started">Not Started</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="date"
              label="End Date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPhase ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
