import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SYSTEM_ENV } from "../store/constant";

// project imports
import MainLayout from "../layout/MainLayout";
import Loadable from "../ui-component/Loadable";
import { decipherEncryption } from "../helper";

// Lazy-loaded components
const LiveTracking = Loadable(lazy(() => import("../views/direct/LiveTracking")));
const SOSAlert = Loadable(lazy(() => import("../views/direct/SOSAlert")));
const HistoryPlayback = Loadable(lazy(() => import("../views/direct/HistoryPlayback")));
const SOSUserExp = Loadable(lazy(() => import("../views/direct/SOSUserExp")));
const SOSExe = Loadable(lazy(() => import("../views/direct/SOSExe")));
const EMCall = Loadable(lazy(() => import("../views/direct/emcall")));
const RouteFixing = Loadable(lazy(() => import("../views/direct/RouteFixing")));
const RouteETA = Loadable(lazy(() => import("../views/direct/RouteETA")));
const TripPlanning = Loadable(lazy(() => import("../views/direct/TripPlanning")));
const GetAllCall = Loadable(lazy(() => import("../views/direct/GetAllCall")));
const CallDetails = Loadable(lazy(() => import("../views/direct/CallDetails")));
const AlertList = Loadable(lazy(() => import("../views/reports/AlertList")));
const AlertLog = Loadable(lazy(() => import("../views/reports/AlertLog")));
const ActivationLogReport = Loadable(lazy(() => import("../views/reports/ActivationLogReport")));
const NotAuthorized = Loadable(lazy(() => import("../views/pages/NotAuthorized")));
const GpsDataLog = Loadable(lazy(() => import("../views/reports/GpsDataLog")));
const EmergencyDataLogs = Loadable(lazy(() => import("views/reports/EmergencyDataLogs")));
const ApiDataLog = Loadable(lazy(() => import("../views/reports/ApiDataLog")));
const CameraFeedsView = Loadable(lazy(() => import("../pages/CameraFeedsView")));
const POIViewer = Loadable(lazy(() => import("../views/direct/POIViewer")));
const TripViewer = Loadable(lazy(() => import("views/direct/TripViewer")));
const ActivatedDeviceReport = Loadable(lazy(() => import("../views/reports/ActivatedDeviceReport")));
const AlertReport = Loadable(lazy(() => import("../views/reports/AlertReport")));
const DeviceHealthReport = Loadable(lazy(() => import("../views/reports/DeviceHealthReport")));
const UserStatisticsReport = Loadable(lazy(() => import("../views/reports/UserStatisticsReport")));
const IncidentReport = Loadable(lazy(() => import("../views/reports/IncidentReport")));

const PublicTransportDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/PublicTransportDashboard")));
const PublicSafetyDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/PublicSafetyDashboard")));
const PublicTransportVehicleMonitoringDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/PublicTransportVehicleMonitoringDashboard")));
const ERSSVehiclesDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/ERSSVehiclesDashboard")));
const SOSMonitoringDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/SOSMonitoringDashboard")));
const SOSAnalyticsDashboard = Loadable(lazy(() => import("../views/dashboard/super admin dashboard/SOSAnalyticsDashboard")));
const NewMap = Loadable(lazy(() => import("../views/MapComponent/Index")));
const HealthPacketLog = Loadable(lazy(() => import("../views/reports/HealthPacketLog")));
const POIReport = Loadable(lazy(() => import("../views/reports/POIReport")));
const MapPolicy = Loadable(lazy(() => import("../views/pages/MapPolicy")));

const Help = Loadable(lazy(() => import("../views/pages/Help")));

// School Bus Management System
const SchoolBusDashboard = Loadable(lazy(() => import("../views/schoolbus/SchoolBusDashboard")));
const ParentTracking = Loadable(lazy(() => import("../views/schoolbus/ParentTracking")));
const SchoolBusTagging = Loadable(lazy(() => import("../views/schoolbus/SchoolBusTagging")));
const RouteManagement = Loadable(lazy(() => import("../views/schoolbus/RouteManagement")));
const BusAssignment = Loadable(lazy(() => import("../views/schoolbus/BusAssignment")));
const ProfileManagement = Loadable(lazy(() => import("../views/schoolbus/ProfileManagement")));
const SchoolHolidays = Loadable(lazy(() => import("../views/schoolbus/SchoolHolidays")));
const SchoolReports = Loadable(lazy(() => import("../views/schoolbus/SchoolReports")));
const AlertsCenter = Loadable(lazy(() => import("../views/schoolbus/AlertsCenter")));
const SchoolOnboarding = Loadable(lazy(() => import("../views/schoolbus/SchoolOnboarding")));

