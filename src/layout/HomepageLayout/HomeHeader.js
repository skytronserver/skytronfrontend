import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Divider, Grid, Button, Menu, MenuItem } from '@mui/material';
import { Home as HomeIcon, Menu as MenuIcon, ImportantDevices as ImportantLinksIcon, KeyboardArrowDown as ArrowDownIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ashokstambh from "../../assets/images/ashoka-pillar.webp";
import { Link } from "react-router-dom";
import logo from "../../assets/images/skytron-logo3.png";
import WebFont from "webfontloader";
WebFont.load({
  google: {
    families: ["Pacifico", "sans-serif", "Lobster", "Caveat"],
  },
});
function HomeHeader({ isDrawerOpen, setDrawerOpen, toggleDrawer }) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const importantLinksOpen = Boolean(anchorEl);
  const [dashboardAnchorEl, setDashboardAnchorEl] = useState(null);
  const dashboardOpen = Boolean(dashboardAnchorEl);

  const handleImportantLinksClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleImportantLinksClose = () => {
    setAnchorEl(null);
  };

  const handleDashboardClick = (event) => {
    setDashboardAnchorEl(event.currentTarget);
  };

  const handleDashboardClose = () => {
    setDashboardAnchorEl(null);
  };

  return (
    <div>
      <AppBar position="static" sx={{ backgroundColor: 'purple', padding: '4px' }}>
        <Toolbar>
          {/* Ashoka Stambh Icon - Moved to the start */}
          <img
            src={ashokstambh}
            alt={t('common.ashokStambh')}
            style={{
              width: '30px',
              height: 'auto',
              marginRight: '12px'
            }}
          />

          {/* Logo and Title Container */}
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
                  src={logo}
                  alt={t('common.skytronLogo')}
                  style={{
                    width: '30px',
                    height: 'auto',
                    marginRight: '8px'
                  }}
                />
                <span style={{ fontFamily: "Bicubik", fontSize: '1.6rem' }}>
                  SkyTron<sup style={{
                    fontSize: '18px',
                    marginLeft: '5px',
                    position: 'relative',
                    top: '-2px'
                  }}>®</sup>
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
                  marginLeft: '10px'
                }}
              >
                {t('common.vltdBackend')}
              </Typography>
            </div>
          </Typography>

          {/* Menu icon */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label={t('common.menu')}
            sx={{ mr: 2, display: { md: 'none' } }}
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          {/* Navigation buttons: Home, Important Links, Privacy Policy */}

          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {/* Home */}
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              component={Link}
              to="/"
              sx={{ mr: 2 }}
            >
              {t('common.home')}
            </Button>

            {/* Dashboards Dropdown */}
            <Button
              color="inherit"
              startIcon={<DashboardIcon />}
              endIcon={<ArrowDownIcon />}
              onClick={handleDashboardClick}
              sx={{ mr: 2 }}
            >
              Dashboards
            </Button>
            <Menu
              anchorEl={dashboardAnchorEl}
              open={dashboardOpen}
              onClose={handleDashboardClose}
              MenuListProps={{
                'aria-labelledby': 'dashboard-button',
              }}
            >
              <MenuItem onClick={handleDashboardClose} component={Link} to="/superadmin-dashboard/vehicle-monitoring">
                Vehicle Monitoring
              </MenuItem>
              <MenuItem onClick={handleDashboardClose} component={Link} to="/superadmin-dashboard/erss-vehicles">
                ERSS Vehicles
              </MenuItem>
              <MenuItem onClick={handleDashboardClose} component={Link} to="/superadmin-dashboard/sos">
                SOS Dashboard
              </MenuItem>
              <MenuItem onClick={handleDashboardClose} component={Link} to="/superadmin-dashboard/sos-analytics">
                SOS Analytics
              </MenuItem>

            </Menu>

            {/* Important Links Dropdown */}
            <Button
              color="inherit"
              startIcon={<ImportantLinksIcon />}
              endIcon={<ArrowDownIcon />}
              onClick={handleImportantLinksClick}
              sx={{ mr: 2 }}
            >
              {t('common.importantLinks')}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={importantLinksOpen}
              onClose={handleImportantLinksClose}
              MenuListProps={{
                'aria-labelledby': 'important-links-button',
              }}
            >
              <MenuItem onClick={handleImportantLinksClose} component={Link} to="/device-stats">
                {t('common.manufacturerDeviceUptimeDetails')}
              </MenuItem>
            </Menu>

            {/* Privacy Policy */}
            <Button color="inherit" component={Link} to="/privacy-policy">
              {t('common.privacyPolicy')}
            </Button>
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
              <ListItemText primary={t('common.home')} />
            </ListItem>
            <ListItem button component={Link} to="/user-registration-request">
              <ListItemText primary="Register" />
            </ListItem>
            <ListItem button>
              <ListItemText primary={t('common.contactUs')} />
            </ListItem>
            <ListItem button>
              <ListItemText primary={t('common.aboutUs')} />
            </ListItem>
            <ListItem button component={Link} to="/privacy-policy">
              <ListItemText primary={t('common.privacyPolicy')} />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemText primary="Dashboards" sx={{ fontWeight: 'bold' }} />
            </ListItem>
            <ListItem button component={Link} to="/superadmin-dashboard/vehicle-monitoring">
              <ListItemText primary="Vehicle Monitoring" />
            </ListItem>
            <ListItem button component={Link} to="/superadmin-dashboard/erss-vehicles">
              <ListItemText primary="ERSS Vehicles" />
            </ListItem>
            <ListItem button component={Link} to="/superadmin-dashboard/sos">
              <ListItemText primary="SOS Dashboard" />
            </ListItem>
            <ListItem button component={Link} to="/superadmin-dashboard/sos-analytics">
              <ListItemText primary="SOS Analytics" />
            </ListItem>

          </List>
          <Divider />
          <List>
            <ListItem>
              <ListItemText primary={t('common.importantLinks')} sx={{ fontWeight: 'bold' }} />
            </ListItem>
            <ListItem button component={Link} to="/device-stats">
              <ListItemText primary={t('common.manufacturerDeviceUptimeDetails')} />
            </ListItem>
          </List>
          <Divider />
        </div>
      </Drawer>
    </div>
  );
}

export default HomeHeader;
