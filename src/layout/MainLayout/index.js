// // import { useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { Outlet, Link, useLocation } from "react-router-dom";
// // import { styled, useTheme } from "@mui/material/styles";
// // import {
// //   AppBar,
// //   Box,
// //   CssBaseline,
// //   Toolbar,
// //   useMediaQuery,
// // } from "@mui/material";
// // import Breadcrumbs from "../../ui-component/extended/Breadcrumbs";
// // import Header from "./Header";
// // import Sidebar from "./Sidebar";
// // import navigation from "../../menu-items";
// // import { drawerWidth } from "../../store/constant";
// // import { SET_MENU } from "../../store/actions";
// // import amtronlogo from "assets/images/Amtron.svg";
// // import { IconChevronRight } from "@tabler/icons";
// // import AuthFooter from "ui-component/cards/AuthFooter";
// // import backgroundImage from "../../assets/images/GPSImagee.jpg";
// // import ashokstambhImage from "../../assets/images/ashokstambh.jpg";
// // import HomeIcon from "@mui/icons-material/Home";
// // import WebFont from "webfontloader";

// // WebFont.load({
// //   google: {
// //     families: ["Pacifico", "sans-serif", "Lobster", "Caveat"],
// //   },
// // });

// // const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
// //   ({ theme, open }) => ({
// //     ...theme.typography.mainContent,
// //     borderBottomLeftRadius: 0,
// //     borderBottomRightRadius: 0,
// //     transition: theme.transitions.create(
// //       "margin",
// //       open
// //         ? {
// //             easing: theme.transitions.easing.easeOut,
// //             duration: theme.transitions.duration.enteringScreen,
// //           }
// //         : {
// //             easing: theme.transitions.easing.sharp,
// //             duration: theme.transitions.duration.leavingScreen,
// //           }
// //     ),
// //     [theme.breakpoints.up("md")]: {
// //       marginLeft: open ? 0 : -(drawerWidth - 20),
// //       width: `calc(100% - ${drawerWidth}px)`,
// //     },
// //     [theme.breakpoints.down("md")]: {
// //       marginLeft: "20px",
// //       width: `calc(100% - ${drawerWidth}px)`,
// //       padding: "16px",
// //     },
// //     [theme.breakpoints.down("sm")]: {
// //       marginLeft: "10px",
// //       width: `calc(100% - ${drawerWidth}px)`,
// //       padding: "16px",
// //       marginRight: "10px",
// //     },
// //     backgroundImage: `url(${backgroundImage})`,
// //     position: "relative",
// //     backgroundSize: open ? "cover" : "contain",
// //     backgroundPosition: "center 5px",
// //     display: "flex",
// //     flexDirection: "column",
// //     justifyContent: "center",
// //     alignItems: "center", // Center items horizontally
// //     minHeight: "100vh", // Ensure the Main container takes the full height of the viewport
// //   })
// // );

// // const MainLayout = () => {
// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
// //   const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
// //   const leftDrawerOpened = useSelector((state) => state.customization.opened);
// //   const dispatch = useDispatch();
// //   const handleLeftDrawerToggle = () => {
// //     dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
// //   };

// //   const location = useLocation();
// //   const isHome = location.pathname === "/home";

// //   useEffect(() => {
// //     document.body.style.overflow = "hidden";

// //     return () => {
// //       document.body.style.overflow = "unset";
// //     };
// //   }, []);

// //   const LoginForm = () => {
// //     return (
// //       <div
// //         style={{
// //           display: "flex",
// //           justifyContent: "center",
// //           alignItems: "center",
// //           height: "100vh",
// //         }}
// //       >
// //         <form
// //           style={{
// //             width: "100%",
// //             maxWidth: "400px",
// //             padding: "20px",
// //             border: "1px solid #ccc",
// //             borderRadius: "5px",
// //           }}
// //         >
// //           <input
// //             style={{
// //               marginBottom: "20px",
// //               width: "100%",
// //               padding: "10px",
// //               boxSizing: "border-box",
// //               fontSize: "16px",
// //             }}
// //             type="text"
// //             placeholder="Username"
// //           />
// //           <input
// //             style={{
// //               marginBottom: "20px",
// //               width: "100%",
// //               padding: "10px",
// //               boxSizing: "border-box",
// //               fontSize: "16px",
// //             }}
// //             type="password"
// //             placeholder="Password"
// //           />
// //           <button
// //             style={{
// //               width: "100%",
// //               padding: "10px",
// //               backgroundColor: "purple",
// //               color: "#fff",
// //               border: "none",
// //               borderRadius: "3px",
// //               fontSize: "16px",
// //             }}
// //             type="submit"
// //           >
// //             Login
// //           </button>
// //         </form>
// //       </div>
// //     );
// //   };

