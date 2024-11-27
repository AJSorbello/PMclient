'use client';

import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Project } from '@/types/project';

export default function DashboardContent() {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProjects = async () => {
      try {
        const response = await fetch('/api/projects?limit=5');
        if (!response.ok) throw new Error('Failed to fetch projects');
        const data = await response.json();
        setRecentProjects(data);
      } catch (error) {
        console.error('Error fetching recent projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProjects();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href="/projects/new"
        >
          New Project
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Projects
              </Typography>
              <Grid container spacing={2}>
                {recentProjects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" component={Link} href={`/projects/${project.id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                          {project.name}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {project.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Status: {project.status}
                          </Typography>
                          {project.endDate && (
                            <Typography variant="caption" color="text.secondary">
                              Due: {new Date(project.endDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
