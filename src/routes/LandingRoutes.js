import ViewNotice from "../views/landingpage/ViewNotice";
import LandingLayout from "../layout/LandingLayout";
import LandingPage from "../views/landingpage/LandingPage";
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
