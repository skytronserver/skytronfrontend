import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// material-ui
import { styled, useTheme } from "@mui/material/styles";
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  useMediaQuery,
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
import { useLocation } from 'react-router-dom';
import {useEffect} from 'react'
// assets
import { decipherEncryption } from "../../helper";
import AuthFooter from "../../ui-component/cards/AuthFooter";

// styles
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    ...theme.typography.mainContent,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create(
      "margin",
      open
        ? {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }
        : {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }
    ),
    [theme.breakpoints.up("md")]: {
      marginLeft: open ? 0 : -(drawerWidth - 20),
      width: `calc(100% - ${drawerWidth}px)`,
    },
    [theme.breakpoints.down("md")]: {
      marginLeft: "20px",
      width: `calc(100% - ${drawerWidth}px)`,
      padding: "16px",
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: "10px",
      width: `calc(100% - ${drawerWidth}px)`,
      padding: "16px",
      marginRight: "10px",
    },
  })
);

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user role first
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = userData && data.length > 2 && data[1];

  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  
  // All useEffect hooks must be before any conditional returns
  useEffect(() => {
    if (location.pathname === '/live-tracking') {
      dispatch({ type: SET_MENU, opened: false });
    }
  }, [location, dispatch]);

  useEffect(() => {
    if (userRoles === 'esimprovider' && location.pathname === '/dashboard') {
      navigate('/device/activation-request/pending');
    }
  }, [userRoles, location.pathname, navigate]);

  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated");

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  sessionStorage.getItem("oAuthToken") &&
    createAxiosInstance(sessionStorage.getItem("oAuthToken"));

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

     {userRoles!=='desk_ex' && <Sidebar
        drawerOpen={!matchDownMd ? leftDrawerOpened : !leftDrawerOpened}
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
          <div style={{ marginTop: "0px" }}>&copy; All Rights Reserved</div>
        </div>
      </Main>
    </Box>
  );
};

export default MainLayout;
