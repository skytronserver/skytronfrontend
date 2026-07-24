import PrivateRoute from './PrivateRoute';
import { lazy } from "react";
import { Navigate } from "react-router-dom";

// project imports
import MainLayout from "../layout/MainLayout";
import Loadable from "../ui-component/Loadable";

const CreateSchool = Loadable(lazy(() => import("views/schoolbus/CreateSchool")));
const ApproveSchool = Loadable(lazy(() => import("views/schoolbus/ApproveSchool")));
const SchoolBusApproval = Loadable(lazy(() => import("views/schoolbus/SchoolBusApproval")));

// Lazy-loaded components
const LiveTracking = Loadable(lazy(() => import("../views/direct/LiveTracking")));
const VehicleTrackingReport = Loadable(lazy(() => import("../views/direct/VehicleTrackingReport")));
const VehicleHistory = Loadable(lazy(() => import("../views/direct/VehicleHistory")));
const SchoolBusTracking = Loadable(lazy(() => import("../views/direct/SchoolBusTracking")));
const SOSAlert = Loadable(lazy(() => import("../views/direct/SOSAlert")));
const HistoryPlayback = Loadable(lazy(() => import("../views/direct/HistoryPlayback")));
//const SOSUserExp = Loadable(lazy(() => import("../views/direct/SOSUserExp")));
const SOSUserExp = Loadable(lazy(() => import("../views/direct/SosPoliceExp")));
//const SOSExe = Loadable(lazy(() => import("../views/direct/SOSExe")));
const SOSExe = Loadable(lazy(() => import("../views/direct/SOSPoliceExe")));
//const EMCall = Loadable(lazy(() => import("../views/direct/emcall")));
const EMCall = Loadable(lazy(() => import("../views/direct/PoliceEmcall")));
const RouteFixing = Loadable(lazy(() => import("../views/direct/RouteFixing")));
const RouteETA = Loadable(lazy(() => import("../views/direct/RouteETA")));
const TripPlanning = Loadable(lazy(() => import("../views/direct/TripPlanning")));
//const GetAllCall = Loadable(lazy(() => import("../views/direct/GetAllCall")));
const GetAllCall = Loadable(lazy(() => import("../views/direct/GetAllPoliceCall")));
//const CallDetails = Loadable(lazy(() => import("../views/direct/CallDetails")));
const CallDetails = Loadable(lazy(() => import("../views/direct/policeCallDetails")));
//const AlertList = Loadable(lazy(() => import("../views/reports/AlertList")));
const AlertList = Loadable(lazy(() => import("../views/reports/policeAlertList")));
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
const ViolationReport = Loadable(lazy(() => import("../views/reports/ViolationReport")));

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
const CreateTrip = Loadable(lazy(() => import("../views/schoolbus/CreateTrip")));

// PIS Components
const BusStopManagement = Loadable(lazy(() => import("../views/pis/BusStopManagement")));
const BusRouteManagement = Loadable(lazy(() => import("../views/pis/BusRouteManagement")));
const BusScheduleManagement = Loadable(lazy(() => import("../views/pis/BusScheduleManagement")));

// State Transport Analytics Components
const TripAnalysis = Loadable(lazy(() => import("../views/state-transport-analytics/TripAnalysis")));
const DrivingAlerts = Loadable(lazy(() => import("../views/state-transport-analytics/DrivingAlerts")));
const VehicleAlertsCount = Loadable(lazy(() => import("../views/state-transport-analytics/VehicleAlertsCount")));
const SummaryDashboard = Loadable(lazy(() => import("../views/state-transport-analytics/SummaryDashboard")));
const DataAnalytics = Loadable(lazy(() => import("../views/state-transport-analytics/DataAnalytics")));
const PISSummaryAnalytics = Loadable(lazy(() => import("../views/state-transport-analytics/PISSummaryAnalytics")));
const ResourcePerformance = Loadable(lazy(() => import("../views/state-transport-analytics/ResourcePerformance")));
const OperationalAnalytics = Loadable(lazy(() => import("../views/state-transport-analytics/OperationalAnalytics")));
const ComparativeAnalysis = Loadable(lazy(() => import("../views/state-transport-analytics/ComparativeAnalysis")));

const M2MRegistrationAdminReview = Loadable(lazy(() => import("../views/pages/M2MRegistrationAdminReview")));
const VehicleManufacturerRegistrationAdminReview = Loadable(lazy(() => import("../views/pages/VehicleManufacturerRegistrationAdminReview")));
const AIS140DeviceManufacturerRegistrationAdminReview = Loadable(lazy(() => import("../views/pages/AIS140DeviceManufacturerRegistrationAdminReview")));
const DeviceModelTechnicalOnboardingAdminList = Loadable(lazy(() => import("../views/pages/DeviceModelTechnicalOnboardingAdminList")));



const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} path={route.path} />,
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

// Complaint Management
const HelpDeskDashboard = Loadable(lazy(() => import("../views/complaint/HelpDeskDashboard")));
const HelpDeskCreateTicket = Loadable(lazy(() => import("../views/complaint/HelpDeskCreateTicket")));
const TicketDetail = Loadable(lazy(() => import("../views/complaint/TicketDetail")));
const StaffTicketList = Loadable(lazy(() => import("../views/complaint/StaffTicketList")));
const ManufacturerTickets = Loadable(lazy(() => import("../views/complaint/ManufacturerTickets")));

