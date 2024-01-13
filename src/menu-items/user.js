// assets
import { IconUser,IconBrandChrome } from '@tabler/icons';

// constant
const icons = {IconUser,IconBrandChrome};

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
        }
      ]
    },
    {
      id: 'sample',
      title: 'Sample',
      type: 'item',
      url: '',
      icon: icons.IconBrandChrome,
      breadcrumbs: false
    },
  ]
};

export default user;
