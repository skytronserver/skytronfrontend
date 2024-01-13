import { lazy } from "react";

// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";


const AuthRegister3 = Loadable(
  lazy(() => import("../views/pages/authentication/authentication3/Register3"))
);
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
    },
    {
      path: "/pages/register/register3",
      element: <AuthRegister3 />,
    },
  ],
};

export default UserRoutes;