// //   return (
// //     <Main open={leftDrawerOpened}>
// //       <div
// //         style={{
// //           paddingTop: "10px",
// //           backgroundColor: "purple",
// //           fontFamily: "bold",
// //         }}
// //       >
// //         <img
// //           src={ashokstambhImage}
// //           alt="Ashok Stambh"
// //           style={{
// //             width: "50px",
// //             height: "56px",
// //             marginRight: "auto",
// //             marginLeft: "auto",
// //           }}
// //         />
// //       </div>

// //       <div
// //         style={{
// //           marginTop: "0px",
// //           paddingLeft: "90px",
// //           height: "15px",
// //           backgroundColor: "purple",
// //           display: "flex",
// //           alignItems: "center",
// //         }}
// //       >
// //         <Link to="/home" style={{ textDecoration: "none" }}>
// //           <HomeIcon
// //             style={{
// //               fontSize: isMobile ? "20px" : "27px",
// //               color: "white",
// //               paddingRight: "10px",
// //             }}
// //           />
// //         </Link>
// //         <Link to="/contact-us" style={{ textDecoration: "none" }}>
// //           <h3
// //             style={{
// //               color: "white",
// //               paddingRight: "10px",
// //               fontSize: isMobile ? "14px" : "18px",
// //             }}
// //           >
// //             ContactUs
// //           </h3>
// //         </Link>
// //         <a href="/whats-new" style={{ textDecoration: "none" }}>
// //           <h3
// //             style={{
// //               color: "white",
// //               paddingRight: "10px",
// //               fontSize: isMobile ? "14px" : "18px",
// //             }}
// //           >
// //             What's New
// //           </h3>
// //         </a>
// //       </div>

// //       {isHome ? (
// //         <div>
// //           <h1>Welcome to the Homepage!</h1>
// //         </div>
// //       ) : (
// //         <LoginForm />
// //       )}

// //       <div
// //         style={{
// //           color: "white",
// //           position: "absolute",
// //           bottom: "0px",
// //           left: "2px",
// //           right: "0px",
// //           textAlign: "center",
// //         }}
// //       >
// //         <div style={{}}>
// //           <img
// //             src={amtronlogo}
// //             alt="Berry"
// //             width={isMobile ? "30" : "38"}
// //             height={isMobile ? "30" : "38"}
// //             style={{ marginTop: "17px" }}
// //           />
// //         </div>
// //         <div
// //           style={{ marginTop: "0px", position: "relative", padding: "50px" }}
// //         >
// //           <h2
// //             style={{
// //               color: "#6C0345",
// //               fontSize: isMobile ? "12px" : "20px",
// //             }}
// //           >
// //             Implemented by Assam Electronics Development Corporation Ltd
// //           </h2>
// //           <h3
// //             style={{
// //               color: "#6C0345",
// //               fontSize: isMobile ? "11px" : "17px",
// //             }}
// //           >
// //             &copy; All Rights Reserved
// //           </h3>
// //         </div>
// //       </div>
// //     </Main>
// //   );
// // };

// // export default MainLayout;

// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Outlet, Link, useLocation } from "react-router-dom";
// import { styled, useTheme } from "@mui/material/styles";
// import {
//   AppBar,
//   Box,
//   CssBaseline,
//   Toolbar,
//   useMediaQuery,
// } from "@mui/material";
// import Breadcrumbs from "../../ui-component/extended/Breadcrumbs";
// import Header from "./Header";
// import Sidebar from "./Sidebar";
// import navigation from "../../menu-items";
// import { drawerWidth } from "../../store/constant";
// import { SET_MENU } from "../../store/actions";
// import amtronlogo from "assets/images/Amtron.svg";
// import { IconChevronRight } from "@tabler/icons";
// import AuthFooter from "ui-component/cards/AuthFooter";
// import backgroundImage from "../../assets/images/GPSImagee.jpg";
// import ashokstambhImage from "../../assets/images/ashokstambh.jpg";
// import HomeIcon from "@mui/icons-material/Home";
// import WebFont from "webfontloader";

