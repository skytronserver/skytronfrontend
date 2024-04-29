import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Link, useLocation } from "react-router-dom";

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
import amtronlogo from "assets/images/Amtron.svg";

// assets
import { IconChevronRight } from "@tabler/icons";
import AuthFooter from "ui-component/cards/AuthFooter";
//new
import backgroundImage from "../../assets/images/GPSImagee.jpg";
import ashokstambhImage from "../../assets/images/ashokstambh.jpg";
import HomeIcon from "@mui/icons-material/Home";

import WebFont from "webfontloader";
// styles
WebFont.load({
  google: {
    families: ["Pacifico", "sans-serif", "Lobster", "Caveat"],
  },
});

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
    // backgroundSize: "cover",
    position: "relative",
    // backgroundPosition: "center 100px", to shift the image below
    backgroundSize: open ? "cover" : "contain",
    backgroundPosition: "center 5px",

    // // Adjust background size for mobile view
    // [theme.breakpoints.down("sm")]: {
    //   backgroundSize: "70%",  // Change this to your desired size
    //   backgroundRepeat: "no-repeat",
    //   backgroundPosition: "center 5px",
    // },
  })
);

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
  // Handle left drawer
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  // new code start

  const location = useLocation(); // Get the current location

  const isHome = location.pathname === "/home"; // Check if the current path is '/home'

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Basic Login Form Component
  const LoginForm = () => {
    return (
      <div
        style={{
          display: "grid",
          placeItems: "center",
          height: "100vh",
          //paddingLeft: "900px",    // previous
          paddingLeft: isMobile ? "0px" : "900px",
          marginRight: isMobile ? "900px" : "0px", //new
          paddingBottom: "200px",
        }}
      >
        <form
          style={{
            width: "300px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <input
            style={{
              marginBottom: "10px",
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
            }}
            type="text"
            placeholder="Username"
          />
          <input
            style={{
              marginBottom: "10px",
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
            }}
            type="password"
            placeholder="Password"
          />
          <button
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "purple",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
            }}
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    );
  };

  // new code end

  return (
    <div style={{ width: "1626px" }}>
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
        <div
          style={{
            display: "flex",

            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
            paddingTop: "10px",
            backgroundColor: "purple",
            fontFamily: "bold",
            //  marginLeft:"20px",
          }}
        >
          <img
            src={ashokstambhImage}
            alt="Ashok Stambh"
            style={{
              width: "50px",
              height: "56px",
              marginRight: "1290px",
            }}
          />
          <div style={{}}>
            {/* <h2 */}
            {/* style={{
                margin: "0 auto",
                fontSize: "20px", // Adjust font size as needed
              }} */}
            {/* > */}
            {/* DEPARTMENT */}
            {/* GOVERNMENT OF ASSAM */}
            {/* </h2> */}
          </div>
        </div>




        <div
          style={{
    
            display: "flex",
            marginRight: "0px",
            marginTop: "0px",
            //paddingLeft: "1000px",
            //paddingLeft: "170px",

            paddingLeft: isMobile ? "200px" : "1000px",   // new whatever new changes made find 'isMobile'


            height: "15px", //header purple height
            backgroundColor: "purple",
            alignItems: "center",
          }}
        >
          <div>
            {/* Use Link component for navigation */}
            <Link to="/home" style={{ textDecoration: "none" }}>
              <h3
                style={{
                  color: "white",
                  paddingRight: "10px",
                  paddingLeft: "90px",
                  paddingBottom: "25px",
                }}
              >
                <HomeIcon style={{ fontSize: isMobile ? "20px" : "27px" }} />
              </h3>
            </Link>
          </div>


          <div>
            {/* Use Link component for navigation */}
            <Link to="/contact-us" style={{ textDecoration: "none" }}>
              <h3
                style={{
                  color: "white",
                  paddingRight: "10px",
                  paddingBottom: "25px",
                  fontSize: isMobile ? "14px" : "18px"
                }}
              >
                ContactUs
              </h3>
            </Link>
          </div>



          <div>
            <a href="/whats-new" style={{ textDecoration: "none" }}>
              <h3
                style={{
                  color: "white",
                  paddingRight: "10px",
                  paddingBottom: "25px",
                  fontSize: isMobile ? "14px" : "18px"
                }}
              >
                What's New
              </h3>
            </a>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {/* Navigation links */}
          {/* ... */}
        </div>

        {/* Render homepage content conditionally */}
        {isHome ? (
          <div>
            <h1>Welcome to the Homepage!</h1>
            {/* Homepage content */}
          </div>
        ) : (
          <LoginForm />
        )}

        {/* Toolbar, Breadcrumbs, Outlet, AuthFooter */}
        {/* ... */}

        {/* Adding ashokstambh image */}
        {/* <img
          src={ashokstambhImage}
          alt="Ashok Stambh"
          style={{
            position: "absolute",
            left: "10px",
            bottom: "20px",
            width: "60px",
            height: "90px",
            marginBottom: "485px", //ashokstambh bottom adjustment
            paddingBottom: "30px",
          }}
        /> */}
        <h4
          style={{
            color: "white",
            position: "absolute",
            height: "43px",
            left: "2px",
            right: "0px",
            bottom: "595px", //skytron vltd backend bottom adjustment
            paddingLeft: "0px",
            // paddingRight: "10px",
            marginbottom: "10px",
          }}
        >
          <div
            style={{
              //fontSize: "15px",
              fontSize: isMobile ? "10px" : "15px",
              color: "#FFC94A",
              paddingLeft: "110px",
              marginLeft: isMobile ? "65px" :"85px",
              height: "10px",
              fontFamily: "bold",
            }}
          >
            <h5>TM</h5>
          </div>
          <div
            style={{
              color: "#FFC94A",
              marginLeft: "100px",
              //fontSize: "13px",
              fontSize: isMobile ? "10px" : "13px",
            }}
          >
            <h1>SkyTron</h1>
          </div>

          <div
            style={{
              marginLeft: "95px",
              // fontSize: "18px",
              fontSize: isMobile ? "12px" : "18px",

              fontFamily: "Caveat",
              color: "#F6F5F2",
              paddingTop: "5px",
            }}
          >
            VLTD BackEnd, ASSAM
          </div>
        </h4>

        <div
          style={{
            position: "absolute",
            bottom: "0px",
            //left: "350px",
            left: isMobile ? "0px" : "350px",
            color: "white",
            paddingLeft: isMobile ? "0px" : "0px",
            paddingRight: isMobile ? "850px" : "0px",
            margingLeft: isMobile ? "0px" : "0px",
            margingRight: isMobile ? "1800px" : "0px",
          }}
        >
          <div style={{ left: "400px", paddingLeft: "160px", height: "1px" }}>
            <img
              src={amtronlogo}
              alt="Berry"
              width={isMobile ? "30" : "38"}
              height={isMobile ? "30" : "38"}
              style={{
                marginLeft: isMobile ? "60px" : "155px",
                marginTop: isMobile ? "17px" : "10px",
              }}
            />
          </div>

          <div
            style={{ marginTop: "0px", position: "relative", padding: "50px" }}
          >
            <h2
              style={{
                color: "#6C0345",
                left: "100px",
                align: "center",
                //fontSize: "20px",
                fontSize: isMobile ? "12px" : "20px",
              }}
            >
              Implemented by Assam Electronics Development Corporation Ltd
            </h2>
            <h3
              style={{
                position: "absolute",
                // positionLeft: isMobile ? "170px" : "250px",
                // left: "250px",
                left: isMobile ? "170px" : "250px",

                color: "#6C0345",
                marginBottom: "150px",
                //fontSize: "17px",
                fontSize: isMobile ? "11px" : "17px",
              }}
            >
              &copy; All Rights Reserved
            </h3>
          </div>
        </div>
      </Main>
    </div>
  );
};

export default MainLayout;
