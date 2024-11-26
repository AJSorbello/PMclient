'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Grid,
  Alert,
  InputAdornment,
} from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import AddressFields from '@/components/AddressFields';
import AppointmentScheduler, { AppointmentData } from '@/components/AppointmentScheduler';
import WeatherForecast from '@/components/WeatherForecast';

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    budget: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Format the location string for the API
      const location = formData.city && formData.state
        ? `${formData.city}, ${formData.state}, ${formData.country}`
        : '';

      if (!location) {
        setError('Please provide at least city and state');
        return;
      }

      console.log('Submitting project with location:', location);

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? Number(formData.budget) : null,
          location,
          appointment: appointmentData ? {
            type: appointmentData.type,
            date: appointmentData.date,
            time: appointmentData.time,
            notes: appointmentData.notes,
          } : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      router.push('/projects');
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleScheduleAppointment = (data: AppointmentData) => {
    setAppointmentData(data);
    setIsAppointmentDialogOpen(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Project Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!formData.name}
                helperText={!formData.name ? 'Project name is required' : ''}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={handleChange('status')}
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget"
                type="number"
                value={formData.budget}
                onChange={handleChange('budget')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <AddressFields
                streetAddress={formData.streetAddress}
                city={formData.city}
                state={formData.state}
                zipCode={formData.zipCode}
                country={formData.country}
                onStreetAddressChange={(value) => setFormData({ ...formData, streetAddress: value })}
                onCityChange={(value) => setFormData({ ...formData, city: value })}
                onStateChange={(value) => setFormData({ ...formData, state: value })}
                onZipCodeChange={(value) => setFormData({ ...formData, zipCode: value })}
                onCountryChange={(value) => setFormData({ ...formData, country: value })}
              />
            </Grid>

            {formData.city && formData.state && (
              <Grid item xs={12}>
                <WeatherForecast location={`${formData.city}, ${formData.state}, ${formData.country}`} />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={() => setIsAppointmentDialogOpen(true)}
                >
                  Schedule Appointment
                </Button>
                {appointmentData && (
                  <Typography variant="body2" color="text.secondary">
                    {appointmentData.type} scheduled for{' '}
                    {dayjs(appointmentData.date).format('MMM D, YYYY')} at{' '}
                    {dayjs(appointmentData.time).format('h:mm A')}
                  </Typography>
                )}
              </Box>
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

      <AppointmentScheduler
        open={isAppointmentDialogOpen}
        onClose={() => setIsAppointmentDialogOpen(false)}
        onSchedule={handleScheduleAppointment}
      />
    </Box>
  );
}