// WebFont.load({
//   google: {
//     families: ["Pacifico", "sans-serif", "Lobster", "Caveat"],
//   },
// });

// const Container = styled("div")({
//   display: "flex",
//   flexDirection: "column",
//   minHeight: "100vh",
// });

// const Main = styled("main", {
//   shouldForwardProp: (prop) => prop !== "open",
// })(({ theme, open }) => ({
//   ...theme.typography.mainContent,
//   flex: 1,
//   position: "relative", // Change to relative positioning
//   overflow: "auto", // Add overflow auto to handle content overflow
//   backgroundImage: `url(${backgroundImage})`,
//   backgroundSize: "cover, contain",
//   backgroundPosition: "center",
//   // backgroundAttachment: "fixed"
// }));

// const MainLayout = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
//   const leftDrawerOpened = useSelector((state) => state.customization.opened);
//   const dispatch = useDispatch();
//   const handleLeftDrawerToggle = () => {
//     dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
//   };

//   const location = useLocation();
//   const isHome = location.pathname === "/home";

//   useEffect(() => {
//     document.body.style.overflow = "hidden";

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, []);

//   const LoginForm = () => {
//     return (
//       <div
//         style={{
//           display: "grid",
//           placeItems: "center",
//           height: "100vh",
//           paddingLeft: isMobile ? "0px" : "900px",
//           marginRight: isMobile ? "900px" : "0px",
//           paddingBottom: "200px",
//         }}
//       >
//         <form
//           style={{
//             width: "300px",
//             padding: "20px",
//             border: "1px solid #ccc",
//             borderRadius: "5px",
//           }}
//         >
//           <input
//             style={{
//               marginBottom: "10px",
//               width: "100%",
//               padding: "8px",
//               boxSizing: "border-box",
//             }}
//             type="text"
//             placeholder="Username"
//           />
//           <input
//             style={{
//               marginBottom: "10px",
//               width: "100%",
//               padding: "8px",
//               boxSizing: "border-box",
//             }}
//             type="password"
//             placeholder="Password"
//           />
//           <button
//             style={{
//               width: "100%",
//               padding: "8px",
//               backgroundColor: "purple",
//               color: "#fff",
//               border: "none",
//               borderRadius: "3px",
//             }}
//             type="submit"
//           >
//             Login
//           </button>
//         </form>
//       </div>
//     );
//   };

//   return (
//     <Container>
//       <CssBaseline />
//       <Main open={leftDrawerOpened}>
//         <div style={{paddingLeft:"0px"}}>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "auto 1fr", // Adjust column widths as needed
//               alignItems: "center",
//               justifyContent: "center",
//               textAlign: "center",
//               color: "white",
//               paddingTop: "10px",
//               backgroundColor: "purple",
//               fontFamily: "bold",
//               width: "100%", // Take full width of parent container
//             }}
//           >
//             <img
//               src={ashokstambhImage}
//               alt="Ashok Stambh"
//               style={{ width: "50px", height: "56px", lefF:"50px",justifySelf: "start" }} // Adjust alignment as needed
//             />
//             <div style={{ justifySelf: "end" }}></div>{" "}
//             {/* Adjust alignment as needed */}
//           </div>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr 1fr 1fr", // Three equal columns
//               gap: "10px", // Gap between grid items
//               padding: "0 480px", // Adjust as needed
//               backgroundColor: "purple",
//               alignItems: "center",
//             }}
//           >
//             <div style={{ gridColumn: "1 / span 1" }}>
//               {" "}
//               {/* Grid Column 1 */}
//               <Link to="/home" style={{ textDecoration: "none" }}>
//                 <h3
//                   style={{
//                     color: "white",
//                     textAlign: "center", // Center the icon
//                   }}
//                 >
//                   <HomeIcon style={{ fontSize: isMobile ? "20px" : "27px" }} />
//                 </h3>
//               </Link>
//             </div>

