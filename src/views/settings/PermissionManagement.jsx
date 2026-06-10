// PermissionManagement.jsx — uses the project's existing form/card/dialog pattern
import { useEffect, useState, useCallback } from 'react';
import {
  Grid, Button, CircularProgress, TextField, MenuItem,
  Checkbox, FormControlLabel, Switch, Select, FormControl, InputLabel
} from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import DialogComponent from '../../ui-component/DialogComponent';
import { gridSpacing } from '../../store/constant';
import RbacService from '../../services/RbacService';
import '../../views/forms/form.css';

// ─── Module master list ────────────────────────────────────────────────────────
const ALL_MODULES = [
  { code: 'dashboard',               label: 'Dashboard' },
  { code: 'gps_tracking',            label: 'GPS Live Tracking' },
  { code: 'gps_history',             label: 'GPS History' },
  { code: 'gps_clustering',          label: 'GPS Cluster / Grid' },
  { code: 'device_management',       label: 'Device Model Management' },
  { code: 'device_stock',            label: 'Device Stock & Inventory' },
  { code: 'vehicle_tagging',         label: 'Vehicle Tagging' },
  { code: 'driver_management',       label: 'Driver Management' },
  { code: 'owner_management',        label: 'Vehicle Owner Management' },
  { code: 'manufacturer_management', label: 'Manufacturer Management' },
  { code: 'dealer_management',       label: 'Dealer Management' },
  { code: 'stateadmin_management',   label: 'State Admin Management' },
  { code: 'esim_management',         label: 'eSIM Provider Management' },
  { code: 'emergency_management',    label: 'Emergency (SOS) Management' },
  { code: 'emergency_teams',         label: 'Emergency Teams' },
  { code: 'poi_management',          label: 'Points of Interest' },
  { code: 'route_management',        label: 'Route Management' },
  { code: 'alerts',                  label: 'Alerts & Notifications' },
  { code: 'reports',                 label: 'Reports' },
  { code: 'user_management',         label: 'User Management' },
  { code: 'notice_management',       label: 'Notices' },
  { code: 'trip_management',         label: 'Trip Management' },
  { code: 'settings_management',     label: 'System Settings' },
];

const DATA_SCOPES = [
  { value: 'national',     label: 'National' },
  { value: 'state',        label: 'State' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'district',     label: 'District' },
  { value: 'dealer',       label: 'Dealer' },
  { value: 'owner',        label: 'Owner' },
  { value: 'self',         label: 'Self' },
  { value: 'none',         label: 'None' },
];

const PERM_FLAGS = ['can_view', 'can_create', 'can_update', 'can_delete', 'can_filter', 'show_in_menu'];
const PERM_LABELS = {
  can_view: 'View', can_create: 'Create', can_update: 'Update',
  can_delete: 'Delete', can_filter: 'Filter', show_in_menu: 'Menu',
};

const defaultRow = () => ({
  can_view: false, can_create: false, can_update: false,
  can_delete: false, can_filter: false, show_in_menu: false,
  data_scope: 'none',
});

