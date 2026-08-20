import { lazy } from "react";
import Loadable from "../ui-component/Loadable";
import MainLayout from "../layout/MainLayout";

const ManufacturerRegistration = Loadable(lazy(() => import("../views/manufacturer/ManufacturerRegistration")));
const ApplicationStatus = Loadable(lazy(() => import("../views/manufacturer/ApplicationStatus")));
const ForgotPassword = Loadable(lazy(() => import("../views/manufacturer/ForgotPassword")));
const ResetPassword = Loadable(lazy(() => import("../views/manufacturer/ResetPassword")));
const OnboardingDashboard = Loadable(lazy(() => import("../views/manufacturer/OnboardingDashboard")));
const ModelList = Loadable(lazy(() => import("../views/manufacturer/ModelList")));
const ModelDetail = Loadable(lazy(() => import("../views/manufacturer/ModelDetail")));
const NewOnboardingRequest = Loadable(lazy(() => import("../views/manufacturer/NewOnboardingRequest")));
const OnboardingRequestList = Loadable(lazy(() => import("../views/manufacturer/OnboardingRequestList")));
const OnboardingStatusDetail = Loadable(lazy(() => import("../views/manufacturer/OnboardingStatusDetail")));
const Notifications = Loadable(lazy(() => import("../views/manufacturer/Notifications")));
const OrganizationUsers = Loadable(lazy(() => import("../views/manufacturer/OrganizationUsers")));


const ManufacturerRoutes = {
  path: "/manufacturer",
  element: <MainLayout />,
  children: [
    {
      path: "register",
      element: <ManufacturerRegistration />,
    },
    {
      path: "application-status",
      element: <ApplicationStatus />,
    },
    {
      path: "forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "reset-password",
      element: <ResetPassword />,
    },
    {
      path: "onboarding-dashboard",
      element: <OnboardingDashboard />,
    },
    {
      path: "models",
      element: <ModelList />,
    },
    {
      path: "models/:id",
      element: <ModelDetail />,
    },
    {
      path: "onboarding/new",
      element: <NewOnboardingRequest />,
    },
    {
      path: "onboarding",
      element: <OnboardingRequestList />,
    },
    {
      path: "onboarding/:id",
      element: <OnboardingStatusDetail />,
    },
    {
      path: "notifications",
      element: <Notifications />,
    },
    {
      path: "organization",
      element: <OrganizationUsers />,
    },
  ],
};

export default ManufacturerRoutes;
