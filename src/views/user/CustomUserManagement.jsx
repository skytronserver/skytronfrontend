// CustomUserManagement.jsx — uses the project's existing form/card/dialog pattern
import { useEffect, useState, useCallback } from 'react';
import {
  Grid, Button, CircularProgress, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import DialogComponent from '../../ui-component/DialogComponent';
import { gridSpacing, FILE_SIZE, SUPPORTED_FORMATS } from '../../store/constant';
import { Formik } from 'formik';
import * as Yup from 'yup';
import FormField from '../../ui-component/CustomTextField';
import RbacService from '../../services/RbacService';
import { indianStates } from '../../formjson/indianState';
import { customUserInitialValues, customUserFields } from '../../formjson/customUser';
import '../../views/forms/form.css';

// ─── Helper: build validation schema from field config ────────────────────────
const buildValidationSchema = (fields) =>
  Yup.object(
    Object.keys(fields).reduce((acc, key) => {
      if (fields[key].validation) acc[key] = fields[key].validation;
      return acc;
    }, {})
  );

// ─── Main component ────────────────────────────────────────────────────────────
const CustomUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 25;

  // Alert dialog
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ error: false, message: '', errorList: [] });

  // Form visibility
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editInitialValues, setEditInitialValues] = useState(customUserInitialValues);
  const [formLoading, setFormLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  // Role-change quick dialog
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [roleChangeSaving, setRoleChangeSaving] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  // Dynamic field config with loaded roles + states
  const [fieldConfig, setFieldConfig] = useState(customUserFields);
  const validationSchema = buildValidationSchema(fieldConfig);

  // ── Load roles and states ────────────────────────────────────────────────
  useEffect(() => {
    RbacService.listActiveRoles()
      .then(res => {
        const roleList = (res.data?.roles || []).map(r => ({ value: r.code, label: r.display_name }));
        setRoles(roleList);
        setFieldConfig(prev => ({
          ...prev,
          role_code: { ...prev.role_code, options: roleList },
          address_State: { ...prev.address_State, options: indianStates },
        }));
      })
      .catch(() => showAlert('Failed to load roles.'));
  }, []);

  // ── Fetch users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (filterRole) params.role_code = filterRole;
      const res = await RbacService.listCustomUsers(params);
      setUsers(res.data?.users || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      showAlert(err?.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, filterRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showAlert = (message) => { setAlert(prev => ({ ...prev, message })); setOpen(true); };
  const handleClose = () => setOpen(false);

  const handleFileChange = (event, formik) => {
    const file = event.currentTarget.files[0];
    const fieldName = event.target.name;
    if (file) {
      if (file.size > FILE_SIZE) {
        formik.setFieldError(fieldName, 'File size must be under 512 KB');
      } else if (!SUPPORTED_FORMATS.includes(file.type)) {
        formik.setFieldError(fieldName, 'Only PDF, JPG, PNG supported');
      } else {
        formik.setFieldValue(fieldName, file);
      }
    }
  };

  // ── Create user ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setIsEdit(false);
    setEditInitialValues(customUserInitialValues);
    setShowResend(false);
    setShowForm(true);
  };

  // ── Edit user ────────────────────────────────────────────────────────────
  const openEdit = (user) => {
    setIsEdit(true);
    setEditInitialValues({
      user_id: user.id,
      name: user.name || '',
      mobile: user.mobile || '',
      email: user.email || '',
      dob: user.dob || '',
      address: user.address || '',
      address_pin: user.address_pin || '',
      address_State: user.address_State || '',
      id_card_name: user.id_card_name || '',
      file_id_card: null,
      file_authorisation_letter: null,
      role_code: user.role || '',
    });
    setShowResend(false);
    setShowForm(true);
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setFormLoading(true);
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') fd.append(k, v);
    });
    try {
      if (isEdit) {
        await RbacService.updateCustomUser(fd);
        setAlert(prev => ({ ...prev, error: false, errorList: [] }));
        showAlert(`User '${values.name}' updated successfully.`);
      } else {
        await RbacService.createCustomUser(fd);
        setAlert(prev => ({ ...prev, error: false, errorList: [] }));
        showAlert(`User '${values.name}' created. OTP / activation link sent.`);
        setShowResend(true);
      }
      fetchUsers();
    } catch (err) {
      setAlert(prev => ({ ...prev, error: true, errorList: [] }));
      showAlert(err?.response?.data?.error || err?.response?.data?.detail || 'Operation failed.');
      setShowResend(false);
    } finally {
      setSubmitting(false);
      setFormLoading(false);
    }
  };

  // ── Quick role change ────────────────────────────────────────────────────
  const openRoleChange = (user) => {
    setRoleChangeUser(user);
    setNewRole(user.role || '');
    setShowRoleChange(true);
  };

  const handleRoleChange = async () => {
    if (!newRole || newRole === roleChangeUser.role) { setShowRoleChange(false); return; }
    setRoleChangeSaving(true);
    try {
      await RbacService.assignUserRole({ user_id: roleChangeUser.id, role_code: newRole });
      setAlert(prev => ({ ...prev, error: false, errorList: [] }));
      showAlert(`Role changed for ${roleChangeUser.name} successfully.`);
      setShowRoleChange(false);
      fetchUsers();
    } catch (err) {
      setAlert(prev => ({ ...prev, error: true, errorList: [] }));
      showAlert(err?.response?.data?.error || 'Role change failed.');
    } finally {
      setRoleChangeSaving(false);
    }
  };

  // ── Filtered display ─────────────────────────────────────────────────────
  const displayedUsers = search
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.mobile?.includes(search) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <DialogComponent open={open} handleClose={handleClose} message={alert.message} errorList={alert.errorList} />

      <Grid container spacing={gridSpacing}>
        {loading && (
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}

        {/* ── Users List ── */}
        <Grid item xs={12} className={loading ? 'loading' : 'not-loading'}>
          <MainCard
            title="Custom User Management"
            secondary={
              <Button variant="contained" color="primary" onClick={openCreate} id="cu-create-user-btn">
                + Create Custom User
              </Button>
            }
          >
            {/* Filters */}
            <Grid container spacing={2} style={{ marginBottom: 16 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth size="small" variant="outlined" label="Search"
                  placeholder="Name / Email / Mobile"
                  value={search} onChange={e => setSearch(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select fullWidth size="small" variant="outlined" label="Filter by Role"
                  id="cu-filter-role"
                  value={filterRole}
                  onChange={e => { setFilterRole(e.target.value); setPage(1); }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4} style={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="outlined" onClick={fetchUsers} size="small">Refresh</Button>
              </Grid>
            </Grid>

            {/* Users table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Mobile</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#9e9e9e' }}>
                        {loading ? 'Loading…' : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    displayedUsers.map((user, idx) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={tdStyle}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td style={tdStyle}><strong>{user.name}</strong></td>
                        <td style={tdStyle}>{user.mobile}</td>
                        <td style={{ ...tdStyle, color: '#757575' }}>{user.email}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                            backgroundColor: '#e3f2fd', color: '#1565c0', fontSize: 12,
                          }}>
                            {user.role_label || user.role}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                            backgroundColor: user.is_active ? '#e8f5e9' : '#f5f5f5',
                            color: user.is_active ? '#2e7d32' : '#9e9e9e', fontSize: 12,
                          }}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, display: 'flex', gap: 8 }}>
                          <Button size="small" variant="outlined" onClick={() => openEdit(user)} id={`cu-edit-${user.id}`}>
                            Edit
                          </Button>
                          <Button size="small" variant="outlined" color="secondary" onClick={() => openRoleChange(user)} id={`cu-role-${user.id}`}>
                            Change Role
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Button size="small" variant="outlined" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span style={{ lineHeight: '32px', fontSize: 13, color: '#757575' }}>
                Page {page} — {total} total
              </span>
              <Button size="small" variant="outlined" disabled={page * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </MainCard>
        </Grid>

        {/* ── Create / Edit Form ── */}
        <Dialog open={showForm} onClose={() => { if (!formLoading) { setShowForm(false); setShowResend(false); } }} maxWidth="md" fullWidth>
          <DialogTitle>{isEdit ? 'Edit Custom User' : 'Create Custom User'}</DialogTitle>
          <DialogContent dividers>
            {formLoading && (
              <div className="spinner-div">
                <CircularProgress className="circular-progress" size={50} />
              </div>
            )}
            <Formik
              initialValues={editInitialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit} id="custom-user-form">
                  <Grid container spacing={2} className="form-controller" style={{ paddingTop: 8 }}>
                    {Object.keys(fieldConfig).map(field => {
                      if (field === 'user_id') return null;
                      return (
                        <Grid key={field} item md={6} sm={12} xs={12}>
                          <FormField
                            fieldConfig={fieldConfig[field]}
                            formik={formik}
                            handleFileChange={handleFileChange}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </form>
              )}
            </Formik>
          </DialogContent>
          <DialogActions style={{ padding: '16px 24px' }}>
            <Button
              type="button" variant="outlined"
              onClick={() => { setShowForm(false); setShowResend(false); }}
              disabled={formLoading}
            >
              Cancel
            </Button>
            {showResend && (
              <Button
                type="button" variant="outlined" color="secondary"
                disabled={formLoading}
                onClick={() => {
                  setShowResend(false);
                  openCreate();
                }}
              >
                Create Another
              </Button>
            )}
            <Button
              type="submit" form="custom-user-form" variant="contained" color="primary"
              disabled={formLoading}
              id="cu-save-user-btn"
            >
              {isEdit ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Quick Role-Change Form ── */}
        <Dialog open={showRoleChange} onClose={() => !roleChangeSaving && setShowRoleChange(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Change Role — {roleChangeUser?.name}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} style={{ paddingTop: 8 }}>
              <Grid item xs={12}>
                <TextField
                  select fullWidth variant="outlined" margin="normal"
                  label="New Role"
                  id="rc-role-select"
                  value={newRole}
                  onChange={e => setNewRole(e.target.value)}
                >
                  {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions style={{ padding: '16px 24px' }}>
            <Button
              variant="outlined"
              onClick={() => setShowRoleChange(false)}
              disabled={roleChangeSaving}
            >
              Cancel
            </Button>
            <Button
              variant="contained" color="primary"
              onClick={handleRoleChange}
              disabled={roleChangeSaving || !newRole || newRole === roleChangeUser?.role}
              id="rc-save-btn"
            >
              {roleChangeSaving ? 'Saving…' : 'Change Role'}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
};

const thStyle = { padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px' };

export default CustomUserManagement;
