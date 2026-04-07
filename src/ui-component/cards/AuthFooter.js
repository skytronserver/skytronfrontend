// import { Typography, Stack } from "@mui/material";
// import { useTranslation } from "react-i18next";
// import amtronlogo from "../../assets/images/Amtron.svg";
// import { useMediaQuery } from "@mui/material";
// import { useTheme } from "@mui/material/styles";

// // ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

// const AuthFooter = () => {
//   const theme = useTheme();
//   const { t } = useTranslation();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   return (
//     <div>
//       <Stack direction="row" justifyContent="center">
//         <Typography
//           variant="subtitle2"
//           href=""
//           target="_blank"
//           underline="hover"
//         >
//           {/* <img
//             src={amtronlogo}
//             alt="Amtron Logo"
//             width={isMobile ? "40" : "38"}
//             height={isMobile ? "40" : "38"}
//             style={{ marginLeft: isMobile ? "150px" : "150px" }}
//           /> */}

//           <span
//             style={{ width: isMobile ? "365px" : "365px", display: "block" }}
            
//           >
//             {t('common.implementedBy')}
//           </span>
//         </Typography>
//       </Stack>
//     </div>
//   );
// };

// export default AuthFooter;

import { Typography, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

const AuthFooter = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "#64748b" }}>
        {t('common.implementedBy')}
      </Typography>
    </Box>
  );
};

export default AuthFooter;
