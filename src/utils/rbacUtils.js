/**
 * rbacUtils.js
 * Maps every frontend route and menu item ID to the backend module_code
 * from the RolePermissionConfig table, and checks permissions.
 *
 * The dual-mode logic works like this:
 *   • Standard roles (built-in): fallbackRoles array is checked first for
 *     backward compatibility, then dynamic permissions refine it.
 *   • Custom roles: strict module-permission check only (no fallback).
 */

import menuItems from '../menu-items';

// ─── ALL KNOWN ROLE CODES ────────────────────────────────────────────────────
// Include every built-in role from the RBAC doc plus all legacy aliases used
// in the codebase so that the "is this a custom role?" check is reliable.
export const STANDARD_ROLES = new Set([
  // Primary codes from RolePermissionConfig
  'superadmin', 'stateadmin', 'esimprovider', 'devicemanufacture', 'sosadmin',
  'dtorto', 'dealer', 'owner', 'teamleader', 'sosexecutive', 'filment',
  'schooladmin', 'parentuser',
  // Legacy / alternate codes used in the existing codebase
  'teamlead', 'desk_ex', 'desk_executive', 'sos_teamlead', 'sos_deskexecutive',
  'sos_desk_executive', 'police_ex', 'ambulance_ex', 'testagency', 'helpdesk',
]);

