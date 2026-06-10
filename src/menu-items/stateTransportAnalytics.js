// assets
import { IconDeviceAnalytics, IconCarCrash, IconAlertCircle, IconDashboard, IconChartBar } from '@tabler/icons';

// constant
const icons = { IconDeviceAnalytics, IconCarCrash, IconAlertCircle, IconDashboard, IconChartBar };

// ==============================|| STATE TRANSPORT ANALYTICS MENU ITEMS ||============================== //

const stateTransportAnalytics = {
  id: 'state-transport-analytics',
  title: 'State Transport Analytics',
  type: 'group',
  roles: ['superadmin', 'stateadmin'],
  children: [
    {
      id: 'analytics-main',
      title: 'Analytics Platform',
      type: 'collapse',
      icon: icons.IconDeviceAnalytics,
      children: [
        {
          id: 'trip-analysis',
          title: 'Trip Analysis',
          type: 'item',
          url: '/analytics/trip-analysis',
          icon: icons.IconCarCrash,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        },
        {
          id: 'driving-alerts',
          title: 'Driving Pattern Alerts',
          type: 'item',
          url: '/analytics/driving-alerts',
          icon: icons.IconAlertCircle,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        },
        {
          id: 'vehicle-alerts',
          title: 'Vehicle Alerts Count',
          type: 'item',
          url: '/analytics/vehicle-alerts',
          icon: icons.IconAlertCircle,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        }
      ]
    }
  ]
};

export default stateTransportAnalytics;
