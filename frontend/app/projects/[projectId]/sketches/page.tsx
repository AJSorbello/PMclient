'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Sketch {
  _id: string;
  url: string;
  title: string;
  createdAt: string;
  approved: boolean;
  approvedAt?: string;
  approvedBy?: string;
}

export default function SketchesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSketches();
  }, [projectId]);

  const fetchSketches = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sketches`);
      if (!response.ok) throw new Error('Failed to fetch sketches');
      const data = await response.json();
      setSketches(data);
    } catch (error) {
      console.error('Error fetching sketches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('sketch', e.target.files[0]);
    formData.append('title', title);

    try {
      const response = await fetch('/api/upload-sketch', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload sketch');
      
      await fetchSketches(); // Refresh sketches after upload
      setTitle(''); // Reset title input
    } catch (error) {
      console.error('Error uploading sketch:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleApproval = async (sketchId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sketches`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sketchId,
          approved,
          userId: 'current-user-id', // Replace with actual user ID
        }),
      });

      if (!response.ok) throw new Error('Failed to update sketch');
      
      await fetchSketches(); // Refresh sketches after approval
    } catch (error) {
      console.error('Error updating sketch:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Sketches</h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sketch title"
            className="border rounded px-3 py-2"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="sketch-upload"
              disabled={uploading || !title}
            />
            <label
              htmlFor="sketch-upload"
              className={`${
                uploading || !title
                  ? 'bg-gray-400'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-2 rounded cursor-pointer transition`}
            >
              {uploading ? 'Uploading...' : 'Upload Sketch'}
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sketches.map((sketch) => (
          <div key={sketch._id} className="border rounded-lg p-4">
            <div className="relative aspect-square mb-4">
              <Image
                src={sketch.url}
                alt={sketch.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{sketch.title}</h3>
                <p className="text-gray-500 text-sm">
                  {new Date(sketch.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleApproval(sketch._id, !sketch.approved)}
                className={`px-3 py-1 rounded-full text-sm ${
                  sketch.approved
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                }`}
              >
                {sketch.approved ? 'Approved' : 'Approve'}
              </button>
            </div>
            {sketch.approvedAt && (
              <p className="text-gray-500 text-sm mt-2">
                Approved on {new Date(sketch.approvedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
