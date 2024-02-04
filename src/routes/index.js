import { useRoutes } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import UserRoutes from './UserRoutes';
import DeviceRoutes from './DeviceRoutes';

export default function ThemeRoutes() {
  return useRoutes([MainRoutes, AuthenticationRoutes,UserRoutes,DeviceRoutes]);
}
