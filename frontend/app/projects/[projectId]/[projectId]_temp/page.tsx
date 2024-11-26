'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CircularProgress, Alert } from '@mui/material';
import dynamic from 'next/dynamic';
import ProjectSidebar from '@/components/ProjectSidebar';
import WeatherWidget from '@/components/WeatherWidget';

// Import Map component dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
});

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  phase: string;
  progress: number;
  budget: number;
  street: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  manager: {
    name: string | null;
    email: string;
  } | null;
}

export default function ProjectDetails() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project details');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-4">
        <Alert severity="error">{error || 'Project not found'}</Alert>
      </div>
    );
  }

  const address = [project.street, project.city, project.state, project.zipCode]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ProjectSidebar project={project} />

      {/* Main content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
            <p className="text-gray-600 mb-6">{project.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Project Status Card */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Project Status</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">{project.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phase:</span>
                    <span className="font-medium">{project.phase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className="font-medium">{project.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Weather Widget */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Weather</h2>
                <WeatherWidget location={address} />
              </div>
            </div>

            {/* Map */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <div className="h-96">
                <MapComponent address={address} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
