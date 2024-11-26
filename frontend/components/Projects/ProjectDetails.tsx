'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Skeleton,
} from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { DirectionsCar, WbSunny } from '@mui/icons-material';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface ProjectDetailsProps {
  project: {
    name: string;
    type: string;
    address: string;
    appointmentDate: string;
    startDate: string;
    endDate: string;
  };
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            project.address
          )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          setCoordinates({ lat, lng });
          fetchWeather(lat, lng);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
      }
    };

    fetchCoordinates();
  }, [project.address]);

  const fetchWeather = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=imperial&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      setWeather({
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLoading(false);
    }
  };

  const handleGetDirections = () => {
    if (coordinates) {
      // Use the user's current location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const origin = `${position.coords.latitude},${position.coords.longitude}`;
          const destination = `${coordinates.lat},${coordinates.lng}`;
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`,
            '_blank'
          );
        });
      } else {
        // If geolocation is not available, just navigate to the destination
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`,
          '_blank'
        );
      }
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            {project.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {project.type}
          </Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            {coordinates ? (
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={coordinates}
                  zoom={15}
                >
                  <Marker position={coordinates} />
                </GoogleMap>
              </LoadScript>
            ) : (
              <Skeleton variant="rectangular" height={400} />
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Project Details
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Address:</strong> {project.address}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Appointment:</strong>{' '}
                    {new Date(project.appointmentDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>Start Date:</strong>{' '}
                    {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>End Date:</strong>{' '}
                    {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WbSunny sx={{ mr: 1 }} />
                    <Typography variant="h6">Weather</Typography>
                  </Box>
                  {loading ? (
                    <Skeleton variant="text" width={200} height={30} />
                  ) : weather ? (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <img
                          src={`http://openweathermap.org/img/w/${weather.icon}.png`}
                          alt="Weather icon"
                          style={{ marginRight: '8px' }}
                        />
                        <Typography variant="h4">{weather.temp}°F</Typography>
                      </Box>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {weather.description}
                      </Typography>
                    </>
                  ) : (
                    <Typography color="error">
                      Unable to load weather information
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<DirectionsCar />}
                onClick={handleGetDirections}
                disabled={!coordinates}
              >
                Get Directions
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
