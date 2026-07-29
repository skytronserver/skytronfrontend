import { lazy } from "react";

// project imports
import Loadable from "../ui-component/Loadable";
import MinimalLayout from "../layout/MinimalLayout";
const LoginOtp = Loadable(lazy(() => import("../views/pages/authentication/LoginOtp")));
const ResetPassword = Loadable(lazy(() => import("../views/pages/authentication/ResetPassword")));
const SetPassword = Loadable(lazy(() => import("../views/pages/authentication/SetPassword")));
const ForgotPassword = Loadable(lazy(() => import("../views/pages/authentication/ForgotPassword")));

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
      path: "/new/:reset_token",
      element: <ResetPassword />
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />
    },
    {
      path: "/reset-password/:reset_token",
      element: <SetPassword />
    }
  ],
};

export default AuthenticationRoutes;