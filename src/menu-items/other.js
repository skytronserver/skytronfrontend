// assets
import { IconBrandChrome, IconHelp,IconSettings } from '@tabler/icons';

// constant
const icons = { IconBrandChrome, IconHelp,IconSettings };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
  id: 'setting-all-routes',
  type: 'group',
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
          breadcrumbs: false
        },
        {
          id: 'state-district',
          title: 'State & District',
          type: 'item',
          url: '/setting/state-district',
          breadcrumbs: false
        }
        
      ]
    },
  ]
};

export default other;
