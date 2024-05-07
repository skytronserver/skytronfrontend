import { lazy } from "react";
import { Navigate } from 'react-router-dom';
// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";
import {stateAdminInitialValues,stateAdminField} from "../formjson/stateAdmin";
import {otherUserInitialValues,otherUserFormField} from "../formjson/otherUser";
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
const PrivateRoute = ({ element,roles }) => {
  const isAuthenticated = true; /*useSelector(
    (state) => state.login.user.isAuthenticated
  );*/
  const userRoles='admin'; // Get the user role after login from redux store

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (roles && roles.length > 0 && !roles.some(role => userRoles.includes(role))) {
    // User does not have any of the required roles
    return <Navigate to="/" replace />;
  }
  return element;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles}/>,
});


const ListUser=Loadable(
  lazy(()=>import("../views/user/list"))
)
const Dummy=Loadable(
  lazy(()=>import("../views/user/dummy"))
)
const Dynamic=Loadable(
  lazy(()=>import("../views/user/dynamic"))
)
const CreateManufacturer=Loadable( lazy(()=>import("../views/pages/device/CreateNew")))
// ==============================|| AUTHENTICATION ROUTING ||============================== //




const UserRoutes = {
  path: "/",
  element: <MainLayout />,

  children: [
    {
      path: "/user/newStateAdmin",
      element: <StateAdmin/>,
      roles: ['admin', 'stateadmin','user']
    },
    {
      path: "/user/list",
      element: <ListUser />,
    },
    {
      path: "/manufacturer/new",
      element: <CreateManufacturer />,
    },
    {
      path: "/user/dummy",
      element: <Dummy />,
    },
    {
      path: "/user/dynamic",
      element: <Dynamic/>,
    },
    {
      path: "/user/newEsimUser",
      element: <EsimUser/>,
    }
    ,
    {
      path: "/user/newManufacturer",
      element: <Manufacturer/>,
    }
    ,
    {
      path: "/user/newDto",
      element: <DtoRto/>,
    },
    {
      path: "/user/newDealerAccount",
      element:<DealerAccount/>,
    },
    {
      path: "/new/vehicleOwner",
      element: <VehicleOwner />,
    },
    {
      path: "/new/otherUser",
      element: <DynamicForm fieldConfig={otherUserFormField} initialData={otherUserInitialValues} formTitle="Other Users" userRole="others"/>,
    },
    {
      path: "/new/sos-admin",
      element: <SOSAdmin/>,
    },
    {
      path: "/new/sos-user",
      element: <SOSUser/>,
    },
    {
      path: "/user/registeredUser",
      element: <UsersList/>,
    },
    {
      path: "/user/dealerList",
      element: <DealerList/>,
    },
    {
      path: "/user/view/:userId",
      element: <UpdateForm fieldConfig={stateAdminField} initialData={stateAdminInitialValues} formTitle="State Admin"/>,
    }
    ,
    {
      path: "/file",
      element: <FileUploadTest/>,
    }
  ].map((route) => applyPrivateRoute(route)),

};

export default UserRoutes;


