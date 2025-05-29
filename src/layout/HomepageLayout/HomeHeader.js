import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Divider,  Grid, Button, ListItemIcon } from '@mui/material';
import { Home as HomeIcon, Menu as MenuIcon } from '@mui/icons-material';
import ashokstambh from "../../assets/images/ashoka-pillar.webp";
import { Link } from "react-router-dom";
import logo2 from "../../assets/images/skytron-logo2.png";
import WebFont from "webfontloader";
WebFont.load({
  google: {
    families: ["Pacifico", "sans-serif", "Lobster", "Caveat"],
  },
});
function HomeHeader({ isDrawerOpen, setDrawerOpen, toggleDrawer }) {
  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: 'purple', padding: '8px' }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Left section with Ashok Stambh */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginRight: '20px' 
          }}>
            <img 
              src={ashokstambh} 
              alt="Ashoka Stambh" 
              style={{ 
                width: '40px', 
                height: 'auto'
              }} 
            />
          </div>

          {/* Title section */}
          <Typography 
            variant="h2" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              color: '#FFC94A', 
              fontWeight: 'bold', 
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <img 
                  src={logo2} 
                  alt="Skytron Logo" 
                  style={{  
                    width: '30px',
                    height: 'auto',
                    marginRight: '8px'
                  }} 
                />
                <span style={{ fontFamily: "Bicubik", fontSize: '1.6rem' }}>
                  SkyTron<sup style={{fontSize: '18px',
                  marginLeft: '5px',
                  position: 'relative',
                  top: '-2px' }}>®</sup>
                </span>
              </div>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'white', 
                  fontFamily: "Caveat", 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  lineHeight: 1,
                  letterSpacing: '0.5px'
                }}
              >
                VLTD BackEnd, ASSAM
              </Typography>
            </div>
          </Typography>

          {/* Menu icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { md: 'none' } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          {/* Navigation buttons */}

          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" startIcon={<HomeIcon />} component={Link} to="/" sx={{ mr: 2 }}>Home</Button>
            {/* <Button color="inherit" component="a" href="#contact" sx={{ mr: 2 }}>Contact Us</Button>
            <Button color="inherit" component="a" href="#about" sx={{ mr: 2 }}>About Us</Button> */}
            <Button color="inherit" component={Link} to="/privacy-policy">Privacy Policy</Button>
          </Grid>
          
        </Toolbar>
      </AppBar>
      {/* Drawer */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: '50%' }, backgroundColor: 'purple' }}
      >
        <div
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          sx={{ width: '50%', backgroundColor: 'purple' }}
        >
          <List>
            <ListItem button component={Link} to="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            {/* <ListItem button component="a" href="#contact">
              <ListItemText primary="Contact Us" />
            </ListItem>
            <ListItem button component="a" href="#about">
              <ListItemText primary="About Us" />
            </ListItem> */}
            <ListItem button component={Link} to="/privacy-policy">
              <ListItemText primary="Privacy Policy" />
            </ListItem>
          </List>
          <Divider />
        </div>
      </Drawer>
    </div>
  );
}

export default HomeHeader;
