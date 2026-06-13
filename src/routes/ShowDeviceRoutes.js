import PrivateRoute from './PrivateRoute';
import { lazy } from "react";
import { Navigate, useLocation } from 'react-router-dom';
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";
import { decipherEncryption } from '../helper';
import { useSelector } from "react-redux";
import NotAuthorized from "../views/pages/NotAuthorized";
import { canViewRoute } from "../utils/rbacUtils";



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
