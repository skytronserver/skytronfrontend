import { lazy } from "react";
import { Navigate } from 'react-router-dom';
import { useSelector } from "react-redux";

// project imports
import MainLayout from "../layout/MainLayout";
import Loadable from "../ui-component/Loadable";
import LiveTracking from "../views/direct/LiveTracking";
import { element } from "prop-types";
import SOSAlert from "../views/direct/SOSAlert";
import HistoryPlayback from "../views/direct/HistoryPlayback";
import SOSUserExp from "../views/direct/SOSUserExp";
import SOSExe from "../views/direct/SOSExe";
import RouteFixing from "../views/direct/RouteFixing";
import GetAllCall from "../views/direct/GetAllCall";
import CallDetails from "../views/direct/CallDetails";
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
// dashboard routing
const DashboardDefault = Loadable(
  lazy(() => import("../views/dashboard/Default"))
);

// sample page routing
const SamplePage = Loadable(lazy(() => import("../views/sample-page")));
// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/",
      element: <DashboardDefault />,
    },
    {
      path:"/live-tracking",
      element:<LiveTracking />
    },
    {
      path:"/sos-alert",
      element:<SOSAlert />
    },
    {
      path:"/sos-lead-exp",
      element:<SOSUserExp />
    },
    {
      path:"/sos-exe",
      element:<SOSExe />
    },
    {
      path:"/history-playback",
      element:<HistoryPlayback />
    },
    {
      path:"/route-fixing",
      element:<RouteFixing />
    },
    {
      path:"/sos-call-list",
      element:<GetAllCall />
    },
    {
      path: "/sos-call-details/:call_id",
      element: <CallDetails/>,
    },
    {
      path: "sample-page",
      element: <SamplePage />,
    },
  ].map((route) => applyPrivateRoute(route)),
};

export default MainRoutes;
