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
import {  decipherEncryption } from '../helper';
import NotAuthorized from '../views/pages/NotAuthorized';
import TaggedList from '../views/reports/TaggedList';

const PrivateRoute = ({ element,roles }) => {
  const myDecipher = decipherEncryption('skytrack')
  const userData=sessionStorage.getItem('cookiesData');
  const data=userData && userData.split("-").map(item=>myDecipher(item))
  const isAuthenticated = useSelector((state) => state.login.user.isAuthenticated) || sessionStorage.getItem('isAuthenticated');
  const userRoles=userData && data.length > 2 && data[1]; // Get the user role after login from redux store
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
    element: <PrivateRoute element={route.element} roles={route.roles}/>,
  });
  
  
const DeviceRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/device/new",
      element: <DeviceForm  formTitle="New Device Form"/>,
      roles:['superadmin','devicemanufacture'],
    },
    {
        path: "/deviceModel/new",
        element: <DeviceModelForm fieldConfig={deviceModelFormField} initialData={deviceModelInitials} formTitle="New Device Model Form"/>,
        roles:['superadmin','devicemanufacture'],
    },
    {
        path: "/deviceModel/extension",
        element: <ModelExtension  formTitle="Model Extension"/>,
        roles:['superadmin','devicemanufacture'],
    },
    {
      path: "/device/list",
      element: <DeviceModelList/>,
      roles:['superadmin','devicemanufacture'],
    },
    {
      path: "/deviceCOP/list",
      element: <UnapproveCopList/>,
      roles:['superadmin','devicemanufacture','stateadmin'],
      
    },
    {
      path: "/deviceModel/view/:deviceId",
      element: <StateAdminDeviceModelView/>,
      roles:['superadmin','devicemanufacture','stateadmin'],
    },
    {
      path: "/deviceCOPModel/view/:deviceId",
      element: <StateAdminCOPModelView/>,
      roles:['superadmin','devicemanufacture','stateadmin'],
    },
    {
      path: "/device/bulkupload",
      element: <BulkUpload/>,
      roles:['superadmin','devicemanufacture'],
    },
    {
      path: "/device/show-device",
      element: <ShowDevice/>,
      roles:['superadmin','devicemanufacture','dealer'],
    },
    {
      path: "/device/assign-device",
      element: <AssignDevice />,
      roles:['superadmin','devicemanufacture'],
    },
    {
      path: "/device/show-available-device",
      element: <AvailableForSale />,
      roles:['superadmin','devicemanufacture'],
    },
    {
      path: "/device/show-tagged-device",
      element: <TaggedList />,
      roles:['superadmin','devicemanufacture','dealer'],
    },
    {
      path: "/device/fit-device",
      element: <ConfigureDevice status='Available_for_fitting'/>,
      roles:['superadmin','devicemanufacture'],
    }
  ].map((route) => applyPrivateRoute(route)),
};

export default DeviceRoutes;


