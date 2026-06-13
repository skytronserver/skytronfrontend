import { lazy } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { canViewRoute } from "../utils/rbacUtils";
import { SYSTEM_ENV } from "../store/constant";
import { decipherEncryption } from "../helper";
import Loadable from "../ui-component/Loadable";

const NotAuthorized = Loadable(lazy(() => import("../views/pages/NotAuthorized")));

const PrivateRoute = ({ element, roles }) => {
  const location = useLocation();
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData") || localStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated") ||
    localStorage.getItem("isAuthenticated");
    
  const userRoles = data && data.length > 2 && data[1]; 
  
  const permissions = useSelector((state) => state.login.permissions) || (() => {
    try {
      const raw = sessionStorage.getItem('userPermissions') || localStorage.getItem('userPermissions');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  const formattedPath = location.pathname;
  const isAuthorized = canViewRoute(formattedPath, userRoles, permissions, roles);

  if (!isAuthorized) {
    return <NotAuthorized />;
  }
  const normalizedRole = (userRoles || '').toLowerCase().trim();
  const isRestrictedRole = ['teamlead', 'team_lead', 'team lead', 'sos_teamlead', 'desk_ex', 'desk_executive', 'desk executive', 'sos_deskexecutive', 'sos_desk_executive', 'sosexecutive'].includes(normalizedRole);

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

export default PrivateRoute;
