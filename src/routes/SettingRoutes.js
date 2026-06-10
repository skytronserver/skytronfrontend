import { Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import IPSetting from "../views/settings/IPSetting";
import LoginSettings from "../views/settings/LoginSettings";
import {
  vehicleCategoryFormFields,
  vehicleCategoryInitialsFields,
} from "../formjson/vehicleCategory";
import {
  notificationPreferencesFormFields,
  notificationPreferencesInitialsFields,
} from "../formjson/notificationPreferences";
import { stateFields, stateInitials, districtFields, districtInitials } from "../formjson/stateDistrict";
import VehicleCategory from "../views/settings/VehicleCategory";
import NotificationPreferences from "../views/settings/NotificationPreferences";
import StateDistrict from "../views/settings/StateDistrict";
import FrequencyFirmware from "../views/settings/FrequencyFirmware";
import SendCommand from "../views/settings/SendCommand";
import ArchiveRestore from "../views/settings/ArchiveRestore";
import NoticeForm from "../views/forms/NoticeForm";
import SchoolHolidayForm from "../views/forms/SchoolHolidayForm";
import SchoolHolidayList from "../views/reports/SchoolHolidayList";
import PermitConditionManagement from "../views/settings/PermitConditionManagement";
import { decipherEncryption } from '../helper';
import { useSelector } from "react-redux";
import NotAuthorized from "../views/pages/NotAuthorized";

// ─── RBAC Pages ────────────────────────────────────────────────────────────────
import RoleManagement from "../views/settings/RoleManagement";
import PermissionManagement from "../views/settings/PermissionManagement";
import CustomUserManagement from "../views/user/CustomUserManagement";

const PrivateRoute = ({ element, roles }) => {
  const myDecipher = decipherEncryption('skytrack')
  const userData = sessionStorage.getItem('cookiesData') || localStorage.getItem('cookiesData');
  const data = userData && userData.split("-").map(item => myDecipher(item))
  const isAuthenticated = useSelector((state) => state.login.user.isAuthenticated) || sessionStorage.getItem('isAuthenticated') || localStorage.getItem('isAuthenticated');
  const userRoles = data && data.length > 2 && data[1];

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
  element: <PrivateRoute element={route.element} roles={route.roles} />,
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
      path: "/setting/notification-preferences",
      element: (
        <NotificationPreferences
          fieldConfig={notificationPreferencesFormFields}
          initialData={notificationPreferencesInitialsFields}
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
        <FrequencyFirmware />
      ),
      roles: ['superadmin', 'devicemanufacture']
    },
    {
      path: "/setting/archive-restore",
      element: (
        <ArchiveRestore />
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/notice/*",
      element: (
        <NoticeForm />
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/ip-settings",
      element: (
        <IPSetting />
      ),
      roles: ['superadmin', 'dealer']
    },
    {
      path: "/setting/holiday/*",
      element: (
        <SchoolHolidayForm />
      ),
      roles: ['superadmin', 'owner']
    },
    {
      path: "/setting/holiday/new",
      element: (
        <SchoolHolidayForm />
      ),
      roles: ['superadmin', 'owner']
    },
    {
      path: "/setting/login-settings",
      element: (
        <LoginSettings />
      ),
      roles: ['superadmin']
    },
    {
      path: "/holiday/all-holiday-list",
      element: (
        <SchoolHolidayList />
      ),
      roles: ['superadmin', 'owner']
    },
    {
      path: "/setting/send-command",
      element: (
        <SendCommand />
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/permit-conditions",
      element: (
        <PermitConditionManagement />
      ),
      roles: ['superadmin']
    },
    // ─── RBAC Routes ─────────────────────────────────────────────────────────
    {
      path: "/setting/rbac/roles",
      element: <RoleManagement />,
      roles: ['superadmin']
    },
    {
      path: "/setting/rbac/permissions",
      element: <PermissionManagement />,
      roles: ['superadmin']
    },
    {
      path: "/setting/rbac/custom-users",
      element: <CustomUserManagement />,
      roles: ['superadmin']
    },
  ].map((route) => applyPrivateRoute(route)),
};

export default SettingRoutes;