//             <div style={{ gridColumn: "2 / span 1" }}>
//               {" "}
//               {/* Grid Column 2 */}
//               <Link to="/contact-us" style={{ textDecoration: "none" }}>
//                 <h3
//                   style={{
//                     color: "white",
//                     textAlign: "center", // Center the text
//                     fontSize: isMobile ? "14px" : "18px",
//                   }}
//                 >
//                   ContactUs
//                 </h3>
//               </Link>
//             </div>

//             <div style={{ gridColumn: "3 / span 1" }}>
//               {" "}
//               {/* Grid Column 3 */}
//               <a href="/whats-new" style={{ textDecoration: "none" }}>
//                 <h3
//                   style={{
//                     color: "white",
//                     textAlign: "center", // Center the text
//                     fontSize: isMobile ? "14px" : "18px",
//                   }}
//                 >
//                   What's New
//                 </h3>
//               </a>
//             </div>
//           </div>

//           <div style={{ display: "flex", justifyContent: "flex-end" }}></div>
//           {isHome ? (
//             <div>
//               <h1>Welcome to the Homepage!</h1>
//             </div>
//           ) : (
//             <LoginForm />
//           )}

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr", // Single column
//               gap: "10px", // Gap between grid items
//               padding: "10px", // Adjust padding as needed
//               position: "absolute",
//               bottom: "665px",
//               left: "0px",
//               right: "1050px",
//               color: "#FFC94A",
//             }}
//           >
//             <div style={{ gridColumn: "1 / span 1", textAlign: "center" }}>
//               {" "}
//               {/* Grid Column 1 */}
//               <div
//                 style={{
//                   fontSize: isMobile ? "10px" : "15px",
//                   fontFamily: "bold",
//                   paddingLeft: "110px",
//                   marginLeft: isMobile ? "65px" : "85px",
//                   height: "10px",
//                   fontFamily: "bold",
//                 }}
//               >
//                 <h5>TM</h5>
//               </div>
//               <div
//                 style={{
//                   fontSize: isMobile ? "10px" : "13px",
//                   color: "#FFC94A",
//                   marginLeft: "100px",
//                 }}
//               >
//                 <h1>SkyTron</h1>
//               </div>
//               <div
//                 style={{
//                   fontSize: isMobile ? "12px" : "18px",
//                   marginLeft: "140px",
//                   fontFamily: "Caveat",
//                 }}
//               >
//                 VLTD BackEnd, ASSAM
//               </div>
//             </div>
//           </div>

//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "1fr", // Single column
//               gap: "10px", // Gap between grid items
//               position: "absolute",
//               bottom: "180px",
//               width:"800px",
//               left: isMobile ? "0px" : "350px",
//               color: "white",
//               paddingLeft: isMobile ? "0px" : "0px",
//               paddingRight: isMobile ? "0px" : "850px",
//               marginLeft: isMobile ? "0px" : "0px",
//               marginRight: isMobile ? "0px" : "1800px",
//             }}
//           >
//             <div style={{ gridColumn: "1 / span 1" }}>
//               {" "}
//               {/* Grid Column 1 */}
//               <div
//                 style={{
//                   paddingLeft: isMobile ? "20px" : "160px",
//                   height: "1px",
//                 }}
//               >
//                 <img
//                   src={amtronlogo}
//                   alt="Berry"
//                   width={isMobile ? "30" : "38"}
//                   height={isMobile ? "30" : "38"}
//                   style={{
//                     marginLeft: isMobile ? "10px" : "155px",
//                     marginTop: isMobile ? "17px" : "10px",
//                   }}
//                 />
//               </div>
//               <div style={{ marginTop: "0px", padding: "20px" }}>
//                 {" "}
//                 {/* Adjust padding as needed */}
//                 <h2
//                   style={{
//                     color: "#6C0345",
//                     textAlign: "center",
//                     fontSize: isMobile ? "12px" : "20px",
//                   }}
//                 >
//                   Implemented by Assam Electronics Development Corporation Ltd
//                 </h2>
//                 <h3
//                   style={{
//                     color: "#6C0345",
//                     textAlign: "center",
//                     marginBottom: "20px", // Adjust margin as needed
//                     fontSize: isMobile ? "11px" : "17px",
//                   }}
//                 >
//                   &copy; All Rights Reserved
//                 </h3>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Main>
//     </Container>
//   );
// };

