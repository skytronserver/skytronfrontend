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
  borderRadius: "8px",
  width: "100%",
  height: "100",

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

const Widget = ({ isLoading, cardColor, label, onClick, device }) => {
  const theme = useTheme();
//work on that
  const labelNew = label.split(",");
  const arr = Object.values(device);
  //work on that

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
                <Grid container direction="row" alignItems="center">
                  {/* new */}

                  {labelNew.map((item, index) => (
                    <Typography
                      key={index}
                      sx={{
                        fontWeight: 500,
                        mr: 1,
                        mt: index === 0 ? 1.75 : 0.75,
                        mb: 0.75,
                      }}
                    >
                      {item} {arr[index]}
                    </Typography>
                  ))}

                  {/* new */}
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
  onClick: PropTypes.func, 
  device: PropTypes.any, 
};

export default Widget;
