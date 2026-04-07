//  material-ui

import { useTheme } from "@mui/material/styles";
import { IconLine } from "@tabler/icons";

import logoDark from "../assets/images/logo-dark.svg";
import skytronlogo from "../assets/images/skytronlogo.png";
import mapwalalogo from "../assets/images/logo.png";
//import logo from 'assets/images/logo.svg';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */
import { useMediaQuery, Box } from "@mui/material";
// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // const dynamicWidth = isMobile ? "350px" : "80px";

  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  // Dynamic logo size
  const logoWidth = isMobile ? 150 : isTablet ? 180 : 200;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
        width: "100%",
        minHeight: "64px",
        //px: 2,
        zIndex: 1,
      }}
    >
      <img
        src={mapwalalogo}
        alt="Mapwala Logo"
        style={{
          width: `${logoWidth}px`, // ✅ minimum 150px
          height: "auto",
          objectFit: "contain",
        }}
      />
    </Box>
    // <div
    //   style={{
    //     display: "flex",
    //     alignItems: "center",
    //     backgroundColor: "#86469C",
    //     width: dynamicWidth,
    //   }}
    // >
    //   <img
    //     src={mapwalalogo}
    //     alt="Berry"
    //     style={{ width: isMobile ? "12%" : "50%", height: isMobile ? "12%" : "50%", marginLeft: isMobile ? "10%" : "50%" }}
    //   />

    //   <div style={{ display: "flex", alignItems: "center" }}>
    //     <h3
    //       style={{
    //         padding: isMobile ? "30px 3px 30px 5px" : "30px 3px 30px 0",
    //         marginLeft: isMobile ? "0px" : "0px",
    //         color: "white",
    //         backgroundColor: "#86469C",
    //         fontfamily: "Quantico",
    //         fontSize: "20px",
    //         //padding: "30px 30px 30px 0",
    //         height: "40px",
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //       }}
    //     >
    //       MAPWALA
    //       <p
    //       style={{
    //         marginLeft: "3px",
    //         marginBottom: "15px",
    //         paddingRight: "2px",
    //         fontfamily: "Quantico",
    //         fontSize: "10px",
    //         marginRight: isMobile ? "100px" : "10px",
    //         textAlign: "left",
    //         color: "white",
    //       }}
    //     >
    //       ®
    //     </p>
    //     </h3>

       
    //   </div>
    // </div>
  );
};

export default Logo;
