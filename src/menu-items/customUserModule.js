// assets
import { IconShieldLock, IconShieldCheck, IconUsers } from '@tabler/icons';

// constant
const icons = { IconShieldLock, IconShieldCheck, IconUsers };

// ==============================|| CUSTOM USER MODULE MENU ITEMS ||============================== //

const customUserModule = {
  id: 'custom-user-module',
  title: 'Custom User Module',
  type: 'group',
  roles: ['superadmin'],
  children: [
    {
      id: 'rbac-group',
      title: 'Access Control',
      type: 'collapse',
      icon: icons.IconShieldLock,
      roles: ['superadmin'],
      children: [
        {
          id: 'rbac-role-management',
          title: 'Custom Role Management',
          type: 'item',
          url: '/setting/rbac/roles',
          icon: icons.IconShieldLock,
          breadcrumbs: false,
          roles: ['superadmin'],
        },
        {
          id: 'rbac-permission-management',
          title: 'Feature Permissions',
          type: 'item',
          url: '/setting/rbac/permissions',
          icon: icons.IconShieldCheck,
          breadcrumbs: false,
          roles: ['superadmin'],
        },
        {
          id: 'rbac-custom-users',
          title: 'Custom User Management',
          type: 'item',
          url: '/setting/rbac/custom-users',
          icon: icons.IconUsers,
          breadcrumbs: false,
          roles: ['superadmin'],
        },
      ],
    }
  ]
};

export default customUserModule;
