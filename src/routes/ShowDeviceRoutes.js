import { lazy } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";
import { decipherEncryption } from '../helper';
import { useSelector } from "react-redux";
import NotAuthorized from "../views/pages/NotAuthorized";
import { canViewRoute } from "../utils/rbacUtils";

const PrivateRoute = ({ element, roles }) => {
  const location = useLocation();
  const myDecipher = decipherEncryption('skytrack')
  const userData = sessionStorage.getItem('cookiesData') || localStorage.getItem('cookiesData');
  const data = userData && userData.split("-").map(item => myDecipher(item))
  const isAuthenticated = useSelector((state) => state.login.user.isAuthenticated) || sessionStorage.getItem('isAuthenticated') || localStorage.getItem('isAuthenticated');
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store
  
  const permissions = (() => {
    try {
      const raw = sessionStorage.getItem('userPermissions') || localStorage.getItem('userPermissions');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (userRoles) {
    const canAccess = canViewRoute(location.pathname, userRoles, permissions, roles);
    if (!canAccess) {
      return <NotAuthorized />;
    }
  } else if (roles && roles.length > 0 && !roles.some(role => userRoles.includes(role))) {
    return <NotAuthorized />;
  }
  
  return element;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} />,
});

const ShowDevice = Loadable(
  lazy(() => import("../views/showDevice/ShowDevice"))
);

const AllTaggedDevice = Loadable(
  lazy(() => import("../views/showDevice/AllTaggedDevice"))
);

const ShowDeviceRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: 'show-device',
      element: <ShowDevice />,
      roles: ['superadmin', 'devicemanufacture'],
    },
  ],
};

export default ShowDeviceRoutes;
