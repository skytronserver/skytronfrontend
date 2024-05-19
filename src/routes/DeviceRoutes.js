import { Navigate } from 'react-router-dom';
// project imports
import { lazy } from "react";
import MainLayout from "../layout/MainLayout";

import {deviceModelInitials,deviceModelFormField} from "../formjson/deviceModel";
import DeviceForm from "../views/forms/DeviceForm";
import DeviceModelForm from "../views/forms/DeviceModelForm";
import ModelExtension from "../views/forms/ModelExtension";
import DeviceModelList from "../views/reports/DeviceModelList";
import StateAdminDeviceModelView from '../views/detailsview/StateAdminDeviceModelView';
import { useSelector } from "react-redux";
import UnapproveCopList from '../views/reports/UnapproveCopList';
import StateAdminCOPModelView from '../views/detailsview/StateAdminCOPModelView';
import BulkUpload from "../views/forms/BulkUpload"
import Loadable from "../ui-component/Loadable";
import AssignDevice from '../views/forms/AssignDevice';
import ShowDevice from '../views/showDevice/ShowDevice';
import AvailableForSale from '../views/showDevice/AvailableForSale';
import ConfigureDevice from 'views/tagging/ConfigureDevice';
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
      element: <DeviceForm  formTitle="New Device Form"/>,
    },
    {
        path: "/deviceModel/new",
        element: <DeviceModelForm fieldConfig={deviceModelFormField} initialData={deviceModelInitials} formTitle="New Device Model Form"/>,
    },
    {
        path: "/deviceModel/extension",
        element: <ModelExtension  formTitle="Model Extension"/>,
    },
    {
      path: "/device/list",
      element: <DeviceModelList/>,
    },
    {
      path: "/deviceCOP/list",
      element: <UnapproveCopList/>,
    },
    {
      path: "/deviceModel/view/:deviceId",
      element: <StateAdminDeviceModelView/>,
    },
    {
      path: "/deviceCOPModel/view/:deviceId",
      element: <StateAdminCOPModelView/>,
    },
    {
      path: "/device/bulkupload",
      element: <BulkUpload/>,
    },
    {
      path: "/device/show-device",
      element: <ShowDevice/>,
    },
    {
      path: "/device/assign-device",
      element: <AssignDevice />,
    },
    {
      path: "/device/show-available-device",
      element: <AvailableForSale />,
    },
    {
      path: "/device/fit-device",
      element: <ConfigureDevice status='Available_for_fitting'/>,
    }
  ].map((route) => applyPrivateRoute(route)),
};

export default DeviceRoutes;


