'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link href="/projects/new">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            New Project
          </Button>
        </Link>
      </div>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <CircularProgress />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No projects found. Create your first project!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block"
            >
              <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                    {project.status}
                  </span>
                  {project.location && (
                    <span className="text-gray-500 text-sm">
                      {project.location}
                    </span>
                  )}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <div>Start: {new Date(project.startDate).toLocaleDateString()}</div>
                  {project.endDate && (
                    <div>End: {new Date(project.endDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
