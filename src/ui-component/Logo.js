// material-ui
import { useTheme } from "@mui/material/styles";

import logoDark from 'assets/images/logo-dark.svg';
import skytronlogo from 'assets/images/skytronlogo.svg';
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
    <div>
    <img src={skytronlogo} alt="Berry" width="30" />

    <h3>SkyTron</h3>

    </div>
  );
};

export default Logo;
