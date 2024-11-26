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
} from '@mui/material';
import AddressFields from '@/components/AddressFields';
import NewProjectForm from '@/components/Projects/NewProjectForm';

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    startDate: '',
    endDate: '',
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
      const location = formData.streetAddress && formData.city && formData.state && formData.zipCode && formData.country
        ? `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`
        : '';

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          budget: formData.budget ? Number(formData.budget) : null,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      router.push('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
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
                label="Project Name"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={4}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={formData.status}
                onChange={handleChange('status')}
                required
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget"
                type="number"
                value={formData.budget}
                onChange={handleChange('budget')}
                InputProps={{
                  startAdornment: <span>$</span>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleChange('startDate')}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={handleChange('endDate')}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Location
              </Typography>
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
    </Box>
  );
}
