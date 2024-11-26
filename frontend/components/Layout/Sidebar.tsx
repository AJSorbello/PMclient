'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery,
  Collapse,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as ProjectsIcon,
  PhotoLibrary as PhotosIcon,
  Brush as SketchesIcon,
  Receipt as EstimatesIcon,
  Add as AddIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useState } from 'react';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
  children?: MenuItem[];
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  selectedProjectId?: string;
}

export default function Sidebar({ open, onClose, selectedProjectId }: SidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [projectMenuOpen, setProjectMenuOpen] = useState(true);

  const handleProjectMenuClick = () => {
    setProjectMenuOpen(!projectMenuOpen);
  };

  const baseMenuItems: MenuItem[] = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    {
      text: 'Projects',
      icon: <ProjectsIcon />,
      path: '/projects',
      children: selectedProjectId
        ? [
            {
              text: 'Photos',
              icon: <PhotosIcon />,
              path: `/projects/${selectedProjectId}/photos`,
            },
            {
              text: 'Sketches',
              icon: <SketchesIcon />,
              path: `/projects/${selectedProjectId}/sketches`,
            },
            {
              text: 'Estimates',
              icon: <EstimatesIcon />,
              path: `/projects/${selectedProjectId}/estimates`,
            },
          ]
        : [],
    },
  ];

  const drawer = (
    <Box sx={{ mt: '64px' }}>
      <List>
        <ListItem sx={{ mb: 2 }}>
          <Button
            component={Link}
            href="/projects/new"
            variant="contained"
            startIcon={<AddIcon />}
            fullWidth
            onClick={isMobile ? onClose : undefined}
          >
            New Project
          </Button>
        </ListItem>

        {baseMenuItems.map((item) => (
          <Box key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={pathname === item.path}
                onClick={item.children ? handleProjectMenuClick : isMobile ? onClose : undefined}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.contrastText,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: pathname === item.path
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.children && item.children.length > 0 && (
                  projectMenuOpen ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>

            {item.children && item.children.length > 0 && (
              <Collapse in={projectMenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding>
                      <ListItemButton
                        component={Link}
                        href={child.path}
                        selected={pathname === child.path}
                        onClick={isMobile ? onClose : undefined}
                        sx={{
                          pl: 4,
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.contrastText,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.main,
                            },
                            '& .MuiListItemIcon-root': {
                              color: theme.palette.primary.contrastText,
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            color: pathname === child.path
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.primary,
                          }}
                        >
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
