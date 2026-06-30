import React, { useEffect, useState } from 'react';
import {
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  CircularProgress,
  Box,
  Tab,
  Tabs,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

import { decipherEncryption } from '../../helper';
import WhitelistService from '../../services/WhitelistService';
import StockServices from '../../services/StockServices';

// Project imports
import PageHeader from '../../ui-component/cards/PageHeader';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';

const DeviceDashboard = () => {
  // ----------------------------------------------------
  // Authentication & Role setup
  // ----------------------------------------------------
  const myDecipher = decipherEncryption('skytrack');
  const userData = sessionStorage.getItem('cookiesData') || localStorage.getItem('cookiesData');
  const parsedData = userData && userData.split('-').map((item) => myDecipher(item));
  const role = (parsedData && parsedData.length > 2 && parsedData[1]) || 'desk_ex';

  const isEsimProvider = role === 'esimprovider';

  // ----------------------------------------------------
  // Dashboard Device List States
  // ----------------------------------------------------
  const [devices, setDevices] = useState([]);
  const [totalDevices, setTotalDevices] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [imeiQuery, setImeiQuery] = useState('');
  const [esnQuery, setEsnQuery] = useState('');
  const [iccidQuery, setIccidQuery] = useState('');
  const [msisdnQuery, setMsisdnQuery] = useState('');
  const [esimStatusFilter, setEsimStatusFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');
  const [kycStatusFilter, setKycStatusFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');

  // Providers list for filter dropdown
  const [providers, setProviders] = useState([]);

  // ----------------------------------------------------
  // Device Detail Dialog States
  // ----------------------------------------------------
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [detailTab, setDetailTab] = useState(0);

  // ----------------------------------------------------
  // KYC & Activation Update States
  // ----------------------------------------------------
  const [kycStatus, setKycStatus] = useState('active');
  const [lastKycDate, setLastKycDate] = useState('');
  const [kycRemarks, setKycRemarks] = useState('');
  const [newActivationStatus, setNewActivationStatus] = useState('');
  const [activationRemarks, setActivationRemarks] = useState('');
  const [updatingKyc, setUpdatingKyc] = useState(false);

  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // ----------------------------------------------------
  // Constants & Valid Statuses
  // ----------------------------------------------------
  const ACTIVATION_STATUSES = [
    { value: 'NotAssigned', label: 'Not Assigned' },
    { value: 'In_transit_to_dealer', label: 'In Transit to Dealer' },
    { value: 'Available_for_fitting', label: 'Available for Fitting' },
    { value: 'Fitted', label: 'Fitted' },
    { value: 'ESIM_Active_Req_Sent', label: 'eSIM Activation Req Sent' },
    { value: 'ESIM_Active_Confirmed', label: 'eSIM Activation Confirmed' },
    { value: 'ESIM_Active_Rejected', label: 'eSIM Activation Rejected' },
    { value: 'IP_PORT_Configured', label: 'IP/Port Configured' },
    { value: 'SOS_GATEWAY_NO_Configured', label: 'SOS Gateway Configured' },
    { value: 'SMS_GATEWAY_NO_Configured', label: 'SMS Gateway Configured' },
    { value: 'Device_Defective', label: 'Device Defective' },
    { value: 'Returned_to_manufacturer', label: 'Returned to Manufacturer' },
    { value: 'Device_Untagged', label: 'Device Untagged' }
  ];

  // ----------------------------------------------------
  // Fetching Logic
  // ----------------------------------------------------
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      if (imeiQuery.trim()) params.imei = imeiQuery.trim();
      if (esnQuery.trim()) params.esn = esnQuery.trim();
      if (iccidQuery.trim()) params.iccid = iccidQuery.trim();
      if (msisdnQuery.trim()) params.msisdn = msisdnQuery.trim();
      if (esimStatusFilter) params.esim_status = esimStatusFilter;
      if (stockStatusFilter) params.stock_status = stockStatusFilter;
      if (kycStatusFilter) params.kyc_status = kycStatusFilter;
      if (providerFilter) params.esim_provider_id = providerFilter;

      const res = await WhitelistService.deviceDashboard(params);
      if (res && res.data) {
        setDevices(res.data.devices || []);
        if (res.data.pagination) {
          setTotalDevices(res.data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard devices:', err);
      showToast(err.response?.data?.error || 'Failed to fetch devices dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await StockServices.getProviderList();
      if (res && res.data) {
        setProviders(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  const loadDeviceDetail = async (id) => {
    setDetailLoading(true);
    setDetailTab(0);
    try {
      const res = await WhitelistService.deviceDetail(id);
      if (res && res.data && res.data.device) {
        const dev = res.data.device;
        setSelectedDevice(dev);
        
        // Pre-fill KYC update fields
        setKycStatus(dev.kyc_status || 'active');
        if (dev.last_kyc_date) {
          try {
            setLastKycDate(new Date(dev.last_kyc_date).toISOString().slice(0, 16));
          } catch {
            setLastKycDate('');
          }
        } else {
          setLastKycDate(new Date().toISOString().slice(0, 16));
        }
        setKycRemarks(dev.kyc_remarks || '');
        setNewActivationStatus('');
        setActivationRemarks('');

        setDetailOpen(true);
      }
    } catch (err) {
      console.error('Error fetching device detail:', err);
      showToast(err.response?.data?.error || 'Failed to fetch device detail.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDevices();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
 fetchDevices();
  }, 10000); // 10 seconds

  return () => clearTimeout(timer);
 
}, [
  page,
  pageSize,
  sortBy,
  sortOrder,
  imeiQuery,
  esnQuery,
  iccidQuery,
  msisdnQuery,
  esimStatusFilter,
  stockStatusFilter,
  kycStatusFilter,
  providerFilter
]);

  const handleResetFilters = () => {
    setImeiQuery('');
    setEsnQuery('');
    setIccidQuery('');
    setMsisdnQuery('');
    setEsimStatusFilter('');
    setStockStatusFilter('');
    setKycStatusFilter('');
    setProviderFilter('');
    setPage(0);
    setTimeout(() => {
      fetchDevices();
    }, 50);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(0);
  };

  // ----------------------------------------------------
  // Submit KYC & eSIM status update
  // ----------------------------------------------------
  const handleUpdateKycSubmit = async () => {
    if (!selectedDevice) return;
    
    const hasKycUpdates = kycStatus || lastKycDate || kycRemarks;
    const hasActivationUpdates = newActivationStatus || activationRemarks;

    if (!hasKycUpdates && !hasActivationUpdates) {
      showToast('Provide at least one KYC field or a new Activation Status.', 'warning');
      return;
    }

    const payload = {};
    if (kycStatus) payload.kyc_status = kycStatus;
    if (lastKycDate) {
      payload.last_kyc_date = new Date(lastKycDate).toISOString();
    }
    if (kycRemarks) payload.kyc_remarks = kycRemarks;

    if (newActivationStatus) {
      payload.new_activation_status = newActivationStatus;
      if (activationRemarks) payload.activation_remarks = activationRemarks;
    }

    setUpdatingKyc(true);
    try {
      await WhitelistService.updateDeviceKyc(selectedDevice.id, payload);
      showToast('Device KYC and activation status updated successfully!', 'success');
      loadDeviceDetail(selectedDevice.id);
      fetchDevices();
    } catch (err) {
      console.error('Error updating KYC:', err);
      showToast(err.response?.data?.error || 'Failed to update device KYC status.', 'error');
    } finally {
      setUpdatingKyc(false);
    }
  };

  // ----------------------------------------------------
  // Badges and chips helpers
  // ----------------------------------------------------
  const renderStatusChip = (status) => {
    let color = 'default';
    if (status === 'approved') color = 'success';
    if (status === 'pending') color = 'warning';
    if (status === 'denied') color = 'error';

    return (
      <Chip
        label={status ? status.toUpperCase() : 'UNKNOWN'}
        color={color}
        size="small"
        sx={{ fontWeight: 'bold', minWidth: '85px' }}
      />
    );
  };

  const getKycChip = (status) => {
    if (status === 'active') return <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
    if (status === 'inactive') return <Chip label="INACTIVE" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
    return <Chip label="PENDING" color="default" size="small" sx={{ fontWeight: 'bold' }} />;
  };

  const getEsimStatusColor = (status) => {
    if (status === 'ESIM_Active_Confirmed') return 'success';
    if (status === 'ESIM_Active_Req_Sent') return 'warning';
    if (status === 'ESIM_Active_Rejected') return 'error';
    return 'default';
  };

  return (
    <Grid container spacing={gridSpacing}>
      {/* Page Header */}
      <Grid item xs={12}>
        <PageHeader title="Device Whitelist & Verification Dashboard" />
      </Grid>

      {/* Filter panel in MainCard */}
      <Grid item xs={12}>
        <MainCard title="Search & Filter">
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="IMEI"
                  placeholder="Partial IMEI search"
                  value={imeiQuery}
                  onChange={(e) => setImeiQuery(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="ESN"
                  placeholder="Partial ESN search"
                  value={esnQuery}
                  onChange={(e) => setEsnQuery(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="ICCID"
                  placeholder="Partial ICCID search"
                  value={iccidQuery}
                  onChange={(e) => setIccidQuery(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="MSISDN / Phone"
                  placeholder="Search phone number"
                  value={msisdnQuery}
                  onChange={(e) => setMsisdnQuery(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="eSim Status"
                  value={esimStatusFilter}
                  onChange={(e) => setEsimStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  {ACTIVATION_STATUSES.map(s => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Stock Status"
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Available_for_fitting">Available for Fitting</MenuItem>
                  <MenuItem value="Fitted">Fitted</MenuItem>
                  <MenuItem value="Device_Defective">Defective</MenuItem>
                  <MenuItem value="Returned_to_manufacturer">Returned</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="KYC Status"
                  value={kycStatusFilter}
                  onChange={(e) => setKycStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="eSim Provider"
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                >
                  <MenuItem value="">All Providers</MenuItem>
                  {providers.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.company_name || p.name || `Provider ID: ${p.id}`}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<FilterListIcon />}
                  onClick={handleResetFilters}
                  sx={{ textTransform: 'none', borderRadius: '8px' }}
                >
                  Reset Filters
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  sx={{ textTransform: 'none', borderRadius: '8px' }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
        </MainCard>
      </Grid>

      {/* Device List Table in MainCard */}
      <Grid item xs={12}>
        <MainCard title="Device Inventory Records">
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            {loading && (
              <Box sx={{ width: '100%', py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}
            {!loading && devices.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No devices found matching current filters.
                </Typography>
              </Box>
            ) : (
              <>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleSortChange('esn')}
                      >
                        Device ESN {sortBy === 'esn' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleSortChange('imei')}
                      >
                        IMEI {sortBy === 'imei' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleSortChange('iccid')}
                      >
                        ICCID {sortBy === 'iccid' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Phone Numbers</TableCell>
                      <TableCell
                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleSortChange('esim_status')}
                      >
                        eSim Status {sortBy === 'esim_status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleSortChange('stock_status')}
                      >
                        Stock Status {sortBy === 'stock_status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleSortChange('kyc_status')}
                      >
                        KYC Status {sortBy === 'kyc_status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Whitelists</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.id} hover>
                        <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{device.device_esn}</TableCell>
                        <TableCell>{device.imei}</TableCell>
                        <TableCell sx={{ fontFamily: 'monospace' }}>{device.iccid}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{device.msisdn1 || 'N/A'}</Typography>
                          {device.msisdn2 && <Typography variant="caption" color="textSecondary">{device.msisdn2}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={device.esim_status ? device.esim_status.toUpperCase() : 'UNKNOWN'}
                            color={getEsimStatusColor(device.esim_status)}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={device.stock_status || 'N/A'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{getKycChip(device.kyc_status)}</TableCell>
                        <TableCell>
                          <Tooltip
                            title={
                              <Box sx={{ p: 0.5 }}>
                                <Typography variant="caption" display="block">IPs: {device.active_whitelists?.ip?.length || 0}</Typography>
                                <Typography variant="caption" display="block">URLs: {device.active_whitelists?.url?.length || 0}</Typography>
                                <Typography variant="caption" display="block">Phones: {device.active_whitelists?.phone?.length || 0}</Typography>
                                <Typography variant="caption" display="block">APNs: {device.active_whitelists?.apn?.length || 0}</Typography>
                              </Box>
                            }
                          >
                            <Chip
                              label={`${device.active_whitelist_count || 0} Entries`}
                              size="small"
                              color={device.active_whitelist_count > 0 ? 'primary' : 'default'}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={isEsimProvider ? <EditIcon /> : <InfoIcon />}
                            onClick={() => loadDeviceDetail(device.id)}
                            sx={{ textTransform: 'none', borderRadius: '6px' }}
                          >
                            {isEsimProvider ? 'Manage' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[10, 20, 50]}
                  component="div"
                  count={totalDevices}
                  rowsPerPage={pageSize}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </>
            )}
          </TableContainer>
        </MainCard>
      </Grid>

      {/* ----------------- DIALOG: DEVICE TECHNICAL DETAIL & KYC UPDATE ----------------- */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        fullWidth
        maxWidth="md"
        sx={{ '& .MuiDialog-paper': { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ backgroundColor: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
              Device Details
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {getKycChip(selectedDevice?.kyc_status)}
            <Chip label={selectedDevice?.stock_status || 'N/A'} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Tabs header */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 1 }}>
            <Tabs value={detailTab} onChange={(e, val) => setDetailTab(val)}>
              <Tab label="General Info" />
              <Tab label={`Active Whitelists (${selectedDevice?.active_whitelist_count || 0})`} />
              <Tab label="Activation Logs" />
              <Tab label="Whitelist History" />
              {isEsimProvider && <Tab label="Update KYC / eSIM" />}
            </Tabs>
          </Box>

          <Box sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto' }}>
            {/* General Info Tab */}
            {detailTab === 0 && selectedDevice && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">IMEI</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedDevice.imei || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Electronic Serial Number (ESN)</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{selectedDevice.device_esn || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Primary ICCID</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedDevice.iccid || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Secondary ICCID</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>{selectedDevice.iccid2 || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Primary phone (MSISDN1)</Typography>
                  <Typography variant="body1">{selectedDevice.msisdn1 || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Secondary phone (MSISDN2)</Typography>
                  <Typography variant="body1">{selectedDevice.msisdn2 || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Primary Telecom Provider</Typography>
                  <Typography variant="body1">{selectedDevice.telecom_provider1 || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Secondary Telecom Provider</Typography>
                  <Typography variant="body1">{selectedDevice.telecom_provider2 || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">eSim Validity Expiry</Typography>
                  <Typography variant="body1">
                    {selectedDevice.esim_validity ? new Date(selectedDevice.esim_validity).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Device Created At</Typography>
                  <Typography variant="body1">
                    {selectedDevice.created ? new Date(selectedDevice.created).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Manufacturer Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {selectedDevice.manufacturer_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Assigned Dealer Name</Typography>
                  <Typography variant="body1">
                    {selectedDevice.dealer_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                    KYC Status Log
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">Last KYC Verification Date</Typography>
                  <Typography variant="body1">
                    {selectedDevice.last_kyc_date ? new Date(selectedDevice.last_kyc_date).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">KYC Checked By</Typography>
                  <Typography variant="body1">
                    {selectedDevice.kyc_updated_by_name || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">KYC Remarks</Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic', bgcolor: '#f8fafc', p: 1, borderRadius: '4px' }}>
                    {selectedDevice.kyc_remarks || 'No remarks provided.'}
                  </Typography>
                </Grid>
              </Grid>
            )}

            {/* Active Whitelists Tab */}
            {detailTab === 1 && selectedDevice && (
              <Box>
                {selectedDevice.active_whitelist_count === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    No active whitelisted entries found for this device.
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {['ip', 'url', 'phone', 'apn'].map((type) => {
                      const list = selectedDevice.active_whitelists?.[type] || [];
                      return (
                        <Grid item xs={12} key={type}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', pb: 0.5, mb: 1, textTransform: 'uppercase', color: 'primary.main' }}>
                            {type === 'ip' ? 'IP Addresses' : type === 'url' ? 'URL Domains' : type === 'phone' ? 'Phone Numbers' : 'APN Gateways'} ({list.length})
                          </Typography>
                          {list.length === 0 ? (
                            <Typography variant="caption" color="textSecondary" display="block" sx={{ fontStyle: 'italic', pl: 1 }}>
                              No items whitelisted.
                            </Typography>
                          ) : (
                            <Table size="small" sx={{ mb: 2 }}>
                              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Value</TableCell>
                                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Source Req</TableCell>
                                  <TableCell sx={{ py: 0.5, fontWeight: 'bold' }}>Activated At</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {list.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell sx={{ py: 0.5, fontFamily: 'monospace', fontWeight: 'bold' }}>{item.value}</TableCell>
                                    <TableCell sx={{ py: 0.5 }}>Req #{item.source_request_id}</TableCell>
                                    <TableCell sx={{ py: 0.5 }}>{item.activated_at ? new Date(item.activated_at).toLocaleString() : 'N/A'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            )}

            {/* Activation Logs Tab */}
            {detailTab === 2 && selectedDevice && (
              <Box>
                {!selectedDevice.activation_logs || selectedDevice.activation_logs.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    No activation history logged.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Changed By</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedDevice.activation_logs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Chip label={log.status} size="small" variant="outlined" color="primary" sx={{ fontWeight: 'bold' }} />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{log.changed_by_name || 'System'}</Typography>
                            </TableCell>
                            <TableCell>{log.changed_at ? new Date(log.changed_at).toLocaleString() : 'N/A'}</TableCell>
                            <TableCell sx={{ fontStyle: 'italic' }}>{log.remarks || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Whitelist History Tab */}
            {detailTab === 3 && selectedDevice && (
              <Box>
                {!selectedDevice.whitelist_request_history || selectedDevice.whitelist_request_history.length === 0 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                    No whitelist request history found for this device.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Request ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Requester</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Entries</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedDevice.whitelist_request_history.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell sx={{ fontWeight: 'bold' }}>#{req.id}</TableCell>
                            <TableCell>
                              <Chip
                                label={req.request_type ? req.request_type.toUpperCase() : ''}
                                color={req.request_type === 'add' ? 'primary' : 'secondary'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell>{renderStatusChip(req.status)}</TableCell>
                            <TableCell>
                              <Typography variant="body2">{req.requested_by_name || 'N/A'}</Typography>
                              <Typography variant="caption" color="textSecondary">{req.requester_type}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {req.entries && req.entries.map((entry, i) => (
                                  <Typography key={i} variant="caption" display="block">
                                    <strong>{entry.whitelist_type.toUpperCase()}:</strong> {entry.value}
                                  </Typography>
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>{req.created_at ? new Date(req.created_at).toLocaleString() : 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* KYC & Activation Update Panel (eSimProvider only) */}
            {detailTab === 4 && isEsimProvider && selectedDevice && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                  Update Device Verification & Status
                </Typography>
                <Grid container spacing={2} sx={{ pt: 1 }}>
                  {/* KYC Group */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      KYC Fields
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="KYC Verification Status"
                      value={kycStatus}
                      onChange={(e) => setKycStatus(e.target.value)}
                    >
                      <MenuItem value="active">Active (Verified)</MenuItem>
                      <MenuItem value="inactive">Inactive (Not Verified)</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="datetime-local"
                      label="Last KYC Date"
                      InputLabelProps={{ shrink: true }}
                      value={lastKycDate}
                      onChange={(e) => setLastKycDate(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="KYC Remarks"
                      value={kycRemarks}
                      onChange={(e) => setKycRemarks(e.target.value)}
                      placeholder="e.g. Physical verification completed at dealership."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Activation & eSIM Status Log (Optional)
                    </Typography>
                  </Grid>

                  {/* Activation Group */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="New Activation Status"
                      value={newActivationStatus}
                      onChange={(e) => setNewActivationStatus(e.target.value)}
                    >
                      <MenuItem value="">— Keep Current Status —</MenuItem>
                      {ACTIVATION_STATUSES.map(s => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Activation Remarks"
                      value={activationRemarks}
                      onChange={(e) => setActivationRemarks(e.target.value)}
                      placeholder="Remarks to log with activation change"
                      disabled={!newActivationStatus}
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateKycSubmit}
                      disabled={updatingKyc}
                    >
                      {updatingKyc ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setDetailOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default DeviceDashboard;
