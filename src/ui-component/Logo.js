//  material-ui

import { useTheme } from "@mui/material/styles";

import skytronlogo from "../assets/images/skytronlogo.png";
//import logo from 'assets/images/logo.svg';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */
import { useMediaQuery } from "@mui/material";
// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const dynamicWidth = isMobile ? "350px" : "80px";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "#86469C",
        width: dynamicWidth,
      }}
    >
      <img
        src={skytronlogo}
        alt="Berry"
        style={{ width: isMobile ? "12%" : "50%", height: isMobile ? "12%" : "50%", marginLeft: isMobile ? "10%" : "50%" }}
      />

      <div style={{ display: "flex", alignItems: "center" }}>
        <h3
          style={{
            padding: isMobile ? "30px 3px 30px 5px" : "30px 3px 30px 0",
            marginLeft: isMobile ? "0px" : "0px",
            color: "white",
            backgroundColor: "#86469C",
            fontfamily: "Quantico",
            fontSize: "20px",
            //padding: "30px 30px 30px 0",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          SKYTRON
          <p
          style={{
            marginLeft: "3px",
            marginBottom: "15px",
            paddingRight: "2px",
            fontfamily: "Quantico",
            fontSize: "10px",
            marginRight: isMobile ? "100px" : "10px",
            textAlign: "left",
            color: "white",
          }}
        >
          ®
        </p>
        </h3>

       
      </div>
    </div>
  );
};

export default Logo;
