// assets
import { IconBrandChrome, IconHelp,IconSettings } from '@tabler/icons';

// constant
const icons = { IconBrandChrome, IconHelp,IconSettings };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const other = {
  id: 'sample-docs-roadmap',
  type: 'group',
  children: [
    {
      id: 'sample-page',
      title: 'Setting',
      type: 'item',
      url: '/sample-page',
      icon: icons.IconSettings,
      breadcrumbs: false
    },
  ]
};

export default other;
