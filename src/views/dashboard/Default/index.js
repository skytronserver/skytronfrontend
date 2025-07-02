import ActiveState from "./ActveState";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getRole } from '../../../helper';
import { Navigate } from 'react-router-dom';

import { createAxiosInstance } from "../../../services/axiosInstance";
const Dashboard = () => {
  const { t } = useTranslation();
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated");
  const userRole = getRole();
  if (userRole === 'esimprovider') {
    return <Navigate to="/device/activation-request/pending" replace />;
  }
  if (isAuthenticated) {
    createAxiosInstance(sessionStorage.getItem("oAuthToken"));
  }
  return (
    <>
      <ActiveState />
    </>
  );
};

export default Dashboard;
