'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface ProjectFormData {
  name: string;
  type: string;
  address: string;
  appointmentDate: Dayjs | null;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

const projectTypes = [
  'Residential',
  'Commercial',
  'Industrial',
  'Infrastructure',
  'Renovation',
  'Other'
];

export default function NewProjectForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    type: '',
    address: '',
    appointmentDate: null,
    startDate: null,
    endDate: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (field: 'appointmentDate' | 'startDate' | 'endDate', date: Dayjs | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Add your API call here to save the project
      // const response = await fetch('/api/projects', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...formData,
      //     appointmentDate: formData.appointmentDate?.toISOString(),
      //     startDate: formData.startDate?.toISOString(),
      //     endDate: formData.endDate?.toISOString(),
      //   }),
      // });
      
      // if (response.ok) {
      //   router.push('/projects');
      // }
      
      // For now, just log the data and redirect
      console.log('Project Data:', {
        ...formData,
        appointmentDate: formData.appointmentDate?.toISOString(),
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
      });
      router.push('/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Create New Project
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="project-type-label">Project Type</InputLabel>
              <Select
                labelId="project-type-label"
                name="type"
                value={formData.type}
                label="Project Type"
                onChange={handleInputChange}
              >
                {projectTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Project Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Appointment Scheduled"
              value={formData.appointmentDate}
              onChange={(date) => handleDateChange('appointmentDate', date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Start Date"
              value={formData.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Projected End Date"
              value={formData.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.push('/projects')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Create Project
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}