// export default MainLayout;

//2nd attepmt with loginform responsive
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Link, useLocation } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import Breadcrumbs from "../../ui-component/extended/Breadcrumbs";
import Header from "./Header";
import Sidebar from "./Sidebar";
import navigation from "../../menu-items";
import { drawerWidth } from "../../store/constant";
import { SET_MENU } from "../../store/actions";
import amtronlogo from "assets/images/Amtron.svg";
import { IconChevronRight } from "@tabler/icons";
import AuthFooter from "ui-component/cards/AuthFooter";
import backgroundImage from "../../assets/images/GPSImagee.jpg";
import ashokstambhImage from "../../assets/images/ashokstambh.jpg";
import HomeIcon from "@mui/icons-material/Home";
import WebFont from "webfontloader";

WebFont.load({
  google: {
    families: ["Pacifico", "sans-serif", "Lobster", "Caveat"],
  },
});

const Container = styled("div")({
  display: "grid",
  gridTemplateColumns: "1fr", // Single column
  gap: "10px", // Gap between grid items
});

const Main = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  ...theme.typography.mainContent,
  flex: 1,
  position: "relative",
  overflow: "auto",
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: "cover, contain",
  //backgroundPosition: "center",
  backgroundPosition: "center top 20px", // Shift the background image 50px below the center vertically
}));

// here code of login from

// here

const Input = styled("input")({
  marginBottom: "20px",
  width: "100%",
  padding: "10px",
  boxSizing: "border-box",
  fontSize: "16px",
});

