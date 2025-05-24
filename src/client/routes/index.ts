import { Home } from './Home';
import { NotFound } from './NotFound';
import { AIChat } from './AIChat';
import { Settings } from './Settings';
import { createRoutes } from '../router';
import { Profile } from './Profile';
import ConfigureActivities from './ConfigureActivities';
import HistoryPage from './History';
import ActivityLogPage from './ActivityLog';
import { FoodsManagement } from './FoodsManagement';

// Define routes
export const routes = createRoutes({
  '/': Home,
  '/ai-chat': AIChat,
  '/settings': Settings,
  '/profile': Profile,
  '/configure-activities': ConfigureActivities,
  '/history': HistoryPage,
  '/activity-log': ActivityLogPage,
  '/foods-management': FoodsManagement,
  '/not-found': NotFound,
});
