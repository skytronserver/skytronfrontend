import React from 'react';
import { Typography } from '@mui/material';
import amtronlogo from "../../assets/images/amtron-logo.png";

function HomeFooter() {
  return (
    <footer style={{ position: 'fixed', bottom: 0, width: '100%', textAlign: 'center', color: 'rgb(163, 255, 214);', padding: '10px 0' }}>
      <img
        src={amtronlogo}
        alt="logo"
        style={{ height: 'auto', width: '36px' }}
      /><br />
      <Typography variant="body1" sx={{ fontSize: '16px',color: "#0010FF" }}>Implemented by Assam Electronics Development Corporation Ltd <br />© All rights reserved.</Typography>
    </footer>
  );
}

export default HomeFooter;
