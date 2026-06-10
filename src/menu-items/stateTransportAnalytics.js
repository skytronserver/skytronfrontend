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
          id: 'summary-dashboard',
          title: 'Summary Dashboard',
          type: 'item',
          url: '/analytics/summary',
          icon: icons.IconDashboard,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        },
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
        },
        {
          id: 'data-analytics',
          title: 'Data Analytics',
          type: 'item',
          url: '/analytics/data-analytics',
          icon: icons.IconChartBar,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        }
      ]
    }
  ]
};

export default stateTransportAnalytics;
