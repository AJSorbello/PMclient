import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Box, Button, ButtonGroup, CircularProgress, Alert } from '@mui/material';
import {
  DirectionsCar as DirectionsIcon,
  Streetview as StreetViewIcon,
  MyLocation as LocationIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';

interface MapComponentProps {
  address: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ address }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streetViewAvailable, setStreetViewAvailable] = useState(false);

  // Custom map style
  const mapStyle = [
    {
      featureType: 'all',
      elementType: 'geometry',
      stylers: [{ color: '#242f3e' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#242f3e' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#746855' }]
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#d59563' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#17263c' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#515c6d' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#17263c' }]
    }
  ];

  useEffect(() => {
    if (!address) return;

    const loadMap = async () => {
      try {
        setLoading(true);
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });

        const google = await loader.load();
        const geocoder = new google.maps.Geocoder();

        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0] && mapRef.current) {
            const location = results[0].geometry.location;

            if (!googleMapRef.current) {
              googleMapRef.current = new google.maps.Map(mapRef.current, {
                center: location,
                zoom: 15,
                styles: mapStyle,
                mapTypeControl: true,
                mapTypeControlOptions: {
                  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                  position: google.maps.ControlPosition.TOP_RIGHT
                },
                fullscreenControl: true,
                streetViewControl: false, // We'll add our own button
                zoomControl: false, // We'll add our own buttons
              });
            } else {
              googleMapRef.current.setCenter(location);
            }

            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            markerRef.current = new google.maps.Marker({
              map: googleMapRef.current,
              position: location,
              animation: google.maps.Animation.DROP,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0;">${results[0].formatted_address}</h3>
                  <p style="margin: 0;">Project Location</p>
                </div>
              `,
            });

            markerRef.current.addListener('click', () => {
              infoWindow.open(googleMapRef.current, markerRef.current);
            });

            // Check if Street View is available
            const streetViewService = new google.maps.StreetViewService();
            streetViewService.getPanorama({ location, radius: 50 }, (data) => {
              setStreetViewAvailable(!!data);
            });

            setError(null);
          } else {
            setError('Could not find location');
          }
        });
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load map');
      } finally {
        setLoading(false);
      }
    };

    loadMap();
  }, [address]);

  const handleGetDirections = () => {
    if (!markerRef.current) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handleStreetView = () => {
    if (!markerRef.current || !googleMapRef.current) return;
    const position = markerRef.current.getPosition();
    if (position) {
      const panorama = new google.maps.StreetViewPanorama(mapRef.current!, {
        position,
        pov: { heading: 0, pitch: 0 },
        zoom: 1
      });
      googleMapRef.current.setStreetView(panorama);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!googleMapRef.current) return;
    const currentZoom = googleMapRef.current.getZoom() || 15;
    googleMapRef.current.setZoom(direction === 'in' ? currentZoom + 1 : currentZoom - 1);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (googleMapRef.current) {
            googleMapRef.current.setCenter(pos);
            googleMapRef.current.setZoom(15);
          }
        },
        () => {
          setError('Error getting your location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ height: '100%' }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      />
      
      {/* Map Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 1,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <ButtonGroup orientation="vertical" size="small">
          <Button
            onClick={() => handleZoom('in')}
            startIcon={<ZoomInIcon />}
          >
            Zoom In
          </Button>
          <Button
            onClick={() => handleZoom('out')}
            startIcon={<ZoomOutIcon />}
          >
            Zoom Out
          </Button>
          <Button
            onClick={handleCurrentLocation}
            startIcon={<LocationIcon />}
          >
            My Location
          </Button>
          <Button
            onClick={handleGetDirections}
            startIcon={<DirectionsIcon />}
          >
            Directions
          </Button>
          {streetViewAvailable && (
            <Button
              onClick={handleStreetView}
              startIcon={<StreetViewIcon />}
            >
              Street View
            </Button>
          )}
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default MapComponent;
