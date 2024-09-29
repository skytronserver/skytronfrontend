import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerList = () => (
    <Box
      sx={{
        width: "auto",
        backgroundColor: "white", // Set drawer background to black
        height: "100%",
        color: "black", // Set text color to white
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
       
        <ListItem button component="a" href="#about">
          <ListItemText primary="About Us" sx={{ color: "white !important" }} />
        </ListItem>
        <ListItem button component="a" href="#contact">
          <ListItemText primary="Contact Us" sx={{ color: "white !important" }} />
        </ListItem>
        <ListItem button component={Link} to="/notice-view-all">
          <ListItemText primary="Notice" sx={{ color: "white !important" }} />
        </ListItem>
      </List>
    </Box>
  );

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "black",
        transition: "background-color 0.3s ease",
        color: scrolled ? "white" : "white",
        boxShadow: scrolled ? 3 : 0, // Add a shadow when scrolled
      }}
    >
      <Toolbar>
        <Typography variant="h3" component={Link} to="/" sx={{ flexGrow: 1, color: 'white', textDecoration: 'none' }}>
          SKYTRACK
        </Typography>

        {/* Right-side navigation links for larger screens */}
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          
          <Button color="inherit" component="a" href="#about">
            About Us
          </Button>
          <Button color="inherit" component="a" href="#contact">
            Contact Us
          </Button>
          <Button color="inherit" component={Link} to="/notice-view-all">
            Public Notice
          </Button>
        </Box>

        {/* Hamburger menu button for mobile */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Drawer for mobile navigation */}
      <Drawer anchor="top" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerList()}
      </Drawer>
    </AppBar>
  );
}

export default Navbar;
