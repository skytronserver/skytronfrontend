//new
// Widget.js
// import React from 'react';

// const Widget = ({ isLoading, cardColor, onClick, label }) => {
//   return (
//     <div
//       style={{
//         backgroundColor: cardColor,
//         padding: '20px',
//         borderRadius: '8px',
//         marginBottom: '20px',
//         textAlign: 'center',
//         color: '#fff', // Text color
//       }}
//       onClick={onClick}
//     >
//       {label} {/* Display the label */}
//     </div>
//   );
// };

// export default Widget;

// Widget.js

import React from "react";
import PropTypes from "prop-types";
import { useTheme, styled } from "@mui/material/styles";
import { Avatar, Box, Grid, Typography } from "@mui/material";
import MainCard from "../../../ui-component/cards/MainCard";
import SkeletonTotalOrderCard from "../../../ui-component/cards/Skeleton/Widget";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";

const CardWrapper = styled(MainCard)(({ theme, data }) => ({
  backgroundColor: data,
  color: "#fff",
  overflow: "hidden",
  position: "relative",
  borderRadius: "8px", // Add border radius
  height: "250px", // Set a fixed height
  width: "250",
  "& > div": {
    position: "relative",
    zIndex: 5,
  },
  "&:after": {
    content: '""',
    position: "absolute",
    width: 250,
    height: 250,
    background: theme.palette.primary[800],
    borderRadius: "50%",
    zIndex: 1,
    top: -125,
    right: -125,
    [theme.breakpoints.down("sm")]: {
      top: -155,
      right: 70,
    },
  },
  "&:before": {
    content: '""',
    position: "absolute",
    zIndex: 1,
    width: 250,
    height: 250,
    background: theme.palette.primary[800],
    borderRadius: "50%",
    top: -125,
    right: -15,
    opacity: 0.5,
    [theme.breakpoints.down("sm")]: {
      top: -155,
      right: -70,
    },
  },
}));

const Widget = ({ isLoading, cardColor, label, onClick }) => {
  const theme = useTheme();

  return (
    <Grid
      item
      xs={12}
      sm={6}
      md={6}
      lg={10}
      style={{
        marginTop: "50px",
        marginLeft: "30px",
        marginRight: "20px",
        marginBottom: "40px",
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
              <Grid item style={{ marginRight: "30px" }}>
                <Avatar
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
                </Avatar>
              </Grid>
              <Grid item xs>
                <Grid container direction="column" alignItems="flex-start">
                  {label.split(",").map((item, index) => (
                    <Typography
                      key={index}
                      sx={{
                        fontWeight: 500,
                        mr: 1,
                        mt: index === 0 ? 1.75 : 0.75,
                        mb: 0.75,
                      }}
                    >
                      {item.trim()}
                    </Typography>
                  ))}
                </Grid>
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
  cardColor: PropTypes.string,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Widget;
