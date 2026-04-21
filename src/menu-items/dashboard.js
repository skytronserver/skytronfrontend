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




    // {
    //   id: 'morth-dashboard',
    //   title: 'MoRTH Dashboard',
    //   type: 'item',
    //   url: '/morth-dashboard',
    //   icon: icons.IconDashboard,
    //   breadcrumbs: false,
    //   roles: ['superadmin']
    // },
    // {
    //   id: 'owner-dashboard',
    //   title: 'Vehicle Owner Dashboard',
    //   type: 'item',
    //   url: '/dashboard/owner',
    //   icon: icons.IconCar,
    //   breadcrumbs: false,
    //   roles: ['owner']
    // },
    // },
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
