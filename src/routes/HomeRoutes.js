import HomepageLayout from "../layout/HomepageLayout";
import Home from "../views/homepage/Home";
const HomeRoutes = {
  path: "/",
  element: <HomepageLayout />,
  children: [
    {
      path: "/",
      element: <Home />,
    }
  ],
};

export default HomeRoutes;
