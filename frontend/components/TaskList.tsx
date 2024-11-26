import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Collapse,
  Typography,
  Chip,
  Box,
  LinearProgress,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Flag as MilestoneIcon,
  Schedule as TimeIcon,
  Person as AssigneeIcon,
  PriorityHigh as PriorityIcon,
} from '@mui/icons-material';

interface Task {
  id: string;
  name: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  progress: number;
  priority: string;
  status: string;
  assignee?: {
    name?: string | null;
    email: string;
  } | null;
  milestone?: {
    id: string;
    name: string;
    dueDate?: Date | null;
    status: string;
  } | null;
}

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const [expandedTasks, setExpandedTasks] = React.useState<{ [key: string]: boolean }>({});

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
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

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  return (
    <List component={Paper} sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {tasks.map((task) => (
        <React.Fragment key={task.id}>
          <ListItem
            button
            onClick={() => toggleTask(task.id)}
            sx={{
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="subtitle1" component="span">
                    {task.name}
                  </Typography>
                  {task.milestone && (
                    <Chip
                      icon={<MilestoneIcon />}
                      label={task.milestone.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={task.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Chip
                      icon={<PriorityIcon />}
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                    <Chip
                      label={task.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(task.status)}
                    />
                  </Box>
                </Box>
              }
            />
            <IconButton edge="end">
              {expandedTasks[task.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </ListItem>
          <Collapse in={expandedTasks[task.id]} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                {task.description || 'No description provided'}
              </Typography>
              <Box display="grid" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TimeIcon color="action" />
                  <Typography variant="body2">
                    {formatDate(task.startDate)} - {formatDate(task.endDate)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <AssigneeIcon color="action" />
                  <Typography variant="body2">
                    {task.assignee?.name || task.assignee?.email || 'Unassigned'}
                  </Typography>
                </Box>
                {task.milestone && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <MilestoneIcon color="action" />
                    <Typography variant="body2">
                      Milestone: {task.milestone.name} (Due: {formatDate(task.milestone.dueDate)})
                    </Typography>
                    <Chip
                      label={task.milestone.status}
                      size="small"
                      color={getStatusColor(task.milestone.status)}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Collapse>
        </React.Fragment>
      ))}
    </List>
  );
};

export default TaskList;