// ─── MENU ID → MODULE CODE ───────────────────────────────────────────────────
// Every menu item id from menu-items/*.js mapped to the backend module_code.
export const MENU_MODULE_MAP = {
  // ── Dashboard ──────────────────────────────────────────────────────────────
  'dashboard':                   'dashboard',
  'default':                     'dashboard',
  'central-dashboard-collapse':  'dashboard_central',
  'vehicle-monitoring':          'dashboard_central',
  'erss-vehicles':               'dashboard_central',
  'sos-dashboard-menu':          'dashboard_central',
  'sos-analytics':               'dashboard_central',
  'morth-dashboard':             'dashboard_morth',

  // ── School Bus System ──────────────────────────────────────────────────────
  'schoolbus-management':        'sbs_dashboard',
  'schoolbus-main':              'sbs_dashboard',
  'schoolbus-dashboard':         'sbs_dashboard',
  'bus-tagging':                 'sbs_bus_tagging',
  'schoolbus-tagging':           'sbs_bus_tracking',
  'route-management':            'sbs_route_mgmt',
  'bus-assignment':              'sbs_bus_assignment',
  'profile-management':          'sbs_profile_mgmt',
  'schoool-report':              'sbs_school_reports',
  'Create-School':               'sbs_create_school',
  'Approve-School':              'sbs_approve_school',
  'create-trip':                 'sbs_create_trip',
  'parent-tracking':             'sbs_parent_tracking',

  // ── Test Agency ────────────────────────────────────────────────────────────
  'test-agency-management':      'ta_agency_list',
  'test-agency-main':            'ta_agency_list',
  'test-agency-details-create':  'ta_create_user',
  'test-agency-details-list-menu': 'ta_user_list',
  'test-agency-create-menu':     'ta_create_agency',
  'test-agency-list-menu':       'ta_agency_list',
  'assigned-models-menu':        'ta_view_models',

  // ── Create New ────────────────────────────────────────────────────────────
  'new-icons':                   'user_management',
  'state-admin':                 'cn_state_admin',
  'm2m-user':                    'cn_m2m_provider',
  'manufacturer-user':           'cn_manufacturer',
  'dto-user':                    'cn_dto',
  'dealer-account':              'cn_dealer',
  'sos-admin':                   'cn_sos_admin',
  'system-admin':                'cn_system_admin',
  'sos-user':                    'cn_sos_user',
  'vehicle-owner':               'cn_vehicle_owner',

  // ── M2M & Manufacturer Requests ───────────────────────────────────────────
  'm2m-registration-requests':              'm2m_registration',
  'manufacturer-registration-requests':     'mfr_vlt_requests',
  'ais140-manufacturer-registration-requests': 'mfr_ais140_requests',
  'superadmin-technical-onboarding-requests':  'tech_onboarding',
  'stateadmin-technical-onboarding-requests':  'tech_onboarding_final',
  'manufacturer-technical-onboarding':         'mfr_onboarding_new',
  'manufacturer-technical-onboarding-create':  'mfr_onboarding_new',
  'manufacturer-technical-onboarding-list':    'mfr_onboarding_list',

  // ── Tracking & Playback ───────────────────────────────────────────────────
  'route-fixing':                'route_fixing',
  'route-eta':                   'trip_monitor',
  'live-tracking':               'live_tracking',
  'vehicle-tracking':            'gps_tracking',
  'vehicle-history':             'gps_history',
  'history-playback':            'history_playback',
  'trip-viewer':                 'trip_viewer',
  'trip-planning':               'trip_monitor',

  // ── VLTD Approval ─────────────────────────────────────────────────────────
  'device-management':           'device_management',
  'view-device':                 'vltd_pending_model',
  'view-device-cop':             'vltd_pending_cop',
  'approved-models':             'vltd_approved_models',
  'approved-cops':               'vltd_approved_cops',

  // ── Whitelist & KYC ───────────────────────────────────────────────────────
  'whitelist-kyc':               'wkyc_requests',
  'whitelist-requests':          'wkyc_requests',
  'whitelist-dashboard':         'wkyc_device_dashboard',

  // ── POI ───────────────────────────────────────────────────────────────────
  'poi-viewer':                  'poi_viewer',

  // ── Reports ───────────────────────────────────────────────────────────────
  'icons-report':                'reports',
  'sos-report':                  'report_sos',
  'all-notice-list':             'report_notices',
  'login-report':                'reports',
  'user-list':                   'report_users',
  'admin-user-list':             'report_state_admin',
  'manufacturer-list':           'report_manufacturer',
  'sos-admin-list':              'report_sos_users',
  'sos-other-list':              'report_sos_admin',
  'm2m-provider-list':           'report_m2m_provider',
  'dealer-list':                 'report_dealers',
  'vehicle-owner-list':          'report_vehicle_owner',
  'vehicle-owner-report':        'report_vehicle_owner',
  'dto-user-list':               'report_dto',
  'combined-stock':              'report_device',
  'all-device':                  'report_stock',
  'gps-data-log':                'report_gps_log',
  'activation-log-report':       'report_activation_log',
  'emergency-data-logs':         'report_emergency_data',
  'health-packet-log':           'report_health_packet',
  'api-data-log':                'report_event_data',
  'activated-device-report':     'report_activated_device',
  'alert-report':                'report_alert',
  'poi-report':                  'report_poi',
  'incident-report':             'report_incident',
  'device-health-report':        'report_device_health',
  'user-statistics-report':      'report_user_stats',
  'violation-report':            'report_violation',
  'sos-call-list-report':        'report_sos_call_list',
  'fitment-report':              'report_fitment',

  // ── Settings ──────────────────────────────────────────────────────────────
  'setting-all-routes':          'settings_management',
  'setting-all':                 'settings_management',
  'notice-create':               'settings_notice',
  'send-command':                'settings_send_command',
  'vehicle-category':            'settings_vehicle_type',
  'vehicle-category-code':       'settings_vehicle_category',
  'permit-master':               'settings_permit_cond',
  'notification-preferences':    'settings_alert_notif',
  'state-district':              'settings_state_district',
  'firmware-frequency':          'settings_ota_firmware',
  'archive-restore':             'settings_archive_restore',
  'ip-settings':                 'settings_ip',
  'login-settings':              'settings_login',
  'permit-conditions':           'settings_permit_cond',
  'custom-alerts':               'settings_custom_alerts',

  // ── PIS ───────────────────────────────────────────────────────────────────
  'pis-management':              'pis_bus_stops',
  'pis-main':                    'pis_bus_stops',
  'bus-stops':                   'pis_bus_stops',
  'bus-routes':                  'pis_bus_routes',
  'bus-schedules':               'pis_bus_schedules',

  // ── State Transport Analytics ─────────────────────────────────────────────
  'state-transport-analytics':   'sta_trip_analysis',
  'analytics-main':              'sta_trip_analysis',
  'trip-analysis':               'sta_trip_analysis',
  'driving-alerts':              'sta_driving_patterns',
  'vehicle-alerts':              'sta_vehicle_alerts',
  'pis-summary':                 'sta_pis_summary',
  'operational-analytics':       'sta_operational',
  'comparative-analysis':        'sta_comparative',
  'resource-performance':        'sta_resource_perf',

  // ── Custom User Module (RBAC admin) ───────────────────────────────────────
  'custom-user-module':          'cum_custom_roles',
  'rbac-group':                  'cum_custom_roles',
  'rbac-role-management':        'cum_custom_roles',
  'rbac-permission-management':  'cum_feature_perms',
  'rbac-custom-users':           'cum_user_mgmt',

  // ── Complaint Tickets ─────────────────────────────────────────────────────
  'complaint-management':        'complaint',
  'complaints-group':            'complaint',
  'helpdesk-tickets':            'ct_my_dashboard',
  'helpdesk-new-ticket':         'ct_create',
  'staff-tickets':               'ct_all_tickets',
  'manufacturer-tickets':        'ct_escalated',

  // ── Device, Stock & Management ────────────────────────────────────────────
  'device-model':                'dm_create_model',
  'new-device-model':            'dm_create_model',
  'device-model-extension':      'dm_tac_cop',
  'device-stock':                'device_stock',
  'new-device':                  'ds_individual',
  'upload-device':               'ds_bulk',
  'assign-device':               'ds_assign',
  'check-m2m-status':            'dealer_m2m_status',
  'activate-m2m-device':         'dealer_request_m2m',
  'icons-tag':                   'vehicle_tagging',
  'new-tagging':                 'dealer_tag_device',
  'tagged-device':               'dealer_download_cert',
  'download-tagging-receipt':    'dealer_download_cert',

  // ── Emergency & SOS ───────────────────────────────────────────────────────
  'new-icons-em-team':           'emergency_teams',
  'em-team':                     'em_team_create',
  'em-team-list':                'em_team_list',
  'sos-call-list':               'sos_call_list',

  // ── M2M / eSIM Provider ───────────────────────────────────────────────────
  'provider-device-list-pending': 'esim_management',
  'provider-device-list-invalid': 'esim_management',
  'provider-device-list-valid':   'esim_management',

  // ── Alerts ────────────────────────────────────────────────────────────────
  'alerts':                      'alerts',
};

