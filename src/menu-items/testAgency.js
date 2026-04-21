// assets
import {
    IconBuildingBank,
    IconPlus,
    IconList,
} from '@tabler/icons';

const icons = { IconBuildingBank, IconPlus, IconList };

// ==============================|| TEST AGENCY MENU ITEMS ||============================== //

const testAgency = {
    id: 'test-agency-management',
    title: 'Test Agency',
    type: 'group',
    roles: ['superadmin', 'testagency'], // Allow group for testagency too
    children: [
        {
            id: 'test-agency-main',
            title: 'Test Agency',
            type: 'collapse',
            icon: icons.IconBuildingBank,
            roles: ['superadmin', 'testagency'],
            children: [
                {
                    id: 'test-agency-details-create',
                    title: 'Create Agency Details',
                    type: 'item',
                    url: '/new/test-agency-details',
                    icon: icons.IconPlus,
                    breadcrumbs: false,
                    roles: ['superadmin'],
                },
                {
                    id: 'test-agency-details-list-menu',
                    title: 'Test Agency Details List',
                    type: 'item',
                    url: '/test-agency/details-list',
                    icon: icons.IconList,
                    breadcrumbs: false,
                    roles: ['superadmin'],
                },
                {
                    id: 'test-agency-create-menu',
                    title: 'Create Agency User',
                    type: 'item',
                    url: '/new/test-agency',
                    icon: icons.IconPlus,
                    breadcrumbs: false,
                    roles: ['superadmin'],
                },
                {
                    id: 'test-agency-list-menu',
                    title: 'Test agency user list',
                    type: 'item',
                    url: '/test-agency/list',
                    icon: icons.IconList,
                    breadcrumbs: false,
                    roles: ['superadmin'],
                },
                {
                    id: 'assigned-models-menu',
                    title: 'Assigned Models',
                    type: 'item',
                    url: '/test-agency/assigned-models',
                    icon: icons.IconList,
                    breadcrumbs: false,
                    roles: ['testagency'],
                },
            ],
        },
    ],
};

export default testAgency;
