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
const PublicTransportVehicleMonitoringDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/PublicTransportVehicleMonitoringDashboard")));
const ERSSVehiclesDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/ERSSVehiclesDashboard")));
const SOSMonitoringDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/SOSMonitoringDashboard")));
const SOSAnalyticsDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/SOSAnalyticsDashboard")));
const HelpDesk = Loadable(lazy(() => import("views/pages/HelpDesk")))
const HelpDeskSuccess = Loadable(lazy(() => import("views/pages/helpDeskSuccess")))

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
      path: "/help-desk-success",
      element: <HelpDeskSuccess />,
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
    {
      path: "/superadmin-dashboard/vehicle-monitoring",
      element: <PublicTransportVehicleMonitoringDashboard />,
    },
    {
      path: "/superadmin-dashboard/erss-vehicles",
      element: <ERSSVehiclesDashboard />,
    },
    {
      path: "/superadmin-dashboard/sos",
      element: <SOSMonitoringDashboard />,
    },
    {
      path: "/superadmin-dashboard/sos-analytics",
      element: <SOSAnalyticsDashboard />,
    }

  ],
};

export default HomeRoutes;