import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

// material-ui
import { styled, useTheme } from "@mui/material/styles";
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { IconChevronRight } from "@tabler/icons";
import { Navigate } from "react-router-dom";
// project imports
import Breadcrumbs from "../../ui-component/extended/Breadcrumbs";
import Header from "./Header";
import Sidebar from "./Sidebar";
import navigation from "../../menu-items";
import { drawerWidth } from "../../store/constant";
import { SET_MENU } from "../../store/actions";
import { createAxiosInstance } from "../../services/axiosInstance";
import showDeviceApi from "../../services/showDeviceApi";
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";
// assets
import { decipherEncryption } from "../../helper";
import AuthFooter from "../../ui-component/cards/AuthFooter";

// styles
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    ...theme.typography.mainContent,
    ...(!open && {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.shorter,
      }),
      [theme.breakpoints.up("md")]: {
        marginLeft: -(drawerWidth - 20),
        width: `calc(100% - ${drawerWidth}px)`,
      },
      [theme.breakpoints.down("md")]: {
        marginLeft: "0px",
        width: "100%",
        padding: "16px",
      },
      [theme.breakpoints.down("sm")]: {
        marginLeft: "0px",
        width: "100%",
        padding: "16px",
      },
    }),
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.shorter,
      }),
      marginLeft: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      width: `calc(100% - ${drawerWidth}px)`,
      [theme.breakpoints.down("md")]: {
        marginLeft: "0px",
        width: "100%",
      },
      [theme.breakpoints.down("sm")]: {
        marginLeft: "0px",
        width: "100%",
      },
    }),
  })
);

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const matchDownMd = useMediaQuery(theme.breakpoints.down("lg"));
  const location = useLocation();
  const ownerAlertSessionFlag = "ownerAlertToastShown";
  const [ownerAlertNotification, setOwnerAlertNotification] = useState({
    open: false,
    message: "",
    type: "info",
  });
  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated");

  useEffect(() => {
    if (location.pathname === '/live-tracking') {
      dispatch({ type: SET_MENU, opened: false });
    }
    // Close drawer when screen size changes to mobile
    if (matchDownMd) {
      dispatch({ type: SET_MENU, opened: false });
    } else {
      dispatch({ type: SET_MENU, opened: true });
    }
  }, [location, matchDownMd, dispatch]);

  sessionStorage.getItem("oAuthToken") &&
    createAxiosInstance(sessionStorage.getItem("oAuthToken"));
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = (userData && data.length > 2 && data[1]) || "desk_ex";

  useEffect(() => {
    const shouldFetchOwnerAlerts =
      userRoles === "owner" && !sessionStorage.getItem(ownerAlertSessionFlag);

    if (!shouldFetchOwnerAlerts) {
      return;
    }

    const fetchOwnerAlerts = async () => {
      try {
        const response = await showDeviceApi.getAlertLogFilter({
          type: "OverSpeed",
          page: 1,
          page_size: 10,
        });
        const alerts = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        if (alerts.length > 0) {
          const latestAlert = alerts[0];
          const timestamp = latestAlert?.timestamp
            ? new Date(latestAlert.timestamp).toLocaleString("en-IN")
            : "recently";
          const vehicleRegNo =
            latestAlert?.deviceTag?.device?.vehicle_reg_no || "your fleet";
          const message = `Latest OverSpeed alert for ${vehicleRegNo} at ${timestamp}.`;
          setOwnerAlertNotification({
            open: true,
            message,
            type: "warning",
          });
        } else {
          setOwnerAlertNotification({
            open: true,
            message: "No recent OverSpeed alerts detected for your vehicles.",
            type: "info",
          });
        }
      } catch (error) {
        setOwnerAlertNotification({
          open: true,
          message: "Unable to load latest alert logs. Please try again later.",
          type: "error",
        });
      } finally {
        sessionStorage.setItem(ownerAlertSessionFlag, "true");
      }
    };

    fetchOwnerAlerts();
  }, [userRoles]);

  const handleOwnerAlertClose = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOwnerAlertNotification((prev) => ({ ...prev, open: false }));
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* header */}
      <AppBar
        enableColorOnDark
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgColor: theme.palette.background.default,
          transition: leftDrawerOpened
            ? theme.transitions.create("width")
            : "none",
        }}
      >
        <Toolbar
          sx={{
            paddingBottom: 0,
            marginBottom: 0,
            borderBottom: 0,
          }}
        >
          <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
        </Toolbar>
      </AppBar>

      {/* drawer */}

      {userRoles !== 'desk_ex' && <Sidebar
        drawerOpen={matchDownMd ? leftDrawerOpened : leftDrawerOpened}
        drawerToggle={handleLeftDrawerToggle}
      />
      }
      {/* main content */}
      <Main theme={theme} open={leftDrawerOpened}>
        {/* breadcrumb */}
        <Breadcrumbs
          separator={IconChevronRight}
          navigation={navigation}
          icon
          title
          rightAlign
        />

        <Outlet />
        <div
          style={{
            paddingTop: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <AuthFooter />
          <div style={{ marginTop: "0px" }}>&copy; {t('common.allRights')}</div>
        </div>
      </Main>
      <Snackbar
        open={ownerAlertNotification.open}
        autoHideDuration={6000}
        onClose={handleOwnerAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          '& .MuiSnackbar-root': {
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
          }
        }}
      >
        <Alert
          onClose={handleOwnerAlertClose}
          severity={ownerAlertNotification.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {ownerAlertNotification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainLayout;
