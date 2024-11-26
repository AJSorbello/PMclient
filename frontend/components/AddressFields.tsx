import { useState } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { countries } from '@/data/countries';

interface AddressFieldsProps {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  onStreetAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
  onCountryChange: (value: string) => void;
}

const AddressFields = ({
  streetAddress,
  city,
  state,
  zipCode,
  country,
  onStreetAddressChange,
  onCityChange,
  onStateChange,
  onZipCodeChange,
  onCountryChange,
}: AddressFieldsProps) => {
  const [isAddressValid, setIsAddressValid] = useState(true);

  const handleAddressValidation = () => {
    // Basic validation - ensure all required fields are filled
    const isValid = streetAddress && city && state && zipCode && country;
    setIsAddressValid(!!isValid);
  };

  const formatAddress = () => {
    if (!isAddressValid) return '';
    return `${streetAddress}, ${city}, ${state} ${zipCode}, ${countries.find(c => c.code === country)?.name}`;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Street Address"
          value={streetAddress}
          onChange={(e) => {
            onStreetAddressChange(e.target.value);
            handleAddressValidation();
          }}
          placeholder="Enter street address"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={isAddressValid ? formatAddress() : 'Please fill in all address fields'}>
                  <IconButton edge="end">
                    <LocationIcon color={isAddressValid ? 'primary' : 'disabled'} />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="City"
          value={city}
          onChange={(e) => {
            onCityChange(e.target.value);
            handleAddressValidation();
          }}
          placeholder="Enter city"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="State/Province"
          value={state}
          onChange={(e) => {
            onStateChange(e.target.value);
            handleAddressValidation();
          }}
          placeholder="Enter state or province"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="ZIP/Postal Code"
          value={zipCode}
          onChange={(e) => {
            onZipCodeChange(e.target.value);
            handleAddressValidation();
          }}
          placeholder="Enter ZIP or postal code"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          select
          fullWidth
          label="Country"
          value={country}
          onChange={(e) => {
            onCountryChange(e.target.value);
            handleAddressValidation();
          }}
        >
          {countries.map((country) => (
            <MenuItem key={country.code} value={country.code}>
              {country.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    </Grid>
  );
};

export default AddressFields;
