'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  WbSunny as SunIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Thunderstorm as StormIcon,
} from '@mui/icons-material';

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export default function WeatherWidget({ lat, lon }: { lat: number; lon: number }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        setWeather({
          temperature: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].main.toLowerCase(),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'clear':
        return <SunIcon sx={{ fontSize: 40, color: '#FFB300' }} />;
      case 'clouds':
        return <CloudIcon sx={{ fontSize: 40, color: '#78909C' }} />;
      case 'rain':
        return <RainIcon sx={{ fontSize: 40, color: '#42A5F5' }} />;
      case 'snow':
        return <SnowIcon sx={{ fontSize: 40, color: '#90CAF9' }} />;
      case 'thunderstorm':
        return <StormIcon sx={{ fontSize: 40, color: '#5C6BC0' }} />;
      default:
        return <CloudIcon sx={{ fontSize: 40, color: '#78909C' }} />;
    }
  };

  if (loading) {
    return (
      <Card sx={{ minWidth: 275, maxWidth: 345 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ minWidth: 275, maxWidth: 345 }}>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <Card sx={{ minWidth: 275, maxWidth: 345 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getWeatherIcon(weather.icon)}
          <Typography variant="h4" component="div" sx={{ ml: 2 }}>
            {weather.temperature}°C
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Humidity: {weather.humidity}%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Wind Speed: {weather.windSpeed} m/s
        </Typography>
      </CardContent>
    </Card>
  );
}