// ─── ROUTE PATH → MODULE CODE ────────────────────────────────────────────────
// Every protected route path mapped to its backend module_code.
// More-specific paths must appear before prefix wildcards in the lookup loop.
export const ROUTE_MODULE_MAP = {
  // Dashboards
  '/dashboard':                                                    'dashboard',
  '/morth-dashboard':                                              'dashboard_morth',
  '/superadmin-dashboard':                                         'dashboard_central',
  '/superadmin-dashboard/vehicle-monitoring':                      'dashboard_central',
  '/superadmin-dashboard/erss-vehicles':                           'dashboard_central',
  '/superadmin-dashboard/sos':                                     'dashboard_central',
  '/superadmin-dashboard/sos-analytics':                           'dashboard_central',

  // School Bus
  '/schoolbus':                                                    'sbs_dashboard',
  '/schoolbus/bus-tagging':                                        'sbs_bus_tagging',
  '/schoolbus/route-management':                                   'sbs_route_mgmt',
  '/schoolbus/bus-assignment':                                     'sbs_bus_assignment',
  '/schoolbus/profile-management':                                 'sbs_profile_mgmt',
  '/schoolbus/reports':                                            'sbs_school_reports',
  '/schoolbus/Create-School':                                      'sbs_create_school',
  '/schoolbus/Approve-School':                                     'sbs_approve_school',
  '/schoolbus/bus-tracking':                                       'sbs_bus_tracking',
  '/schoolbus/create-trip':                                        'sbs_create_trip',
  '/schoolbus/parent-tracking':                                    'sbs_parent_tracking',

  // Test Agency
  '/new/test-agency':                                              'ta_create_agency',
  '/test-agency/list':                                             'ta_agency_list',
  '/new/test-agency-details':                                      'ta_create_user',
  '/test-agency/details-list':                                     'ta_user_list',
  '/test-agency/assigned-models':                                  'ta_view_models',

  // Create New
  '/user/newStateAdmin':                                           'cn_state_admin',
  '/user/newM2MUser':                                              'cn_m2m_provider',
  '/user/newManufacturer':                                         'cn_manufacturer',
  '/manufacturer/new':                                             'cn_manufacturer',
  '/new/sos-admin':                                                'cn_sos_admin',
  '/new/system-admin':                                             'cn_system_admin',
  '/user/newDto':                                                  'cn_dto',
  '/user/newDealerAccount':                                        'cn_dealer',
  '/new/sos-user':                                                 'cn_sos_user',
  '/new/vehicleOwner':                                             'cn_vehicle_owner',

  // M2M & Manufacturer Requests
  '/superadmin-dashboard/m2m-registration-requests':               'm2m_registration',
  '/superadmin-dashboard/vehicle-manufacturer-registration-requests': 'mfr_vlt_requests',
  '/superadmin-dashboard/ais-140-device-manufacturer-registration-requests': 'mfr_ais140_requests',
  '/superadmin-dashboard/technical-onboarding-requests':           'tech_onboarding',
  '/stateadmin-dashboard/technical-onboarding-requests':           'tech_onboarding_final',
  '/manufacturer/technical-onboarding/create':                     'mfr_onboarding_new',
  '/manufacturer/technical-onboarding/list':                       'mfr_onboarding_list',

  // Tracking & Playback
  '/route-fixing':                                                 'route_fixing',
  '/live-tracking':                                                'live_tracking',
  '/vehicle-tracking-report':                                      'gps_tracking',
  '/vehicle-history':                                              'gps_history',
  '/history-playback':                                             'history_playback',
  '/trip-viewer':                                                  'trip_viewer',
  '/trip-planning':                                                'trip_monitor',
  '/route-eta':                                                    'trip_monitor',

  // VLTD Approval
  '/device/list':                                                  'vltd_pending_model',
  '/deviceCOP/list':                                               'vltd_pending_cop',
  '/device/approved-models':                                       'vltd_approved_models',
  '/device/approved-cops':                                         'vltd_approved_cops',

  // Whitelist & KYC
  '/device/whitelist/requests':                                    'wkyc_requests',
  '/device/whitelist/dashboard':                                   'wkyc_device_dashboard',

  // POI
  '/poi-viewer':                                                   'poi_viewer',
  '/reports/poi-report':                                           'poi_management',

  // Reports (specific paths before generic /reports prefix)
  '/reports/gps-data-log':                                         'report_gps_log',
  '/reports/activation-log-report':                                'report_activation_log',
  '/reports/emergency-data-logs':                                  'report_emergency_data',
  '/reports/health-packet-log':                                    'report_health_packet',
  '/reports/api-data-log':                                         'report_event_data',
  '/reports/activated-device-report':                              'report_activated_device',
  '/reports/alert-report':                                         'report_alert',
  '/reports/incident-report':                                      'report_incident',
  '/reports/device-health-report':                                 'report_device_health',
  '/reports/user-statistics-report':                               'report_user_stats',
  '/reports/violation-report':                                     'report_violation',
  '/reports/login-report':                                         'reports',
  '/reports':                                                      'reports',
  '/sos-report':                                                   'report_sos',
  '/notice/all-notice-list':                                       'report_notices',
  '/user/registeredUser':                                          'report_users',
  '/user/state-admin-list':                                        'report_state_admin',
  '/user/manufacturer-list':                                       'report_manufacturer',
  '/user/sos-other-list':                                          'report_sos_admin',
  '/user/m2m-provider-list':                                       'report_m2m_provider',
  '/user/dealerList':                                              'report_dealers',
  '/user/vehicle-owner-list':                                      'report_vehicle_owner',
  '/user/dto-user-list':                                           'report_dto',
  '/device/combined-stock-report':                                 'report_device',
  '/device/fit-device':                                            'report_fitment',
  '/device/all-tagged-devices':                                    'report_device',
  '/user/sos-user-list':                                           'report_sos_users',
  '/sos-call-list':                                                'sos_call_list',

  // Settings (specific paths before generic /setting prefix)
  '/setting/notice':                                               'settings_notice',
  '/setting/send-command':                                         'settings_send_command',
  '/setting/vehicle-category-code':                                'settings_vehicle_category',
  '/setting/vehicle-category':                                     'settings_vehicle_type',
  '/setting/notification-preferences':                             'settings_alert_notif',
  '/setting/state-district':                                       'settings_state_district',
  '/setting/frequency-firmware':                                   'settings_ota_firmware',
  '/setting/archive-restore':                                      'settings_archive_restore',
  '/setting/ip-settings':                                          'settings_ip',
  '/setting/login-settings':                                       'settings_login',
  '/setting/permit-conditions':                                    'settings_permit_cond',
  '/setting/permit-master':                                        'settings_permit_cond',
  '/setting/custom-alerts':                                        'settings_custom_alerts',
  '/setting/rbac/roles':                                           'cum_custom_roles',
  '/setting/rbac/permissions':                                     'cum_feature_perms',
  '/setting/rbac/custom-users':                                    'cum_user_mgmt',
  '/setting':                                                      'settings_management',

  // PIS
  '/pis/bus-stops':                                                'pis_bus_stops',
  '/pis/bus-routes':                                               'pis_bus_routes',
  '/pis/bus-schedules':                                            'pis_bus_schedules',

  // State Transport Analytics
  '/analytics/trip-analysis':                                      'sta_trip_analysis',
  '/analytics/driving-alerts':                                     'sta_driving_patterns',
  '/analytics/vehicle-alerts':                                     'sta_vehicle_alerts',
  '/analytics/pis-summary':                                        'sta_pis_summary',
  '/analytics/operational':                                        'sta_operational',
  '/analytics/comparative-analysis':                               'sta_comparative',
  '/analytics/resource-performance':                               'sta_resource_perf',

  // Complaint Tickets
  '/helpdesk/tickets/new':                                         'ct_create',
  '/helpdesk/tickets':                                             'ct_my_dashboard',
  '/staff/tickets':                                                'ct_all_tickets',
  '/manufacturer/tickets':                                         'ct_escalated',

  // Device, Stock & Management
  '/device/new':                                                   'ds_individual',
  '/device/show-available-device':                                 'report_fitment',
  '/deviceModel/new':                                              'dm_create_model',
  '/deviceModel/extension':                                        'dm_tac_cop',
  '/device/show-device':                                           'report_stock',
  '/device/bulkupload':                                            'ds_bulk',
  '/device/bulk-assign':                                           'ds_assign',
  '/device/assign-device':                                         'ds_assign',
  '/device/m2m-status':                                            'dealer_m2m_status',
  '/device/m2m-activation':                                        'dealer_request_m2m',
  '/device/show-tagged-device':                                    'dealer_download_cert',
  '/tag/device-vehicle':                                           'dealer_tag_device',
  '/tag/unapproved-vehicle':                                       'dealer_tag_device',
  '/tag/download-receipt':                                         'dealer_download_cert',
  '/tag/vahan-verification':                                       'vehicle_tagging',
  '/device/activation-request':                                    'esim_management',

  // Emergency & SOS
  '/sos-alert':                                                    'emergency_management',
  '/list/em-team':                                                 'em_team_list',
  '/new/em-team':                                                  'em_team_create',

  // Other Management
  '/alert-list':                                                   'alerts',
  '/user/list':                                                    'user_management',
  '/new/otherUser':                                                'driver_management',

  // Trip & Route management pages
  '/trip-management':                                              'trip_management',
  '/route-management':                                             'route_management',
};

