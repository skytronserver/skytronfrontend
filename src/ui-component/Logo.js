// material-ui
import { useTheme } from "@mui/material/styles";
import { IconLine } from "@tabler/icons";

import logoDark from "assets/images/logo-dark.svg";
import skytronlogo from "assets/images/skytronlogo.svg";
//import logo from 'assets/images/logo.svg';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */

// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
  const theme = useTheme();

  return (


    /**
     * if you want to use image instead of svg uncomment following, and comment out <svg> element.
     *
     * <img src={logo} alt="Berry" width="100" />
     *
     */
    // <div>
    //   <img src={skytronlogo} alt="Berry" width="30"/>
    //   <h3
    //     style={{
    //       color: "white",
    //       width: "265px",
    //       backgroundColor: "#86469C",
    //       fontSize: "15px",
    //       padding: "30px",
    //       height: "40px",
    //       display: "flex",
    //       alignItems: "center",
    //       justifyContent: "center",
    //       marginLeft: "-30px",
    //       marginTop: "-10",
    //     }}
    //   >
    //     SKYTRON
    //   </h3>
    // </div>

    <div style={{ display: 'flex', alignItems: 'center'}}>
    <img src={skytronlogo} alt="Berry" width="20" style={{marginLeft:'50px' }}    />
    <h3 style={{ color: 'white', backgroundColor: '#86469C',fontfamily: 'Quantico', fontSize: '20px',padding: '30px 30px 30px 0', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '5px' }}>SKYTRON</h3>
</div>

    
  );
};

export default Logo;
