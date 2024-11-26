'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProjectSidebar from '@/components/ProjectSidebar';
import WeatherWidget from '@/components/WeatherWidget';
import MapComponent from '@/components/MapComponent';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  address?: string;
  budget: number;
  manager?: {
    name: string | null;
    email: string;
  } | null;
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // Fetch project data
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project');
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (!project) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ProjectSidebar project={project} />
      
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: '280px' }}>
        <Grid container spacing={3}>
          {/* Project Header */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">{project.name}</Typography>
                <Box sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: project.status === 'active' ? 'success.light' :
                           project.status === 'completed' ? 'info.light' : 'warning.light',
                  color: project.status === 'active' ? 'success.dark' :
                         project.status === 'completed' ? 'info.dark' : 'warning.dark'
                }}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Box>
              </Box>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{project.description}</Typography>
              <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                <Typography>Start Date: {new Date(project.startDate).toLocaleDateString()}</Typography>
                {project.endDate && (
                  <Typography>End Date: {new Date(project.endDate).toLocaleDateString()}</Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Weather Widget */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Weather at Project Site</Typography>
              <WeatherWidget location={project.address || 'New York, NY'} />
            </Paper>
          </Grid>

          {/* Map Component */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Project Location</Typography>
              <Box sx={{ height: 400 }}>
                <MapComponent address={project.address || '123 Eva St, Downstairs, Bathroom'} />
              </Box>
            </Paper>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Link href={`/projects/${projectId}/photos`}>
                  <Paper sx={{ p: 3, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                    <Typography variant="h6">Photos</Typography>
                    <Typography color="text.secondary">View project photos</Typography>
                  </Paper>
                </Link>
              </Grid>
              <Grid item xs={12} md={4}>
                <Link href={`/projects/${projectId}/sketches`}>
                  <Paper sx={{ p: 3, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                    <Typography variant="h6">Sketches</Typography>
                    <Typography color="text.secondary">View project sketches</Typography>
                  </Paper>
                </Link>
              </Grid>
              <Grid item xs={12} md={4}>
                <Link href={`/projects/${projectId}/estimates`}>
                  <Paper sx={{ p: 3, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}>
                    <Typography variant="h6">Estimates</Typography>
                    <Typography color="text.secondary">View project estimates</Typography>
                  </Paper>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
