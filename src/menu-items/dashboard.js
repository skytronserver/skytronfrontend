// assets
import {
  IconDashboard,
  IconChartBar,
  IconUsers,
  IconPhone,
  IconCar,
  IconShield,
  IconAmbulance,
  IconAlertTriangle
} from '@tabler/icons';

// constant
const icons = {
  IconDashboard,
  IconChartBar,
  IconUsers,
  IconPhone,
  IconCar,
  IconShield,
  IconAmbulance,
  IconAlertTriangle
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  type: 'group',
  roles: ['superadmin', 'stateadmin', 'dealer', 'devicemanufacture', 'owner', 'dtorto', 'sosadmin', 'teamlead', 'desk_ex', 'esimprovider'],
  children: [
    {
      id: 'default',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'superadmin-dashboard-vehicle-monitoring',
      title: 'Vehicle Monitoring',
      type: 'item',
      url: '/superadmin-dashboard/vehicle-monitoring',
      icon: icons.IconCar,
      breadcrumbs: false,
      roles: ['superadmin']
    },
    {
      id: 'superadmin-dashboard-erss-vehicles',
      title: 'ERSS Vehicles',
      type: 'item',
      url: '/superadmin-dashboard/erss-vehicles',
      icon: icons.IconAmbulance,
      breadcrumbs: false,
      roles: ['superadmin']
    },
    {
      id: 'superadmin-dashboard-sos',
      title: 'SOS Dashboard',
      type: 'item',
      url: '/superadmin-dashboard/sos',
      icon: icons.IconAlertTriangle,
      breadcrumbs: false,
      roles: ['superadmin']
    },
    {
      id: 'superadmin-dashboard-sos-analytics',
      title: 'SOS Analytics',
      type: 'item',
      url: '/superadmin-dashboard/sos-analytics',
      icon: icons.IconChartBar,
      breadcrumbs: false,
      roles: ['superadmin']
    },
    {
      id: 'morth-dashboard',
      title: 'MoRTH Dashboard',
      type: 'item',
      url: '/morth-dashboard',
      icon: icons.IconDashboard,
      breadcrumbs: false,
      roles: ['superadmin']
    },
    // {
    //   id: 'owner-dashboard',
    //   title: 'Vehicle Owner Dashboard',
    //   type: 'item',
    //   url: '/dashboard/owner',
    //   icon: icons.IconCar,
    //   breadcrumbs: false,
    //   roles: ['owner']
    // },
    {
      id: 'desk-executive-dashboard',
      title: 'Desk Executive Dashboard',
      type: 'item',
      url: '/dashboard/desk-executive',
      icon: icons.IconPhone,
      breadcrumbs: false,
      roles: ['desk_ex']
    },
    // {
    //   id: 'team-lead-dashboard',
    //   title: 'Team Lead Dashboard',
    //   type: 'item',
    //   url: '/dashboard/team-lead',
    //   icon: icons.IconUsers,
    //   breadcrumbs: false,
    //   roles: ['teamlead']
    // }
  ]
};

export default dashboard;
