//  material-ui

import { useTheme } from "@mui/material/styles";
import { IconLine } from "@tabler/icons";

import logoDark from "assets/images/logo-dark.svg";
import skytronlogo from "assets/images/skytronlogo.svg";
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
      <h3
        style={{
          padding: isMobile ? "30px 30px 30px 5px" : "30px 30px 30px 0",
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
          //marginLeft: "5px",
        }}
      >
        SKYTRON
      </h3>
    </div>
  );
};

export default Logo;
