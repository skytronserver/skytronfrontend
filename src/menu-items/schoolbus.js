// assets
import { IconBus, IconRoute, IconUserCircle, IconMapPin, IconLockAccess, IconDashboard,IconSchool,
  IconCircleCheck,IconCurrentLocation,IconClipboardCheck,IconReportAnalytics ,IconClockPlay, IconCalendarEvent } from '@tabler/icons';

// constant
const icons = { IconBus, IconRoute, IconUserCircle, IconMapPin, IconLockAccess, IconDashboard,IconSchool,
  IconCircleCheck,IconCurrentLocation,IconClipboardCheck,IconReportAnalytics ,IconClockPlay, IconCalendarEvent };

// ==============================|| SCHOOL BUS MENU ITEMS ||============================== //

const schoolbus = {
    id: 'schoolbus-management',
    title: 'School Bus',
    type: 'group',
    roles: ['superadmin', 'schooladmin', 'parentuser'],
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
                    id: 'schoolbus-tagging',
                    title: 'School Bus Tracking',
                    type: 'item',
                    url: '/schoolbus/bus-tracking',
                    icon: icons.IconCurrentLocation,
                    breadcrumbs: false,
                    roles: [ 'schooladmin']
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
    id: 'create-trip',
    title: 'Create Trip',
    type: 'item',
    url: '/schoolbus/create-trip',
    icon: icons.IconClockPlay,
     breadcrumbs: false,
     roles: [ 'schooladmin']
},
                {
                    id: 'schoool-report',
                    title: 'School Reports',
                    type: 'item',
                    url: '/schoolbus/reports',
                    icon: icons.IconReportAnalytics ,
                    breadcrumbs: false,
                    roles: ['superadmin', 'schooladmin']
                },
                {
                    id: 'school-holidays',
                    title: 'School Holidays',
                    type: 'item',
                    url: '/schoolbus/holidays',
                    icon: icons.IconCalendarEvent,
                    breadcrumbs: false,
                    roles: ['stateadmin', 'schooladmin']
                },
                {
                    id: 'alerts-center',
                    title: 'Alerts Center',
                    type: 'item',
                    url: '/schoolbus/alerts',
                    icon: icons.IconReportAnalytics,
                    breadcrumbs: false,
                    roles: ['stateadmin', 'schooladmin']
                },
                // {
                //     id: 'attendance-management',
                //     title: 'Attendance Management',
                //     type: 'item',
                //     url: '/schoolbus/attendance-management',
                //     icon: icons.IconClipboardCheck ,
                //     breadcrumbs: false,
                //     roles: ['superadmin', 'schooladmin']
                // },
                {
                    id: 'parent-tracking',
                    title: 'Parent Tracking',
                    type: 'item',
                    url: '/schoolbus/parent-tracking',
                    icon: icons.IconMapPin,
                    breadcrumbs: false,
                    roles: [ 'parentuser']
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
