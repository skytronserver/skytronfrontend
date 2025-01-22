import { useRoutes } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import UserRoutes from './UserRoutes';
import DeviceRoutes from './DeviceRoutes';
import TaggingRoutes from './TaggingRoutes';
import SettingRoutes from './SettingRoutes';
import HomeRoutes from './HomeRoutes';
import LandingRoutes from './LandingRoutes';
// import Home from 'layout/MainLayout/Header/Home';
export default function ThemeRoutes() {
  return useRoutes([HomeRoutes,LandingRoutes,MainRoutes, AuthenticationRoutes,UserRoutes,DeviceRoutes,SettingRoutes,TaggingRoutes]);
}
