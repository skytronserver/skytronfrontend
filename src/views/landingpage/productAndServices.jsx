import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";

import weoffer1 from "../../assets/images/weoffer1.jpg";
import weoffer2 from "../../assets/images/weoffer2.jpg";
import weoffer3 from "../../assets/images/weoffer3.jpg";
import chooosemmw1 from "../../assets/images/choosemw1.jpg";
import chooosemmw2 from "../../assets/images/choosemw2.jpg";

const Services = () => {
  return (
    <Box sx={{ background: "#f5f7fb" }}>
      
      {/* ===== WHAT WE OFFER ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold">
            What We Offer
          </Typography>
          <Box
            sx={{
              width: 80,
              height: 4,
              bgcolor: "#1976d2",
              mx: "auto",
              mt: 2,
              borderRadius: 2,
            }}
          />
        </Box>

        <Grid container spacing={6}>
          
          {/* Item 1 */}
          <Grid item xs={12}>
            <Grid container spacing={4} alignItems="center">
              
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src={weoffer1}
                  sx={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h4" fontWeight="600">
                  Custom IoT Design
                </Typography>
                <Typography mt={2} color="text.secondary">
                  Our team of experienced engineers and designers specialize in
                  developing bespoke IoT solutions tailored to meet your specific
                  needs. From concept to product, we ensure optimal performance.
                </Typography>
              </Grid>

            </Grid>
          </Grid>

          {/* Item 2 */}
          <Grid item xs={12}>
            <Grid container spacing={4} alignItems="center">
              
              <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
                <Box
                  component="img"
                  src={weoffer2}
                  sx={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <Typography variant="h4" fontWeight="600">
                  Manufacturing & Sales
                </Typography>
                <Typography mt={2} color="text.secondary">
                  Explore our wide range of IoT products for smart homes,
                  automation, and innovative consumer electronics.
                </Typography>
              </Grid>

            </Grid>
          </Grid>

          {/* Item 3 */}
          <Grid item xs={12}>
            <Grid container spacing={4} alignItems="center">
              
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src={weoffer3}
                  sx={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h4" fontWeight="600">
                  Service & Support
                </Typography>
                <Typography mt={2} color="text.secondary">
                  We provide complete after-sales support ensuring your devices
                  operate smoothly and efficiently at all times.
                </Typography>
              </Grid>

            </Grid>
          </Grid>

        </Grid>
      </Container>

      {/* ===== WHY CHOOSE US ===== */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>

        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold">
            Why Choose Mapwala?
          </Typography>
        </Box>

        <Grid container spacing={4}>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Box component="img" src={chooosemmw1} sx={{ width: "100%" }} />
              <Typography variant="h5" mt={2} fontWeight="600">
                Innovative Solutions
              </Typography>
              <Typography mt={1} color="text.secondary">
                We stay ahead with cutting-edge IoT innovations.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="600">
                Quality Assurance
              </Typography>
              <Typography mt={1} color="text.secondary">
                We maintain the highest quality standards.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Box component="img" src={chooosemmw2} sx={{ width: "100%" }} />
              <Typography variant="h5" mt={2} fontWeight="600">
                Customer-Centric
              </Typography>
              <Typography mt={1} color="text.secondary">
                We focus on delivering personalized solutions.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="600">
                Expert Team
              </Typography>
              <Typography mt={1} color="text.secondary">
                Experienced professionals delivering excellence.
              </Typography>
            </Paper>
          </Grid>

        </Grid>
      </Container>

      {/* ===== CTA SECTION ===== */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2, #0d47a1)",
          color: "#fff",
          py: { xs: 6, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold">
            Join the IoT Revolution
          </Typography>

          <Typography mt={2}>
            Transform your world with smart connected solutions from Mapwala.
          </Typography>

          <Box mt={4}>
            <Button
              component={Link}
              to="/contact"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#fff",
                color: "#1976d2",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "#e3f2fd",
                },
              }}
            >
              Try Now
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
};

export default Services;