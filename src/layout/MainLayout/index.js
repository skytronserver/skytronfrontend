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
        marginLeft: "20px",
      },
      [theme.breakpoints.down("sm")]: {
        marginLeft: "10px",
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
  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };
  useEffect(() => {
    if (location.pathname === '/live-tracking') {
      dispatch({ type: SET_MENU, opened: false });
    }
  }, [location]);
  const isAuthenticated =
    useSelector((state) => state.login.user.isAuthenticated) ||
    sessionStorage.getItem("isAuthenticated");
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  sessionStorage.getItem("oAuthToken") &&
    createAxiosInstance(sessionStorage.getItem("oAuthToken"));
    const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = (userData && data.length > 2 && data[1]) || "desk_ex"; 
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
          <div style={{ marginTop: "0px" }}>&copy; {t('common.allRights')}</div>
        </div>
      </Main>
    </Box>
  );
};

export default MainLayout;
