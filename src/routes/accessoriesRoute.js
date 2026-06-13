import PrivateRoute from './PrivateRoute';
import { Navigate } from "react-router-dom";
// project imports

import MainLayout from "../layout/MainLayout";
import { useSelector } from "react-redux";
import { decipherEncryption } from "../helper";
import NotAuthorized from "../views/pages/NotAuthorized";
import AccessoryForm from "views/forms/AccessoryForm";




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
