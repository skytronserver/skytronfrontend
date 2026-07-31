/* eslint-disable no-unused-vars */
// RoleManagement.jsx — uses the project's existing form/card/dialog pattern
import { useEffect, useState, useCallback } from 'react';
import { Grid, Button, CircularProgress, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import MainCard from '../../ui-component/cards/MainCard';
import DialogComponent from '../../ui-component/DialogComponent';
import { gridSpacing } from '../../store/constant';
import RbacService from '../../services/RbacService';
import '../../views/forms/form.css';

// ─── List sub-component ────────────────────────────────────────────────────────
const RoleRow = ({ role, onEdit }) => (
  <tr>
    <td>{role.code}</td>
    <td>{role.display_name}</td>
    <td>{role.description || '—'}</td>
    <td>{role.is_builtin ? 'Built-in' : 'Custom'}</td>
    <td>
      <span style={{
        display: 'inline-block', padding: '2px 10px', borderRadius: 12,
        backgroundColor: role.is_active ? '#e8f5e9' : '#f5f5f5',
        color: role.is_active ? '#2e7d32' : '#9e9e9e', fontSize: 12, fontWeight: 600,
      }}>
        {role.is_active ? 'Active' : 'Inactive'}
      </span>
    </td>
    <td>{role.module_count ?? '—'}</td>
    <td>
      {!role.is_builtin && (
        <Button size='small' variant='outlined' onClick={() => onEdit(role)}>
          Edit
        </Button>
      )}
    </td>
  </tr>
);

// ─── Main component ────────────────────────────────────────────────────────────
const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({ error: false, message: '', errorList: [] });

  // Form state (create / edit)
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ code: '', display_name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});

  // ── Fetch roles ──────────────────────────────────────────────────────────────
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RbacService.listAllRoles();
      setRoles(res.data?.roles || []);
    } catch (err) {
      showAlert(err?.response?.data?.error || 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showAlert = (message) => {
    setAlert(prev => ({ ...prev, message }));
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const openCreate = () => {
    setIsEdit(false);
    setForm({ code: '', display_name: '', description: '' });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (role) => {
    setIsEdit(true);
    setForm({ code: role.code, display_name: role.display_name, description: role.description || '' });
    setFormErrors({});
    setShowForm(true);
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!isEdit) {
      if (!form.code.trim()) errs.code = 'Role code is required.';
      else if (!/^[a-z0-9_]{1,20}$/.test(form.code))
        errs.code = 'Lowercase letters, numbers, underscores only. Max 20 chars.';
    }
    if (!form.display_name.trim()) errs.display_name = 'Display name is required.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setFormLoading(true);
    try {
      if (isEdit) {
        await RbacService.updateRole({
          role_code: form.code,
          display_name: form.display_name,
          description: form.description,
        });
        showAlert(`Role '${form.display_name}' updated successfully.`);
      } else {
        await RbacService.createRole({
          code: form.code,
          display_name: form.display_name,
          description: form.description,
        });
        showAlert(`Role '${form.code}' created successfully.`);
      }
      setShowForm(false);
      fetchRoles();
    } catch (err) {
      setAlert(prev => ({ ...prev, error: true, errorList: [] }));
      showAlert(err?.response?.data?.error || 'Operation failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (role) => {
    if (!window.confirm(`Are you sure you want to deactivate the role '${role.display_name}'?`)) return;
    setLoading(true);
    try {
      await RbacService.deactivateRole({ role_code: role.code });
      showAlert(`Role '${role.display_name}' deactivated successfully.`);
      fetchRoles();
    } catch (err) {
      setAlert(prev => ({ ...prev, error: true, errorList: [] }));
      showAlert(err?.response?.data?.error || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = search
    ? roles.filter(r => r.code.includes(search.toLowerCase()) || r.display_name.toLowerCase().includes(search.toLowerCase()))
    : roles;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <DialogComponent open={open} handleClose={handleClose} message={alert.message} errorList={alert.errorList} />

      <Grid container spacing={gridSpacing}>
        {loading && (
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}

        <Grid item xs={12} className={loading ? 'loading' : 'not-loading'}>
          <MainCard
            title="Custom Role Management"
            secondary={
              <Button variant="contained" color="primary" onClick={openCreate} id="rbac-create-role-btn">
                + Create Custom Role
              </Button>
            }
          >
            {/* Search */}
            <Grid container spacing={2} style={{ marginBottom: 16 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  variant="outlined"
                  label="Search Roles"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Roles table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                    <th style={thStyle}>Role Code</th>
                    <th style={thStyle}>Display Name</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Modules</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#9e9e9e' }}>
                        {loading ? 'Loading…' : 'No roles found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map(role => (
                      <tr key={role.code} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={tdStyle}>
                          <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>
                            {role.code}
                          </code>
                        </td>
                        <td style={tdStyle}><strong>{role.display_name}</strong></td>
                        <td style={{ ...tdStyle, color: '#757575' }}>{role.description || '—'}</td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                            backgroundColor: role.is_builtin ? '#e3f2fd' : '#f3e5f5',
                            color: role.is_builtin ? '#1565c0' : '#6a1b9a', fontSize: 12,
                          }}>
                            {role.is_builtin ? 'Built-in' : 'Custom'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: 12,
                            backgroundColor: role.is_active ? '#e8f5e9' : '#f5f5f5',
                            color: role.is_active ? '#2e7d32' : '#9e9e9e', fontSize: 12,
                          }}>
                            {role.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={tdStyle}>{role.module_count ?? '—'}</td>
                        <td style={tdStyle}>
                          {!role.is_builtin && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Button
                                size="small" variant="outlined"
                                onClick={() => openEdit(role)}
                                id={`edit-role-${role.code}`}
                              >
                                Edit
                              </Button>
                              {role.is_active && (
                                <Button
                                  size="small" variant="outlined" color="error"
                                  onClick={() => handleDeactivate(role)}
                                  id={`deactivate-role-${role.code}`}
                                >
                                  Deactivate
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </MainCard>
        </Grid>

        {/* Create / Edit Form */}
        <Dialog open={showForm} onClose={() => !formLoading && setShowForm(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{isEdit ? `Edit Role: ${form.code}` : 'Create Custom Role'}</DialogTitle>
          <DialogContent dividers>
            {formLoading && (
              <div className="spinner-div">
                <CircularProgress className="circular-progress" size={50} />
              </div>
            )}
            <form onSubmit={handleSubmit} id="role-form">
              <Grid container spacing={2} className="form-controller" style={{ paddingTop: 8 }}>
                {!isEdit && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      label="Role Code *"
                      id="rbac-role-code-input"
                      placeholder="e.g. field_inspector"
                      value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                      error={!!formErrors.code}
                      helperText={formErrors.code || 'Lowercase, underscores, max 20 chars'}
                      inputProps={{ maxLength: 20 }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Display Name *"
                    id="rbac-display-name-input"
                    placeholder="e.g. Field Inspector"
                    value={form.display_name}
                    onChange={e => setForm({ ...form, display_name: e.target.value })}
                    error={!!formErrors.display_name}
                    helperText={formErrors.display_name}
                  />
                </Grid>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="Description"
                    id="rbac-description-input"
                    placeholder="Optional description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>
          <DialogActions style={{ padding: '16px 24px' }}>
            <Button
              type="button" variant="outlined" color="secondary"
              onClick={() => setShowForm(false)} disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" form="role-form" variant="contained" color="primary" disabled={formLoading}>
              {isEdit ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </>
  );
};

const thStyle = { padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' };
const tdStyle = { padding: '10px 12px' };

export default RoleManagement;
