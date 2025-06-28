import React from "react";
import PropTypes from "prop-types";
import { useTheme, styled } from "@mui/material/styles";
import { Box, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import MainCard from "../../../ui-component/cards/MainCard";

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
    width: "100%", 
    height: "100%", 
    borderRadius: "50%",
    zIndex: 1,
    top: 0,
    left: 0,
    opacity: 0.5,
  },
}));

const Widget = ({
  cardColor,
  label,
  onClick,
  cardValue,
  iconImage,
  heading,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const labelNew = label.split(",");
  const arr = Object.values(cardValue);
  return (
    <>
      <CardWrapper
        border={false}
        content={false}
        data={cardColor}
        onClick={onClick}
      >
        <Box sx={{ p: 2.25 }}>
          <Grid container alignItems="center">
            <Grid item xs>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ color: "#fff", fontWeight: "bold" }}
              >
                {typeof heading === 'string' && heading.startsWith('dashboard.headings.') 
                  ? t(heading)
                  : t(heading)}
              </Typography>
              <Box>
                {labelNew.map((item, index) => (
                  <Typography
                    key={index}
                    sx={{
                      fontWeight: 500,
                      mt: 0.75,
                      mb: 0.75,
                    }}
                  >
                    {`${item.trim()}: ${arr?.[index] ?? ''}`}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item>
              <img
                src={iconImage}
                alt={heading}
                width="50"
                style={{ marginLeft: "50px" }}
              />
            </Grid>
          </Grid>
        </Box>
      </CardWrapper>
    </>
  );
};

Widget.propTypes = {
  cardColor: PropTypes.any,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  cardValue: PropTypes.any,
  heading: PropTypes.any,
};

export default Widget;
