import { lazy } from "react";

// project imports
import Loadable from "../ui-component/Loadable";
import MinimalLayout from "../layout/MinimalLayout";
import LoginOtp from "../views/pages/authentication/LoginOtp";
import ResetPassword from "../views/pages/authentication/ResetPassword";
import SetPassword from "../views/pages/authentication/SetPassword";
import ForgotPassword from "../views/pages/authentication/ForgotPassword";

// login option 3 routing
const AuthLogin3 = Loadable(
  lazy(() => import("../views/pages/authentication/authentication3/Login3"))
);
// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: "/",
  element: <MinimalLayout />,
  children: [
    {
      path: "/login",
      element: <AuthLogin3 />,
    },
    {
      path: "/otp-login",
      element: <LoginOtp />,
    },
    {
      path:"/mis/new/:reset_token",
      element:<ResetPassword/>
    },
    {
      path:"/forgot-password",
      element:<ForgotPassword/>
    },
    {
      path:"/mis/reset-password/:reset_token",
      element:<SetPassword/>
    }
  ],
};

export default AuthenticationRoutes;
