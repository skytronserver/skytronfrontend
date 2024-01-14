// assets
import { IconUser,IconBrandChrome,IconMap,IconDeviceSim,IconReport,IconDeviceSim1 } from '@tabler/icons';

// constant
const icons = {IconUser,IconBrandChrome,IconMap,IconDeviceSim,IconReport,IconDeviceSim1};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const user = {
  id: 'utilities',
  type: 'group',
  children: [
    {
      id: 'icons',
      title: 'Users',
      type: 'collapse',
      icon: icons.IconUser,
      children: [
        {
          id: 'new-user',
          title: 'State User',
          type: 'item',
          url: '/user/new',
          breadcrumbs: false
        },
        {
          id: 'new-sub-user',
          title: 'Sub User',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'unlock-user',
          title: 'Unlock User',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'deactivate-user',
          title: 'Deactivate User',
          type: 'item',
          url: '',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'live-tracking',
      title: 'Live Tracking',
      type: 'item',
      url: '',
      icon: icons.IconMap,
      breadcrumbs: false
    },
    {
      id: 'icons',
      title: 'Device',
      type: 'collapse',
      icon: icons.IconDeviceSim,
      children: [
        {
          id: 'new-device',
          title: 'Add',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'view-device',
          title: 'Device List',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'upload-device',
          title: 'Upload',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'upload-firmware',
          title: 'Upload Firmware',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'inactive-device',
          title: 'Inactive Device',
          type: 'item',
          url: '',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'icons',
      title: 'E Sim',
      type: 'collapse',
      icon: icons.IconDeviceSim1,
      children: [
        {
          id: 'new-sim',
          title: 'New',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'view-sim',
          title: 'List',
          type: 'item',
          url: '',
          breadcrumbs: false
        }
        
      ]
    },
    {
      id: 'icons',
      title: 'Reports',
      type: 'collapse',
      icon: icons.IconReport,
      children: [
        {
          id: 'manufacturer-list',
          title: 'Manufacturer',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'view-device',
          title: 'Device List',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'tagged-device',
          title: 'Tagged Device',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'dealer-list',
          title: 'Dealers',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'vehicle-owner',
          title: 'Vehicle Owner',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'emergency-list',
          title: 'Emergency',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'route-deviation',
          title: 'Route Deviation Alert',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'untagged-list',
          title: 'Untagged',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'fitment-receipt',
          title: 'Fitment Receipt',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'geo-fence',
          title: 'Geo Fence',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'geo-fence-alert',
          title: 'Geo Fence Alert',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'performance-list',
          title: 'Performance List',
          type: 'item',
          url: '',
          breadcrumbs: false
        },{
          id: 'route-fix-report',
          title: 'Route Fix',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
        {
          id: 'vehicle-category-list',
          title: 'Vehicle Category',
          type: 'item',
          url: '',
          breadcrumbs: false
        },
      ]
    },
  ]
};

export default user;
