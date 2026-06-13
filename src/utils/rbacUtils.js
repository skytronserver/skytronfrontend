/**
 * rbacUtils.js
 * Utility functions for mapping frontend routes and menu IDs to backend
 * Dynamic RBAC module codes, and checking permissions.
 */

import menuItems from '../menu-items';

// Maps frontend menu item 'id' to backend 'module_code'
export const MENU_MODULE_MAP = {
  // Dashboard
  "dashboard": "dashboard",
  "default": "dashboard",
  "morth-dashboard": "dashboard",
  "vehicle-monitoring": "dashboard",
  "erss-vehicles": "dashboard",
  "sos-dashboard-menu": "dashboard",
  "sos-analytics": "dashboard",

  // GPS Tracking
  "live-tracking": "gps_tracking",
  "vehicle-history": "gps_history",
  "history-playback": "gps_history",
  
  // Settings
  "setting-all-routes": "settings_management",
  "setting-all": "settings_management",
  
  // Reports
  "icons-report": "reports",
  
  // Device & Stock
  "device-management": "device_management",
  "device-model": "device_management",
  "device-stock": "device_stock",
  "new-device": "device_stock",
  "upload-device": "device_stock",
  "assign-device": "device_stock",
  "combined-stock": "device_stock",
  
  // Tagging
  "icons-tag": "vehicle_tagging",
  "new-tagging": "vehicle_tagging",
  "tagged-device": "vehicle_tagging",
  "download-tagging-receipt": "vehicle_tagging",
  
  // User Management
  "new-icons": "user_management",
  "user-list": "user_management",
  "admin-user-list": "stateadmin_management",
  "manufacturer-list": "manufacturer_management",
  "sos-admin-list": "emergency_management",
  "m2m-provider-list": "esim_management",
  "dealer-list": "dealer_management",
  "vehicle-owner": "owner_management",
  "dto-user-list": "user_management",
  
  // POI & Route
  "poi-viewer": "poi_management",
  "route-fixing": "route_management",
  "route-eta": "route_management",
  "trip-planning": "trip_management",
  "trip-viewer": "trip_management",
  
  // Alerts & SOS
  "sos-call-list": "emergency_management",
  "new-icons-em-team": "emergency_teams",
  
  // PIS
  "pis-group": "route_management", // mapping broadly
  
  // School Bus
  "schoolbus": "route_management", // mapping broadly
  
  // Complaints
  "complaint-management": "complaint",
  "complaints-group": "complaint",
  "helpdesk-tickets": "complaint",
  "helpdesk-new-ticket": "complaint",
  "staff-tickets": "complaint",
  "manufacturer-tickets": "complaint",
};

// Maps frontend route path to backend 'module_code'
export const ROUTE_MODULE_MAP = {
  "/dashboard": "dashboard",
  "/superadmin-dashboard": "dashboard",
  "/superadmin-dashboard/vehicle-monitoring": "dashboard",
  "/superadmin-dashboard/erss-vehicles": "dashboard",
  "/superadmin-dashboard/sos": "dashboard",
  "/superadmin-dashboard/sos-analytics": "dashboard",
  "/live-tracking": "gps_tracking",
  "/vehicle-history": "gps_history",
  "/history-playback": "gps_history",
  "/poi-viewer": "poi_management",
  "/route-fixing": "route_management",
  "/route-eta": "route_management",
  "/trip-planning": "trip_management",
  "/trip-viewer": "trip_management",
  "/device/list": "device_management",
  "/device/new": "device_stock",
  "/device/bulkupload": "device_stock",
  "/device/assign-device": "device_stock",
  "/device/combined-stock-report": "device_stock",
  "/device/show-tagged-device": "vehicle_tagging",
  "/device/show-device": "device_stock",
  "/device/show-available-device": "device_stock",
  "/tag/device-vehicle": "vehicle_tagging",
  "/tag/unapproved-vehicle": "vehicle_tagging",
  "/tag/download-receipt": "vehicle_tagging",
  "/tag/vahan-verification": "vehicle_tagging",
  "/sos-alert": "emergency_management",
  "/sos-call-list": "emergency_management",
  "/setting/notice": "notice_management",
  "/user/registeredUser": "user_management",
  "/helpdesk/tickets": "complaint",
  "/staff/tickets": "complaint",
  "/manufacturer/tickets": "complaint",
};

let expandedMenuModuleMap = null;
const getExpandedMenuModuleMap = () => {
  if (expandedMenuModuleMap) return expandedMenuModuleMap;
  expandedMenuModuleMap = { ...MENU_MODULE_MAP };
  
  const traverse = (items, currentModule) => {
    items.forEach(item => {
      const itemModule = MENU_MODULE_MAP[item.id] || currentModule;
      
      if (itemModule && !expandedMenuModuleMap[item.id]) {
        expandedMenuModuleMap[item.id] = itemModule;
      }
      
      if (item.children) {
        traverse(item.children, itemModule);
      }
    });
  };
  
  if (menuItems && menuItems.items) {
    traverse(menuItems.items, null);
  }
  return expandedMenuModuleMap;
};

