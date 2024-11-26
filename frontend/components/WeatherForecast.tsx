import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  WbSunny as SunIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Thunderstorm as StormIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface WeatherData {
  current: {
    temp: number;
    weather: [{
      main: string;
      description: string;
    }];
  };
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    weather: [{
      main: string;
      description: string;
    }];
  }>;
}

interface WeatherForecastProps {
  location: string;
}

const WeatherForecast = ({ location }: WeatherForecastProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatLocation = (loc: string) => {
    // Remove any extra whitespace and convert to lowercase for consistent processing
    const cleaned = loc.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Extract ZIP code if present
    const zipMatch = cleaned.match(/\b\d{5}\b/);
    const zip = zipMatch ? zipMatch[0] : null;
    
    // Split the address into components
    const parts = cleaned.split(',').map(part => part.trim());
    
    // For US addresses with state abbreviations
    const stateMatch = parts.find(part => 
      part.match(/\b(wa|washington|ca|california|ny|new york|tx|texas)\b/)
    );
    
    // Try to extract city
    let city = '';
    if (parts[0].includes('st') || parts[0].includes('ave') || parts[0].includes('road')) {
      // If first part is a street address, look for city in second part
      city = parts[1] || '';
    } else {
      // Otherwise use first part as city
      city = parts[0];
    }
    
    // Clean up city name (remove street numbers and directionals)
    city = city
      .replace(/^\d+/, '') // Remove leading numbers
      .replace(/\b(st|street|ave|avenue|rd|road|nw|ne|sw|se|n|s|e|w)\b/g, '') // Remove street types and directions
      .trim();
    
    // Find state abbreviation
    let state = '';
    if (stateMatch) {
      if (stateMatch.includes('wa') || stateMatch.includes('washington')) {
        state = 'WA';
      } else if (stateMatch.includes('ca') || stateMatch.includes('california')) {
        state = 'CA';
      } else if (stateMatch.includes('ny') || stateMatch.includes('new york')) {
        state = 'NY';
      } else if (stateMatch.includes('tx') || stateMatch.includes('texas')) {
        state = 'TX';
      }
    }
    
    // Build the formatted location string
    let formattedLocation = city.charAt(0).toUpperCase() + city.slice(1); // Capitalize city
    if (state) {
      formattedLocation += `, ${state}`;
    }
    formattedLocation += ', US'; // Add country code
    
    console.log('Original location:', loc);
    console.log('Formatted location:', formattedLocation);
    
    return formattedLocation;
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;

      setLoading(true);
      setError(null);

      try {
        const formattedLocation = formatLocation(location);
        console.log('Formatted location:', formattedLocation);
        
        console.log('Fetching weather for location:', formattedLocation);
        
        // First, get coordinates for the location
        const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          formattedLocation
        )}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
        
        console.log('Geocoding URL:', geocodeUrl);
        
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        
        console.log('Geocode response:', geocodeData);

        if (!geocodeResponse.ok) {
          throw new Error(`Failed to fetch location coordinates: ${geocodeResponse.statusText}`);
        }

        if (!geocodeData || !Array.isArray(geocodeData) || geocodeData.length === 0) {
          throw new Error(`Location not found: ${formattedLocation}`);
        }

        const { lat, lon } = geocodeData[0];
        console.log('Coordinates:', { lat, lon });

        // Then, get weather data for those coordinates
        const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`;
        
        console.log('Weather URL:', weatherUrl);
        
        const weatherResponse = await fetch(weatherUrl);
        
        if (!weatherResponse.ok) {
          const errorText = await weatherResponse.text();
          throw new Error(`Failed to fetch weather data: ${errorText}`);
        }

        const data = await weatherResponse.json();
        console.log('Weather data:', data);
        
        setWeatherData(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [location]);

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <SunIcon sx={{ color: '#FFD700' }} />;
      case 'clouds':
        return <CloudIcon sx={{ color: '#A9A9A9' }} />;
      case 'rain':
      case 'drizzle':
        return <RainIcon sx={{ color: '#4682B4' }} />;
      case 'snow':
        return <SnowIcon sx={{ color: '#B0E0E6' }} />;
      case 'thunderstorm':
        return <StormIcon sx={{ color: '#4B0082' }} />;
      default:
        return <WarningIcon sx={{ color: '#FF8C00' }} />;
    }
  };

  if (!location) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
      <Typography variant="subtitle2" gutterBottom>
        Weather Forecast
      </Typography>
      <Grid container spacing={1}>
        {weatherData.daily.slice(0, 5).map((day, index) => (
          <Grid item xs={2.4} key={day.dt}>
            <Tooltip
              title={`${day.weather[0].description} (High: ${Math.round(
                day.temp.max
              )}°F, Low: ${Math.round(day.temp.min)}°F)`}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1,
                }}
              >
                <Typography variant="caption">
                  {index === 0
                    ? 'Today'
                    : new Date(day.dt * 1000).toLocaleDateString('en-US', {
                        weekday: 'short',
                      })}
                </Typography>
                {getWeatherIcon(day.weather[0].main)}
                <Typography variant="caption">
                  {Math.round(day.temp.max)}°
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default WeatherForecast;
