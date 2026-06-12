// RbacService.js — API calls for Dynamic RBAC
// Base URL: https://api.gromed.in/api
// All endpoints require Authorization: Bearer <token>

import { getAxiosInstance } from './axiosInstance';

// ─── ROLE MANAGEMENT ────────────────────────────────────────────────────────

/**
 * GET /api/rbac/roles/
 * List all roles (superadmin only)
 */
const listAllRoles = () => {
  return getAxiosInstance().get('/api/rbac/roles/');
};

/**
 * GET /api/rbac/modules/
 * List all modules
 */
const listModules = () => {
  return getAxiosInstance().get('/api/rbac/modules/');
};

/**
 * GET /api/rbac/roles/active/
 * List active roles — used for dropdowns (any authenticated user)
 */
const listActiveRoles = () => {
  return getAxiosInstance().get('/api/rbac/roles/active/');
};

/**
 * POST /api/rbac/roles/create/
 * Create a custom role (superadmin only)
 * @param {{ code: string, display_name: string, description?: string }} data
 */
const createRole = (data) => {
  return getAxiosInstance().post('/api/rbac/roles/create/', data);
};

/**
 * POST /api/rbac/roles/update/
 * Update role display_name / description (superadmin only)
 * @param {{ role_code: string, display_name?: string, description?: string }} data
 */
const updateRole = (data) => {
  return getAxiosInstance().post('/api/rbac/roles/update/', data);
};

/**
 * POST /api/rbac/roles/deactivate/
 * Soft-deactivate a custom role (superadmin only)
 * @param {{ role_code: string }} data
 */
const deactivateRole = (data) => {
  return getAxiosInstance().post('/api/rbac/roles/deactivate/', data);
};

// ─── MODULE PERMISSION MANAGEMENT ───────────────────────────────────────────

/**
 * GET /api/rbac/roles/permissions/?role_code=X
 * Get module permissions for a specific role (superadmin only)
 * @param {string} roleCode
 */
const getRolePermissions = (roleCode) => {
  return getAxiosInstance().get(`/api/rbac/roles/permissions/?role_code=${roleCode}`);
};

/**
 * POST /api/rbac/roles/permissions/update/
 * Create or update module permissions for a role (superadmin only)
 * @param {{ role_code: string, permissions: Array }} data
 */
const updateRolePermissions = (data) => {
  return getAxiosInstance().post('/api/rbac/roles/permissions/update/', data);
};

// ─── USER MANAGEMENT ────────────────────────────────────────────────────────

/**
 * GET /api/rbac/users/
 * List all custom users with role info (superadmin only)
 * Supports ?role_code=X&page=N&page_size=N
 * @param {{ role_code?: string, page?: number, page_size?: number }} params
 */
const listCustomUsers = (params = {}) => {
  return getAxiosInstance().get('/api/rbac/users/', { params });
};

/**
 * POST /api/rbac/users/create/
 * Create a new user with any role (superadmin only) — multipart/form-data for file uploads
 * @param {FormData} formData
 */
const createCustomUser = (formData) => {
  return getAxiosInstance().post('/api/rbac/users/create/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * POST /api/rbac/users/update/
 * Update an existing user's profile (superadmin only) — multipart/form-data
 * @param {FormData} formData
 */
const updateCustomUser = (formData) => {
  return getAxiosInstance().post('/api/rbac/users/update/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * POST /api/rbac/users/assign-role/
 * Quick role change without updating other fields (superadmin only)
 * @param {{ user_id: number, role_code: string }} data
 */
const assignUserRole = (data) => {
  return getAxiosInstance().post('/api/rbac/users/assign-role/', data);
};

// ─── ACCESS CHECK UTILITIES ──────────────────────────────────────────────────

/**
 * POST /api/check-user-access/
 * Full user profile + all permissions — useful on app start/refresh
 */
const checkUserAccess = () => {
  return getAxiosInstance().post('/api/check-user-access/');
};

/**
 * POST /api/check-module-access/
 * Check module permission for current user (single or batch)
 * @param {Object} data { module: 'code' } OR { modules: ['code1', 'code2'] }
 */
const checkModuleAccess = (data) => {
  return getAxiosInstance().post('/api/check-module-access/', data);
};

// ─── EXPORT ─────────────────────────────────────────────────────────────────

const RbacService = {
  listAllRoles,
  listModules,
  listActiveRoles,
  createRole,
  updateRole,
  deactivateRole,
  getRolePermissions,
  updateRolePermissions,
  listCustomUsers,
  createCustomUser,
  updateCustomUser,
  assignUserRole,
  checkUserAccess,
  checkModuleAccess,
};

export default RbacService;
