import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  People as TeamIcon,
  AttachMoney as BudgetIcon,
  Description as DocumentIcon,
  Event as TimelineIcon,
  Build as ResourceIcon,
  Warning as RiskIcon,
  Comment as CommentIcon,
  Description,
  PhotoLibrary,
  Receipt,
} from '@mui/icons-material';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  budget: number;
  manager: {
    name: string | null;
    email: string;
  } | null;
}

interface ProjectSidebarProps {
  project: Project;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ project }) => {
  const menuItems = [
    { text: 'Project Details', icon: <Description />, href: `/projects/${project.id}` },
    { text: 'Photos', icon: <PhotoLibrary />, href: `/projects/${project.id}/photos` },
    { text: 'Estimates', icon: <Receipt />, href: `/projects/${project.id}/estimates` },
    { text: 'Tasks', icon: <TaskIcon />, href: `/projects/${project.id}/tasks` },
    { text: 'Team', icon: <TeamIcon />, href: `/projects/${project.id}/team` },
    { text: 'Budget', icon: <BudgetIcon />, href: `/projects/${project.id}/budget` },
    { text: 'Timeline', icon: <TimelineIcon />, href: `/projects/${project.id}/timeline` },
    { text: 'Resources', icon: <ResourceIcon />, href: `/projects/${project.id}/resources` },
    { text: 'Risks', icon: <RiskIcon />, href: `/projects/${project.id}/risks` },
    { text: 'Comments', icon: <CommentIcon />, href: `/projects/${project.id}/comments` },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: '#1a237e',
          color: 'white',
        },
      }}
    >
      <div className="p-6">
        <Typography variant="h6" component="div" sx={{ color: 'white', mb: 1 }}>
          {project.name}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
          Manager: {project.manager?.name || project.manager?.email || 'Not assigned'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Budget: ${project.budget.toLocaleString()}
        </Typography>
      </div>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <List>
        {menuItems.map((item) => (
          <Link key={item.text} href={item.href}>
            <ListItem
              button
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          </Link>
        ))}
      </List>
    </Drawer>
  );
};

export default ProjectSidebar;
