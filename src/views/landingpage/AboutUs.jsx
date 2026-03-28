import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

import aboutimg from "../../assets/images/aboutimg.jpg";

const About = () => {
  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom right, #f8fafc, #e3f2fd)",
        minHeight: "100vh",
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        
        {/* Top Section */}
        <Grid container spacing={6} alignItems="center">
          
          {/* Left Content */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#1976d2", fontWeight: 600, mb: 1 }}
            >
              Who We Are
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#0d47a1",
                mb: 2,
                lineHeight: 1.3,
              }}
            >
              Smart Tracking & IoT Solutions for the Future
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "gray", mb: 3, lineHeight: 1.7 }}
            >
              Mapwala is not just a name; it's a commitment to innovation and
              excellence. Our in-house electronics design team builds advanced,
              user-friendly IoT solutions that simplify complex technologies.
              We focus on enhancing productivity, security, and convenience for
              individuals and businesses.
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card elevation={3} sx={{ borderRadius: 3, textAlign: "center" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                      10K+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Devices Connected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={6}>
                <Card elevation={3} sx={{ borderRadius: 3, textAlign: "center" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                      24/7
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monitoring
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Image */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
              }}
            >
              {/* Blur background */}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "#1976d2",
                  opacity: 0.1,
                  borderRadius: 4,
                  filter: "blur(20px)",
                }}
              />

              <Box
                component="img"
                src={aboutimg}
                alt="Mapwala About"
                sx={{
                  position: "relative",
                  width: "100%",
                  height: { xs: 250, md: 400 },
                  objectFit: "cover",
                  borderRadius: 4,
                  boxShadow: 4,
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Box sx={{ my: 8, borderTop: "1px solid #e0e0e0" }} />

        {/* Bottom Section */}
        <Box sx={{ maxWidth: 800, mx: "auto", textAlign: { xs: "center", md: "left" } }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: "#0d47a1", mb: 2 }}
          >
            About Mapwala
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "gray", lineHeight: 1.8 }}
          >
            At Mapwala, we are dedicated to transforming how you interact with
            technology. As a pioneering startup in IoT product design,
            manufacturing, and services, we deliver smart solutions that
            seamlessly integrate into everyday life and business workflows. Our
            mission is to create reliable, scalable, and innovative products
            that empower smarter decisions and better connectivity.
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

export default About;