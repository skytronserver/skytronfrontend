import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// project imports
import MainLayout from "../layout/MainLayout";
import Loadable from "../ui-component/Loadable";
import LiveTracking from "../views/direct/LiveTracking";
import SOSAlert from "../views/direct/SOSAlert";
import HistoryPlayback from "../views/direct/HistoryPlayback";
import SOSUserExp from "../views/direct/SOSUserExp";
import SOSExe from "../views/direct/SOSExe";
import EMCall from "../views/direct/emcall";
import RouteFixing from "../views/direct/RouteFixing";
import RouteETA from "../views/direct/RouteETA";
import TripPlanning from "../views/direct/TripPlanning";
import GetAllCall from "../views/direct/GetAllCall";
import CallDetails from "../views/direct/CallDetails";
import AlertList from "../views/reports/AlertList";
import AlertLog from "../views/reports/AlertLog";
import ActivationLogReport from "../views/reports/ActivationLogReport";
import { decipherEncryption } from "../helper";
import NotAuthorized from "../views/pages/NotAuthorized";
import GpsDataLog from "../views/reports/GpsDataLog";
import EmergencyDataLogs from "views/reports/EmergencyDataLogs";
import ApiDataLog from "../views/reports/ApiDataLog";
import CameraFeedsView from "../pages/CameraFeedsView";
import POIViewer from "../views/direct/POIViewer";
import TripViewer from "views/direct/TripViewer";
import ActivatedDeviceReport from "../views/reports/ActivatedDeviceReport";
import AlertReport from "../views/reports/AlertReport";
import DeviceHealthReport from "../views/reports/DeviceHealthReport";
import UserStatisticsReport from "../views/reports/UserStatisticsReport";
import IncidentReport from "../views/reports/IncidentReport";
import SuperAdminDashboard from "../views/dashboard/super admin dashboard/SuperAdminDashboard";
import PublicTransportDashboard from "../views/dashboard/super admin dashboard/PublicTransportDashboard";
import PublicSafetyDashboard from "../views/dashboard/super admin dashboard/PublicSafetyDashboard";
import SOSEmergencyDashboard from "../views/dashboard/super admin dashboard/SOSEmergencyDashboard";
import NewMap from "../views/MapComponent/Index";
import HealthPacketLog from "../views/reports/HealthPacketLog";
import POIReport from "../views/reports/POIReport";
import MapPolicy from "../views/pages/MapPolicy";

import Help from "../views/pages/Help";

// School Bus Management System
import SchoolBusDashboard from "../views/schoolbus/SchoolBusDashboard";
import ParentTracking from "../views/schoolbus/ParentTracking";
import SchoolBusTagging from "../views/schoolbus/SchoolBusTagging";
import RouteManagement from "../views/schoolbus/RouteManagement";
import BusAssignment from "../views/schoolbus/BusAssignment";
import ProfileManagement from "../views/schoolbus/ProfileManagement";
import SchoolHolidays from "../views/schoolbus/SchoolHolidays";
import SchoolReports from "../views/schoolbus/SchoolReports";
import AlertsCenter from "../views/schoolbus/AlertsCenter";
import SchoolOnboarding from "../views/schoolbus/SchoolOnboarding";

const PrivateRoute = ({ element, roles }) => {
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated");
  const userRoles = userData && data.length > 2 && data[1]; // Get the user role after login from redux store
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (
    roles &&
    roles.length > 0 &&
    !roles.some((role) => userRoles.includes(role))
  ) {
    // User does not have any of the required roles
    return <NotAuthorized />;
  }
  return element;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} />,
});

// dashboard routing
const DashboardDefault = Loadable(
  lazy(() => import("../views/dashboard/Default"))
);

const MorthDashboard = Loadable(
  lazy(() => import("../views/dashboard/Morth"))
);


