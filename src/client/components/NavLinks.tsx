import { NavItem } from './layout/types';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import TimelineIcon from '@mui/icons-material/Timeline';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export const navItems: NavItem[] = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/activity-log', label: 'Activity Log', icon: <TimelineIcon /> },
  {
    path: '/configure-activities',
    label: 'Configure',
    icon: <SettingsIcon />,
  },
];

export const menuItems: NavItem[] = [
  { path: '/', label: 'Home', icon: <HomeIcon /> },
  { path: '/ai-chat', label: 'AI Chat', icon: <ChatIcon /> },
  { path: '/activity-log', label: 'Activity Log', icon: <TimelineIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  {
    path: '/configure-activities',
    label: 'Configure Activities',
    icon: <SettingsIcon />,
  },
  { path: '/foods-management', label: 'Foods Management', icon: <RestaurantIcon /> },
];
