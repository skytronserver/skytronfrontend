/**
 * rbacUtils.js
 * Utility functions for mapping frontend routes and menu IDs to backend
 * Dynamic RBAC module codes, and checking permissions.
 */

// Maps frontend menu item 'id' to backend 'module_code'
export const MENU_MODULE_MAP = {
  // Dashboard
  "dashboard": "dashboard",
  "default": "dashboard",
  "morth-dashboard": "dashboard",

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
  
  // Tagging
  "icons-tag": "vehicle_tagging",
  "new-tagging": "vehicle_tagging",
  "tagged-device": "vehicle_tagging",
  "download-tagging-receipt": "vehicle_tagging",
  
  // User Management
  "utilities": "user_management",
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
};

// Maps frontend route path to backend 'module_code'
export const ROUTE_MODULE_MAP = {
  "/dashboard": "dashboard",
  "/superadmin-dashboard": "dashboard",
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
  "/tag/device-vehicle": "vehicle_tagging",
  "/sos-alert": "emergency_management",
  "/sos-call-list": "emergency_management",
  "/setting/notice": "notice_management",
  "/user/registeredUser": "user_management",
};

/**
 * Check if the user has permission to view a menu item.
 * @param {string} menuId - The ID of the menu item (from menu-items config)
 * @param {string} role - The user's role (string)
 * @param {object} permissions - The permissions object from Redux state
 * @param {array} fallbackRoles - The hardcoded array of roles from the menu-items config
 * @returns {boolean}
 */
export const canViewMenu = (menuId, role, permissions, fallbackRoles = []) => {
  // 1. Backward compatibility: if the role is explicitly in the hardcoded list, allow.
  if (fallbackRoles && fallbackRoles.length > 0 && fallbackRoles.includes(role)) {
    return true;
  }

  // 2. Dynamic RBAC check
  if (permissions) {
    const apiModule = MENU_MODULE_MAP[menuId];
    if (apiModule && permissions[apiModule]) {
      return permissions[apiModule].menu === true || permissions[apiModule].view === true;
    }
  }

  // 3. If no dynamic mapping and not in fallback roles, hide it.
  // Note: if fallbackRoles is empty/undefined, it means the menu is public, so return true.
  if (!fallbackRoles || fallbackRoles.length === 0) {
    return true;
  }

  return false;
};

/**
 * Check if the user has permission to view a route.
 * @param {string} routePath - The path of the route
 * @param {string} role - The user's role (string)
 * @param {object} permissions - The permissions object from Redux state
 * @param {array} fallbackRoles - The hardcoded array of roles from the route config
 * @returns {boolean}
 */
export const canViewRoute = (routePath, role, permissions, fallbackRoles = []) => {
  // 1. Backward compatibility: if the role is explicitly in the hardcoded list, allow.
  if (fallbackRoles && fallbackRoles.length > 0 && fallbackRoles.includes(role)) {
    return true;
  }

  // 2. Dynamic RBAC check
  if (permissions) {
    // Try to find an exact or prefix match for the route
    const matchingKey = Object.keys(ROUTE_MODULE_MAP).find(path => routePath.startsWith(path));
    if (matchingKey) {
      const apiModule = ROUTE_MODULE_MAP[matchingKey];
      if (permissions[apiModule]) {
        return permissions[apiModule].view === true;
      }
    } else {
      // If no mapping, we can try to allow if they have dashboard access as a baseline,
      // but it's safer to deny if they don't match fallbackRoles.
    }
  }

  // 3. If no roles specified, it's a public/authenticated route
  if (!fallbackRoles || fallbackRoles.length === 0) {
    return true;
  }

  return false;
};
