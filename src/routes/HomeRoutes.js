import PrivacyPolicy from "views/pages/PrivacyPolicy";
import HomepageLayout from "../layout/HomepageLayout";
import Home from "../views/homepage/Home";
import CameraFeedsView from "pages/CameraFeedsView";
import UserRegistrationRequest from "../views/homepage/UserRegistrationRequest";
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
    },
    {
      path: "/user-registration-request",
      element: <UserRegistrationRequest />,
    }
  ],
};

export default HomeRoutes;