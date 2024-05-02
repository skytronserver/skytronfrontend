// assets
import { IconUser,IconBrandChrome,IconMap,IconDeviceSim,IconReport,IconDeviceSim1,IconTag,IconUrgent } from '@tabler/icons';

// constant
const icons = {IconUser,IconBrandChrome,IconMap,IconDeviceSim,IconReport,IconDeviceSim1,IconTag,IconUrgent};

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
          id: 'dto-user',
          title: 'DTO',
          type: 'item',
          url: '/user/newDto',
          breadcrumbs: false
        },
        {
          id: 'dealer-account',
          title: 'Dealer Account',
          type: 'item',
          url: '/user/newDealerAccount',
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
          id: 'sos-admin',
          title: 'SOS Admin',
          type: 'item',
          url: '/new/sos-admin',
          breadcrumbs: false
        },
        {
          id: 'sos-user',
          title: 'SOS User',
          type: 'item',
          url: '/new/sos-user',
          breadcrumbs: false
        },
       
      ]
    },

    {
      id: 'sos-call-list',
      title: 'SOS Call List',
      type: 'item',
      url: '/sos-call-list',
      icon: icons.IconUrgent,
      breadcrumbs: false
    },
    {
      id: 'route-fixing',
      title: 'Route Fixing',
      type: 'item',
      url: '/route-fixing',
      icon: icons.IconMap,
      breadcrumbs: false
    },
    {
      id: 'live-tracking',
      title: 'Live Tracking',
      type: 'item',
      url: '/live-tracking',
      icon: icons.IconMap,
      breadcrumbs: false
    },
    {
      id: 'history-playback',
      title: 'History Playback',
      type: 'item',
      url: '/history-playback',
      icon: icons.IconMap,
      breadcrumbs: false
    },
    {
      id: 'sos-tracking',
      title: 'SOS Admin',
      type: 'item',
      url: '/sos-alert',
      icon: icons.IconUrgent,
      breadcrumbs: false
    },
    {
      id: 'sos-lead',
      title: 'SOS Lead',
      type: 'item',
      url: '/sos-lead-exp',
      icon: icons.IconUrgent,
      breadcrumbs: false
    },
    {
      id: 'sos-user',
      title: 'SOS Executive',
      type: 'item',
      url: '/sos-exe',
      icon: icons.IconUrgent,
      breadcrumbs: false
    },
    {
      id: 'device-icons',
      title: 'Device',
      type: 'collapse',
      icon: icons.IconDeviceSim,
      children: [
        {
          id: 'new-device-model',
          title: 'Model',
          type: 'item',
          url: '/deviceModel/new',
          breadcrumbs: false
        },
        {
          id: 'device-model-extension',
          title: 'Model Extension',
          type: 'item',
          url: '/deviceModel/extension',
          breadcrumbs: false
        },
        {
          id: 'view-device',
          title: 'Model Awaiting Approval',
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
          id: 'new-device',
          title: 'New Device Stock',
          type: 'item',
          url: '/device/new',
          breadcrumbs: false
        },
        {
          id: 'upload-device',
          title: 'Upload Device Stock',
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
        },
        {
          id: 'all-device',
          title: 'Show All Device',
          type: 'item',
          url: '/device/show-device',
          breadcrumbs: false
        },
        {
          id: 'assign-device',
          title: 'Assign Device to Retailer',
          type: 'item',
          url: '/device/assign-device',
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
    },,
    {
      id: 'icons-tag',
      title: 'Tagging',
      type: 'collapse',
      icon: icons.IconTag,
      children: [
        {
          id: 'new-tagging',
          title: 'Tag Device to Vehicle',
          type: 'item',
          url: '/tag/device-vehicle',
          breadcrumbs: false
        },
        {
          id: 'view-pending',
          title: 'Pending for Owner Approval',
          type: 'item',
          url: '/tag/unapproved-vehicle',
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
          url: '/device/show-available-device',
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
          url: '/user/dealerList',
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
          id: 'alert-list',
          title: 'Alert',
          type: 'item',
          url: '/alert-list',
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
