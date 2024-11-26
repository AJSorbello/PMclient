import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface AppointmentSchedulerProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (appointmentData: AppointmentData) => void;
}

export interface AppointmentData {
  date: Date | null;
  time: Date | null;
  type: string;
  notes: string;
}

const appointmentTypes = [
  'Initial Consultation',
  'Site Visit',
  'Project Review',
  'Progress Update',
  'Final Inspection',
];

const AppointmentScheduler = ({
  open,
  onClose,
  onSchedule,
}: AppointmentSchedulerProps) => {
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    date: null,
    time: null,
    type: '',
    notes: '',
  });

  const handleSchedule = () => {
    if (appointmentData.date && appointmentData.time) {
      onSchedule(appointmentData);
      onClose();
      // Reset form
      setAppointmentData({
        date: null,
        time: null,
        type: '',
        notes: '',
      });
    }
  };

  const isScheduleDisabled = !appointmentData.date || !appointmentData.time || !appointmentData.type;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Appointment Type</InputLabel>
                  <Select
                    value={appointmentData.type}
                    label="Appointment Type"
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, type: e.target.value })
                    }
                  >
                    {appointmentTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={appointmentData.date ? dayjs(appointmentData.date) : null}
                  onChange={(newDate) =>
                    setAppointmentData({
                      ...appointmentData,
                      date: newDate ? newDate.toDate() : null,
                    })
                  }
                  disablePast
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Time"
                  value={appointmentData.time ? dayjs(appointmentData.time) : null}
                  onChange={(newTime) =>
                    setAppointmentData({
                      ...appointmentData,
                      time: newTime ? newTime.toDate() : null,
                    })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={4}
                  value={appointmentData.notes}
                  onChange={(e) =>
                    setAppointmentData({ ...appointmentData, notes: e.target.value })
                  }
                  placeholder="Add any additional notes or requirements"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSchedule}
            variant="contained"
            color="primary"
            disabled={isScheduleDisabled}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default AppointmentScheduler;
