'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Tabs, Tab, Button } from '@mui/material';
import TaskList from '@/components/TaskList';
import TaskFilters, { TaskFilters as ITaskFilters, SortOption } from '@/components/TaskFilters';
import MilestoneOverview from '@/components/MilestoneOverview';
import { Add as AddIcon } from '@mui/icons-material';

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

interface Milestone {
  id: string;
  name: string;
  dueDate: Date | null;
  status: string;
  tasks: Task[];
}

export default function TasksPage({ params }: { params: { projectId: string } }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'milestones'>('list');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchData();
  }, [params.projectId]);

  const fetchData = async () => {
    try {
      const [tasksRes, milestonesRes] = await Promise.all([
        fetch(`/api/projects/${params.projectId}/tasks`),
        fetch(`/api/projects/${params.projectId}/milestones`)
      ]);

      const tasksData = await tasksRes.json();
      const milestonesData = await milestonesRes.json();

      setTasks(tasksData);
      setFilteredTasks(tasksData);
      setMilestones(milestonesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: ITaskFilters) => {
    let filtered = tasks;

    if (filters.milestone) {
      filtered = filtered.filter(task => task.milestone?.id === filters.milestone);
    }

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTasks(filtered);
  };

  const handleSortChange = (sort: SortOption) => {
    const sorted = [...filteredTasks];
    
    switch (sort) {
      case 'dueDate':
        sorted.sort((a, b) => {
          if (!a.endDate) return 1;
          if (!b.endDate) return -1;
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        });
        break;
      case 'priority':
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        sorted.sort((a, b) => priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]);
        break;
      case 'status':
        const statusOrder = { NOT_STARTED: 0, IN_PROGRESS: 1, BLOCKED: 2, COMPLETED: 3 };
        sorted.sort((a, b) => statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]);
        break;
      case 'milestone':
        sorted.sort((a, b) => {
          if (!a.milestone) return 1;
          if (!b.milestone) return -1;
          return a.milestone.name.localeCompare(b.milestone.name);
        });
        break;
    }

    setFilteredTasks(sorted);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Project Tasks</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {/* TODO: Implement task creation */}}
        >
          Add Task
        </Button>
      </Box>

      <Tabs
        value={view}
        onChange={(_, newValue) => setView(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="List View" value="list" />
        <Tab label="Milestone View" value="milestones" />
      </Tabs>

      {view === 'list' && (
        <>
          <TaskFilters
            milestones={milestones}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
          />
          <TaskList tasks={filteredTasks} />
        </>
      )}

      {view === 'milestones' && (
        <MilestoneOverview milestones={milestones} />
      )}
    </Box>
  );
}
