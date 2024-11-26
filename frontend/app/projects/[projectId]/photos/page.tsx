'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Photo {
  _id: string;
  url: string;
  title: string;
  createdAt: string;
}

export default function PhotosPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, [projectId]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/photos`);
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('photo', e.target.files[0]);
    formData.append('title', title);

    try {
      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload photo');
      
      await fetchPhotos(); // Refresh photos after upload
      setTitle(''); // Reset title input
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Project Photos</h1>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Photo title"
            className="border rounded px-3 py-2"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
              disabled={uploading || !title}
            />
            <label
              htmlFor="photo-upload"
              className={`${
                uploading || !title
                  ? 'bg-gray-400'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white px-4 py-2 rounded cursor-pointer transition`}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div key={photo._id} className="border rounded-lg p-4">
            <div className="relative aspect-square mb-4">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{photo.title}</h3>
              <p className="text-gray-500 text-sm">
                {new Date(photo.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
