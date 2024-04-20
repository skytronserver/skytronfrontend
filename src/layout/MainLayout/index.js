// import { useDispatch, useSelector } from "react-redux";
// import { Outlet } from "react-router-dom";

// // material-ui
// import { styled, useTheme } from "@mui/material/styles";
// import {
//   AppBar,
//   Box,
//   CssBaseline,
//   Toolbar,
//   useMediaQuery,
// } from "@mui/material";

// // project imports
// import Breadcrumbs from "../../ui-component/extended/Breadcrumbs";
// import Header from "./Header";
// import Sidebar from "./Sidebar";
// import navigation from "../../menu-items";
// import { drawerWidth } from "../../store/constant";
// import { SET_MENU } from "../../store/actions";

// // assets
// import { IconChevronRight } from "@tabler/icons";
// import AuthFooter from "ui-component/cards/AuthFooter";

// // styles
// const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
//   ({ theme, open }) => ({
//     ...theme.typography.mainContent,
//     borderBottomLeftRadius: 0,
//     borderBottomRightRadius: 0,
//     transition: theme.transitions.create(
//       "margin",
//       open
//         ? {
//             easing: theme.transitions.easing.easeOut,
//             duration: theme.transitions.duration.enteringScreen,
//           }
//         : {
//             easing: theme.transitions.easing.sharp,
//             duration: theme.transitions.duration.leavingScreen,
//           }
//     ),
//     [theme.breakpoints.up("md")]: {
//       marginLeft: open ? 0 : -(drawerWidth - 20),
//       width: `calc(100% - ${drawerWidth}px)`,
//     },
//     [theme.breakpoints.down("md")]: {
//       marginLeft: "20px",
//       width: `calc(100% - ${drawerWidth}px)`,
//       padding: "16px",
//     },
//     [theme.breakpoints.down("sm")]: {
//       marginLeft: "10px",
//       width: `calc(100% - ${drawerWidth}px)`,
//       padding: "16px",
//       marginRight: "10px",
//     },
//   })
// );

// // ==============================|| MAIN LAYOUT ||============================== //

// const MainLayout = () => {
//   const theme = useTheme();
//   const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
//   // Handle left drawer
//   const leftDrawerOpened = useSelector((state) => state.customization.opened);
//   const dispatch = useDispatch();
//   const handleLeftDrawerToggle = () => {
//     dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
//   };

//   return (

//     <Box sx={{ display: "flex" }}>
//       <CssBaseline />
//       {/* header */}
//       <AppBar
//         enableColorOnDark
//         position="fixed"
//         color="inherit"
//         elevation={0}
//         sx={{
//           bgcolor: theme.palette.background.default,
//           transition: leftDrawerOpened
//             ? theme.transitions.create("width")
//             : "none",
//         }}
//       >
//         <Toolbar
//           sx={{
//             paddingbottom: 0,
//             marginbottom: 0,
//             borderBottom: 0,
//           }}
//         >
//           <Header handleLeftDrawerToggle={handleLeftDrawerToggle} />
//         </Toolbar>
//       </AppBar>

//       {/* drawer */}
//       <Sidebar
//         drawerOpen={!matchDownMd ? leftDrawerOpened : !leftDrawerOpened}
//         drawerToggle={handleLeftDrawerToggle}
//       />

//       {/* main content */}
//       <Main theme={theme} open={leftDrawerOpened}>
//         {/* breadcrumb */}
//         <Breadcrumbs
//           separator={IconChevronRight}
//           navigation={navigation}
//           icon
//           title
//           rightAlign
//         />

//         <Outlet />
//         <div
//           style={{
//             paddingTop: "20px",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//           }}
//         >
//           <AuthFooter />
//           <div style={{ marginTop: "0px" }}>&copy; All Rights Reserved</div>
//         </div>
//       </Main>
//     </Box>
//   );
// };

// export default MainLayout;

//new Home page

import { useEffect } from "react";
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

// project imports
import Breadcrumbs from "../../ui-component/extended/Breadcrumbs";
import Header from "./Header";
import Sidebar from "./Sidebar";
import navigation from "../../menu-items";
import { drawerWidth } from "../../store/constant";
import { SET_MENU } from "../../store/actions";

// assets
import { IconChevronRight } from "@tabler/icons";
import AuthFooter from "ui-component/cards/AuthFooter";
//new
import backgroundImage from "../../assets/images/GPSImagee.jpg";
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
    //new
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "100% 100%",
  })
);

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div style={{ width: "1626px" }}>
      {/* <CssBaseline /> */}
      <Main
        open={leftDrawerOpened}
        style={{
          height: "650px",
          paddingBottom: "0px",
          marginTop: "0px",
          marginRight: "0px",
          paddingRight: "0px",
          paddingTop: "0px",
          paddingLeft: "0px",
        }}
      >
        <h3 style={{ textAlign: "center", color: "white", paddingTop: "10px" }}>
          TRANSPORT DEPARTMENT, GOVERNMENT OF ASSAM
        </h3>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <a href="/whats-new" style={{ textDecoration: "none" }}>
            <h3 style={{ color: "white", paddingRight: "10px" }}>Home</h3>
          </a>
          <a href="/contact-us" style={{ textDecoration: "none" }}>
            <h3 style={{ color: "white", paddingRight: "10px" }}>Contact Us</h3>
          </a>
          <a href="/whats-new" style={{ textDecoration: "none" }}>
            <h3 style={{ color: "white", paddingRight: "10px" }}>What's New</h3>
          </a>

          <a href="/login" style={{ textDecoration: "none" }}>
            <h3 style={{ color: "white", paddingRight: "10px" }}>Login</h3>
          </a>
        </div>
        {/* <Toolbar /> */}
        {/* <Breadcrumbs /> */}
        {/* <Outlet /> */}
        {/* <AuthFooter /> */}
      </Main>
    </div>
  );
};

export default MainLayout;
