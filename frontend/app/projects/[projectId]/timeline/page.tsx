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
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Error as DelayedIcon,
} from '@mui/icons-material';

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'delayed';
  category: string;
}

export default function TimelinePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
    category: '',
  });

  const categories = [
    'Milestone',
    'Planning',
    'Development',
    'Testing',
    'Deployment',
    'Review',
    'Other',
  ];

  useEffect(() => {
    fetchEvents();
  }, [projectId]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/timeline`);
      if (!response.ok) throw new Error('Failed to fetch timeline events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = `/api/projects/${projectId}/timeline${
        editingEvent ? `/${editingEvent.id}` : ''
      }`;
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingEvent || newEvent),
      });

      if (!response.ok) throw new Error('Failed to save timeline event');

      await fetchEvents();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving timeline event:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/timeline/${eventId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete timeline event');

      await fetchEvents();
    } catch (error) {
      console.error('Error deleting timeline event:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      category: '',
    });
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event);
    setOpenDialog(true);
  };

  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'delayed':
        return <DelayedIcon color="error" />;
      default:
        return <PendingIcon color="primary" />;
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'success.main';
      case 'delayed':
        return 'error.main';
      default:
        return 'primary.main';
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
        <Typography variant="h4">Project Timeline</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Event
        </Button>
      </Box>

      <Timeline position="alternate">
        {events.map((event) => (
          <TimelineItem key={event.id}>
            <TimelineOppositeContent color="text.secondary">
              {new Date(event.date).toLocaleDateString()}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: getStatusColor(event.status) }}>
                {getStatusIcon(event.status)}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        {event.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEditEvent(event)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(event.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingEvent ? 'Edit Timeline Event' : 'Add Timeline Event'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={editingEvent?.title || newEvent.title}
              onChange={(e) => editingEvent
                ? setEditingEvent({ ...editingEvent, title: e.target.value })
                : setNewEvent({ ...newEvent, title: e.target.value })
              }
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editingEvent?.category || newEvent.category}
                onChange={(e) => editingEvent
                  ? setEditingEvent({ ...editingEvent, category: e.target.value })
                  : setNewEvent({ ...newEvent, category: e.target.value })
                }
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={editingEvent?.description || newEvent.description}
              onChange={(e) => editingEvent
                ? setEditingEvent({ ...editingEvent, description: e.target.value })
                : setNewEvent({ ...newEvent, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Date"
              type="date"
              value={editingEvent?.date || newEvent.date}
              onChange={(e) => editingEvent
                ? setEditingEvent({ ...editingEvent, date: e.target.value })
                : setNewEvent({ ...newEvent, date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingEvent?.status || newEvent.status}
                onChange={(e) => editingEvent
                  ? setEditingEvent({ ...editingEvent, status: e.target.value as TimelineEvent['status'] })
                  : setNewEvent({ ...newEvent, status: e.target.value as TimelineEvent['status'] })
                }
                label="Status"
              >
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="delayed">Delayed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingEvent ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
