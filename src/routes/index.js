import { useRoutes } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import UserRoutes from './UserRoutes';
import DeviceRoutes from './DeviceRoutes';
import ShowDeviceRoutes from './ShowDeviceRoutes';
import HomeRoutes from './HomeRoutes';
// import Home from 'layout/MainLayout/Header/Home';


export default function ThemeRoutes() {
  return useRoutes([HomeRoutes,MainRoutes, AuthenticationRoutes,UserRoutes,DeviceRoutes,ShowDeviceRoutes]);
}
