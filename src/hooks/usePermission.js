/**
 * usePermission — hook for action-level permission checks per module.
 *
 * Usage:
 *   const { canCreate, canUpdate, canDelete, canFilter, dataScope } =
 *     usePermission('report_alert');
 *
 * Returns all-false for unknown modules (safe default — deny).
 * Standard built-in roles always get full access matching their hardcoded
 * role definition; dynamic permissions are the authority for custom roles.
 */
import { useSelector } from 'react-redux';
import { getModulePermissions, STANDARD_ROLES } from '../utils/rbacUtils';
import { decipherEncryption } from '../helper';

const getStoredPermissions = () => {
  try {
    const raw = sessionStorage.getItem('userPermissions') || localStorage.getItem('userPermissions');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredRole = () => {
  try {
    const myDecipher = decipherEncryption('skytrack');
    const userData = sessionStorage.getItem('cookiesData') || localStorage.getItem('cookiesData');
    if (!userData) return null;
    const parts = userData.split('-').map(p => myDecipher(p));
    return parts.length > 1 ? parts[1] : null;
  } catch {
    return null;
  }
};

const DENY_ALL = {
  canView: false, canCreate: false, canUpdate: false,
  canDelete: false, canFilter: false, showInMenu: false, dataScope: null,
};

const ALLOW_ALL = {
  canView: true, canCreate: true, canUpdate: true,
  canDelete: true, canFilter: true, showInMenu: true, dataScope: 'national',
};

/**
 * @param {string} moduleCode  - backend module_code, e.g. 'report_alert'
 * @returns {{ canView, canCreate, canUpdate, canDelete, canFilter, showInMenu, dataScope }}
 */
const usePermission = (moduleCode) => {
  const reduxPermissions = useSelector((state) => state.login?.permissions);
  const permissions = reduxPermissions || getStoredPermissions();
  const role = getStoredRole();

  // Superadmin always gets everything — avoids needing to populate all 142
  // modules in the permissions payload just for superadmin.
  if (role === 'superadmin') return ALLOW_ALL;

  // If no permissions payload yet (first render, legacy user), fall back to
  // all-true for standard roles so existing behavior is unchanged.
  if (!permissions) {
    if (role && STANDARD_ROLES.has(role)) return ALLOW_ALL;
    return DENY_ALL;
  }

  const resolved = getModulePermissions(permissions, moduleCode);
  if (!resolved) {
    // Module not in payload → deny custom roles, allow standard roles
    if (role && STANDARD_ROLES.has(role)) return ALLOW_ALL;
    return DENY_ALL;
  }

  return resolved;
};

export default usePermission;
