import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import {
  WbSunny as SunIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Thunderstorm as StormIcon,
  RemoveRedEye as MistIcon,
} from '@mui/icons-material';

interface WeatherForecastProps {
  location: string;
}

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  weatherMain: string;
}

const WeatherForecast = ({ location }: WeatherForecastProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const formatLocation = (loc: string): string => {
    // Remove any extra whitespace and normalize
    const cleaned = loc.trim().replace(/\s+/g, ' ');
    
    // Check if we have a valid location string
    if (!cleaned) {
      throw new Error('Location is empty');
    }

    // Remove any trailing commas and extra spaces
    return cleaned.replace(/,\s*$/, '').trim();
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) {
        setLoading(false);
        setError('No location provided');
        return;
      }

      // Check if API key is available
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      if (!apiKey) {
        setError('Weather API key is not configured');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const formattedLocation = formatLocation(location);
        console.log('Fetching weather for location:', formattedLocation);

        // Get weather data directly using city name
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          formattedLocation
        )}&units=imperial&appid=${apiKey}`;

        console.log('Weather URL:', weatherUrl);
        const weatherResponse = await fetch(weatherUrl);
        const weatherResult = await weatherResponse.json();

        console.log('Weather response:', weatherResult);

        if (weatherResult.cod === '401') {
          throw new Error('Invalid API key. Please check your OpenWeather API key configuration.');
        }

        if (weatherResult.cod !== 200) {
          throw new Error(weatherResult.message || 'Failed to fetch weather data');
        }

        setWeatherData({
          temperature: Math.round(weatherResult.main.temp),
          description: weatherResult.weather[0].description,
          icon: weatherResult.weather[0].icon,
          humidity: weatherResult.main.humidity,
          windSpeed: Math.round(weatherResult.wind.speed),
          weatherMain: weatherResult.weather[0].main,
        });
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <SunIcon sx={{ fontSize: 40, color: '#FFD700' }} />;
      case 'clouds':
        return <CloudIcon sx={{ fontSize: 40, color: '#A9A9A9' }} />;
      case 'rain':
      case 'drizzle':
        return <RainIcon sx={{ fontSize: 40, color: '#4682B4' }} />;
      case 'snow':
        return <SnowIcon sx={{ fontSize: 40, color: '#87CEEB' }} />;
      case 'thunderstorm':
        return <StormIcon sx={{ fontSize: 40, color: '#4B0082' }} />;
      case 'mist':
      case 'fog':
      case 'haze':
        return <MistIcon sx={{ fontSize: 40, color: '#B8B8B8' }} />;
      default:
        return <SunIcon sx={{ fontSize: 40, color: '#FFD700' }} />;
    }
  };

  if (!location) {
    return null;
  }

  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Weather Forecast for {location}
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            {error}
            {error.includes('API key') && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Please add your OpenWeather API key to .env.local file as NEXT_PUBLIC_OPENWEATHER_API_KEY
              </Typography>
            )}
          </Alert>
        ) : weatherData ? (
          <Box>
            <Box display="flex" alignItems="center" mb={2}>
              {getWeatherIcon(weatherData.weatherMain)}
              <Typography variant="h3" component="span" sx={{ ml: 2 }}>
                {weatherData.temperature}°F
              </Typography>
            </Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ textTransform: 'capitalize' }}
            >
              {weatherData.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Humidity: {weatherData.humidity}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wind Speed: {weatherData.windSpeed} mph
            </Typography>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;
