// material-ui
import { Link, Typography, Stack } from "@mui/material";
import amtronlogo from "assets/images/Amtron.svg";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

const AuthFooter = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div >
      <Stack direction="row"  justifyContent="space-between" >
        <Typography
          variant="subtitle2"
          component={Link}
          href=""
          target="_blank"
          underline="hover"
        >
          <img
          
           
            src={amtronlogo}
            alt="Berry"
            // width="20"
            // , height: isMobile ? '63px' : '40px'

            width={isMobile ? "40" : "38"}
            height={isMobile ? "40" : "38"}
            style={{ marginLeft: isMobile ? "150px" : "150px" }}
          />

          <h4 >Implemented by Assam Electronics Development Corporation Ltd</h4>
        </Typography>

        <Typography
          variant="subtitle2"
          component={Link}
          href=""
          target="_blank"
          underline="hover"

        >
          {/* &copy; Tracking */}
        </Typography>
      </Stack>
    </div>
  );
};

export default AuthFooter;

