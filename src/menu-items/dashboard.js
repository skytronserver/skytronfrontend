// assets
import { IconDashboard } from '@tabler/icons';

// constant
const icons = { IconDashboard };

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
    }
  ]
};

export default dashboard;