/**
 * Check if the user has permission to view a menu item.
 * @param {string} menuId - The ID of the menu item (from menu-items config)
 * @param {string} role - The user's role (string)
 * @param {object|array} permissions - The permissions object or array from Redux state
 * @param {array} fallbackRoles - The hardcoded array of roles from the menu-items config
 * @returns {boolean}
 */
export const canViewMenu = (menuId, role, permissions, fallbackRoles = []) => {
  const standardRoles = ['superadmin', 'stateadmin', 'dtorto', 'devicemanufacture', 'dealer', 'owner', 'esimprovider', 'sosadmin', 'teamlead', 'desk_ex', 'police_ex', 'ambulance_ex'];
  const isCustomRole = role && !standardRoles.includes(role);

  // 1. Backward compatibility: if the role is explicitly in the hardcoded list, allow.
  if (!isCustomRole && fallbackRoles && fallbackRoles.length > 0 && fallbackRoles.includes(role)) {
    return true;
  }

  // 2. Dynamic RBAC check
  if (permissions) {
    const map = getExpandedMenuModuleMap();
    const apiModule = map[menuId];
    if (apiModule) {
      let modPerms = null;
      if (Array.isArray(permissions)) {
        modPerms = permissions.find(p => p.module === apiModule);
      } else {
        modPerms = permissions[apiModule];
      }

      if (modPerms) {
        // Check if any view/menu flag is true
        const hasAccess = modPerms.menu === true || 
                          modPerms.show_in_menu === true || 
                          modPerms.view === true || 
                          modPerms.can_view === true;
        
        if (hasAccess) return true;
        if (isCustomRole) return false; // Strict deny for custom roles if module exists but no access
      } else if (isCustomRole) {
        return false; // Strict deny if custom role has no permissions object for this mapped module
      }
    } else if (isCustomRole && fallbackRoles && fallbackRoles.length > 0) {
      // If module is not in map, but is restricted by roles, deny for custom role
      return false;
    }
  }

  // 3. If no dynamic mapping and not in fallback roles, hide it.
  // Note: if fallbackRoles is empty/undefined, it means the menu is public, so return true.
  if (!fallbackRoles || fallbackRoles.length === 0) {
    return true;
  }

  return false;
};

let routeToMenuIdMap = null;
const getRouteToMenuIdMap = () => {
  if (routeToMenuIdMap) return routeToMenuIdMap;
  routeToMenuIdMap = {};
  const traverse = (items) => {
    items.forEach(item => {
      if (item.url) {
        routeToMenuIdMap[item.url] = item.id;
      }
      if (item.children) {
        traverse(item.children);
      }
    });
  };
  if (menuItems && menuItems.items) {
    traverse(menuItems.items);
  }
  return routeToMenuIdMap;
};

/**
 * Check if the user has permission to view a route.
 * @param {string} routePath - The path of the route
 * @param {string} role - The user's role (string)
 * @param {object|array} permissions - The permissions object or array from Redux state
 * @param {array} fallbackRoles - The hardcoded array of roles from the route config
 * @returns {boolean}
 */
export const canViewRoute = (routePath, role, permissions, fallbackRoles = []) => {
  const standardRoles = ['superadmin', 'stateadmin', 'dtorto', 'devicemanufacture', 'dealer', 'owner', 'esimprovider', 'sosadmin', 'teamlead', 'desk_ex', 'police_ex', 'ambulance_ex'];
  const isCustomRole = role && !standardRoles.includes(role);

  // 1. Backward compatibility: if the role is explicitly in the hardcoded list, allow.
  if (!isCustomRole && fallbackRoles && fallbackRoles.length > 0 && fallbackRoles.includes(role)) {
    return true;
  }

  // 2. Dynamic RBAC check
  if (permissions) {
    // Try to find an exact or prefix match for the route
    const matchingKey = Object.keys(ROUTE_MODULE_MAP).find(path => routePath.startsWith(path));
    let apiModule = null;
    
    if (matchingKey) {
      apiModule = ROUTE_MODULE_MAP[matchingKey];
    } else {
      // Fallback: Check if the route is defined in menu-items, and map it to its module
      const map = getRouteToMenuIdMap();
      const menuId = map[routePath];
      if (menuId) {
        const expandedMap = getExpandedMenuModuleMap();
        apiModule = expandedMap[menuId];
      }
    }

    if (apiModule) {
      let modPerms = null;
      if (Array.isArray(permissions)) {
        modPerms = permissions.find(p => p.module === apiModule);
      } else {
        modPerms = permissions[apiModule];
      }

      if (modPerms) {
        const hasAccess = modPerms.view === true || modPerms.can_view === true;
        if (hasAccess) return true;
        if (isCustomRole) return false;
      } else if (isCustomRole) {
        return false;
      }
    } else if (isCustomRole && fallbackRoles && fallbackRoles.length > 0) {
      return false;
    }
  }

  // 3. If no roles specified, it's a public/authenticated route
  if (!fallbackRoles || fallbackRoles.length === 0) {
    return true;
  }

  return false;
};
