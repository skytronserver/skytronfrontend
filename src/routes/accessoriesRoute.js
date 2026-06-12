import { Navigate } from "react-router-dom";
// project imports

import MainLayout from "../layout/MainLayout";
import { useSelector } from "react-redux";
import { decipherEncryption } from "../helper";
import NotAuthorized from "../views/pages/NotAuthorized";
import AccessoryForm from "views/forms/AccessoryForm";
import { canViewRoute } from "../utils/rbacUtils";


const PrivateRoute = ({ element, roles, path }) => {
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData") || localStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated") ||
    localStorage.getItem("isAuthenticated");
  const permissions = useSelector((state) => state.login.permissions) || (() => {
    try {
      const raw = sessionStorage.getItem('userPermissions') || localStorage.getItem('userPermissions');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const formattedPath = path?.startsWith('/') ? path : `/${path}`;
  const isAuthorized = canViewRoute(formattedPath, userRoles, permissions, roles);

  if (!isAuthorized) {
    // User does not have any of the required roles or module permissions
    return <NotAuthorized />;
  }
  return element;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} path={route.path} />,
});

const AccessoriesRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/accessory/new",
      element: <AccessoryForm formTitle="New Accessory Form" />,
      roles: ["devicemanufacture"]
    }
  ].map((route) => applyPrivateRoute(route)),
};

export default AccessoriesRoutes;
