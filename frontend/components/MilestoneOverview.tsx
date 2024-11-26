import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Flag as MilestoneIcon,
  Event as DateIcon,
} from '@mui/icons-material';

interface Task {
  id: string;
  name: string;
  status: string;
  progress: number;
}

interface Milestone {
  id: string;
  name: string;
  dueDate: Date | null;
  status: string;
  tasks: Task[];
}

interface MilestoneOverviewProps {
  milestones: Milestone[];
}

const MilestoneOverview: React.FC<MilestoneOverviewProps> = ({ milestones }) => {
  const [expandedMilestones, setExpandedMilestones] = React.useState<{ [key: string]: boolean }>({});

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };

  const calculateMilestoneProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / tasks.length);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      case 'NOT_STARTED':
        return 'default';
      case 'BLOCKED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Grid container spacing={2}>
      {milestones.map((milestone) => (
        <Grid item xs={12} key={milestone.id}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <MilestoneIcon color="primary" />
                  <Typography variant="h6">{milestone.name}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    icon={<DateIcon />}
                    label={formatDate(milestone.dueDate)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={milestone.status}
                    size="small"
                    color={getStatusColor(milestone.status)}
                  />
                  <IconButton
                    onClick={() => toggleMilestone(milestone.id)}
                    size="small"
                  >
                    {expandedMilestones[milestone.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ width: '100%', mb: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {calculateMilestoneProgress(milestone.tasks)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateMilestoneProgress(milestone.tasks)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Collapse in={expandedMilestones[milestone.id]} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tasks ({milestone.tasks.length})
                  </Typography>
                  {milestone.tasks.map((task) => (
                    <Box
                      key={task.id}
                      sx={{
                        py: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                      }}
                    >
                      <Typography variant="body2">{task.name}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{ width: 100, height: 6, borderRadius: 3 }}
                        />
                        <Chip
                          label={task.status}
                          size="small"
                          color={getStatusColor(task.status)}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MilestoneOverview;
