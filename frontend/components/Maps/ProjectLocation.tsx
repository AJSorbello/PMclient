'use client';

import { useState, useCallback } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from '@react-google-maps/api';
import { CircularProgress, Box, Paper, Typography } from '@mui/material';

interface Location {
  lat: number;
  lng: number;
}

interface Project {
  id: number;
  name: string;
  location: Location;
  address: string;
  status: string;
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060, // New York City coordinates as default
};

interface ProjectLocationProps {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
}

export default function ProjectLocation({ projects, onProjectSelect }: ProjectLocationProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds();
    projects.forEach(project => {
      bounds.extend(project.location);
    });
    map.fitBounds(bounds);
    setMap(map);
  }, [projects]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (project: Project) => {
    setSelectedProject(project);
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  if (!isLoaded) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 400 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Project Locations
      </Typography>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
          fullscreenControl: true,
          streetViewControl: true,
          mapTypeControl: true,
        }}
      >
        {projects.map(project => (
          <Marker
            key={project.id}
            position={project.location}
            onClick={() => handleMarkerClick(project)}
            icon={{
              url: project.status === 'active' 
                ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
          />
        ))}

        {selectedProject && (
          <InfoWindow
            position={selectedProject.location}
            onCloseClick={() => setSelectedProject(null)}
          >
            <div>
              <Typography variant="subtitle1" gutterBottom>
                {selectedProject.name}
              </Typography>
              <Typography variant="body2">
                {selectedProject.address}
              </Typography>
              <Typography variant="body2" color="primary">
                Status: {selectedProject.status}
              </Typography>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </Paper>
  );
}
