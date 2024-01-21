import { lazy } from "react";

// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";
import {eSIMInitialValues,eSIMFormField} from "../formjson/eSIMUser";
import {deviceMakeInitialValues,deviceMakeFormField} from "../formjson/deviceMake";
import {dealerInitialValues,dealerFormField} from "../formjson/dealer";
import {stateAdminInitialValues,stateAdminField} from "../formjson/stateAdmin";
import {vehicleOwnerInitialValues,vehicleOwnerField} from "../formjson/vehicleOwner";
import DynamicForm from "../views/forms/DynamicForm";
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
    }
  ],
};

export default UserRoutes;
