import { lazy } from "react";

// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";

const NewUser=Loadable(
  lazy(() => import("../views/user/new"))
)

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const UserRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/user/new",
      element: <NewUser />,
    }
  ],
};

export default UserRoutes;
