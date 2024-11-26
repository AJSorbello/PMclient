'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, CircularProgress, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Manager {
  id: string;
  name: string | null;
  email: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  phase: string;
  progress: number;
  riskLevel: string;
  budget: number;
  actualCost: number | null;
  grandTotal: number;
  location: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
  manager: Manager | null;
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

      {loading && (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      )}

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
            <p className="text-gray-600 mb-4">{project.description || 'No description'}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {project.status}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                {project.phase}
              </span>
              <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                {project.priority}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <p>Budget: ${project.budget.toLocaleString()}</p>
              <p>Progress: {project.progress}%</p>
              {project.manager && (
                <p>Manager: {project.manager.name || project.manager.email}</p>
              )}
              <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
