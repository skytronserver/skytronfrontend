// assets
import { IconBrandChrome, IconHelp,IconSettings } from '@tabler/icons';

// constant
const icons = { IconBrandChrome, IconHelp,IconSettings };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
  id: 'setting-all-routes',
  type: 'group',
  roles:['superadmin','stateadmin'],
  children: [
    {
      id: 'setting-all',
      title: 'Setting',
      type: 'collapse',
      icon:icons.IconSettings,
      children: [
        {
          id: 'vehicle-category',
          title: 'Vehicle Category',
          type: 'item',
          url: '/setting/vehicle-category',
          breadcrumbs: false,
          roles:['superadmin','stateadmin']
        },
        {
          id: 'state-district',
          title: 'State & District',
          type: 'item',
          url: '/setting/state-district',
          breadcrumbs: false,
          roles:['superadmin','stateadmin']
        },
        {
          id: 'firmware-frequency',
          title: 'HP Frequency & Firmware',
          type: 'item',
          url: '/setting/frequency-firmware',
          breadcrumbs: false,
          roles:['superadmin','stateadmin']
        },
        {
          id: 'ip-settings',
          title: 'IP Settings',
          type: 'item',
          url: '/setting/ip-settings',
          breadcrumbs: false,
          roles:['superadmin','stateadmin']
        }
        
      ]
    },
  ]
};

export default other;
