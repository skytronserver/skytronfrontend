import { lazy } from "react";
import { Navigate } from 'react-router-dom';
// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";
import {eSIMInitialValues,eSIMFormField} from "../formjson/eSIMUser";
import {deviceMakeInitialValues,deviceMakeFormField} from "../formjson/deviceMake";
import {dealerInitialValues,dealerFormField} from "../formjson/dealer";
import {stateAdminInitialValues,stateAdminField} from "../formjson/stateAdmin";
import {vehicleOwnerInitialValues,vehicleOwnerField} from "../formjson/vehicleOwner";
import {otherUserInitialValues,otherUserFormField} from "../formjson/otherUser";
import DynamicForm from "../views/forms/DynamicForm";
import UpdateForm from "../views/forms/UpdateForm";
import UsersList from "../views/reports/UsersList";
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

const NewUser=Loadable(
  lazy(() => import("../views/user/new"))
)
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
      element: <DynamicForm fieldConfig={stateAdminField} initialData={stateAdminInitialValues} formTitle="State Admin"/>,
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
      element: <DynamicForm fieldConfig={eSIMFormField} initialData={eSIMInitialValues} formTitle="e SIM Provider"/>,
    }
    ,
    {
      path: "/user/newManufacturer",
      element: <DynamicForm fieldConfig={deviceMakeFormField} initialData={deviceMakeInitialValues} formTitle="Device Manufacturer"/>,
    }
    ,
    {
      path: "/user/newDealer",
      element: <DynamicForm fieldConfig={dealerFormField} initialData={dealerInitialValues} formTitle="Dealer"/>,
    }
    ,
    {
      path: "/new/vehicleOwner",
      element: <DynamicForm fieldConfig={vehicleOwnerField} initialData={vehicleOwnerInitialValues} formTitle="Vehicle Owner"/>,
    },
    {
      path: "/new/otherUser",
      element: <DynamicForm fieldConfig={otherUserFormField} initialData={otherUserInitialValues} formTitle="Other Users"/>,
    },
    {
      path: "/user/registeredUser",
      element: <UsersList/>,
    }
    ,
    {
      path: "/user/view/:userId",
      element: <UpdateForm/>,
    }
  ].map((route) => applyPrivateRoute(route)),
};

export default UserRoutes;
