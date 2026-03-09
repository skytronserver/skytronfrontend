import ActiveState from "./ActveState";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getRole } from '../../../helper';
import { createAxiosInstance } from "../../../services/axiosInstance";

const Dashboard = () => {
  const { t } = useTranslation();
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated") ||
    localStorage.getItem("isAuthenticated");
  const userRole = getRole();

  if (isAuthenticated) {
    const token = sessionStorage.getItem("oAuthToken") || localStorage.getItem("oAuthToken");
    createAxiosInstance(token);
  }

  return (
    <>
      <ActiveState />
    </>
  );
};

export default Dashboard;
