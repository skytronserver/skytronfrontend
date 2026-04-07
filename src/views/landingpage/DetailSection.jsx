// src/DetailSection.js

import { Container, Typography, Box } from "@mui/material";

function DetailSection() {
  return (
    <Box
      sx={{
        py: 8, // Adds padding to the top and bottom
        backgroundColor: "#f5f5f5", // Light background color
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" component="h2" gutterBottom sx={{
            letterSpacing: "4px",
            textAlign: "center",
            fontWeight: 400,
            fontSize: "30px"
        }}>
          Mapwala - Revolutionizing Intelligent Transportation Systems
        </Typography>
       
        <Typography variant="body1" paragraph sx={{
            fontStyle: "italic",
            fontSize: "16px",
            fontWeight:"bold",
            lineHeight:'30px'
        }}>
        Mapwala Technologies Private Limited is a StartUp recognized by the Department of Industrial Policy and Promotion (DIPP), Government of India, with a mission to transform the landscape of intelligent transportation systems in India. With our cutting-edge technology and unwavering commitment to innovation, we aim to provide advanced solutions that enhance efficiency, safety, and comfort in transportation networks.
        </Typography>
     
      </Container>
    </Box>
  );
}

export default DetailSection;
