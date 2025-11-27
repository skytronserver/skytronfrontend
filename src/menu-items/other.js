// assets
import { IconBrandChrome, IconHelp, IconSettings } from '@tabler/icons';

// constant
const icons = { IconBrandChrome, IconHelp, IconSettings };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
  id: 'setting-all-routes',
  type: 'group',
  roles: ['superadmin', 'devicemanufacture'],
  children: [
    {
      id: 'setting-all',
      title: 'Settings',
      type: 'collapse',
      icon: icons.IconSettings,
      children: [
        {
          id: 'notice-create',
          title: 'Notice',
          type: 'item',
          url: '/setting/notice',
          breadcrumbs: false,
          roles: ['superadmin']
        },
        {
          id: 'vehicle-category',
          title: 'Vehicle Category',
          type: 'item',
          url: '/setting/vehicle-category',
          breadcrumbs: false,
          roles: ['superadmin']
        },
        {
          id: 'notification-preferences',
          title: 'Notification Delivery Mode',
          type: 'item',
          url: '/setting/notification-preferences',
          breadcrumbs: false,
          roles: ['superadmin']
        },
        {
          id: 'state-district',
          title: 'State & District',
          type: 'item',
          url: '/setting/state-district',
          breadcrumbs: false,
          roles: ['superadmin']
        },
        {
          id: 'firmware-frequency',
          title: 'HP Frequency & Firmware',
          type: 'item',
          url: '/setting/frequency-firmware',
          breadcrumbs: false,
          roles: ['superadmin', 'devicemanufacture'],
        },
        {
          id: 'archive-restore',
          title: 'Archive & Restore',
          type: 'item',
          url: '/setting/archive-restore',
          breadcrumbs: false,
          roles: ['superadmin']
        },
        {
          id: 'ip-settings',
          title: 'IP Settings',
          type: 'item',
          url: '/setting/ip-settings',
          breadcrumbs: false,
          roles: ['superadmin', 'dealer']
        }
      ]
    },
  ]
};

export default other;
