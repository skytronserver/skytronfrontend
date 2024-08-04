// assets
import { IconUser,IconBrandChrome,IconMap,IconDeviceSim,IconReport,IconDeviceSim1,IconTag,IconUrgent } from '@tabler/icons';
import { cipherEncryption } from '../helper';
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
      roles:['superadmin',
      'stateadmin',
      'dealer',
      'sosadmin'],     
      children: [
        {
          id: 'state-admin',
          title: 'State Admin',
          type: 'item',
          url: '/user/newStateAdmin',
          breadcrumbs: false,
          roles:['superadmin']
        },
        {
          id: 'esim-user',
          title: 'M2M Service Provider',
          type: 'item',
          url: '/user/newEsimUser',
          breadcrumbs: false,
          roles: ['superadmin']
        },
        {
          id: 'manufacturer-user',
          title: 'Manufacturer',
          type: 'item',
          url: '/user/newManufacturer',
          breadcrumbs: false,
          roles: ['superadmin']
        },
        {
          id: 'dto-user',
          title: 'DTO',
          type: 'item',
          url: '/user/newDto',
          breadcrumbs: false,
          roles: ['stateadmin']
        },
        {
          id: 'dealer-account',
          title: 'Dealer Account',
          type: 'item',
          url: '/user/newDealerAccount',
          breadcrumbs: false,
          roles: ['stateadmin']
        },
        {
          id: 'vehicle-owner',
          title: 'Vehicle Owner',
          type: 'item',
          url: '/new/vehicleOwner',
          breadcrumbs: false,
          roles: ['dealer']
        },
        {
          id: 'sos-admin',
          title: 'SOS Admin',
          type: 'item',
          url: '/new/sos-admin',
          breadcrumbs: false,
          roles: ['superadmin']
        },
        {
          id: 'sos-user',
          title: 'SOS User',
          type: 'item',
          url: '/new/sos-user',
          breadcrumbs: false,
          roles: ['sosadmin'],
        },
       
      ]
    },

    {
      id: 'sos-call-list',
      title: 'SOS Call List',
      type: 'item',
      url: '/sos-call-list',
      icon: icons.IconUrgent,
      breadcrumbs: false,
      roles: ['superadmin','sosadmin','sosuser','teamleader'],
    },
    {
      id: 'route-fixing',
      title: 'Route Fixing',
      type: 'item',
      url: '/route-fixing',
      icon: icons.IconMap,
      breadcrumbs: false,
      roles:['superadmin','stateadmin','owner','dto'],
    },
    {
      id: 'live-tracking',
      title: 'Live Tracking',
      type: 'item',
      url: '/live-tracking',
      icon: icons.IconMap,
      breadcrumbs: false,
      roles:['superadmin','stateadmin','owner','dto'],
    },
    {
      id: 'history-playback',
      title: 'History Playback',
      type: 'item',
      url: '/history-playback',
      icon: icons.IconMap,
      breadcrumbs: false,
      roles:['superadmin','stateadmin','owner','dto'],
    },
    {
      id: 'sos-tracking',
      title: 'SOS Admin',
      type: 'item',
      url: '/sos-alert',
      icon: icons.IconUrgent,
      breadcrumbs: false,
      roles: ['superadmin','sosadmin'],
    },
    {
      id: 'sos-lead',
      title: 'SOS Lead',
      type: 'item',
      url: '/sos-lead-exp',
      icon: icons.IconUrgent,
      breadcrumbs: false,
      roles: ['superadmin','sosadmin','teamleader'],
    },
    {
      id: 'sos-user',
      title: 'SOS Executive',
      type: 'item',
      url: '/sos-exe',
      icon: icons.IconUrgent,
      breadcrumbs: false,
      roles: ['superadmin','sosadmin','teamleader','sosuser'],
    },
    {
      id: 'device-icons',
      title: 'Device',
      type: 'collapse',
      icon: icons.IconDeviceSim,
      roles:['superadmin',
      'dealer',
      'devicemanufacture','stateadmin'],  
      children: [
        {
          id: 'new-device-model',
          title: 'Model',
          type: 'item',
          url: '/deviceModel/new',
          breadcrumbs: false,
          roles:['devicemanufacture'],
        },
        {
          id: 'device-model-extension',
          title: 'Model Extension',
          type: 'item',
          url: '/deviceModel/extension',
          breadcrumbs: false,
          roles:['devicemanufacture'],
        },
        {
          id: 'view-device',
          title: 'Model Awaiting Approval',
          type: 'item',
          url: '/device/list',
          breadcrumbs: false,
          roles:['stateadmin'],
        },
        {
          id: 'view-device-cop',
          title: 'Awaiting COP Device List',
          type: 'item',
          url: '/deviceCOP/list',
          breadcrumbs: false,
          roles:['stateadmin'],
        },
        {
          id: 'new-device',
          title: 'New Device Stock',
          type: 'item',
          url: '/device/new',
          breadcrumbs: false,
          roles:['devicemanufacture'],
        },
        {
          id: 'upload-device',
          title: 'Upload Device Stock',
          type: 'item',
          url: '/device/bulkupload',
          breadcrumbs: false,
          roles:['devicemanufacture'],
        },
        {
          id: 'inactive-device',
          title: 'Inactive Device',
          type: 'item',
          url: '/dashboard',
          breadcrumbs: false,
          roles:['devicemanufacture'],
        },
        {
          id: 'all-device',
          title: 'Show All Device',
          type: 'item',
          url: '/device/show-device',
          breadcrumbs: false,
          roles:['devicemanufacture','dealer'],
        },
        {
          id: 'assign-device',
          title: 'Assign Device to Retailer',
          type: 'item',
          url: '/device/assign-device',
          breadcrumbs: false,
          roles:['devicemanufacture'],
        },
        {
          id: 'activate-esim-device',
          title: 'eSIM Activation',
          type: 'item',
          url: '/device/eSimActivation',
          breadcrumbs: false,
          roles:['dealer'],
        },
        {
          id: 'fit-device',
          title: 'Configure Device/Sell Api',
          type: 'item',
          url: '/device/fit-device',
          breadcrumbs: false,
          roles:['devicemanufacture','dealer'],
        }
      ]
    },
    // {
    //   id: 'icons-esim',
    //   title: 'E Sim',
    //   type: 'collapse',
    //   icon: icons.IconDeviceSim1,
    //   children: [
    //     {
    //       id: 'new-sim',
    //       title: 'New',
    //       type: 'item',
    //       url: '',
    //       breadcrumbs: false
    //     },
    //     {
    //       id: 'view-sim',
    //       title: 'List',
    //       type: 'item',
    //       url: '',
    //       breadcrumbs: false
    //     }
        
    //   ]
    // },
    {
      id: 'icons-tag',
      title: 'Tagging',
      type: 'collapse',
      icon: icons.IconTag,
      roles:['dealer'],
      children: [
        {
          id: 'new-tagging',
          title: 'Tag Device to Vehicle',
          type: 'item',
          url: '/tag/device-vehicle',
          breadcrumbs: false,
          roles:['dealer'],
        },
        {
          id: 'view-pending',
          title: 'Pending for Owner Approval',
          type: 'item',
          url: '/tag/unapproved-vehicle',
          breadcrumbs: false,
          roles:['dealer'],
        },
        {
          id: 'upload-tagging-receipt',
          title: 'Upload Receipt',
          type: 'item',
          url: '/tag/upload-receipt',
          breadcrumbs: false,
          roles:['dealer'],
        },
        {
          id: 'vahan-verification',
          title: 'Vahan Verification',
          type: 'item',
          url: '/tag/vahan-verification',
          breadcrumbs: false,
          roles:['dealer'],
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
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'admin-user-list',
          title: 'State Admin',
          type: 'item',
          url: '/user/state-admin-list',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'provider-device-list-pending',
          title: 'Activation Request',
          type: 'item',
          url: '/device/activation-request/pending',
          breadcrumbs: false,
          roles:['esimprovider'],
        },
        {
          id: 'provider-device-list-invalid',
          title: 'Rejected Request',
          type: 'item',
          url: '/device/activation-request/invalid',
          breadcrumbs: false,
          roles:['esimprovider'],
        },
        {
          id: 'provider-device-list-valid',
          title: 'Accepted Request',
          type: 'item',
          url: '/device/activation-request/valid',
          breadcrumbs: false,
          roles:['esimprovider'],
        },
        {
          id: 'manufacturer-list',
          title: 'Manufacturer',
          type: 'item',
          url: '/user/manufacturer-list',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'sos-admin-list',
          title: 'SOS Admin',
          type: 'item',
          url: '/user/sos-user-list',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'view-device',
          title: 'Device List',
          type: 'item',
          url: '/device/show-available-device',
          breadcrumbs: false,
          roles:['superadmin','devicemanufacture','dealer'],
        },
        {
          id: 'tagged-device',
          title: 'Tagged Device',
          type: 'item',
          url: '/device/show-tagged-device',
          breadcrumbs: false,
          roles:['superadmin','dealer','devicemanufacture'],
        },
        {
          id: 'dealer-list',
          title: 'Dealers',
          type: 'item',
          url: '/user/dealerList',
          breadcrumbs: false,
          roles:['superadmin','stateadmin','devicemanufacture'],
        },
        {
          id: 'vehicle-owner',
          title: 'Vehicle Owner',
          type: 'item',
          url: '/user/vehicle-owner-list',
          breadcrumbs: false,
          roles:['superadmin','stateadmin','dealer'],
        },
        {
          id: 'dto-user-list',
          title: 'DTO User List',
          type: 'item',
          url: '/user/dto-user-list',
          breadcrumbs: false,
          roles: ['stateadmin']
        },
        {
          id: 'emergency-list',
          title: 'Emergency',
          type: 'item',
          url: '/dashboard',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'route-deviation',
          title: 'Route Deviation Alert',
          type: 'item',
          url: '/dashboard',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'untagged-list',
          title: 'Untagged',
          type: 'item',
          url: '/dashboard',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'fitment-receipt',
          title: 'Fitment Receipt',
          type: 'item',
          url: '/dashboard',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'geo-fence',
          title: 'Geo Fence',
          type: 'item',
          url: '/dashboard',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'alert-list',
          title: 'Alert',
          type: 'item',
          url: '/alert-list',
          breadcrumbs: false,
          roles:['superadmin'],
        },
        {
          id: 'performance-list',
          title: 'Performance List',
          type: 'item',
          url: '/dashboard',
          breadcrumbs: false,
          roles:['superadmin'],
        },
      ]
    },
  ]
};

export default user;
