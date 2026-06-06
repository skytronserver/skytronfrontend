// assets
import { IconBusStop, IconRoute, IconCalendarEvent, IconReportAnalytics, IconInfoSquareRounded } from '@tabler/icons';

// constant
const icons = { IconBusStop, IconRoute, IconCalendarEvent, IconReportAnalytics, IconInfoSquareRounded };

// ==============================|| PIS MENU ITEMS ||============================== //

const pis = {
  id: 'pis-management',
  title: 'Passenger Info System',
  type: 'group',
  roles: ['superadmin', 'stateadmin', 'dtorto'],
  children: [
    {
      id: 'pis-main',
      title: 'PIS Operations',
      type: 'collapse',
      icon: icons.IconInfoSquareRounded,
      children: [
        {
          id: 'bus-stops',
          title: 'Bus Stops',
          type: 'item',
          url: '/pis/bus-stops',
          icon: icons.IconBusStop,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin', 'dtorto']
        },
        {
          id: 'bus-routes',
          title: 'Bus Routes',
          type: 'item',
          url: '/pis/bus-routes',
          icon: icons.IconRoute,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin', 'dtorto']
        },
        {
          id: 'bus-schedules',
          title: 'Bus Schedules',
          type: 'item',
          url: '/pis/bus-schedules',
          icon: icons.IconCalendarEvent,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin', 'dtorto']
        },
        {
          id: 'pis-reports',
          title: 'Trip Reports',
          type: 'item',
          url: '/pis/reports',
          icon: icons.IconReportAnalytics,
          breadcrumbs: false,
          roles: ['superadmin', 'stateadmin', 'dtorto']
        }
      ]
    }
  ]
};

export default pis;
