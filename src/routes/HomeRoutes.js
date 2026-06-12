import { lazy } from "react";
import Loadable from "../ui-component/Loadable";
import HomepageLayout from "../layout/HomepageLayout";

// Lazy-loaded components
const PrivacyPolicy = Loadable(lazy(() => import("views/pages/PrivacyPolicy")));
const Home = Loadable(lazy(() => import("../views/homepage/Home")));
const CameraFeedsView = Loadable(lazy(() => import("pages/CameraFeedsView")));
const UserRegistrationRequest = Loadable(lazy(() => import("../views/homepage/UserRegistrationRequest")));
const DeviceStats = Loadable(lazy(() => import("../views/public/DeviceStats")));
const InaugurationPhotos = Loadable(lazy(() => import("../views/public/InaugurationPhotos")));
const RegistrationStatusTracker = Loadable(lazy(() => import("../views/homepage/RegistrationStatusTracker")));
const RegistrationAdminReview = Loadable(lazy(() => import("../views/homepage/RegistrationAdminReview")));
const UserRegistrationForm = Loadable(lazy(() => import("../views/homepage/UserRegistrationForm")));

const HelpDesk = Loadable(lazy(() => import("views/pages/HelpDesk")))
const HelpDeskSuccess = Loadable(lazy(() => import("views/pages/helpDeskSuccess")))
const PublicTracker = Loadable(lazy(() => import("views/complaint/PublicTracker")))

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
      path: "/help-desk",
      element: <HelpDesk />,
    },
    {
      path: "/complaint/new",
      element: <HelpDesk />,
    },
    {
      path: "/help-desk-success",
      element: <HelpDeskSuccess />,
    },
    {
      path: "/complaint/track",
      element: <PublicTracker />,
    },
    {
      path: "/user-registration-request",
      element: <UserRegistrationRequest />,
    },
    {
      path: "/user-registration-request/:role",
      element: <UserRegistrationForm />,
    },
    {
      path: "/registration-status",
      element: <RegistrationStatusTracker />,
    },
    {
      path: "/registration-admin-review",
      element: <RegistrationAdminReview />,
    },
    {
      path: "/device-stats",
      element: <DeviceStats />,
    },
    {
      path: "/inauguration-photos",
      element: <InaugurationPhotos />,
    },


  ],
};

export default HomeRoutes;