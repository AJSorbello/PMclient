'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, CircularProgress, TextField, Grid, Card, CardContent, CardMedia } from '@mui/material';
import { PhotoCamera as PhotoIcon } from '@mui/icons-material';

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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Project Photos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Photo title"
            disabled={uploading}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="photo-upload"
            disabled={uploading || !title}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="contained"
              component="span"
              disabled={uploading || !title}
              startIcon={<PhotoIcon />}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </label>
        </Box>
      </Box>

      {photos.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '300px',
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 3,
            textAlign: 'center'
          }}
        >
          <PhotoIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Photos Yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your first photo to get started
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo._id}>
              <Card>
                <CardMedia
                  component="div"
                  sx={{
                    position: 'relative',
                    height: 0,
                    paddingTop: '100%', // 1:1 aspect ratio
                  }}
                >
                  <Image
                    src={photo.url}
                    alt={photo.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </CardMedia>
                <CardContent>
                  <Typography variant="subtitle1" component="h3">
                    {photo.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
