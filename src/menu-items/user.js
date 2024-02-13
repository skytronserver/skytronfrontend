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
      id: 'new-icons',
      title: 'Create New',
      type: 'collapse',
      icon: icons.IconUser,
      children: [
        {
          id: 'state-admin',
          title: 'State Admin',
          type: 'item',
          url: '/user/newStateAdmin',
          breadcrumbs: false
        },
        {
          id: 'esim-user',
          title: 'eSIM Service Provider',
          type: 'item',
          url: '/user/newEsimUser',
          breadcrumbs: false
        },
        {
          id: 'manufacturer-user',
          title: 'Manufacturer',
          type: 'item',
          url: '/user/newManufacturer',
          breadcrumbs: false
        },
        {
          id: 'dealer-user',
          title: 'Dealer',
          type: 'item',
          url: '/user/newDealer',
          breadcrumbs: false
        },
        {
          id: 'vehicle-owner',
          title: 'Vehicle Owner',
          type: 'item',
          url: '/new/vehicleOwner',
          breadcrumbs: false
        },
        {
          id: 'Other-user',
          title: 'Other Users',
          type: 'item',
          url: '/new/otherUser',
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
      id: 'device-icons',
      title: 'Device',
      type: 'collapse',
      icon: icons.IconDeviceSim,
      children: [
        {
          id: 'new-device',
          title: 'Add',
          type: 'item',
          url: '/device/new',
          breadcrumbs: false
        },
        {
          id: 'new-device-model',
          title: 'Add Device Model',
          type: 'item',
          url: '/deviceModel/new',
          breadcrumbs: false
        },
        {
          id: 'device-model-extension',
          title: 'Device Model Extension',
          type: 'item',
          url: '/deviceModel/extension',
          breadcrumbs: false
        },
        {
          id: 'view-device',
          title: 'Device List',
          type: 'item',
          url: '/device/list',
          breadcrumbs: false
        },
        {
          id: 'view-device-cop',
          title: 'Awaiting COP Device List',
          type: 'item',
          url: '/deviceCOP/list',
          breadcrumbs: false
        },
        {
          id: 'upload-device',
          title: 'Upload',
          type: 'item',
          url: '/device/bulkupload',
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
      id: 'icons-esim',
      title: 'E Sim',
      type: 'collapse',
      icon: icons.IconDeviceSim1,
      children: [
        {
          id: 'new-sim',
          title: 'New',
          type: 'item',
          url: '/esim/newUser',
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
      id: 'icons-report',
      title: 'Reports',
      type: 'collapse',
      icon: icons.IconReport,
      children: [
        {
          id: 'user-list',
          title: 'Users',
          type: 'item',
          url: '/user/registeredUser',
          breadcrumbs: false
        },
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
