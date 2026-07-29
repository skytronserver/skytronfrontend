import LandingLayout from "../layout/LandingLayout";
import { lazy } from "react";
import Loadable from "../ui-component/Loadable";

const ViewNotice = Loadable(lazy(() => import("../views/landingpage/ViewNotice")));
const LandingPage = Loadable(lazy(() => import("../views/landingpage/LandingPage")));
const LandingRoutes = {
  path: "/landing",
  element: <LandingLayout />,
  children: [
    {
      path: "/landing",
      element: <LandingPage />,
    },
    {
      path: "home-page",
      element: <LandingPage />,
    },
    {
      path: "notice-view-all",
      element: <ViewNotice />,
    },
  ],
};

export default LandingRoutes;
