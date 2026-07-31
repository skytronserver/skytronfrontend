/* eslint-disable no-unused-vars */
import ActiveState from "./ActveState";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getRole } from '../../../helper';
import { createAxiosInstance } from "../../../services/axiosInstance";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // const { t } = useTranslation();
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated") ||
    localStorage.getItem("isAuthenticated");
  const userRole = getRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === 'testagency') {
      navigate('/test-agency/assigned-models', { replace: true });
    }
  }, [userRole, navigate]);

  if (isAuthenticated) {
    const token = sessionStorage.getItem("oAuthToken") || localStorage.getItem("oAuthToken");
    createAxiosInstance(token);
  }

  if (userRole === 'testagency') {
    return null; // Prevent showing flash of empty dashboard
  }

  return (
    <>
      <ActiveState />
    </>
  );
};

export default Dashboard;
