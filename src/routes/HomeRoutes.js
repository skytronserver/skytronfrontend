import PrivacyPolicy from "views/pages/PrivacyPolicy";
import HomepageLayout from "../layout/HomepageLayout";
import Home from "../views/homepage/Home";
import CameraFeedsView from "pages/CameraFeedsView";
const HomeRoutes = {
  path: "/",
  element: <HomepageLayout />,
  children: [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/camera-feeds",
      element: <CameraFeedsView />,
    },
    {
      path: "/privacy-policy",
      element: <PrivacyPolicy />,
    }
  ],
};

export default HomeRoutes;