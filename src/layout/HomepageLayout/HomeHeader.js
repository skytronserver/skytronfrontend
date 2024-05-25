import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Divider, Link, Grid, Button } from '@mui/material';
import { Home as HomeIcon, Menu as MenuIcon } from '@mui/icons-material';
import ashokstambh from "../../assets/images/ashoka-pillar.webp";
import WebFont from "webfontloader";
WebFont.load({
  google: {
    families: ["Pacifico", "sans-serif", "Lobster", "Caveat"],
  },
});
function HomeHeader({ isDrawerOpen, setDrawerOpen, toggleDrawer }) {
  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: 'purple' }}>
        <Toolbar>
        <img src={ashokstambh} alt="Skytron" style={{ width: '40px', marginRight: '16px' ,height:'auto',marginLeft:'16px'}} />

          <Typography variant="h2" component="div" sx={{ flexGrow: 1, color: '#FFC94A', fontWeight: 'bold', position: 'relative', padding: '12px', marginLeft: '12px' }}>
            <span>SkyTron<sup style={{ fontSize: "12px" }}>TM</sup></span>
            <Typography variant="caption" sx={{ color: 'white', fontFamily: "Caveat", display: 'block', fontSize: '16px', fontWeight: 'bold' }}>VLTD BackEnd, ASSAM</Typography>
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
            <Button color="inherit" startIcon={<HomeIcon />} component={Link} href="#home" sx={{ mr: 2 }}>Home</Button>
            <Button color="inherit" component={Link} href="#contact" sx={{ mr: 2 }}>Contact Us</Button>
            <Button color="inherit" component={Link} href="#about">About Us</Button>
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
            <ListItem button>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Contact Us" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="About Us" />
            </ListItem>
          </List>
          <Divider />
        </div>
      </Drawer>
    </div>
  );
}

export default HomeHeader;
