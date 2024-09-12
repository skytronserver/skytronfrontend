import React from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import skytrack from "../../assets/images/skytrack.jpg";
import gps from "../../assets/images/gps.webp";


function AboutUs() {
  return (
    <Box
      id="about"
      sx={{
        padding: 4,
        backgroundImage: `url(${skytrack})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay color
        color: 'white',
      }}
    >
      <Box sx={{ backgroundColor: 'rgba(144, 107, 229, 0.5)', padding: 3, borderRadius: 2 }}>
        <Grid container spacing={4} alignItems="center">
          {/* First Column: Image */}
          <Grid item xs={12} md={6}>
            <img
              src={gps}
              alt="About Us"
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          </Grid>

          {/* Second Column: Details */}
          <Grid item xs={12} md={6} sx={{color:'white'}}>
            <Typography variant="h2" component="h2" gutterBottom sx={{color:'white !important'}}>
              ABOUT US
            </Typography>
        
            <Typography variant="body1" paragraph sx={{fontSize: "16px",fontWeight: "bold",fontStyle: "italic",lineHeight:'30px'}}>Since our inception on September, 2019, we have been at
                the forefront of developing state-of-the-art hardware and software solutions for the transportation
                sector. As a proud supporter of the Make in India initiative, all our devices and technologies are
                designed, prototyped, and tested locally in India.
              </Typography>
              <Typography variant="body1" paragraph sx={{fontSize: "16px",fontWeight: "bold",fontStyle: "italic",lineHeight:'30px'}}>At Skytrack, we recognize the challenges faced by the
                Indian transportation industry. The lack of
                reliable routing systems and inadequate tracking mechanisms result in unauthorized route deviations,
                traffic congestion, and illegal activities. Our solutions aim to address these issues by providing
                accurate GPS routing, enhancing efficiency, reducing driving time, and enabling significant cost
                savings.</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AboutUs;
