
import { lazy } from "react";
import { Navigate } from 'react-router-dom';
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";

const isAuthenticated = true;

const PrivateRoute = ({ element }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} />,
});

const ShowDevice = Loadable(
  lazy(() => import("../views/showDevice/ShowDevice"))
)

const ShowDeviceRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: 'show-device',
      element: <ShowDevice />,
    },
  ],
};

export default ShowDeviceRoutes;