// ─── Main component ────────────────────────────────────────────────────────────
const PermissionManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [perms, setPerms] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ error: false, message: '', errorList: [] });

  // ── Load active roles for the dropdown ────────────────────────────────────
  useEffect(() => {
    RbacService.listActiveRoles()
      .then(res => setRoles(res.data?.roles || []))
      .catch(() => showAlert('Failed to load roles.'));
  }, []);

  // ── Load permissions when role selected ───────────────────────────────────
  const loadPermissions = useCallback(async (roleCode) => {
    if (!roleCode) return;
    setLoading(true);
    setDirty(false);
    try {
      const res = await RbacService.getRolePermissions(roleCode);
      const map = {};
      ALL_MODULES.forEach(m => { map[m.code] = defaultRow(); });
      (res.data?.permissions || []).forEach(p => {
        map[p.module] = {
          can_view:     p.can_view,
          can_create:   p.can_create,
          can_update:   p.can_update,
          can_delete:   p.can_delete,
          can_filter:   p.can_filter,
          show_in_menu: p.show_in_menu,
          data_scope:   p.data_scope || 'none',
        };
      });
      setPerms(map);
    } catch (err) {
      showAlert(err?.response?.data?.error || 'Failed to load permissions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (selectedRole) loadPermissions(selectedRole); }, [selectedRole, loadPermissions]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showAlert = (message) => { setAlert(prev => ({ ...prev, message })); setOpen(true); };
  const handleClose = () => setOpen(false);

  const toggleFlag = (mod, flag) => {
    setPerms(prev => ({ ...prev, [mod]: { ...prev[mod], [flag]: !prev[mod][flag] } }));
    setDirty(true);
  };

  const setScope = (mod, scope) => {
    setPerms(prev => ({ ...prev, [mod]: { ...prev[mod], data_scope: scope } }));
    setDirty(true);
  };

  const toggleRow = (mod, grantAll) => {
    setPerms(prev => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        can_view: grantAll, can_create: grantAll, can_update: grantAll,
        can_delete: grantAll, can_filter: grantAll, show_in_menu: grantAll,
      },
    }));
    setDirty(true);
  };

  const isRowActive = (mod) => {
    const r = perms[mod];
    return r && (r.can_view || r.can_create || r.can_update || r.can_delete || r.can_filter || r.show_in_menu);
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const permissions = ALL_MODULES.map(m => ({ module: m.code, ...perms[m.code] }));
      await RbacService.updateRolePermissions({ role_code: selectedRole, permissions });
      setDirty(false);
      setAlert(prev => ({ ...prev, error: false, errorList: [] }));
      showAlert('Permissions saved successfully. Changes take effect immediately.');
    } catch (err) {
      setAlert(prev => ({ ...prev, error: true, errorList: [] }));
      showAlert(err?.response?.data?.error || 'Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <DialogComponent open={open} handleClose={handleClose} message={alert.message} errorList={alert.errorList} />

      <Grid container spacing={gridSpacing}>
        {(loading || saving) && (
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}

        <Grid item xs={12} className={(loading || saving) ? 'loading' : 'not-loading'}>
          <MainCard title="Role-Based Access Management">

            {/* Role selector */}
            <Grid container spacing={2} style={{ marginBottom: 20 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  select fullWidth variant="outlined" margin="normal"
                  label="Select Role to Configure"
                  id="rbac-role-select"
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                >
                  <MenuItem value="" disabled><em>— choose a role —</em></MenuItem>
                  {roles.map(r => (
                    <MenuItem key={r.code} value={r.code}>
                      {r.display_name} {r.is_builtin ? '(built-in)' : ''}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {selectedRole && (
                <Grid item xs={12} md={8} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {dirty && (
                    <span style={{
                      padding: '4px 12px', borderRadius: 12,
                      backgroundColor: '#fff3e0', color: '#e65100', fontSize: 13
                    }}>
                      ⚠ Unsaved changes
                    </span>
                  )}
                </Grid>
              )}
            </Grid>

            {/* Permissions matrix */}
            {!selectedRole ? (
              <p style={{ color: '#9e9e9e', textAlign: 'center', padding: '40px 0' }}>
                Please select a role above to view and configure its module permissions.
              </p>
            ) : (
              <form onSubmit={handleSave}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th style={{ ...thStyle, minWidth: 200, textAlign: 'left' }}>Module</th>
                        {PERM_FLAGS.map(f => (
                          <th key={f} style={{ ...thStyle, textAlign: 'center' }}>{PERM_LABELS[f]}</th>
                        ))}
                        <th style={{ ...thStyle, minWidth: 140, textAlign: 'center' }}>Data Scope</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>All</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ALL_MODULES.map(mod => {
                        const row = perms[mod.code] || defaultRow();
                        const active = isRowActive(mod.code);
                        return (
                          <tr
                            key={mod.code}
                            style={{
                              borderBottom: '1px solid #f0f0f0',
                              backgroundColor: active ? 'rgba(25,118,210,0.03)' : undefined,
                            }}
                          >
                            <td style={{ ...tdStyle, paddingLeft: 12 }}>
                              <div style={{ fontWeight: active ? 600 : 400 }}>{mod.label}</div>
                              <div style={{ fontSize: 11, color: '#9e9e9e', fontFamily: 'monospace' }}>{mod.code}</div>
                            </td>

                            {PERM_FLAGS.map(flag => (
                              <td key={flag} style={{ ...tdStyle, textAlign: 'center', padding: 4 }}>
                                <Checkbox
                                  size="small"
                                  checked={!!row[flag]}
                                  onChange={() => toggleFlag(mod.code, flag)}
                                  id={`perm-${mod.code}-${flag}`}
                                  color="primary"
                                />
                              </td>
                            ))}

                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <TextField
                                select size="small" variant="standard"
                                value={row.data_scope || 'none'}
                                onChange={e => setScope(mod.code, e.target.value)}
                                id={`scope-${mod.code}`}
                                InputProps={{ disableUnderline: true }}
                                style={{ fontSize: 13, minWidth: 120 }}
                              >
                                {DATA_SCOPES.map(s => (
                                  <MenuItem key={s.value} value={s.value} style={{ fontSize: 13 }}>
                                    {s.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </td>

                            <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <Switch
                                size="small"
                                checked={active}
                                onChange={e => toggleRow(mod.code, e.target.checked)}
                                id={`toggle-${mod.code}`}
                                color="primary"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid-item-button-div" style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <Button
                    type="submit" variant="contained" color="primary"
                    disabled={saving || !dirty}
                    id="rbac-save-permissions-btn"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button" variant="outlined" color="secondary"
                    onClick={() => loadPermissions(selectedRole)}
                    disabled={saving || !dirty}
                  >
                    Discard Changes
                  </Button>
                </div>
              </form>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

const thStyle = { padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' };
const tdStyle = { padding: '8px 4px' };

export default PermissionManagement;
