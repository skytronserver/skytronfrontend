import { Navigate } from "react-router-dom";
// project imports

import MainLayout from "../layout/MainLayout";
import { useSelector } from "react-redux";
import { decipherEncryption } from "../helper";
import NotAuthorized from "../views/pages/NotAuthorized";
import AccessoryForm from "views/forms/AccessoryForm";


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

const AccessoriesRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
  {
    path:"/accessory/new",
    element:<AccessoryForm formTitle="New Accessory Form" />,
    roles:["devicemanufacture"]
  }
  ].map((route) => applyPrivateRoute(route)),
};

export default AccessoriesRoutes;
