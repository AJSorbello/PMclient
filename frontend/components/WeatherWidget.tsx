import { useEffect, useState } from 'react';
import { CircularProgress, Alert, Box, Typography, Paper, Grid } from '@mui/material';
import {
  WbSunny as SunIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Thunderstorm as StormIcon,
  Air as WindIcon,
  WaterDrop as HumidityIcon,
  Visibility as VisibilityIcon,
  CompareArrows as PressureIcon,
} from '@mui/icons-material';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  visibility: number;
  pressure: number;
  icon: string;
}

interface WeatherWidgetProps {
  location: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      if (!location) {
        setError('Location not provided');
        setLoading(false);
        return;
      }

      try {
        // First, get coordinates from the location
        const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
        const geocodeRes = await fetch(geocodeUrl);
        const geocodeData = await geocodeRes.json();

        if (!geocodeData || geocodeData.length === 0) {
          throw new Error('Location not found');
        }

        const { lat, lon } = geocodeData[0];

        // Then, get weather data using coordinates
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
        const weatherRes = await fetch(weatherUrl);
        const weatherData = await weatherRes.json();

        setWeather({
          temperature: Math.round(weatherData.main.temp),
          condition: weatherData.weather[0].main,
          humidity: weatherData.main.humidity,
          windSpeed: Math.round(weatherData.wind.speed),
          feelsLike: Math.round(weatherData.main.feels_like),
          visibility: Math.round(weatherData.visibility / 1609.34), // Convert meters to miles
          pressure: weatherData.main.pressure,
          icon: weatherData.weather[0].icon,
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching weather:', error);
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !weather) {
    return (
      <Alert severity="error" sx={{ minHeight: '300px', display: 'flex', alignItems: 'center' }}>
        {error || 'Weather data not available'}
      </Alert>
    );
  }

  const getWeatherIcon = (condition: string, iconCode: string) => {
    // Check if it's night time
    const isNight = iconCode.includes('n');
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return <SunIcon sx={{ fontSize: 48, color: isNight ? '#5C6BC0' : '#FFB300' }} />;
      case 'clouds':
        return <CloudIcon sx={{ fontSize: 48, color: '#78909C' }} />;
      case 'rain':
      case 'drizzle':
        return <RainIcon sx={{ fontSize: 48, color: '#42A5F5' }} />;
      case 'snow':
        return <SnowIcon sx={{ fontSize: 48, color: '#90CAF9' }} />;
      case 'thunderstorm':
        return <StormIcon sx={{ fontSize: 48, color: '#5C6BC0' }} />;
      default:
        return <CloudIcon sx={{ fontSize: 48, color: '#78909C' }} />;
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
        <Box mr={2}>
          {getWeatherIcon(weather.condition, weather.icon)}
        </Box>
        <Box>
          <Typography variant="h3" component="div" fontWeight="bold">
            {weather.temperature}°F
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Feels like {weather.feelsLike}°F
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" align="center" gutterBottom>
        {weather.condition}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
              <HumidityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Humidity</Typography>
                <Typography variant="body1">{weather.humidity}%</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
              <WindIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Wind</Typography>
                <Typography variant="body1">{weather.windSpeed} mph</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
              <VisibilityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Visibility</Typography>
                <Typography variant="body1">{weather.visibility} mi</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
              <PressureIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Pressure</Typography>
                <Typography variant="body1">{weather.pressure} hPa</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default WeatherWidget;
