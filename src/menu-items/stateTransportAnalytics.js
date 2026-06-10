import { IconDeviceAnalytics, IconCarCrash, IconAlertCircle, IconDashboard, IconChartBar, IconBus, IconTruck, IconReportAnalytics, IconScale } from '@tabler/icons';

// constant
const icons = { IconDeviceAnalytics, IconCarCrash, IconAlertCircle, IconDashboard, IconChartBar, IconBus, IconTruck, IconReportAnalytics, IconScale };

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
        },
        {
          id: 'pis-summary',
          title: 'PIS Summary',
          type: 'item',
          url: '/analytics/pis-summary',
          icon: icons.IconBus,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        },
        {
          id: 'operational-analytics',
          title: 'Operational Analytics',
          type: 'item',
          url: '/analytics/operational',
          icon: icons.IconReportAnalytics,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        },
        {
          id: 'comparative-analysis',
          title: 'Comparative Analysis',
          type: 'item',
          url: '/analytics/comparative-analysis',
          icon: icons.IconScale,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        },
        {
          id: 'resource-performance',
          title: 'Resource Performance',
          type: 'item',
          url: '/analytics/resource-performance',
          icon: icons.IconTruck,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin']
        }
      ]
    }
  ]
};

export default stateTransportAnalytics;
