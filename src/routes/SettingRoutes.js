import { Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import {
  vehicleCategoryInitialsFields,
  vehicleCategoryFormFields,
} from "../formjson/vehicleCategory";
import {stateInitials,stateFields,districtFields,districtInitials} from "../formjson/stateDistrict"
import VehicleCategory from "../views/settings/VehicleCategory";
import StateDistrict from "../views/settings/StateDistrict";
import FrequencyFirmware from "../views/settings/FrequencyFirmware";
import IPSetting from "../views/settings/IPSetting";
import ArchiveRestore from "../views/settings/ArchiveRestore";
import { decipherEncryption } from '../helper';
import { useSelector } from "react-redux";
import NotAuthorized from "../views/pages/NotAuthorized";
import NoticeForm from "../views/forms/NoticeForm";
import SchoolHolidayForm from "../views/forms/SchoolHolidayForm";
import SchoolHolidayList from "../views/reports/SchoolHolidayList";

const PrivateRoute = ({ element,roles }) => {
  const myDecipher = decipherEncryption('skytrack')
  const userData=sessionStorage.getItem('cookiesData');
  const data=userData && userData.split("-").map(item=>myDecipher(item))
  const isAuthenticated = useSelector((state) => state.login.user.isAuthenticated) || sessionStorage.getItem('isAuthenticated');
  const userRoles=data.length > 2 && data[1];

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

const SettingRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/setting/vehicle-category",
      element: (
        <VehicleCategory
          fieldConfig={vehicleCategoryFormFields}
          initialData={vehicleCategoryInitialsFields}
          formTitle="Vehicle Category"
        />
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/state-district",
      element: (
        <StateDistrict
          fieldConfig={stateFields}
          initialData={stateInitials}
          formTitle="State"
          districtConfig={districtFields}
          districtInitials={districtInitials}
        />
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/frequency-firmware",
      element: (
        <FrequencyFirmware/>
      ),
      roles: ['superadmin','devicemanufacture']
    },
    {
      path: "/setting/archive-restore",
      element: (
        <ArchiveRestore/>
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/notice/*",
      element: (
        <NoticeForm/>
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/ip-settings",
      element: (
        <IPSetting/>
      ),
      roles: ['superadmin','dealer']
    },
    {
      path: "/setting/holiday/*",
      element: (
        <SchoolHolidayForm/>
      ),
      roles: ['superadmin', 'owner']
    },
    {
      path: "/setting/holiday/new",
      element: (
        <SchoolHolidayForm/>
      ),
      roles: ['superadmin', 'owner']
    },
    {
      path: "/holiday/all-holiday-list",
      element: (
        <SchoolHolidayList/>
      ),
      roles: ['superadmin', 'owner']
    },
  ].map((route) => applyPrivateRoute(route)),
};

export default SettingRoutes;
