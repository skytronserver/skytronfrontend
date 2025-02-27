import PrivacyPolicy from "views/pages/PrivacyPolicy";
import HomepageLayout from "../layout/HomepageLayout";
import Home from "../views/homepage/Home";
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
    }
  ],
};

export default HomeRoutes;