import { lazy } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";
import {
  stateAdminInitialValues,
  stateAdminField,
} from "../formjson/stateAdmin";
import {
  otherUserInitialValues,
  otherUserFormField,
} from "../formjson/otherUser";
import { decipherEncryption } from "../helper";

// Lazy-loaded components
const DynamicForm = Loadable(lazy(() => import("../views/forms/DynamicForm")));
const StateAdmin = Loadable(lazy(() => import("../views/forms/StateAdmin")));
const UpdateForm = Loadable(lazy(() => import("../views/forms/UpdateForm")));
const UsersList = Loadable(lazy(() => import("../views/reports/UsersList")));
const FileUploadTest = Loadable(lazy(() => import("../views/forms/FileUploadTest")));
const DealerAccount = Loadable(lazy(() => import("../views/forms/DealerAccount")));
const VehicleOwner = Loadable(lazy(() => import("../views/forms/VehicleOwner")));
const DealerList = Loadable(lazy(() => import("../views/reports/DealerList")));
const DtoRto = Loadable(lazy(() => import("../views/forms/DtoRto")));
const Manufacturer = Loadable(lazy(() => import("../views/forms/Manufacturer")));
const M2MUser = Loadable(lazy(() => import("../views/forms/M2MUser")));
const SOSAdmin = Loadable(lazy(() => import("../views/forms/SOSAdmin")));
const SOSUser = Loadable(lazy(() => import("../views/forms/SOSUser")));
const SystemAdmin = Loadable(lazy(() => import("../views/forms/SystemAdmin")));
const TestAgencyDetailsForm = Loadable(lazy(() => import("../views/forms/TestAgencyDetailsForm")));
const TestAgencyCreate = Loadable(lazy(() => import("../views/forms/TestAgencyCreate")));
const TestAgencyList = Loadable(lazy(() => import("../views/pages/TestAgencyList")));
const TestAgencyDetailsList = Loadable(lazy(() => import("../views/pages/TestAgencyDetailsList")));
const NotAuthorized = Loadable(lazy(() => import("../views/pages/NotAuthorized")));
const Details = Loadable(lazy(() => import("../views/pages/Details")));
const ManufacturerList = Loadable(lazy(() => import("../views/reports/ManufacturerList")));
const VehicleOwnerList = Loadable(lazy(() => import("../views/reports/VehicleOwnerList")));
const SOSUserList = Loadable(lazy(() => import("../views/reports/SOSUserList")));
const SOSOtherList = Loadable(lazy(() => import("../views/reports/SOSOtherList")));
const SOSReport = Loadable(lazy(() => import("../views/reports/SOSReport")));
const StateAdminList = Loadable(lazy(() => import("../views/reports/StateAdminList")));
const DTOUserList = Loadable(lazy(() => import("../views/reports/DTOUserList")));
const M2MProviderList = Loadable(lazy(() => import("../views/reports/M2MProviderList")));
const NoticeList = Loadable(lazy(() => import("../views/reports/NoticeList")));
const CreateEMTeam = Loadable(lazy(() => import("../views/sosManagement/CreateEMTeam")));
const ListEmTeam = Loadable(lazy(() => import("../views/sosManagement/ListEmTeam")));
const SOSTimestamp = Loadable(lazy(() => import("views/sosManagement/SOSTimestamp")));
const PrivateRoute = ({ element, roles }) => {
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData") || localStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated") ||
    localStorage.getItem("isAuthenticated");
  const userRoles = data && data.length > 2 && data[1]; // Get the user role after login from redux store
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (
    roles &&
    roles.length > 0 &&
    !roles.some((role) => userRoles.includes(role))
  ) {
    // User does not have any of the required roles
    return <NotAuthorized />;
  }
  return element;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} />,
});

const ListUser = Loadable(lazy(() => import("../views/user/list")));
const Dummy = Loadable(lazy(() => import("../views/user/dummy")));
const Dynamic = Loadable(lazy(() => import("../views/user/dynamic")));
const CreateManufacturer = Loadable(
  lazy(() => import("../views/pages/device/CreateNew"))
);
// ==============================|| AUTHENTICATION ROUTING ||============================== //

const UserRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/user/newStateAdmin/*",
      element: <StateAdmin />,
      roles: ["superadmin"],
    },

    {
      path: "/user/list",
      element: <ListUser />,
      roles: ["superadmin"],
    },
    {
      path: "/manufacturer/new",
      element: <CreateManufacturer />,
      roles: ["superadmin"],
    },
    {
      path: "/user/dummy",
      element: <Dummy />,
      roles: ["superadmin"],
    },
    {
      path: "/user/dynamic",
      element: <Dynamic />,
      roles: ["superadmin"],
    },
    {
      path: "/user/newM2MUser",
      element: <M2MUser />,
      roles: ["superadmin"],
    },
    {
      path: "/user/newManufacturer",
      element: <Manufacturer />,
      roles: ["superadmin"],
    },
    {
      path: "/user/manufacturer-list",
      element: <ManufacturerList />,
      roles: ["superadmin"],
    },
    {
      path: "/user/dto-user-list",
      element: <DTOUserList />,
      roles: ["stateadmin"],
    },
    {
      path: "/user/newDto",
      element: <DtoRto />,
      roles: ["stateadmin"],
    },
    {
      path: "/user/newDealerAccount",
      element: <DealerAccount />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/new/vehicleOwner/*",
      element: <VehicleOwner />,
      roles: ["dealer"],
    },
    {
      path: "/user/vehicle-owner-list",
      element: <VehicleOwnerList />,
      roles: ["dealer", "stateadmin", "superadmin"],
    },
    {
      path: "/new/otherUser",
      element: (
        <DynamicForm
          fieldConfig={otherUserFormField}
          initialData={otherUserInitialValues}
          formTitle="Other Users"
          userRole="others"
        />
      ),
      roles: ["superadmin"],
    },
    {
      path: "/new/system-admin",
      element: <SystemAdmin />,
      roles: ["superadmin"],
    },
    {
      path: "/new/test-agency",
      element: <TestAgencyCreate />,
      roles: ["superadmin"],
    },
    {
      path: "/new/test-agency-details",
      element: <TestAgencyDetailsForm />,
      roles: ["superadmin"],
    },
    {
      path: "/test-agency/list",
      element: <TestAgencyList />,
      roles: ["superadmin"],
    },
    {
      path: "/test-agency/details-list",
      element: <TestAgencyDetailsList />,
      roles: ["superadmin"],
    },
    {
      path: "/new/sos-admin",
      element: <SOSAdmin />,
      roles: ["superadmin"],
    },
    {
      path: "/new/sos-user",
      element: <SOSUser />,
      roles: ["sosadmin"],
    },
    {
      path: "/user/registeredUser",
      element: <UsersList />,
      roles: ["superadmin"],
    },
    {
      path: "/user/dealerList",
      element: <DealerList />,
      roles: ["superadmin", "stateadmin", "devicemanufacture"],
    },
    {
      path: "/user/view/:userId",
      element: (
        <UpdateForm
          fieldConfig={stateAdminField}
          initialData={stateAdminInitialValues}
          formTitle="State Admin"
        />
      ),
      roles: ["superadmin"],
    },
    {
      path: "/user/detail/:userType/:userId",
      element: <Details />,
      roles: ["superadmin", "stateadmin", "dealer", "devicemanufacture", "sosadmin"],
    },
    {
      path: "/file",
      element: <FileUploadTest />,
      roles: ["superadmin"],
    },
    {
      path: "/user/sos-user-list",
      element: <SOSUserList />,
      roles: ["superadmin"],
    },
    {
      path: "/user/sos-other-list",
      element: <SOSOtherList />,
      roles: ["sosadmin"],
    },
    {
      path: "/sos-report",
      element: <SOSReport />,
      roles: ["superadmin", "sosadmin"],
    },
    {
      path: "/notice/all-notice-list",
      element: <NoticeList />,
      roles: ["superadmin"],
    },
    {
      path: "/user/m2m-provider-list",
      element: <M2MProviderList />,
      roles: ["superadmin"],
    },
    {
      path: "/user/state-admin-list",
      element: <StateAdminList />,
      roles: ["superadmin"],
    },
    {
      path: "/new/em-team/*",
      element: <CreateEMTeam />,
      roles: ["sosadmin"],
    },
    {
      path: "/list/em-team",
      element: <ListEmTeam />,
      roles: ["sosadmin"],
    },
    {
      path: "/sosTimestamp",
      element: <SOSTimestamp />,
      roles: ["superadmin", "sosadmin"]
    },
  ].map((route) => applyPrivateRoute(route)),
};

export default UserRoutes;
