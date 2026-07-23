import PrivateRoute from './PrivateRoute';
// project imports

import MainLayout from "../layout/MainLayout";
import { lazy } from "react";
import Loadable from "../ui-component/Loadable";

const AccessoryForm = Loadable(lazy(() => import("views/forms/AccessoryForm")));




const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} />,
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
