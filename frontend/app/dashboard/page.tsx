import { Suspense } from 'react';
import DashboardContent from './DashboardContent';
import { Box, CircularProgress } from '@mui/material';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <DashboardContent />
    </Suspense>
  );
}
