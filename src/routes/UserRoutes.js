import { lazy } from "react";

// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";

const NewUser=Loadable(
  lazy(() => import("../views/user/new"))
)
const ListUser=Loadable(
  lazy(()=>import("../views/user/list"))
)
// ==============================|| AUTHENTICATION ROUTING ||============================== //

const UserRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/user/new",
      element: <NewUser />,
    },
    {
      path: "/user/list",
      element: <ListUser />,
    }
  ],
};

export default UserRoutes;
