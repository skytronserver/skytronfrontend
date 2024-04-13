// // material-ui
// import { useTheme } from "@mui/material/styles";
// import { IconLine } from "@tabler/icons";

// import logoDark from "assets/images/logo-dark.svg";
// import skytronlogo from "assets/images/skytronlogo.svg";


// // ==============================|| LOGO SVG ||============================== //

// const Logo = () => {
//   const theme = useTheme();

//   return (
//     <div style={{ display: 'flex', alignItems: 'center'}}>
//     <img src={skytronlogo} alt="Berry" width="20" style={{marginLeft:'50px' }}    />
//     <h3 style={{ color: 'white', backgroundColor: '#86469C',fontfamily: 'Quantico', fontSize: '20px',padding: '30px 30px 30px 0', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '5px' }}>SKYTRON</h3>
// {/* mobile view */}
//     <style>
//         {`
//           @media (max-width: 768px) {
//             h3 {
//               font-size: 14px;
//             }
//             img {
//               width: 15px;
//               margin-left: 10px;
//             }
//           }
//         `}
//       </style>
// </div>

    
//   );
// };

// export default Logo;
import { useTheme } from "@mui/material/styles";
import { IconLine } from "@tabler/icons";

import logoDark from "assets/images/logo-dark.svg";
import skytronlogo from "assets/images/skytronlogo.svg";

// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
  const theme = useTheme();

  return (
    <div style={{ display: 'flex', alignItems: 'center'}}>
      <img src={skytronlogo} alt="Berry" width="20" style={{marginLeft:'50px' }} />
      <h3 style={{ color: 'white', backgroundColor: '#86469C',fontfamily: 'Quantico', fontSize: '20px',padding: '30px 30px 30px 0', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '5px' }}>SKYTRON</h3>
      {/* mobile view */}
      <style>
        {`
          @media (max-width: 768px) {
            h3 {
              font-size: 14px; /* Adjust font size as needed */
            }
            img {
              width: 15px; /* Adjust width as needed */
              margin-left: 10px; /* Adjust margin as needed */
            }
          }
        `}
      </style>
    </div>
  );
};

export default Logo;