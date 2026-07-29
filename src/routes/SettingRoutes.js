import PrivateRoute from './PrivateRoute';
import MainLayout from "../layout/MainLayout";
import { lazy } from "react";
import Loadable from "../ui-component/Loadable";
import {
  vehicleCategoryFormFields,
  vehicleCategoryInitialsFields,
} from "../formjson/vehicleCategory";
import {
  notificationPreferencesFormFields,
  notificationPreferencesInitialsFields,
} from "../formjson/notificationPreferences";
import { stateFields, stateInitials, districtFields, districtInitials } from "../formjson/stateDistrict";
import { vehicleCategoryCodeFormFields, vehicleCategoryCodeInitialsFields } from "../formjson/vehicleCategoryCode";
import { permitMasterFormFields, permitMasterInitialsFields } from "../formjson/permitMaster";

const IPSetting = Loadable(lazy(() => import("../views/settings/IPSetting")));
const LoginSettings = Loadable(lazy(() => import("../views/settings/LoginSettings")));
const VehicleCategory = Loadable(lazy(() => import("../views/settings/VehicleCategory")));
const VehicleCategoryCode = Loadable(lazy(() => import("../views/settings/VehicleCategoryCode")));
const PermitMaster = Loadable(lazy(() => import("../views/settings/PermitMaster")));
const NotificationPreferences = Loadable(lazy(() => import("../views/settings/NotificationPreferences")));
const StateDistrict = Loadable(lazy(() => import("../views/settings/StateDistrict")));
const FrequencyFirmware = Loadable(lazy(() => import("../views/settings/FrequencyFirmware")));
const SendCommand = Loadable(lazy(() => import("../views/settings/SendCommand")));
const ArchiveRestore = Loadable(lazy(() => import("../views/settings/ArchiveRestore")));
const NoticeForm = Loadable(lazy(() => import("../views/forms/NoticeForm")));
const SchoolHolidayForm = Loadable(lazy(() => import("../views/forms/SchoolHolidayForm")));
const SchoolHolidayList = Loadable(lazy(() => import("../views/reports/SchoolHolidayList")));
const PermitConditionManagement = Loadable(lazy(() => import("../views/settings/PermitConditionManagement")));

// ─── RBAC Pages ────────────────────────────────────────────────────────────────
const RoleManagement = Loadable(lazy(() => import("../views/settings/RoleManagement")));
const PermissionManagement = Loadable(lazy(() => import("../views/settings/PermissionManagement")));
const CustomUserManagement = Loadable(lazy(() => import("../views/user/CustomUserManagement")));
const CustomAlertManagement = Loadable(lazy(() => import("../views/settings/CustomAlertManagement")));


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
          formTitle="Vehicle Type"
        />
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/vehicle-category-code",
      element: (
        <VehicleCategoryCode
          fieldConfig={vehicleCategoryCodeFormFields}
          initialData={vehicleCategoryCodeInitialsFields}
        />
      ),
      roles: ['superadmin']
    },
    {
      path: "/setting/permit-master",
      element: (
        <PermitMaster
          fieldConfig={permitMasterFormFields}
          initialData={permitMasterInitialsFields}
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
    // ─── Custom Alerts ───────────────────────────────────────────────────────
    {
      path: "/setting/custom-alerts",
      element: <CustomAlertManagement />,
      roles: ['superadmin', 'stateadmin']
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
