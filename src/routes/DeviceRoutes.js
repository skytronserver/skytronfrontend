import { Navigate } from 'react-router-dom';
// project imports
import { lazy } from "react";
import MainLayout from "../layout/MainLayout";
import {deviceInitials,deviceFormField} from "../formjson/deviceForm";
import {deviceModelInitials,deviceModelFormField} from "../formjson/deviceModel";
import {modelExtensionInitials,modelExtensionFormField} from "../formjson/modelExtension";
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
const ShowDevice = Loadable(
  lazy(() => import("../views/showDevice/ShowDevice"))
)
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
    }
  ].map((route) => applyPrivateRoute(route)),
};

export default DeviceRoutes;
