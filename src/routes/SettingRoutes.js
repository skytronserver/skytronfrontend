import { Navigate } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import {
  vehicleCategoryInitialsFields,
  vehicleCategoryFormFields,
} from "../formjson/vehicleCategory";
import {stateInitials,stateFields,districtFields,districtInitials} from "../formjson/stateDistrict"
import VehicleCategory from "../views/settings/VehicleCategory";
import StateDistrict from "../views/settings/StateDistrict";
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

const SettingRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/setting/vehicle-category",
      element: (
        <VehicleCategory
          fieldConfig={vehicleCategoryFormFields}
          initialData={vehicleCategoryInitialsFields}
          formTitle="Vehicle Category"
        />
      ),
    },
    {
      path: "/setting/state-district",
      element: (
        <StateDistrict
          fieldConfig={stateFields}
          initialData={stateInitials}
          formTitle="State"
          districtConfig={districtFields}
          districtInitials={districtInitials}
        />
      ),
    },
  ].map((route) => applyPrivateRoute(route)),
};

export default SettingRoutes;
