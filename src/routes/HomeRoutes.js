import PrivacyPolicy from "views/pages/PrivacyPolicy";
import HomepageLayout from "../layout/HomepageLayout";
import Home from "../views/homepage/Home";
import CameraFeedsView from "pages/CameraFeedsView";
import UserRegistrationRequest from "../views/homepage/UserRegistrationRequest";
import DeviceStats from "../views/public/DeviceStats";
import RegistrationStatusTracker from "../views/homepage/RegistrationStatusTracker";
import RegistrationAdminReview from "../views/homepage/RegistrationAdminReview";
import UserRegistrationForm from "../views/homepage/UserRegistrationForm";
import PublicTransportVehicleMonitoringDashboard from "../views/dashboard/super admin dashboard/PublicTransportVehicleMonitoringDashboard";
import ERSSVehiclesDashboard from "../views/dashboard/super admin dashboard/ERSSVehiclesDashboard";
import SOSMonitoringDashboard from "../views/dashboard/super admin dashboard/SOSMonitoringDashboard";
import SOSAnalyticsDashboard from "../views/dashboard/super admin dashboard/SOSAnalyticsDashboard";


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