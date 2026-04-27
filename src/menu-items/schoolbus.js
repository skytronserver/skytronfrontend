// assets
import { IconBus, IconRoute, IconUserCircle, IconMapPin, IconLockAccess, IconDashboard,IconSchool,
  IconCircleCheck } from '@tabler/icons';

// constant
const icons = { IconBus, IconRoute, IconUserCircle, IconMapPin, IconLockAccess, IconDashboard,IconSchool,
  IconCircleCheck };

// ==============================|| SCHOOL BUS MENU ITEMS ||============================== //

const schoolbus = {
    id: 'schoolbus-management',
    title: 'School Bus',
    type: 'group',
    roles: ['superadmin', 'schooladmin', 'parent'],
    children: [
        {
            id: 'schoolbus-main',
            title: 'School Bus System',
            type: 'collapse',
            icon: icons.IconBus,
            children: [
                {
                    id: 'schoolbus-dashboard',
                    title: 'Dashboard',
                    type: 'item',
                    url: '/schoolbus',
                    icon: icons.IconDashboard,
                    breadcrumbs: false,
                    roles: ['superadmin', 'schooladmin']
                },
                {
                    id: 'bus-tagging',
                    title: 'Bus Tagging',
                    type: 'item',
                    url: '/schoolbus/bus-tagging',
                    icon: icons.IconLockAccess,
                    breadcrumbs: false,
                    roles: ['superadmin', 'schooladmin']
                },
                {
                    id: 'route-management',
                    title: 'Route Management',
                    type: 'item',
                    url: '/schoolbus/route-management',
                    icon: icons.IconRoute,
                    breadcrumbs: false,
                    roles: ['superadmin', 'schooladmin']
                },
                {
                    id: 'bus-assignment',
                    title: 'Bus Assignment',
                    type: 'item',
                    url: '/schoolbus/bus-assignment',
                    icon: icons.IconBus,
                    breadcrumbs: false,
                    roles: ['superadmin', 'schooladmin']
                },
                {
                    id: 'profile-management',
                    title: 'Profile Management',
                    type: 'item',
                    url: '/schoolbus/profile-management',
                    icon: icons.IconUserCircle,
                    breadcrumbs: false,
                    roles: ['superadmin', 'schooladmin']
                },
                {
                    id: 'parent-tracking',
                    title: 'Parent Tracking',
                    type: 'item',
                    url: '/schoolbus/parent-tracking',
                    icon: icons.IconMapPin,
                    breadcrumbs: false,
                    roles: ['superadmin', 'schooladmin', 'parent']
                },
                
                 {
                    id: 'Create-School',
                    title: 'Create School',
                    type: 'item',
                    url: '/schoolbus/Create-School',
                    icon: icons.IconSchool,
                    breadcrumbs: false,
                    roles: ['superadmin']
                },
                 {
                    id: 'Approve-School',
                    title: 'Approve School',
                    type: 'item',
                    url: '/schoolbus/Approve-School',
                    icon: icons.IconCircleCheck,
                    breadcrumbs: false,
                    roles: ['superadmin']
                }
            ]
        }
    ]
};

export default schoolbus;
