import PrivacyPolicy from "views/pages/PrivacyPolicy";
import HomepageLayout from "../layout/HomepageLayout";
import Home from "../views/homepage/Home";
import TermsAndConditions from "../views/pages/TermsAndConditions";

const HomeRoutes = {
  path: "/",
  element: <HomepageLayout />,
  children: [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/privacy-policy",
      element: <PrivacyPolicy />,
    },
    {
      path: "/terms-of-service",
      element: <TermsAndConditions />,
    }
  ],
};

export default HomeRoutes;