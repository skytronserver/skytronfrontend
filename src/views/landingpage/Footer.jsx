import React from "react";
import {
  Box,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import NavigationIcon from "@mui/icons-material/Navigation";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  return (
    <Box
      sx={{
        position: "relative",
        mt: 10,
        background: "linear-gradient(to top, #0a0a0a, #111)", // 🔥 solid dark bg
        color: "#fff",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.8)", // 🔥 premium shadow
      }}
    >
      {/* Top Fade Transition */}
      <Box
        sx={{
          position: "absolute",
          top: "-60px",
          left: 0,
          width: "100%",
          height: "60px",
          background: "linear-gradient(to bottom, transparent, #0a0a0a)",
        }}
      />

      {/* Animated Top Border */}
      <Box
        sx={{
          height: "3px",
          width: "100%",
          background:
            "linear-gradient(90deg, #00c6ff, #0072ff, #00c6ff)",
          backgroundSize: "200% 100%",
          animation: "moveGradient 4s linear infinite",
        }}
      />

      {/* CENTERED CONTAINER */}
      <Box sx={{ maxWidth: "1200px", mx: "auto", px: { xs: 2, md: 3 } }}>
        <Grid container spacing={4} sx={{ py: { xs: 4, md: 6 } }}>
          
          {/* BRAND */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color:"#fff" }}>
              MAPWALA
            </Typography>
            <Typography variant="body2" sx={{ color: "#bbb" }}>
              Smart live tracking for vehicles & products across India.
              Real-time GPS tracking with powerful analytics.
            </Typography>
          </Grid>

          {/*  QUICK LINKS */}
          <Grid item xs={6} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color:"#fff" }}>
              Quick Links
            </Typography>
            {["Home", "About", "Tracking", "Contact"].map((item) => (
              <Typography key={item} sx={{ mb: 1 }}>
                <Link
                  href="#"
                  underline="none"
                  sx={{
                    color: "#bbb",
                    fontSize: "14px",
                    "&:hover": {
                      color: "#00c6ff",
                      pl: 1,
                    },
                    transition: "0.3s",
                  }}
                >
                  {item}
                </Link>
              </Typography>
            ))}
          </Grid>

          {/* FEATURES */}
          <Grid item xs={6} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>

            {[
              { icon: <NavigationIcon />, text: "Live GPS Tracking" },
              { icon: <LocalShippingIcon />, text: "Fleet Management" },
              { icon: <TrackChangesIcon />, text: "Real-time Alerts" },
            ].map((item, i) => (
              <Box key={i} sx={{ display: "flex", mb: 1 }}>
                <Box sx={{ color: "#00c6ff", mr: 1 }}>
                  {item.icon}
                </Box>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Grid>

          {/* CONTACT */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Contact
            </Typography>

            <Box sx={{ display: "flex", mb: 1 }}>
              <LocationOnIcon sx={{ color: "#00c6ff", mr: 1 }} />
              <Typography variant="body2" sx={{ color: "#ccc" }}>
                India
              </Typography>
            </Box>

            <Box sx={{ display: "flex", mb: 1 }}>
              <PhoneIcon sx={{ color: "#00c6ff", mr: 1 }} />
              <Typography variant="body2" sx={{ color: "#ccc" }}>
                +91 123456789
              </Typography>
            </Box>

            <Box sx={{ display: "flex", mb: 2 }}>
              <EmailIcon sx={{ color: "#00c6ff", mr: 1 }} />
              <Typography variant="body2" sx={{ color: "#ccc" }}>
                support@mapwala.com
              </Typography>
            </Box>

            {/*  SOCIAL */}
            <Box>
              {[FacebookIcon, TwitterIcon, LinkedInIcon].map(
                (Icon, i) => (
                  <IconButton
                    key={i}
                    sx={{
                      color: "#fff",
                      "&:hover": {
                        color: "#00c6ff",
                        transform: "scale(1.2)",
                      },
                      transition: "0.3s",
                    }}
                  >
                    <Icon />
                  </IconButton>
                )
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/*  COPYRIGHT */}
      <Box
        sx={{
          textAlign: "center",
          py: 2,
          fontSize: "14px",
          color: "#aaa",
        }}
      >
        © {new Date().getFullYear()} Mapwala • Live Tracking System 
      </Box>

      {/*  ANIMATION */}
      <style>
        {`
          @keyframes moveGradient {
            0% { background-position: 0% }
            100% { background-position: 200% }
          }
        `}
      </style>
    </Box>
  );
};

export default Footer;