// sample page routing
const SamplePage = Loadable(lazy(() => import("../views/sample-page")));
// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "dashboard",
      element: <DashboardDefault />,
    },
    {
      path: "/superadmin-dashboard",
      element: <SuperAdminDashboard />,
      roles: ["superadmin"],
    },
    {
      path: "/superadmin-dashboard/transport",
      element: <PublicTransportDashboard />,
      roles: ["superadmin"],
    },
    {
      path: "/superadmin-dashboard/public-safety",
      element: <PublicSafetyDashboard />,
      roles: ["superadmin"],
    },
    {
      path: "/superadmin-dashboard/sos",
      element: <SOSEmergencyDashboard />,
      roles: ["superadmin"],
    },
    {
      path: "/morth-dashboard",
      element: <MorthDashboard />,
      roles: ["superadmin"],
    },
    {
      path: "/live-tracking",
      element: <LiveTracking />,
      roles: ["superadmin", "stateadmin", "owner", "dto"],
    },
    {
      path: "/sos-alert",
      element: <SOSAlert />,
      roles: ["superadmin", "sosadmin"],
    },
    {
      path: "/sos-lead-exp",
      element: <SOSUserExp />,
      roles: ["superadmin", "sosadmin", "teamlead"],
    },
    {
      path: "/sos-exe",
      element: <SOSExe />,
      roles: ["superadmin", "sosadmin", "teamlead", "desk_ex"],
    },
    {
      path: "/history-playback",
      element: <HistoryPlayback />,
      roles: ["superadmin", "stateadmin", "owner", "dto", "dtorto"],
    },
    {
      path: "/route-fixing",
      element: <RouteFixing />,
      roles: ["superadmin", "stateadmin", "owner", "dto"],
    },
    {
      path: "/route-eta",
      element: <RouteETA />,
      roles: ["owner"],
    },
    {
      path: "/trip-planning",
      element: <TripPlanning />,
      roles: ["owner", "dto"],
    },
    {
      path: "/sos-call-list",
      element: <GetAllCall />,
      roles: ["desk_ex", "teamlead", "sosadmin"],
    },
    {
      path: "/emcall",
      element: <EMCall />,
      roles: ["superadmin", "sosadmin", "desk_ex", "teamlead"],
    },
    {
      path: "/sos-call-details/:call_id",
      element: <CallDetails />,
      roles: ["superadmin", "sosadmin", "desk_ex", "teamlead"],
    },
    {
      path: "/help",
      element: <Help />,
    },
    {
      path: "sample-page",
      element: <SamplePage />,
      roles: ["superadmin"],
    },
    {
      path: "alert-list",
      element: <AlertList />,
      roles: ["superadmin", "sosadmin", "desk_ex", "teamlead"],
    },
    {
      path: '/reports/gps-data-log',
      element: <GpsDataLog />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/reports/activation-log-report',
      element: <ActivationLogReport />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/reports/emergency-data-logs',
      element: <EmergencyDataLogs />,
      roles: ['superadmin']
    },
    {
      path: '/reports/api-data-log',
      element: <ApiDataLog />,
      roles: ['superadmin']
    },
    {
      path: '/reports/alert-log',
      element: <AlertLog />,
      roles: ['superadmin', 'stateadmin', 'dtorto', 'owner']
    },
    {
      path: "/camera-feeds",
      element: <CameraFeedsView />,
      roles: ["superadmin", "stateadmin"],
    },
    {
      path: "/poi-viewer",
      element: <POIViewer />,
      roles: ["superadmin", "stateadmin", "owner", "dto"],
    },
    {
      path: '/trip-viewer',
      element: <TripViewer />,
      roles: ["superadmin", "stateadmin", "owner", "dto"],
    },
    {
      path: '/reports/activated-device-report',
      element: <ActivatedDeviceReport />,
      roles: ['superadmin', 'stateadmin', 'dealer', 'dtorto', 'devicemanufacture']
    },
    {
      path: '/reports/alert-report',
      element: <AlertReport />,
      roles: ['superadmin', 'stateadmin', 'dtorto', 'devicemanufacture', 'owner']
    },
    {
      path: '/reports/device-health-report',
      element: <DeviceHealthReport />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/reports/user-statistics-report',
      element: <UserStatisticsReport />,
      roles: ['superadmin']
    },
    {
      path: '/reports/incident-report',
      element: <IncidentReport />,
      roles: ['superadmin']
    },
    {
      path: '/reports/health-packet-log',
      element: <HealthPacketLog />,
      roles: ['superadmin']
    },
    {
      path: '/reports/poi-report',
      element: <POIReport />,
      roles: ['superadmin', 'stateadmin', 'owner', 'dto']
    },
    {
      path: '/map',
      element: <NewMap />,
      roles: ['superadmin']
    },
    {
      path: '/map-policy',
      element: <MapPolicy />
    },
    // School Bus Management System Routes
    {
      path: '/schoolbus',
      element: <SchoolBusDashboard />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    },
    {
      path: '/schoolbus/parent-tracking',
      element: <ParentTracking />,
      roles: ['superadmin', 'stateadmin', 'schooladmin', 'parent']
    },
    {
      path: '/schoolbus/bus-tagging',
      element: <SchoolBusTagging />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    },
    {
      path: '/schoolbus/route-management',
      element: <RouteManagement />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    },
    {
      path: '/schoolbus/bus-assignment',
      element: <BusAssignment />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    },
    {
      path: '/schoolbus/profile-management',
      element: <ProfileManagement />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    },
    {
      path: '/schoolbus/holidays',
      element: <SchoolHolidays />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    },
    {
      path: '/schoolbus/alerts',
      element: <AlertsCenter />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    },
    {
      path: '/schoolbus/reports',
      element: <SchoolReports />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    }

    ,
    {
      path: '/schoolbus/onboarding',
      element: <SchoolOnboarding />,
      roles: ['superadmin', 'stateadmin']
    }

  ].map((route) => applyPrivateRoute(route)),
};

export default MainRoutes;
