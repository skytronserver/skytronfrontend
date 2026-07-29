import PrivateRoute from './PrivateRoute';
import { lazy } from "react";
// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";

// Lazy-loaded components
const TagDeviceToVehicle = Loadable(lazy(() => import("../views/tagging/TagDeviceToVehicle")));
const UnApprovedTag = Loadable(lazy(() => import("../views/tagging/UnApprovedTag")));
const NotAuthorized = Loadable(lazy(() => import("../views/pages/NotAuthorized")));
const UploadReceipt = Loadable(lazy(() => import("../views/tagging/UploadReceipt")));
const VahanVerification = Loadable(lazy(() => import("../views/tagging/VahanVerification")));


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
