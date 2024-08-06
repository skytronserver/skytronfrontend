import { Typography, Stack } from "@mui/material";
import amtronlogo from "../../assets/images/Amtron.svg";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

const AuthFooter = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          variant="subtitle2"
          href=""
          target="_blank"
          underline="hover"
        >
          <img
            src={amtronlogo}
            alt="Amtron Logo"
            width={isMobile ? "40" : "38"}
            height={isMobile ? "40" : "38"}
            style={{ marginLeft: isMobile ? "150px" : "150px" }}
          />

          <span
            style={{ width: isMobile ? "365px" : "365px", display: "block" }}
          >
            Implemented by Assam Electronics Development Corporation Ltd
          </span>
        </Typography>
      </Stack>
    </div>
  );
};

export default AuthFooter;
