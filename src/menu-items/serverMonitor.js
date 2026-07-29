// assets
import { IconServer, IconCpu, IconAlertTriangle, IconActivity, IconHeartbeat } from '@tabler/icons';

// Use the project's BASE_URL so it works across all environments (dev / staging / prod)
import { BASE_URL } from '../store/constant';

// constant
const icons = { IconServer, IconCpu, IconAlertTriangle, IconActivity, IconHeartbeat };

// ==============================|| SERVER MONITOR MENU ITEMS ||============================== //
// NOTE: URLs are built from BASE_URL (REACT_APP_BASE_URL in .env).
// The token is appended dynamically in NavItem (external: true + tokenParam: true).

const serverMonitor = {
  id: 'server-monitor-group',
  title: 'Server Monitor',
  type: 'group',
  roles: ['superadmin'],
  children: [
    {
      id: 'server-monitor-collapse',
      title: 'Server Monitor',
      type: 'collapse',
      icon: icons.IconServer,
      roles: ['superadmin'],
      children: [
        {
          id: 'server-health-dashboard',
          title: 'Server Health',
          type: 'item',
          url: `${BASE_URL}api/server-health/dashboard/`,
          icon: icons.IconHeartbeat,
          breadcrumbs: false,
          external: true,
          target: true,     // opens in _blank
          tokenParam: true, // NavItem will append ?token=<oAuthToken>
          roles: ['superadmin']
        },
        {
          id: 'device-inspector-dashboard',
          title: 'Device Inspector',
          type: 'item',
          url: `${BASE_URL}api/device-inspector/dashboard/`,
          icon: icons.IconCpu,
          breadcrumbs: false,
          external: true,
          target: true,
          tokenParam: true,
          roles: ['superadmin']
        },
        {
          id: 'alert-stats-dashboard',
          title: 'Alert Stats',
          type: 'item',
          url: `${BASE_URL}api/alert-stats/dashboard/`,
          icon: icons.IconAlertTriangle,
          breadcrumbs: false,
          external: true,
          target: true,
          tokenParam: true,
          roles: ['superadmin']
        },
        {
          id: 'device-data-health-dashboard',
          title: 'Device Data Health',
          type: 'item',
          url: `${BASE_URL}api/device-data-health/dashboard/`,
          icon: icons.IconActivity,
          breadcrumbs: false,
          external: true,
          target: true,
          // No tokenParam — this endpoint does not require a token query param
          roles: ['superadmin']
        }
      ]
    }
  ]
};

export default serverMonitor;