// OTA Management
const OtaCommandDefinition = Loadable(lazy(() => import("../views/ota/OtaCommandDefinition")));
const OtaCommandHistory = Loadable(lazy(() => import("../views/ota/OtaCommandHistory")));

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
      path: "/superadmin-dashboard/vehicle-monitoring",
      element: <PublicTransportVehicleMonitoringDashboard />,
      roles: ["superadmin", "sosadmin"],
    },
    {
      path: "/superadmin-dashboard/erss-vehicles",
      element: <ERSSVehiclesDashboard />,
      roles: ["superadmin", "sosadmin"],
    },
    {
      path: "/superadmin-dashboard/sos",
      element: <SOSMonitoringDashboard />,
      roles: ["superadmin", "sosadmin"],
    },
    {
      path: "/superadmin-dashboard/sos-analytics",
      element: <SOSAnalyticsDashboard />,
      roles: ["superadmin", "sosadmin"],
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
      path: "/vehicle-tracking-report",
      element: <VehicleTrackingReport />,
      roles: ["superadmin", "stateadmin", "owner", "dto"],
    },
    {
      path: "/vehicle-history",
      element: <VehicleHistory />,
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
      roles: ['superadmin', 'stateadmin', 'devicemanufacture', 'sosadmin']
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
      path: '/reports/violation-report',
      element: <ViolationReport />,
      roles: ['superadmin', 'stateadmin', 'dtorto']
    },
    {
      path: '/reports/health-packet-log',
      element: <HealthPacketLog />,
      roles: ['superadmin', 'sosadmin']
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
      roles: ['parentuser']
    },
    {
      path: '/schoolbus/bus-tagging',
      element: <SchoolBusTagging />,
      roles: ['superadmin', 'stateadmin', 'schooladmin']
    },
    {
      path: '/schoolbus/bus-tracking',
      element: <SchoolBusTracking />,
      roles: ['schooladmin']
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
      path: '/schoolbus/create-trip',
      element: <CreateTrip />,
      roles: ['schooladmin']
    },

    {
      path: '/schoolbus/holidays',
      element: <SchoolHolidays />,
      roles: ['schooladmin']
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
    },

    {
      path: '/schoolbus/Create-School',
      element: <CreateSchool />,
      roles: ['superadmin']
    },
    {
      path: '/schoolbus/Approve-School',
      element: <ApproveSchool />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/schoolbus/Approve-School-bus',
      element: <SchoolBusApproval />,
      roles: ['superadmin']
    },
    {
      path: '/schoolbus/onboarding',
      element: <SchoolOnboarding />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/test-agency/assigned-models',
      element: <AgencyDeviceModelList />,
      roles: ['testagency']
    },
    // PIS Routes
    {
      path: '/pis/bus-stops',
      element: <BusStopManagement />,
      roles: ['superadmin', 'stateadmin', 'dtorto']
    },
    {
      path: '/pis/bus-routes',
      element: <BusRouteManagement />,
      roles: ['superadmin', 'stateadmin', 'dtorto']
    },
    {
      path: '/pis/bus-schedules',
      element: <BusScheduleManagement />,
      roles: ['superadmin', 'stateadmin', 'dtorto', 'owner']
    },
    // State Transport Analytics Routes
    {
      path: '/analytics/summary',
      element: <SummaryDashboard />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/analytics/trip-analysis',
      element: <TripAnalysis />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/analytics/driving-alerts',
      element: <DrivingAlerts />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/analytics/vehicle-alerts',
      element: <VehicleAlertsCount />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/analytics/data-analytics',
      element: <DataAnalytics />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/analytics/pis-summary',
      element: <PISSummaryAnalytics />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/analytics/resource-performance',
      element: <ResourcePerformance />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/analytics/operational',
      element: <OperationalAnalytics />,
      roles: ['superadmin', 'stateadmin']
    },
    {
      path: '/analytics/comparative-analysis',
      element: <ComparativeAnalysis />,
      roles: ['superadmin', 'stateadmin']
    },
    // Complaint Management — HelpDesk
    {
      path: '/helpdesk/tickets',
      element: <HelpDeskDashboard />,
      roles: ['helpdesk'],
    },
    {
      path: '/helpdesk/tickets/new',
      element: <HelpDeskCreateTicket />,
      roles: ['helpdesk'],
    },
    // Complaint Management — Ticket Detail (all staff roles)
    {
      path: '/helpdesk/tickets/:id',
      element: <TicketDetail />,
      roles: ['helpdesk', 'teamlead', 'sosexecutive', 'sosadmin', 'stateadmin', 'superadmin', 'devicemanufacture'],
    },
    // Complaint Management — Staff list (elevated roles)
    {
      path: '/staff/tickets',
      element: <StaffTicketList />,
      roles: ['teamlead', 'sosexecutive', 'sosadmin', 'stateadmin', 'superadmin'],
    },
    // Complaint Management — Manufacturer view
    {
      path: '/manufacturer/tickets',
      element: <ManufacturerTickets />,
      roles: ['devicemanufacture'],
    },
    // OTA Management Routes
    {
      path: "/ota/commands",
      element: <OtaCommandDefinition />,
      roles: ["superadmin"],
    },
    {
      path: "/ota/history",
      element: <OtaCommandHistory />,
      roles: ["superadmin"],
    },
  ].map((route) => applyPrivateRoute(route)),
};

export default MainRoutes;
