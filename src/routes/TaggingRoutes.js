import { lazy } from "react";
import { Navigate } from "react-router-dom";
// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";
import { decipherEncryption } from '../helper';
import { useSelector } from "react-redux";

// Lazy-loaded components
const TagDeviceToVehicle = Loadable(lazy(() => import("../views/tagging/TagDeviceToVehicle")));
const UnApprovedTag = Loadable(lazy(() => import("../views/tagging/UnApprovedTag")));
const NotAuthorized = Loadable(lazy(() => import("../views/pages/NotAuthorized")));
const UploadReceipt = Loadable(lazy(() => import("../views/tagging/UploadReceipt")));
const VahanVerification = Loadable(lazy(() => import("../views/tagging/VahanVerification")));
const PrivateRoute = ({ element, roles }) => {
  const myDecipher = decipherEncryption('skytrack')
  const userData = sessionStorage.getItem('cookiesData') || localStorage.getItem('cookiesData');
  const data = userData && userData.split("-").map(item => myDecipher(item))
  const isAuthenticated = useSelector((state) => state.login.user.isAuthenticated) || sessionStorage.getItem('isAuthenticated') || localStorage.getItem('isAuthenticated');
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (roles && roles.length > 0 && !roles.some(role => userRoles.includes(role))) {
    // User does not have any of the required roles
    return <NotAuthorized />;
  }
  return element;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} />,
});



const TaggingRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "tag/device-vehicle",
      element: (
        <TagDeviceToVehicle />
      ),
      roles: ['dealer', 'superadmin']
    },
    {
      path: "tag/unapproved-vehicle",
      element: (
        <UnApprovedTag />
      ),
      roles: ['dealer', 'superadmin']
    },
    {
      path: "tag/download-receipt",
      element: (
        <UploadReceipt />
      ),
      roles: ['dealer', 'superadmin']
    },
    {
      path: "tag/vahan-verification",
      element: (
        <VahanVerification />
      ),
      roles: ['dealer', 'superadmin']
    }
  ].map((route) => applyPrivateRoute(route)),
};

export default TaggingRoutes;
