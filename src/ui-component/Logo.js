//  material-ui

import { useTheme } from "@mui/material/styles";
import { IconLine } from "@tabler/icons";

import logoDark from "../assets/images/logo-dark.svg";
import skytronlogo from "../assets/images/skytronlogo.svg";
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
        // width="20"
        // , height: isMobile ? '63px' : '40px'

        width={isMobile ? "20" : "20"}
        height={isMobile ? "40" : "40"}
        style={{ marginLeft: isMobile ? "40px" : "50px" }}
      />

      <div style={{ display: "flex", alignItems: "center" }}>
        <h3
          style={{
            padding: isMobile ? "30px 3px 30px 5px" : "30px 3px 30px 0",
            marginLeft: isMobile ? "0px" : "5px",
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
        </h3>

        <h5
          style={{
            marginBottom: "15px",
            paddingRight: "30px",
            fontfamily: "Quantico",
            fontSize: "10px",
            marginRight: "100px",
            textAlign: "left",
            color: "white",
          }}
        >
          ®
        </h5>
      </div>
    </div>
  );
};

export default Logo;
