import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  SelectChangeEvent,
} from '@mui/material';
import {
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

interface Milestone {
  id: string;
  name: string;
}

interface TaskFiltersProps {
  milestones: Milestone[];
  onFilterChange: (filters: TaskFilters) => void;
  onSortChange: (sort: SortOption) => void;
}

export interface TaskFilters {
  milestone: string;
  status: string;
  priority: string;
  search: string;
}

export type SortOption = 'dueDate' | 'priority' | 'status' | 'milestone';

const TaskFilters: React.FC<TaskFiltersProps> = ({
  milestones,
  onFilterChange,
  onSortChange,
}) => {
  const [filters, setFilters] = React.useState<TaskFilters>({
    milestone: '',
    status: '',
    priority: '',
    search: '',
  });

  const [currentSort, setCurrentSort] = React.useState<SortOption>('dueDate');

  const handleFilterChange = (
    event: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = () => {
    const sortOptions: SortOption[] = ['dueDate', 'priority', 'status', 'milestone'];
    const currentIndex = sortOptions.indexOf(currentSort);
    const nextSort = sortOptions[(currentIndex + 1) % sortOptions.length];
    setCurrentSort(nextSort);
    onSortChange(nextSort);
  };

  const getSortTooltip = () => {
    switch (currentSort) {
      case 'dueDate':
        return 'Sorted by Due Date';
      case 'priority':
        return 'Sorted by Priority';
      case 'status':
        return 'Sorted by Status';
      case 'milestone':
        return 'Sorted by Milestone';
      default:
        return 'Sort Tasks';
    }
  };

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Milestone</InputLabel>
        <Select
          name="milestone"
          value={filters.milestone}
          label="Milestone"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All Milestones</MenuItem>
          {milestones.map((milestone) => (
            <MenuItem key={milestone.id} value={milestone.id}>
              {milestone.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          name="status"
          value={filters.status}
          label="Status"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="NOT_STARTED">Not Started</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="COMPLETED">Completed</MenuItem>
          <MenuItem value="BLOCKED">Blocked</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          name="priority"
          value={filters.priority}
          label="Priority"
          onChange={handleFilterChange}
        >
          <MenuItem value="">All Priorities</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="LOW">Low</MenuItem>
        </Select>
      </FormControl>

      <TextField
        size="small"
        name="search"
        value={filters.search}
        onChange={handleFilterChange}
        placeholder="Search tasks..."
        sx={{ minWidth: 200 }}
      />

      <Tooltip title={getSortTooltip()}>
        <IconButton onClick={handleSortChange} color="primary">
          <SortIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default TaskFilters;
