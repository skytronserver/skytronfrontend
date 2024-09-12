import ViewNotice from "../views/landingpage/ViewNotice";
import LandingLayout from "../layout/LandingLayout";
import LandingPage from "../views/landingpage/LandingPage";
const LandingRoutes = {
  path: "/",
  element: <LandingLayout />,
  children: [
    {
      path: "/",
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