// ─── Internal cache ──────────────────────────────────────────────────────────
let _expandedMenuMap = null;

const getExpandedMenuModuleMap = () => {
  if (_expandedMenuMap) return _expandedMenuMap;
  _expandedMenuMap = { ...MENU_MODULE_MAP };

  const traverse = (items, parentModule) => {
    items.forEach(item => {
      const mod = MENU_MODULE_MAP[item.id] || parentModule;
      if (mod && !_expandedMenuMap[item.id]) {
        _expandedMenuMap[item.id] = mod;
      }
      if (item.children) {
        traverse(item.children, mod);
      }
    });
  };

  if (menuItems?.items) traverse(menuItems.items, null);
  return _expandedMenuMap;
};

let _routeToMenuId = null;

const getRouteToMenuIdMap = () => {
  if (_routeToMenuId) return _routeToMenuId;
  _routeToMenuId = {};
  const traverse = (items) => {
    items.forEach(item => {
      if (item.url) _routeToMenuId[item.url] = item.id;
      if (item.children) traverse(item.children);
    });
  };
  if (menuItems?.items) traverse(menuItems.items);
  return _routeToMenuId;
};

// ─── Resolve module code for a route path ────────────────────────────────────
// Tries exact match, then longest-prefix match, then menu-item fallback.
const resolveRouteModule = (routePath) => {
  // Exact match
  if (ROUTE_MODULE_MAP[routePath]) return ROUTE_MODULE_MAP[routePath];

  // Longest-prefix match (sort once so more-specific paths win)
  const keys = Object.keys(ROUTE_MODULE_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (routePath.startsWith(key)) return ROUTE_MODULE_MAP[key];
  }

  // Fallback via menu-item url → id → module
  const menuId = getRouteToMenuIdMap()[routePath];
  if (menuId) return getExpandedMenuModuleMap()[menuId] || null;

  return null;
};

