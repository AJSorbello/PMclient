'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            project.status === 'active' ? 'bg-green-100 text-green-800' :
            project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        <p className="text-gray-600 mt-2">{project.description}</p>
        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          <p>Start Date: {new Date(project.startDate).toLocaleDateString()}</p>
          {project.endDate && (
            <p>End Date: {new Date(project.endDate).toLocaleDateString()}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href={`/projects/${projectId}/photos`}
          className="p-4 border rounded-lg hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Photos</h2>
          <p className="text-gray-600">View project photos</p>
        </Link>

        <Link 
          href={`/projects/${projectId}/sketches`}
          className="p-4 border rounded-lg hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Sketches</h2>
          <p className="text-gray-600">View project sketches</p>
        </Link>

        <Link 
          href={`/projects/${projectId}/estimates`}
          className="p-4 border rounded-lg hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">Estimates</h2>
          <p className="text-gray-600">View project estimates</p>
        </Link>
      </div>
    </div>
  );
}
