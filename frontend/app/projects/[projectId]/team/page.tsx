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
  Avatar,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive';
}

export default function TeamPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: 'active' as const,
  });

  useEffect(() => {
    fetchTeam();
  }, [projectId]);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/team`);
      if (!response.ok) throw new Error('Failed to fetch team');
      const data = await response.json();
      setTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = `/api/projects/${projectId}/team${editingMember ? `/${editingMember.id}` : ''}`;
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingMember || newMember),
      });

      if (!response.ok) throw new Error('Failed to save team member');
      
      await fetchTeam();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving team member:', error);
    }
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/team/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove team member');
      
      await fetchTeam();
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMember(null);
    setNewMember({
      name: '',
      email: '',
      phone: '',
      role: '',
      status: 'active',
    });
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setOpenDialog(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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
        <Typography variant="h4">Team Members</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Member
        </Button>
      </Box>

      <Grid container spacing={3}>
        {team.map((member) => (
          <Grid item xs={12} sm={6} md={4} key={member.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={member.avatar}
                    sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
                  >
                    {getInitials(member.name)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{member.name}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {member.role}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleEditMember(member)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(member.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{member.email}</Typography>
                </Box>

                {member.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{member.phone}</Typography>
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={member.status}
                    color={member.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMember ? 'Edit Team Member' : 'Add Team Member'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={editingMember?.name || newMember.name}
              onChange={(e) => editingMember
                ? setEditingMember({ ...editingMember, name: e.target.value })
                : setNewMember({ ...newMember, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editingMember?.email || newMember.email}
              onChange={(e) => editingMember
                ? setEditingMember({ ...editingMember, email: e.target.value })
                : setNewMember({ ...newMember, email: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Phone"
              value={editingMember?.phone || newMember.phone}
              onChange={(e) => editingMember
                ? setEditingMember({ ...editingMember, phone: e.target.value })
                : setNewMember({ ...newMember, phone: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Role"
              value={editingMember?.role || newMember.role}
              onChange={(e) => editingMember
                ? setEditingMember({ ...editingMember, role: e.target.value })
                : setNewMember({ ...newMember, role: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingMember?.status || newMember.status}
                onChange={(e) => editingMember
                  ? setEditingMember({ ...editingMember, status: e.target.value as TeamMember['status'] })
                  : setNewMember({ ...newMember, status: e.target.value as TeamMember['status'] })
                }
                label="Status"
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMember ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
