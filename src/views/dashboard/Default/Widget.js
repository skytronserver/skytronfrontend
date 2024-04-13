//new imp

import React from "react";
import PropTypes from "prop-types";
import { useTheme, styled } from "@mui/material/styles";
import { Avatar, Box, Grid, Typography } from "@mui/material";
import MainCard from "../../../ui-component/cards/MainCard";
import SkeletonTotalOrderCard from "../../../ui-component/cards/Skeleton/Widget";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import { useMediaQuery } from "@mui/material";

const CardWrapper = styled(MainCard)(({ theme, data }) => ({
  
  background: data,
  color: "#fff",
  overflow: "hidden",
  position: "relative",
  borderRadius: "8px",
  width: "100%",
  height: "150px",

  "& > div": {
    position: "relative",
    zIndex: 5,
  },
  "&:after, &:before": {
    content: '""',
    position: "absolute",
    width: "100%", // width to  cover the entire component
    height: "100%", // height to cover the entire component
    //  background: theme.palette.primary[800],
    borderRadius: "50%",
    zIndex: 1,
    top: 0,
    left: 0,
    opacity: 0.5,
  },
}));

const Widget = ({ isLoading, cardColor, label, onClick, device, address }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const labelNew = label.split(",");
  const arr = Object.values(device);

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={6}
      lg={10}
      style={{
        marginTop: "40px",
        marginLeft: "30px",
        marginRight: "10px",
        marginBottom: "0.2px",
      }}
    >
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <CardWrapper
          border={false}
          content={false}
          data={cardColor}
          onClick={onClick}
        >
          <Box sx={{ p: 2.25 }}>
            <Grid container alignItems="center">
              <Grid item xs>
                <Grid
                  container
                  direction="column"
                  alignItems="flex-start"
                  sx={{ pt: 3 }}
                >
                   
                  {labelNew.map((item, index) => (
                    <Typography
                      key={index}
                      sx={{
                        fontWeight: 500,
                        mt: 0.75,
                        mb: 0.75,
                      }}
                    >
                      {isMobile ? `${item}: ` : `${item}: ${arr[index]}`}
                    </Typography>
                  ))}
                </Grid>
              </Grid>
              <Grid item style={{ marginLeft: "30px" }}>
                {/* <Avatar
                  variant="rounded"
                  sx={{
                    ...theme.typography.commonAvatar,
                    ...theme.typography.largeAvatar,
                    backgroundColor: theme.palette.primary[800],
                    color: "#fff",
                    mt: 1,
                  }}
                >
                  <LocalMallOutlinedIcon fontSize="inherit" />
                </Avatar> */}


                <img src={address} alt="Berry" width="50" style={{marginLeft:'50px' }} />

              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </Grid>
  );
};

Widget.propTypes = {
  isLoading: PropTypes.bool,
  cardColor: PropTypes.any,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  device: PropTypes.any,
};

export default Widget;
