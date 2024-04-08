import { Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import TagDeviceToVehicle from "../views/tagging/TagDeviceToVehicle";
const PrivateRoute = ({ element }) => {
  const isAuthenticated = true; /*useSelector(
    (state) => state.login.user.isAuthenticated
  );*/
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const applyPrivateRoute = (route) => ({
  ...route,
  element: <PrivateRoute element={route.element} />,
});

const TaggingRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/tag/device-vehicle",
      element: (
        <TagDeviceToVehicle/>
      ),
    }
  ].map((route) => applyPrivateRoute(route)),
};

export default TaggingRoutes;