// ─── Resolve permission entry from the permissions store ─────────────────────
const resolveModulePerms = (permissions, moduleCode) => {
  if (!permissions || !moduleCode) return null;
  if (Array.isArray(permissions)) {
    return permissions.find(p => p.module === moduleCode) || null;
  }
  return permissions[moduleCode] || null;
};

// ─── canViewMenu ─────────────────────────────────────────────────────────────
/**
 * Decide whether to show a sidebar menu item.
 *
 * @param {string}        menuId       - menu-items `id` field
 * @param {string}        role         - user's role string
 * @param {object|array}  permissions  - module permissions from Redux/storage
 * @param {string[]}      fallbackRoles - hardcoded `roles` array from menu config
 */
export const canViewMenu = (menuId, role, permissions, fallbackRoles = []) => {
  // ── 100% Dynamic RBAC ────────────────────────────────────────────────────
  // Sidebar visibility is controlled ENTIRELY by the RBAC permission toggles.
  // Hardcoded roles[] are NOT used — only what's saved in the permission
  // management page matters.

  if (permissions) {
    const moduleCode = getExpandedMenuModuleMap()[menuId];
    if (menuId === 'vehicle-owner') {
      console.log('[RBAC DEBUG canViewMenu] vehicle-owner moduleCode:', moduleCode);
    }
    if (moduleCode) {
      const p = resolveModulePerms(permissions, moduleCode);
      if (menuId === 'vehicle-owner') {
        console.log('[RBAC DEBUG canViewMenu] vehicle-owner perm:', p);
      }
      if (p) {
        // Exact toggle value — ON = show, OFF = hide
        const result = !!(p.menu || p.show_in_menu || p.view || p.can_view);
        if (menuId === 'vehicle-owner') {
           console.log('[RBAC DEBUG canViewMenu] vehicle-owner returning:', result);
        }
        return result;
      }
      // Module mapped but no permission entry saved → hide
      if (menuId === 'vehicle-owner') console.log('[RBAC DEBUG canViewMenu] vehicle-owner returning false (no perm entry)');
      return false;
    }
    // No module mapping → not controlled by RBAC yet, use roles as fallback
    if (menuId === 'vehicle-owner') {
      console.log('[RBAC DEBUG canViewMenu] vehicle-owner falling back to roles:', fallbackRoles, 'role:', role);
    }
    if (!fallbackRoles || fallbackRoles.length === 0) return true;
    return fallbackRoles.includes(role);
  }

  // Permissions not loaded yet (API still loading) → hide everything
  // to avoid flashing items before permissions arrive
  return false;
};

