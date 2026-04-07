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
  height: "100%",
  minHeight: "150px",
  cursor:"pointer",
  transition: "all 0.4s ease",

  "& > div": {
    position: "relative",
    zIndex: 5,
  },
  /* HOVER EFFECT */
  "&:hover": {
    transform: "translateY(-8px) scale(1.02)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    filter: "brightness(1.1)",
  },
  /* ICON ANIMATION */
  "&:hover .widget-icon": {
    transform: "scale(1.2) rotate(5deg)",
  },

  // "&:after, &:before": {
  //   content: '""',
  //   position: "absolute",
  //   width: "100%", 
  //   height: "100%", 
  //   borderRadius: "50%",
  //   zIndex: 1,
  //   top: 0,
  //   left: 0,
  //   opacity: 0.5,
  // },

    "&:after": {
    content: '""',
    position: "absolute",
    width: "200%",
    height: "200%",
    top: "-50%",
    left: "-50%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)",
    transition: "0.5s",
    opacity: 0,
  },

  "&:hover::after": {
    opacity: 0.8,
  },
}));

const Widget = ({
  cardColor,
  label,
  onClick,
  cardValue,
  iconImage,
  heading,
  index = 0,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const labelNew = label.split(",");
  const arr = Object.values(cardValue);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100 + index * 120); // stagger effect

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <Box sx={{ height: "100%", transform: loaded
          ? "translateY(0px) scale(1)"
          : "translateY(40px) scale(0.95)",
        opacity: loaded ? 1 : 0,
        transition: "all 0.5s ease", }}>
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
                className="widget-icon"
                style={{
                  marginLeft: "50px",
                  transition: "transform 0.3s ease",
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </CardWrapper>
    </Box>
  );
};

Widget.propTypes = {
  cardColor: PropTypes.any,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  cardValue: PropTypes.any,
  heading: PropTypes.any,
  index: PropTypes.number,
};

export default Widget;
