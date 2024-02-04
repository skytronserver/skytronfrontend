import { Navigate } from 'react-router-dom';
// project imports
import MainLayout from "../layout/MainLayout";
import {deviceInitials,deviceFormField} from "../formjson/deviceForm";
import {deviceModelInitials,deviceModelFormField} from "../formjson/deviceModel";
import {modelExtensionInitials,modelExtensionFormField} from "../formjson/modelExtension";
import DeviceForm from "../views/forms/DeviceForm";
import DeviceModelForm from "../views/forms/DeviceModelForm";
import ModelExtension from "../views/forms/ModelExtension";
import { useSelector } from "react-redux";
const PrivateRoute = ({ element }) => {
  const isAuthenticated = true; /*useSelector(
    (state) => state.login.user.isAuthenticated
  );*/
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} />,
});

const DeviceRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/device/new",
      element: <DeviceForm fieldConfig={deviceFormField} initialData={deviceInitials} formTitle="New Device Form"/>,
    },
    {
        path: "/deviceModel/new",
        element: <DeviceModelForm fieldConfig={deviceModelFormField} initialData={deviceModelInitials} formTitle="New Device Model Form"/>,
    },
    {
        path: "/deviceModel/extension",
        element: <ModelExtension fieldConfig={modelExtensionFormField} initialData={modelExtensionInitials} formTitle="Model Extension"/>,
    },
    {
      path: "/device/list",
      element: <DeviceForm fieldConfig={deviceFormField} initialData={deviceInitials} formTitle="State Admin"/>,
    },
  ].map((route) => applyPrivateRoute(route)),
};

export default DeviceRoutes;
