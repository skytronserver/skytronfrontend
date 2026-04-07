import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Drawer, useMediaQuery } from '@mui/material';

// third-party
import PerfectScrollbar from 'react-perfect-scrollbar';
import { BrowserView, MobileView } from 'react-device-detect';

// project imports
import MenuList from './MenuList';
import LogoSection from '../LogoSection';
import { drawerWidth } from '../../../store/constant';

// helper to get role
const getUserRole = () => {
  try {
    const userData =
      sessionStorage.getItem('cookiesData') ||
      localStorage.getItem('cookiesData');

    if (!userData) return 'default';

    const data = userData.split('-');
    return data[1]; // role
  } catch (err) {
    return 'default';
  }
};

// ROLE BASED THEMES
const roleThemes = {
  superadmin: {
    gradient: '#0F172A',

  },
  stateadmin: {
    gradient: '#064E3B',

  },
  dealer: {
    gradient: '#7C2D12',

  },
  devicemanufacture: {
    gradient: '#1F2937',

  },
  esimprovider: {
    gradient: '#7F1D1D',

  },
  default: {
    gradient: '#111827',

  }
};


// ==============================|| SIDEBAR DRAWER ||============================== //

const Sidebar = ({ drawerOpen, drawerToggle, window }) => {
  const theme = useTheme();
  const matchUpMd = useMediaQuery(theme.breakpoints.up('md'));


  const role = getUserRole();
  const currentTheme = roleThemes[role] || roleThemes.default;

  const drawer = (
    <>
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box sx={{ display: 'flex', p: 0, mx: 0 }}>
          <LogoSection />
        </Box>
      </Box>
      <BrowserView>
        <PerfectScrollbar
          component="div"
          style={{
            height: !matchUpMd ? 'calc(100vh - 56px)' : 'calc(100vh - 88px)',
            paddingLeft: '16px',
            paddingRight: '16px'
          }}
        >
          <MenuList />
        </PerfectScrollbar>
      </BrowserView>
      <MobileView>
        <Box sx={{ px: 2 }}>
          <MenuList />
        </Box>
      </MobileView>
    </>
  );

  const container = window !== undefined ? () => window.document.body : undefined;

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 }, width: matchUpMd ? drawerWidth : 'auto' }} aria-label="mailbox folders">
      <Drawer
        container={container}
        variant={matchUpMd ? 'persistent' : 'temporary'}
        anchor="left"
        open={drawerOpen}
        onClose={drawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column',
            //  ROLE BASED BACKGROUND
            background: currentTheme.gradient,
            position: 'fixed',
            overflow: 'hidden',
            color: "#ffffff",
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            borderRight: '1px solid rgba(255,255,255,0.05)',

            [theme.breakpoints.up('md')]: {
              top: '65px',
              height: 'calc(100vh - 88px)'
            },
            [theme.breakpoints.down('md')]: {
              position: 'fixed',
              top: 0,
              left: drawerOpen ? 0 : -drawerWidth,
              transition: theme.transitions.create(['left'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }
          }
        }}
        ModalProps={{
          keepMounted: true,
          disableScrollLock: true,
          disableEnforceFocus: true,
          disableAutoFocus: true,
          // hideBackdrop: true
        }}
        color="inherit"
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  drawerOpen: PropTypes.bool,
  drawerToggle: PropTypes.func,
  window: PropTypes.object
};

export default Sidebar;
