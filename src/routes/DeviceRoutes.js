import PrivateRoute from './PrivateRoute';
import { lazy } from "react";
import { Navigate } from "react-router-dom";
// project imports

// project imports
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";

// Lazy-loaded components
const DeviceForm = Loadable(lazy(() => import("../views/forms/DeviceForm")));
const DeviceModelForm = Loadable(lazy(() => import("../views/forms/DeviceModelForm")));
const ModelExtension = Loadable(lazy(() => import("../views/forms/ModelExtension")));
const DeviceModelList = Loadable(lazy(() => import("../views/reports/DeviceModelList")));
const StateAdminDeviceModelView = Loadable(lazy(() => import("../views/detailsview/StateAdminDeviceModelView")));
const UnapproveCopList = Loadable(lazy(() => import("../views/reports/UnapproveCopList")));
const StateAdminCOPModelView = Loadable(lazy(() => import("../views/detailsview/StateAdminCOPModelView")));
const BulkUpload = Loadable(lazy(() => import("../views/forms/BulkUpload")));
const AssignDevice = Loadable(lazy(() => import("../views/forms/AssignDevice")));
const BulkDeviceAssign = Loadable(lazy(() => import("../views/forms/BulkDeviceAssign")));
const ShowDevice = Loadable(lazy(() => import("../views/showDevice/ShowDevice")));
const AvailableForSale = Loadable(lazy(() => import("../views/showDevice/AvailableForSale")));
const ConfigureDevice = Loadable(lazy(() => import("../views/tagging/ConfigureDevice")));
const NotAuthorized = Loadable(lazy(() => import("../views/pages/NotAuthorized")));
const TaggedList = Loadable(lazy(() => import("../views/reports/TaggedList")));
const SimActivation = Loadable(lazy(() => import("../views/pages/device/SimActivation")));
const ListSimActivation = Loadable(lazy(() => import("../views/pages/device/ListSimActivation")));
const CombinedStockReport = Loadable(lazy(() => import("../views/showDevice/CombinedStockReport")));
const AllTaggedDevice = Loadable(lazy(() => import("../views/showDevice/AllTaggedDevice")));
const ApprovedModelsList = Loadable(lazy(() => import("../views/reports/ApprovedModelsList")));
const ApprovedCOPsList = Loadable(lazy(() => import("../views/reports/ApprovedCOPsList")));
const M2MStatusReport = Loadable(lazy(() => import("../views/reports/M2MStatusReport")));
const ManufacturerOnboarding = Loadable(lazy(() => import("../views/pages/ManufacturerOnboarding")));
const DeviceModelTechnicalOnboardingCreate = Loadable(lazy(() => import("../views/pages/DeviceModelTechnicalOnboardingCreate")));
const DeviceModelTechnicalOnboardingList = Loadable(lazy(() => import("../views/pages/DeviceModelTechnicalOnboardingList")));
const WhitelistRequests = Loadable(lazy(() => import("../views/whitelist/WhitelistRequests")));
const DeviceDashboard = Loadable(lazy(() => import("../views/whitelist/DeviceDashboard")));



const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} roles={route.roles} />,
});

const DeviceRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/manufacturer/onboarding",
      element: <ManufacturerOnboarding />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/manufacturer/technical-onboarding/create",
      element: <DeviceModelTechnicalOnboardingCreate />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/manufacturer/technical-onboarding/list",
      element: <DeviceModelTechnicalOnboardingList />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/device/bulk-assign",
      element: <BulkDeviceAssign />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/device/new",
      element: <DeviceForm formTitle="New Device Form" />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/device/m2m-activation",
      element: <SimActivation />,
      roles: ["dealer"],
    },
    {
      path: "/deviceModel/new",
      element: <DeviceModelForm />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/deviceModel/extension",
      element: <ModelExtension formTitle="Model Extension" />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/device/list",
      element: <DeviceModelList />,
      roles: ["superadmin", "stateadmin"],
    },
    {
      path: "/deviceCOP/list",
      element: <UnapproveCopList />,
      roles: ["superadmin", "stateadmin"],
    },
    {
      path: "/deviceModel/view/:deviceId",
      element: <StateAdminDeviceModelView />,
      roles: ["superadmin", "devicemanufacture", "stateadmin", "dealer"],
    },
    {
      path: "/deviceCOPModel/view/:deviceId",
      element: <StateAdminCOPModelView />,
      roles: ["superadmin", "devicemanufacture", "stateadmin", "dealer"],
    },
    {
      path: "/device/bulkupload",
      element: <BulkUpload />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/device/show-device",
      element: <ShowDevice />,
      roles: ["superadmin", "devicemanufacture", "dealer", "stateadmin", "dtorto"],
    },
    {
      path: "/device/assign-device",
      element: <AssignDevice />,
      roles: ["devicemanufacture"],
    },
    {
      path: "/device/activation-request/:deviceStatus",
      element: <ListSimActivation />,
      roles: ["esimprovider"],
    },
    {
      path: "/device/show-available-device",
      element: <AvailableForSale />,
      roles: ["superadmin", "devicemanufacture", "dealer", "dtorto"],
    },
    {
      path: "/device/show-tagged-device",
      element: <TaggedList />,
      roles: ["superadmin", "devicemanufacture", "dealer"],
    },
    {
      path: "/device/combined-stock-report",
      element: <CombinedStockReport />,
      roles: ["superadmin", "devicemanufacture", "dealer", "dtorto"],
    },
    {
      path: "/device/fit-device",
      element: <ConfigureDevice status="Available_for_fitting" />,
      roles: ["dealer"],
    },
    {
      path: '/device/all-tagged-devices',
      element: <AllTaggedDevice />,
      roles: ['superadmin', 'devicemanufacture', 'stateadmin'],
    },
    {
      path: "/device/approved-models",
      element: <ApprovedModelsList />,
      roles: ["superadmin", "stateadmin"],
    },
    {
      path: "/device/approved-cops",
      element: <ApprovedCOPsList />,
      roles: ["superadmin", "stateadmin"],
    },
    {
      path: "/device/m2m-status",
      element: <M2MStatusReport />,
      roles: ["dealer"],
    },
    {
      path: "/device/whitelist/requests",
      element: <WhitelistRequests />,
      roles: ["superadmin", "stateadmin", "devicemanufacture", "dealer", "esimprovider"],
    },
    {
      path: "/device/whitelist/dashboard",
      element: <DeviceDashboard />,
      roles: ["superadmin", "stateadmin", "devicemanufacture", "dealer", "esimprovider"],
    },
    {
      path: "/device/esim-status",
      element: <Navigate to="/device/m2m-status" replace />,
    },
    {
      path: "/device/eSimActivation",
      element: <Navigate to="/device/m2m-activation" replace />,
    },
  ].map((route) => applyPrivateRoute(route)),
};

export default DeviceRoutes;
