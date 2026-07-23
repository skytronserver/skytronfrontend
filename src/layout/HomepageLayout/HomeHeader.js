import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemText, Divider, Grid, Button, Menu, MenuItem, Collapse, Box } from '@mui/material';
import { Home as HomeIcon, Menu as MenuIcon, ImportantDevices as ImportantLinksIcon, KeyboardArrowDown as ArrowDownIcon, ExpandLess, ExpandMore, GetApp as DownloadIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ashokstambh from "../../assets/images/ashoka-pillar.webp";
import { Link } from "react-router-dom";
import logo from "../../assets/images/skytron-logo3.png";
import playstoreQR from "../../assets/images/QR/playstore.JPG";
import appstoreQR from "../../assets/images/QR/appstore.JPG";
import WebFont from "webfontloader";
import PolicyIcon from "@mui/icons-material/Policy";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
WebFont.load({
  google: {
    families: ["Pacifico", "sans-serif", "Lobster", "Caveat"],
  },
});
function HomeHeader({ isDrawerOpen, setDrawerOpen, toggleDrawer }) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const importantLinksOpen = Boolean(anchorEl);
  const [downloadAppAnchorEl, setDownloadAppAnchorEl] = useState(null);
  const downloadAppOpen = Boolean(downloadAppAnchorEl);
  const [dashboardAnchorEl, setDashboardAnchorEl] = useState(null);
  const dashboardOpen = Boolean(dashboardAnchorEl);
  const [drawerImportantLinksOpen, setDrawerImportantLinksOpen] = useState(false);
  const [drawerDownloadAppOpen, setDrawerDownloadAppOpen] = useState(false);

  const handleDrawerDownloadAppClick = (event) => {
    event.stopPropagation();
    setDrawerDownloadAppOpen(!drawerDownloadAppOpen);
  };

  const handleDrawerImportantLinksClick = (event) => {
    event.stopPropagation();
    setDrawerImportantLinksOpen(!drawerImportantLinksOpen);
  };

  const handleImportantLinksClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleImportantLinksClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadAppClick = (event) => {
    setDownloadAppAnchorEl(event.currentTarget);
  };

  const handleDownloadAppClose = () => {
    setDownloadAppAnchorEl(null);
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

            {/* Dashboards Dropdown
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

            </Menu> */}

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
              <MenuItem onClick={handleImportantLinksClose} component={Link} to="/inauguration-photos">
                {t('common.inaugurationPhotos')}
              </MenuItem>
            </Menu>

            {/* Download App Dropdown */}
            <Button
              color="inherit"
              startIcon={<DownloadIcon />}
              endIcon={<ArrowDownIcon />}
              onClick={handleDownloadAppClick}
              sx={{ mr: 2 }}
            >
              {t('common.downloadApp')}
            </Button>
            <Menu
              anchorEl={downloadAppAnchorEl}
              open={downloadAppOpen}
              onClose={handleDownloadAppClose}
              MenuListProps={{
                'aria-labelledby': 'download-app-button',
              }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  p: 2,
                  minWidth: '320px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)'
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Google Play Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' } }}>
                  <img
                    src={playstoreQR}
                    alt="Google Play QR"
                    style={{ width: '80px', height: '80px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#6a1b9a' }}>
                      {t('common.googlePlay')}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      component="a"
                      href="https://play.google.com/store/apps/details?id=com.skytrack.skytronapp"
                      target="_blank"
                      sx={{ p: 0, textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Download Now →
                    </Button>
                  </Box>
                </Box>

                <Divider />

                {/* App Store Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1, borderRadius: '8px', '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' } }}>
                  <img
                    src={appstoreQR}
                    alt="App Store QR"
                    style={{ width: '80px', height: '80px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#6a1b9a' }}>
                      {t('common.appleAppStore')}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      component="a"
                      href="https://apps.apple.com/in/app/skytron/id6746767283"
                      target="_blank"
                      sx={{ p: 0, textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      Download Now →
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Menu>

            {/* Privacy Policy */}
            <Button color="inherit" component={Link} to="/privacy-policy" startIcon={<PolicyIcon />}>
              {t('common.privacyPolicy')}
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/help-desk"
              startIcon={<SupportAgentIcon />}
            >
              Help Desk
            </Button>
          </Grid>

        </Toolbar>
      </AppBar>
      {/* Drawer */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '280px',
          }
        }}
      >
        <Box
          role="presentation"
          sx={{ width: '100%', height: '100%' }}
        >
          <List>
            <ListItem button component={Link} to="/" onClick={toggleDrawer(false)}>
              <ListItemText primary={t('common.home')} />
            </ListItem>

            {/* Important Links (Collapsible) - Reordered and collapsible to match dropdown */}
            <ListItem button onClick={handleDrawerImportantLinksClick}>
              <ListItemText primary={t('common.importantLinks')} />
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                {drawerImportantLinksOpen ? <ExpandLess /> : <ExpandMore />}
              </Box>
            </ListItem>
            <Collapse in={drawerImportantLinksOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button component={Link} to="/device-stats" onClick={toggleDrawer(false)} sx={{ pl: 4 }}>
                  <ListItemText primary={t('common.manufacturerDeviceUptimeDetails')} />
                </ListItem>
                <ListItem button component={Link} to="/inauguration-photos" onClick={toggleDrawer(false)} sx={{ pl: 4 }}>
                  <ListItemText primary={t('common.inaugurationPhotos')} />
                </ListItem>
              </List>
            </Collapse>

            {/* Download App (Collapsible) */}
            <ListItem button onClick={handleDrawerDownloadAppClick}>
              <ListItemText primary={t('common.downloadApp')} />
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                {drawerDownloadAppOpen ? <ExpandLess /> : <ExpandMore />}
              </Box>
            </ListItem>
            <Collapse in={drawerDownloadAppOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem sx={{ pl: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <img
                      src={playstoreQR}
                      alt="Google Play QR"
                      style={{ width: '60px', height: '60px', borderRadius: '4px' }}
                    />
                    <ListItemText
                      primary={t('common.googlePlay')}
                      secondary={<Link href="https://play.google.com/store/apps/details?id=com.skytrack.skytronapp" target="_blank" sx={{ fontSize: '0.7rem' }}>Download Now</Link>}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img
                      src={appstoreQR}
                      alt="App Store QR"
                      style={{ width: '60px', height: '60px', borderRadius: '4px' }}
                    />
                    <ListItemText
                      primary={t('common.appleAppStore')}
                      secondary={<Link href="https://apps.apple.com/in/app/skytron/id6746767283" target="_blank" sx={{ fontSize: '0.7rem' }}>Download Now</Link>}
                    />
                  </Box>
                </ListItem>
              </List>
            </Collapse>

            <ListItem button component={Link} to="/privacy-policy" onClick={toggleDrawer(false)}>
              <ListItemText primary={t('common.privacyPolicy')} />
            </ListItem>
            <ListItem button component={Link} to="/help-desk" onClick={toggleDrawer(false)}>
              <ListItemText primary="Help Desk" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </div>
  );
}

export default HomeHeader;