const M2MRegistrationAdminReview = Loadable(lazy(() => import("../views/pages/M2MRegistrationAdminReview")));
const VehicleManufacturerRegistrationAdminReview = Loadable(lazy(() => import("../views/pages/VehicleManufacturerRegistrationAdminReview")));
const AIS140DeviceManufacturerRegistrationAdminReview = Loadable(lazy(() => import("../views/pages/AIS140DeviceManufacturerRegistrationAdminReview")));
const DeviceModelTechnicalOnboardingAdminList = Loadable(lazy(() => import("../views/pages/DeviceModelTechnicalOnboardingAdminList")));

const PrivateRoute = ({ element, roles }) => {
  const myDecipher = decipherEncryption("skytrack");
  // Fall back to localStorage so new windows (opened via window.open) are also authenticated
  const userData =
    sessionStorage.getItem("cookiesData") ||
    localStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated") ||
    localStorage.getItem("isAuthenticated");
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
  const normalizedRole = (userRoles || '').toLowerCase().trim();
  const isRestrictedRole = ['teamlead', 'team_lead', 'team lead', 'sos_teamlead', 'desk_ex', 'desk_executive', 'desk executive', 'sos_deskexecutive', 'sos_desk_executive', 'sosexecutive'].includes(normalizedRole);
  console.log(`[ACL] Route Check - Role: ${normalizedRole}, Env: ${SYSTEM_ENV}, Restricted: ${isRestrictedRole}`);

  if (SYSTEM_ENV === 'prod') {
    if (isRestrictedRole) {
      return <NotAuthorized />;
    }
  } else if (SYSTEM_ENV === 'sos') {
    if (!isRestrictedRole) {
      return <NotAuthorized />;
    }
  }
  return element;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} />,
});

const AgencyDeviceModelList = Loadable(
  lazy(() => import("../views/pages/AgencyDeviceModelList"))
);

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
      element: <Navigate to="/superadmin-dashboard/transport" replace />,
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
      path: "/superadmin-dashboard/m2m-registration-requests",
      element: <M2MRegistrationAdminReview />,
      roles: ["superadmin"],
    },
    {
      path: "/superadmin-dashboard/manufacturer-registration-requests",
      element: <Navigate to="/superadmin-dashboard/vehicle-manufacturer-registration-requests" replace />,
      roles: ["superadmin"],
    },
    {
      path: "/superadmin-dashboard/vehicle-manufacturer-registration-requests",
      element: <VehicleManufacturerRegistrationAdminReview />,
      roles: ["superadmin"],
    },
    {
      path: "/superadmin-dashboard/ais-140-device-manufacturer-registration-requests",
      element: <AIS140DeviceManufacturerRegistrationAdminReview />,
      roles: ["superadmin"],
    },
    {
      path: "/stateadmin-dashboard/technical-onboarding-requests",
      element: <DeviceModelTechnicalOnboardingAdminList title="Technical Onboarding Approval" />,
      roles: ["stateadmin"],
    },
    {
      path: "/stateadmin-dashboard/vehicle-manufacturer-registration-requests",
      element: <Navigate to="/stateadmin-dashboard/technical-onboarding-requests" replace />,
      roles: ["stateadmin"],
    },
    {
      path: "/stateadmin-dashboard/ais-140-device-manufacturer-registration-requests",
      element: <Navigate to="/stateadmin-dashboard/technical-onboarding-requests" replace />,
      roles: ["stateadmin"],
    },
    {
      path: "/stateadmin-dashboard/manufacturer-registration-requests",
      element: <Navigate to="/stateadmin-dashboard/technical-onboarding-requests" replace />,
      roles: ["stateadmin"],
    },
    {
      path: "/superadmin-dashboard/technical-onboarding-requests",
      element: <DeviceModelTechnicalOnboardingAdminList />,
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
    },
    {
      path: '/test-agency/assigned-models',
      element: <AgencyDeviceModelList />,
      roles: ['testagency']
    }

  ].map((route) => applyPrivateRoute(route)),
};

export default MainRoutes;