// ─── hasVisibleChildren ──────────────────────────────────────────────────────
/**
 * Recursively check if a menu group or collapse has at least one visible child.
 *
 * @param {object}        menuItem     - menu-items node
 * @param {string}        role         - user's role string
 * @param {object|array}  permissions  - module permissions
 */
export const hasVisibleChildren = (menuItem, role, permissions) => {
  if (!menuItem.children || menuItem.children.length === 0) {
    return canViewMenu(menuItem.id, role, permissions, menuItem?.roles || []);
  }

  return menuItem.children.some(child => {
    if (child.type === 'item') {
      return canViewMenu(child.id, role, permissions, child.roles || []);
    } else if (child.type === 'collapse' || child.type === 'group') {
      const canView = canViewMenu(child.id, role, permissions, child.roles || []);
      return canView && hasVisibleChildren(child, role, permissions);
    }
    return false;
  });
};

// ─── canViewRoute ─────────────────────────────────────────────────────────────
/**
 * Decide whether a user may access a route.
 *
 * @param {string}        routePath    - current location.pathname
 * @param {string}        role         - user's role string
 * @param {object|array}  permissions  - module permissions from Redux/storage
 * @param {string[]}      fallbackRoles - hardcoded `roles` array from route config
 */
export const canViewRoute = (routePath, role, permissions, fallbackRoles = []) => {
  // ── 100% Dynamic RBAC ────────────────────────────────────────────────────
  // Route access is controlled ENTIRELY by the RBAC permission toggles.
  // Hardcoded roles[] are NOT used — only what's saved in the permission
  // management page matters, just like the sidebar menu.

  if (permissions) {
    const moduleCode = resolveRouteModule(routePath);
    if (moduleCode) {
      const p = resolveModulePerms(permissions, moduleCode);
      if (p) {
        // Exact toggle value — ON = allow, OFF = deny
        return !!(p.view || p.can_view);
      }
      // Module mapped but no permission entry saved → deny access
      return false;
    }
    
    // No module mapping → not controlled by RBAC yet, use roles as fallback
    if (!fallbackRoles || fallbackRoles.length === 0) return true;
    return fallbackRoles.includes(role);
  }

  // Permissions not loaded yet (API still loading) → block access by default
  return false;
};

// ─── getModulePermissions ─────────────────────────────────────────────────────
/**
 * Return the full permission object for a module code, normalising
 * both the array-format and object-format permission stores.
 *
 * @param {object|array} permissions
 * @param {string}       moduleCode
 * @returns {{ canView, canCreate, canUpdate, canDelete, canFilter, showInMenu, dataScope } | null}
 */
export const getModulePermissions = (permissions, moduleCode) => {
  const p = resolveModulePerms(permissions, moduleCode);
  if (!p) return null;
  return {
    canView:     !!(p.view    || p.can_view),
    canCreate:   !!(p.create  || p.can_create),
    canUpdate:   !!(p.update  || p.can_update),
    canDelete:   !!(p.delete  || p.can_delete),
    canFilter:   !!(p.filter  || p.can_filter),
    showInMenu:  !!(p.menu    || p.show_in_menu),
    dataScope:   p.data_scope || null,
  };
};