const Button = styled("button")({
  width: "100%",
  padding: "10px",
  backgroundColor: "purple",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  fontSize: "16px",
});

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const leftDrawerOpened = useSelector((state) => state.customization.opened);
  const dispatch = useDispatch();
  const handleLeftDrawerToggle = () => {
    dispatch({ type: SET_MENU, opened: !leftDrawerOpened });
  };

  const LoginFormContainer = styled("div")({
    display: "grid",
    height: "100vh",
    alignItems: "center",
    paddingRight: isMobile ? "0px" : "40px",
    justifyContent: isMobile ? "center" : "flex-end",
  });

  const LoginForm = styled("form")({
    width: "100%",
    maxWidth: "320px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  });

  const location = useLocation();
  const isHome = location.pathname === "/home";

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <Container>
      <CssBaseline />
      <Main
        open={leftDrawerOpened}
        style={{
          marginTop: 0,
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 0,
          paddingBottom: 0,
        }}
      >
        <div>
          {/* oldcode */}

          <div
            style={{
              paddingTop: "10px",
              backgroundColor: "purple",
              fontFamily: "bold",
              display: "flex",
              height: isMobile ? "75px" : "85px",
            }}
          >
            <img
              src={ashokstambhImage}
              alt="Ashok Stambh"
              style={{
                width: "50px",
                height: "56px",
                marginRight: "auto",
                marginLeft: isMobile ? "12px" : "15px",
              }}
            />

            {/* newcode1 */}
            <div
              style={{
                marginTop: "0px",
                height: "auto",
                backgroundColor: "purple",
                display: "grid",
                gridTemplateColumns: isMobile ? "10px 50px 80px": "30px 80px 100px",

                //gridTemplateColumns: "30px 100px 130px",
                // gridTemplateColumns: "repeat(auto-fit, minmax(5px, 1fr))",
                // alignItems: "right",
                justifyContent: isMobile ? "start" : "start",
                padding: "10px",
              }}
            >
              <Link
                to="/home"
                style={{
                  textDecoration: "none",
                  margin: "0",
                  padding: "0 5px",
                }}
              >
                <HomeIcon
                  style={{
                    fontSize: isMobile ? "20px" : "27px",
                    color: "white",
                    paddingRight: "5px",
                    marginTop: isMobile ? "35px" : "29px",
                  }}
                />
              </Link>
              <Link
                to="/contact-us"
                style={{
                  textDecoration: "none",
                  margin: "0",
                  padding: "0 5px",
                }}
              >
                <h3
                  style={{
                    color: "white",
                    // margin: "0",
                    paddingRight: "5px",
                    fontSize: isMobile ? "9px" : "15px",
                    paddingLeft: isMobile ? "10px" : "0px",
                    marginTop: isMobile ? "35px" : "33px",
                  }}
                >
                  ContactUs
                </h3>
              </Link>
              <a
                href="/whats-new"
                style={{
                  textDecoration: "none",
                  margin: "0",
                  padding: "0 5px",
                }}
              >
                <h3
                  style={{
                    color: "white",

                    margin: "0",
                    // paddingRight: "5px",
                    fontSize: isMobile ? "9px" : "15px",
                    paddingLeft: isMobile ? "10px" : "0px",
                    marginTop: isMobile ? "35px" : "33px",
                  }}
                >
                  What's New
                </h3>
              </a>
            </div>
          </div>

          {isHome ? (
            <div>
              <h1>Welcome to the Homepage!</h1>
            </div>
          ) : (
            <LoginFormContainer>
              <LoginForm>
                <Input type="text" placeholder="Username" />
                <Input type="password" placeholder="Password" />
                <Button type="submit">Login</Button>
              </LoginForm>
            </LoginFormContainer>
          )}

          <div
            style={{
              color: "white",
              position: "fixed",
              bottom: "0px",
              left: "2px",
              right: "0px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "white",
                position: "absolute",
                height: "auto",
                left: "5%", // Adjust left position
                right: "5%", // Adjust right position
                bottom: "calc(100vh - 55%)", // Adjust bottom position using viewport height
                paddingLeft: "0px",
                marginbottom: "10px",
                display: "grid",
                gridTemplateColumns: "auto auto", // Define two columns
                gridTemplateRows: "auto auto auto", // Three rows
                // gap: "10px", // Add gap between grid items
                transform: isMobile ? "translateX(-25%)" : "translateX(-37%)", // Shift the grid to the left
              }}
            >
              {/* here */}

              <div
                style={{
                  fontSize: isMobile ? "10px" : "15px",
                  color: "#FFC94A",
                  fontFamily: "bold",
                  gridArea: "1/ 1/ 2/ 2", // Positioning in the grid
                  textAlign: "end",
                  paddingRight: "10px",
                  paddingTop:"3px",
                  paddingLeft: isMobile ? "150px" : "140px",
                  height: isMobile ? "9px" : "13px",
                  marginRight:isMobile ?"0px":"175px",
                }}
              >
                <h5>TM</h5>
              </div>
              <div
                style={{
                  color: "#FFC94A",
                  paddingLeft: isMobile ? "50px" : "0px",
                  fontSize: isMobile ? "11px" : "13px",
                  marginRight:isMobile ?"0px":"150px",
                  // fontSize: "13px",
                  gridArea: "2 / 1 / 3 / 3", // Positioning in the grid
                }}
              >
                <h1>SkyTron</h1>
              </div>

              {/* here */}

              <div
                style={{
                  fontSize: isMobile ? "11px" : "18px",
                  fontFamily: "Caveat",
                  color: "#F6F5F2",
                   paddingTop: "5px",
                   
                  gridArea: "3 / 1 / 4 / 3", // Positioning in the grid
                  paddingLeft: isMobile ? "50px" : "50px",
                  marginRight:isMobile ?"0px":"150px",
                }}
              >
                VLTD BackEnd, ASSAM
              </div>
            </div>

            <div style={{}}>
              <img
                src={amtronlogo}
                alt="Berry"
                width={isMobile ? "30" : "38"}
                height={isMobile ? "30" : "38"}
                style={{ marginTop: "17px" }}
              />
            </div>

            <div
              style={{
                marginTop: "0px",
                position: "relative",
                // paddingleft: "0px",
                // paddingRight: "0px",
                // paddingTop: "0px",
                paddingBottom: "20px",
              }}
            >
              <h2
                style={{
                  color: "#A3FFD6",
                  fontSize: isMobile ? "12px" : "20px",
                }}
              >
                Implemented by Assam Electronics Development Corporation Ltd
              </h2>
              <h3
                style={{
                  color: "#A3FFD6",
                  fontSize: isMobile ? "11px" : "17px",
                }}
              >
                &copy; All Rights Reserved
              </h3>
            </div>
          </div>
        </div>
      </Main>
    </Container>
  );
};

export default MainLayout;
