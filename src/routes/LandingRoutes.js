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
  ],
};

export default LandingRoutes;
