// material-ui
import { Typography } from '@mui/material';

// project imports
import NavGroup from './NavGroup';
import menuItem from '../../../../menu-items';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { decipherEncryption } from '../../../../helper';
import { SYSTEM_ENV } from '../../../../store/constant';
import { hasVisibleChildren } from '../../../../utils/rbacUtils';
import RbacService from '../../../../services/RbacService';
import { setPermissions } from '../../../../actions/loginActions';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const dispatch = useDispatch();
  const fetchedRef = useRef(false); // prevent double-fetch on hot-reload
  const myDecipher = decipherEncryption('skytrack');

  const userData = useSelector((state) => state.login.cookiesData)
    || sessionStorage.getItem('cookiesData')
    || localStorage.getItem('cookiesData');

  const reduxPermissions = useSelector((state) => state.login.permissions);

  // Compute role synchronously so the useEffect has it
  const data = userData && userData.split('-').map((item) => myDecipher(item));
  const userRoles = userData && data && data.length > 2 && data[1];
  const role = menuItem.role || userRoles;

  // Read permissions from Redux only (storage is cleared below and refreshed via API)
  const permissions = reduxPermissions || null;

  // Fetch ROLE-CONFIGURED permissions (reflects what's set in RBAC management page)
  // Always refresh ROLE-CONFIGURED permissions on mount so sidebar toggles are respected.
  // We don't guard on "!permissions" because cached permissions may be stale (e.g. from
  // a previous approach that stored effective/full permissions for superadmin).
  useEffect(() => {
    if (fetchedRef.current || !role) return;
    fetchedRef.current = true;

    const loadRolePermissions = async () => {
      // Only superadmin has access to fetch role-configured permissions directly.
      if (role === 'superadmin') {
        try {
          const res = await RbacService.getRolePermissions(role);
          const rolePerms = res.data?.permissions;
          console.log('[RBAC DEBUG] getRolePermissions for role:', role);
          const vehicleOwnerPerm = rolePerms?.find(p => p.module === 'cn_vehicle_owner');
          console.log('[RBAC DEBUG] cn_vehicle_owner FULL:', JSON.stringify(vehicleOwnerPerm));
          console.log('[RBAC DEBUG] total permissions:', rolePerms?.length);
          if (rolePerms && rolePerms.length > 0) {
            sessionStorage.setItem('userPermissions', JSON.stringify(rolePerms));
            localStorage.setItem('userPermissions', JSON.stringify(rolePerms));
            dispatch(setPermissions(rolePerms));
            return;
          }
        } catch (err) {
          console.warn('[RBAC] getRolePermissions failed:', err?.message);
        }
        // Fallback: checkUserAccess
        try {
          const permRes = await RbacService.checkUserAccess();
          const fetchedPerms = permRes.data?.permissions;
          console.log('[RBAC DEBUG] ⚠ checkUserAccess FALLBACK used (getRolePermissions failed or empty)');
          const voPerm = fetchedPerms?.find ? fetchedPerms?.find(p => p.module === 'cn_vehicle_owner') : fetchedPerms?.['cn_vehicle_owner'];
          console.log('[RBAC DEBUG] cn_vehicle_owner in checkUserAccess:', JSON.stringify(voPerm));
          if (fetchedPerms) {
            sessionStorage.setItem('userPermissions', JSON.stringify(fetchedPerms));
            localStorage.setItem('userPermissions', JSON.stringify(fetchedPerms));
            dispatch(setPermissions(fetchedPerms));
          }
        } catch (err2) {
          console.warn('[RBAC] checkUserAccess failed:', err2?.message);
        }
      }
    };

    loadRolePermissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const webRestrictedRoles = ['police_ex', 'ambulance_ex', 'PCR', 'ACR'];
  if (webRestrictedRoles.includes(role)) {
    return null;
  }

  // Environment-based role blocking
  const normalizedRole = (role || '').toLowerCase().trim();
  const isBlockedInProd = [
    'teamlead', 'team_lead', 'team lead', 'sos_teamlead',
    'desk_ex', 'desk_executive', 'desk executive',
    'sos_deskexecutive', 'sos_desk_executive', 'sosexecutive',
  ].includes(normalizedRole);

  if (SYSTEM_ENV === 'prod') {
    if (isBlockedInProd) return null;
  } else if (SYSTEM_ENV === 'sos') {
    if (!isBlockedInProd) return null;
  }

  const navItems = menuItem.items.map((item) => {
    switch (item.type) {
      case 'group': {
        const hasChildren = hasVisibleChildren(item, role, permissions);
        return hasChildren
          ? <NavGroup key={item.id} item={item} role={role} permissions={permissions} />
          : null;
      }
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <>{navItems}</>;
};

export default MenuList;
