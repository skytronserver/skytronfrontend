import ActiveState from "./ActveState";
import { useSelector } from "react-redux";

import { createAxiosInstance } from "../../../services/axiosInstance";
const Dashboard = () => {
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated");
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
