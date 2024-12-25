import { lazy } from "react";
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
import DynamicForm from "../views/forms/DynamicForm";
import StateAdmin from "../views/forms/StateAdmin";
import UpdateForm from "../views/forms/UpdateForm";
import UsersList from "../views/reports/UsersList";
import { useSelector } from "react-redux";
import FileUploadTest from "../views/forms/FileUploadTest";
import DealerAccount from "../views/forms/DealerAccount";
import VehicleOwner from "../views/forms/VehicleOwner";
import DealerList from "../views/reports/DealerList";
import DtoRto from "../views/forms/DtoRto";
import Manufacturer from "../views/forms/Manufacturer";
import EsimUser from "../views/forms/EsimUser";
import SOSAdmin from "../views/forms/SOSAdmin";
import SOSUser from "../views/forms/SOSUser";
import { decipherEncryption } from "../helper";
import NotAuthorized from "../views/pages/NotAuthorized";
import Details from "../views/pages/Details";
import ManufacturerList from "../views/reports/ManufacturerList";
import VehicleOwnerList from "../views/reports/VehicleOwnerList";
import SOSUserList from "../views/reports/SOSUserList";
import SOSOtherList from "../views/reports/SOSOtherList";
import StateAdminList from "../views/reports/StateAdminList";
import DTOUserList from "../views/reports/DTOUserList";
import EsimProviderList from "../views/reports/EsimProviderList";
import NoticeList from "../views/reports/NoticeList";
import CreateEMTeam from "../views/sosManagement/CreateEMTeam";
import ListEmTeam from "../views/sosManagement/ListEmTeam";
const PrivateRoute = ({ element, roles }) => {
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated");
  const userRoles = data.length > 2 && data[1]; // Get the user role after login from redux store
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
      path: "/user/newEsimUser",
      element: <EsimUser />,
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
      roles: ["stateadmin"],
    },
    {
      path: "/new/vehicleOwner/*",
      element: <VehicleOwner />,
      roles: ["dealer"],
    },
    {
      path: "/user/vehicle-owner-list",
      element: <VehicleOwnerList />,
      roles: ["dealer", "stateadmin","superadmin"],
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
      roles: ["superadmin", "stateadmin", "dealer", "devicemanufacture","sosadmin"],
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
      path: "/notice/all-notice-list",
      element: <NoticeList />,
      roles: ["superadmin"],
    },
    {
      path: "/user/esim-provider-list",
      element: <EsimProviderList />,
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
  ].map((route) => applyPrivateRoute(route)),
};

export default UserRoutes;
