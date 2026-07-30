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
  IconButton,
  Box,
  Tab,
  Tabs,
  Autocomplete,
  Divider,
  Snackbar,
  Alert,
  Tooltip,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';

import { decipherEncryption } from '../../helper';
import WhitelistService from '../../services/WhitelistService';
import StockServices from '../../services/StockServices';

// Project imports
import PageHeader from '../../ui-component/cards/PageHeader';
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';

const WhitelistRequests = () => {
  // ----------------------------------------------------
  // Authentication & Role setup
  // ----------------------------------------------------
  const myDecipher = decipherEncryption('skytrack');
  const userData = sessionStorage.getItem('cookiesData') || localStorage.getItem('cookiesData');
  const parsedData = userData && userData.split('-').map((item) => myDecipher(item));
  const role = (parsedData && parsedData.length > 2 && parsedData[1]) || 'desk_ex';

  const isRequester = role === 'devicemanufacture' || role === 'dealer';
  const isEsimProvider = role === 'esimprovider';
  const isAdmin = role === 'superadmin' || role === 'stateadmin';

  // ----------------------------------------------------
  // Tabs & Layout States
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState(isAdmin ? 1 : 0);

  // ----------------------------------------------------
  // List Whitelist Requests States
  // ----------------------------------------------------
  const [requests, setRequests] = useState([]);
  const [requestsCount, setRequestsCount] = useState(0);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqPage, setReqPage] = useState(0);
  const [reqRowsPerPage, setReqRowsPerPage] = useState(10);

  // Filters for requests
  const [reqTypeFilter, setReqTypeFilter] = useState('');
  const [reqStatusFilter, setReqStatusFilter] = useState('');

  // ----------------------------------------------------
  // Active Whitelists States (Tab 1)
  // ----------------------------------------------------
  const [activeWhitelists, setActiveWhitelists] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [activeLoading, setActiveLoading] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [activeRowsPerPage, setActiveRowsPerPage] = useState(10);

  // Filters for active whitelists
  const [activeTypeFilter, setActiveTypeFilter] = useState('');
  const [activeStockIdFilter, setActiveStockIdFilter] = useState('');
  const [activeProviderIdFilter, setActiveProviderIdFilter] = useState('');

  // ----------------------------------------------------
  // Create Request Modal States
  // ----------------------------------------------------
  const [createOpen, setCreateOpen] = useState(false);
  const [submittingReq, setSubmittingReq] = useState(false);
  const [esimProviders, setEsimProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // Create Request Form fields
  const [requestType, setRequestType] = useState('add');
  const [deviceSelectionMode, setDeviceSelectionMode] = useState('all'); // 'all' or 'specific'
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [requesterRemarks, setRequesterRemarks] = useState('');

  // Entries build list
  const [entries, setEntries] = useState([{ whitelist_type: 'ip', value: '' }]);

  // ----------------------------------------------------
  // Approve/Deny Dialog States
  // ----------------------------------------------------
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState('approve'); // 'approve' or 'deny'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewReason, setReviewReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // ----------------------------------------------------
  // Fetching Data Logic
  // ----------------------------------------------------
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const fetchRequests = async () => {
    setReqLoading(true);
    try {
      const params = {
        page: reqPage + 1,
        page_size: reqRowsPerPage,
      };
      if (reqTypeFilter) params.request_type = reqTypeFilter;
      if (reqStatusFilter) params.status = reqStatusFilter;

      let res;
      if (isRequester) {
        res = await WhitelistService.listOwnRequests(params);
      } else if (isEsimProvider) {
        res = await WhitelistService.listEsimRequests(params);
      } else {
        // Fallback/Admin
        try {
          res = await WhitelistService.listEsimRequests(params);
        } catch {
          res = await WhitelistService.listOwnRequests(params);
        }
      }

      if (res && res.data) {
        setRequests(res.data.requests || []);
        setRequestsCount(res.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching whitelist requests:', err);
      if (err.response?.status !== 403) {
        showToast(err.response?.data?.error || 'Failed to load requests list.', 'error');
      }
    } finally {
      setReqLoading(false);
    }
  };

  const fetchActiveWhitelists = async () => {
    setActiveLoading(true);
    try {
      const params = {
        page: activePage + 1,
        page_size: activeRowsPerPage,
      };
      if (activeTypeFilter) params.whitelist_type = activeTypeFilter;
      if (activeStockIdFilter) params.device_stock_id = activeStockIdFilter;
      if (activeProviderIdFilter) params.esim_provider_id = activeProviderIdFilter;

      const res = await WhitelistService.listActiveWhitelist(params);
      if (res && res.data) {
        setActiveWhitelists(res.data.active_whitelists || []);
        setActiveCount(res.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching active whitelists:', err);
      showToast(err.response?.data?.error || 'Failed to load active whitelist entries.', 'error');
    } finally {
      setActiveLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await StockServices.getProviderList();
      if (res && res.data) {
        setEsimProviders(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  // Fetch devices for request selection based on selected eSIM provider
  const fetchDevicesForProvider = async (providerId) => {
    setLoadingDevices(true);
    try {
      const params = {
        esim_provider_id: providerId,
        page_size: 100
      };
      const res = await WhitelistService.deviceDashboard(params);
      if (res && res.data) {
        setAvailableDevices(res.data.devices || []);
      }
    } catch (err) {
      console.error('Error fetching devices for provider:', err);
      showToast('Failed to fetch devices for this eSIM provider.', 'warning');
    } finally {
      setLoadingDevices(false);
    }
  };

  // Trigger loading lists on tab change/filter/pagination change
  useEffect(() => {
    if (activeTab === 0) {
      fetchRequests();
    } else {
      fetchActiveWhitelists();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, reqPage, reqRowsPerPage, reqTypeFilter, reqStatusFilter, activePage, activeRowsPerPage, activeTypeFilter, activeStockIdFilter, activeProviderIdFilter]);

  // Load providers once on mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Fetch devices when eSIM provider changes in the Create Request Dialog
  useEffect(() => {
    if (selectedProvider && deviceSelectionMode === 'specific') {
      fetchDevicesForProvider(selectedProvider.id);
    } else {
      setAvailableDevices([]);
      setSelectedDevices([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvider, deviceSelectionMode]);

  // ----------------------------------------------------
  // Request Actions Handlers
  // ----------------------------------------------------
  const handleAddEntryRow = () => {
    setEntries([...entries, { whitelist_type: 'ip', value: '' }]);
  };

  const handleRemoveEntryRow = (index) => {
    const updated = entries.filter((_, idx) => idx !== index);
    setEntries(updated);
  };

  const handleEntryChange = (index, field, val) => {
    const updated = [...entries];
    updated[index][field] = val;
    setEntries(updated);
  };

  const handleOpenCreateModal = () => {
    setEntries([{ whitelist_type: 'ip', value: '' }]);
    setSelectedProvider(null);
    setRequestType('add');
    setDeviceSelectionMode('all');
    setSelectedDevices([]);
    setRequesterRemarks('');
    setCreateOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedProvider) {
      showToast('Please select an eSIM provider.', 'error');
      return;
    }

    const validEntries = entries.filter(e => e.value.trim() !== '');
    if (validEntries.length === 0) {
      showToast('Please add at least one entry with a non-empty value.', 'error');
      return;
    }

    const payload = {
      request_type: requestType,
      esim_provider_id: selectedProvider.id,
      entries: validEntries,
      device_stock_ids: deviceSelectionMode === 'all' ? 'all' : selectedDevices.map(d => d.id),
      requester_remarks: requesterRemarks
    };

    if (payload.device_stock_ids !== 'all' && payload.device_stock_ids.length === 0) {
      showToast('Please select at least one device or choose "All accessible devices".', 'error');
      return;
    }

    setSubmittingReq(true);
    try {
      await WhitelistService.createRequest(payload);
      showToast('Whitelist request submitted successfully!', 'success');
      setCreateOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Error submitting request:', err);
      showToast(err.response?.data?.error || 'Failed to submit request.', 'error');
    } finally {
      setSubmittingReq(false);
    }
  };

  // Approval/Denial actions
  const handleOpenReview = (request, action) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewReason('');
    setReviewOpen(true);
  };

  const handleSubmitReview = async () => {
    if (reviewAction === 'deny' && !reviewReason.trim()) {
      showToast('A reason is mandatory when denying a request.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const id = selectedRequest.id;
      const payload = { reason: reviewReason };

      if (reviewAction === 'approve') {
        await WhitelistService.approveRequest(id, payload);
        showToast('Request approved successfully!', 'success');
      } else {
        await WhitelistService.denyRequest(id, payload);
        showToast('Request denied.', 'info');
      }

      setReviewOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Error reviewing request:', err);
      showToast(err.response?.data?.error || 'Failed to process request action.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Clean filters
  const handleResetFilters = () => {
    if (activeTab === 0) {
      setReqTypeFilter('');
      setReqStatusFilter('');
      setReqPage(0);
    } else {
      setActiveTypeFilter('');
      setActiveStockIdFilter('');
      setActiveProviderIdFilter('');
      setActivePage(0);
    }
  };

  // Status badges helper
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

  return (
    <Grid container spacing={gridSpacing}>
      {/* Title Header */}
      <Grid item xs={12}>
        <PageHeader title={isAdmin ? "Active Whitelisted Devices" : "Whitelist Requests & Verification"} />
      </Grid>

      {/* Tabs Selection */}
      <Grid item xs={12}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => {
            setActiveTab(val);
            handleResetFilters();
          }}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            mb: 1,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.95rem',
            }
          }}
        >
          {!isAdmin && <Tab label="Whitelist Requests" value={0} />}
          <Tab label="Active Whitelisted Entries" value={1} />
        </Tabs>
      </Grid>

      {/* ----------------- TAB 0: WHITELIST REQUESTS LIST ----------------- */}
      {activeTab === 0 && (
        <>
          {/* Filters MainCard */}
          <Grid item xs={12}>
            <MainCard title="Filters">
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Request Type"
                    value={reqTypeFilter}
                    onChange={(e) => {
                      setReqTypeFilter(e.target.value);
                      setReqPage(0);
                    }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="add">Add Whitelist</MenuItem>
                    <MenuItem value="remove">Remove Whitelist</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={reqStatusFilter}
                    onChange={(e) => {
                      setReqStatusFilter(e.target.value);
                      setReqPage(0);
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="denied">Denied</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FilterListIcon />}
                    onClick={handleResetFilters}
                    sx={{ textTransform: 'none' }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={fetchRequests}
                    sx={{ textTransform: 'none' }}
                  >
                    Refresh List
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>

          {/* Grid Table MainCard */}
          <Grid item xs={12}>
            <MainCard
              title="Whitelist Requests Register"
              secondary={
                isRequester ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateModal}
                    sx={{ textTransform: 'none', borderRadius: '8px' }}
                  >
                    New Whitelist Request
                  </Button>
                ) : null
              }
            >
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                {reqLoading && (
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                {!reqLoading && requests.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      No whitelist requests found.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Request ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Requester</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>eSim Provider</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Devices</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Whitelist Entries</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Created At</TableCell>
                          {isEsimProvider && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {requests.map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{ fontWeight: 'bold' }}>#{row.id}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.request_type ? row.request_type.toUpperCase() : ''}
                                color={row.request_type === 'add' ? 'primary' : 'secondary'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell>{renderStatusChip(row.status)}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{row.requested_by_name || 'N/A'}</Typography>
                              <Typography variant="caption" color="textSecondary">{row.requester_type}</Typography>
                            </TableCell>
                            <TableCell>{row.esim_provider_name || 'N/A'}</TableCell>
                            <TableCell>
                              <Tooltip title={row.device_stock_ids && Array.isArray(row.device_stock_ids) ? row.device_stock_ids.join(', ') : 'All Devices'}>
                                <Chip
                                  label={`${row.device_stock_count} Device(s)`}
                                  variant="outlined"
                                  size="small"
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {row.entries && row.entries.map((entry, idx) => (
                                  <Box key={entry.id || idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={entry.whitelist_type.toUpperCase()} size="small" variant="outlined" sx={{ height: '18px', fontSize: '0.65rem' }} />
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{entry.value}</Typography>
                                  </Box>
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>{row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'}</TableCell>
                            {isEsimProvider && (
                              <TableCell>
                                {row.status === 'pending' ? (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      variant="contained"
                                      color="success"
                                      size="small"
                                      startIcon={<CheckIcon />}
                                      onClick={() => handleOpenReview(row, 'approve')}
                                      sx={{ textTransform: 'none', borderRadius: '6px', px: 1 }}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="contained"
                                      color="error"
                                      size="small"
                                      startIcon={<CloseIcon />}
                                      onClick={() => handleOpenReview(row, 'deny')}
                                      sx={{ textTransform: 'none', borderRadius: '6px', px: 1 }}
                                    >
                                      Deny
                                    </Button>
                                  </Box>
                                ) : (
                                  <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                    Reviewed
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={requestsCount}
                      rowsPerPage={reqRowsPerPage}
                      page={reqPage}
                      onPageChange={(e, newPage) => setReqPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setReqRowsPerPage(parseInt(e.target.value, 10));
                        setReqPage(0);
                      }}
                    />
                  </>
                )}
              </TableContainer>
            </MainCard>
          </Grid>
        </>
      )}

      {/* ----------------- TAB 1: ACTIVE WHITELISTS LIST ----------------- */}
      {activeTab === 1 && (
        <>
          {/* Filters MainCard */}
          <Grid item xs={12}>
            <MainCard title="Filters">
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Whitelist Type"
                    value={activeTypeFilter}
                    onChange={(e) => {
                      setActiveTypeFilter(e.target.value);
                      setActivePage(0);
                    }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="ip">IP Address</MenuItem>
                    <MenuItem value="url">URL Domain</MenuItem>
                    <MenuItem value="phone">Phone Number</MenuItem>
                    <MenuItem value="apn">APN Gateway</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Device Stock ID"
                    value={activeStockIdFilter}
                    onChange={(e) => {
                      setActiveStockIdFilter(e.target.value);
                      setActivePage(0);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="eSim Provider ID"
                    value={activeProviderIdFilter}
                    onChange={(e) => {
                      setActiveProviderIdFilter(e.target.value);
                      setActivePage(0);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FilterListIcon />}
                    onClick={handleResetFilters}
                    sx={{ textTransform: 'none' }}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={fetchActiveWhitelists}
                    sx={{ textTransform: 'none' }}
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </MainCard>
          </Grid>

          {/* Grid list active whitelists */}
          <Grid item xs={12}>
            <MainCard title="Active Whitelist Database Register">
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                {activeLoading && (
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
                {!activeLoading && activeWhitelists.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      No active whitelisted entries found.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Device ESN</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>eSim Provider</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Source Request ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Activated At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeWhitelists.map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{ fontWeight: 'bold' }}>#{row.id}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace' }}>{row.device_esn}</TableCell>
                            <TableCell>
                              <Typography variant="body2">{row.esim_provider_name || 'N/A'}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={row.whitelist_type ? row.whitelist_type.toUpperCase() : ''}
                                variant="outlined"
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{row.value}</TableCell>
                            <TableCell>
                              <Chip
                                label={`Req #${row.source_request_id}`}
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setReqStatusFilter('');
                                  setReqTypeFilter('');
                                  setActiveTab(0);
                                }}
                                sx={{ cursor: 'pointer' }}
                              />
                            </TableCell>
                            <TableCell>{row.activated_at ? new Date(row.activated_at).toLocaleString() : 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={activeCount}
                      rowsPerPage={activeRowsPerPage}
                      page={activePage}
                      onPageChange={(e, newPage) => setActivePage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setActiveRowsPerPage(parseInt(e.target.value, 10));
                        setActivePage(0);
                      }}
                    />
                  </>
                )}
              </TableContainer>
            </MainCard>
          </Grid>
        </>
      )}

      {/* ----------------- DIALOG: CREATE NEW WHITELIST REQUEST ----------------- */}
      <Dialog open={createOpen} onClose={() => !submittingReq && setCreateOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ backgroundColor: '#0f172a', color: '#fff', fontWeight: 'bold' }}>
          Create Whitelist Request
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {/* Request type */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Request Operation"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                <MenuItem value="add">Add to Whitelist</MenuItem>
                <MenuItem value="remove">Remove from Whitelist</MenuItem>
              </TextField>
            </Grid>

            {/* Provider selection */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                size="small"
                options={esimProviders}
                getOptionLabel={(option) => option.company_name || option.name || `Provider ID: ${option.id}`}
                value={selectedProvider}
                onChange={(event, newValue) => {
                  setSelectedProvider(newValue);
                  setSelectedDevices([]);
                }}
                renderInput={(params) => <TextField {...params} label="eSim Provider" required />}
              />
            </Grid>

            {/* Device selection mode */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                size="small"
                label="Device Selection Scope"
                value={deviceSelectionMode}
                onChange={(e) => setDeviceSelectionMode(e.target.value)}
                disabled={!selectedProvider}
              >
                <MenuItem value="all">All Accessible Devices linked to Provider</MenuItem>
                <MenuItem value="specific">Select Specific Device Stocks</MenuItem>
              </TextField>
            </Grid>

            {/* Specific Device multi-select */}
            {deviceSelectionMode === 'specific' && (
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  size="small"
                  options={availableDevices}
                  loading={loadingDevices}
                  getOptionLabel={(option) => `${option.device_esn} (IMEI: ${option.imei})`}
                  value={selectedDevices}
                  onChange={(event, newValue) => setSelectedDevices(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Devices"
                      placeholder="Search Device ESN or IMEI"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingDevices ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                Whitelist Entries
              </Typography>
              {entries.map((entry, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <TextField
                    select
                    size="small"
                    sx={{ width: '150px' }}
                    value={entry.whitelist_type}
                    onChange={(e) => handleEntryChange(index, 'whitelist_type', e.target.value)}
                  >
                    <MenuItem value="ip">IP</MenuItem>
                    <MenuItem value="url">URL</MenuItem>
                    <MenuItem value="phone">Phone No</MenuItem>
                    <MenuItem value="apn">APN</MenuItem>
                  </TextField>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder={
                      entry.whitelist_type === 'ip'
                        ? 'e.g. 203.0.113.45'
                        : entry.whitelist_type === 'url'
                        ? 'e.g. tracking.server.com'
                        : entry.whitelist_type === 'phone'
                        ? 'e.g. +919876543210'
                        : 'e.g. m2m.airtel.com'
                    }
                    value={entry.value}
                    onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveEntryRow(index)}
                    disabled={entries.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddEntryRow}
                sx={{ textTransform: 'none', mt: 1 }}
              >
                Add Another Entry
              </Button>
            </Grid>

            {/* Remarks */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Requester Remarks / Justification"
                value={requesterRemarks}
                onChange={(e) => setRequesterRemarks(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={submittingReq}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitRequest}
            disabled={submittingReq}
          >
            {submittingReq ? <CircularProgress size={20} color="inherit" /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----------------- DIALOG: APPROVE / DENY REQUEST ----------------- */}
      <Dialog open={reviewOpen} onClose={() => !submittingReview && setReviewOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {reviewAction === 'approve' ? 'Approve Request' : 'Deny Request'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to <strong>{reviewAction}</strong> the whitelist request <strong>#{selectedRequest?.id}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={reviewAction === 'deny' ? 'Denial Reason (Mandatory)' : 'Approval Reason (Optional)'}
            value={reviewReason}
            onChange={(e) => setReviewReason(e.target.value)}
            required={reviewAction === 'deny'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)} disabled={submittingReview}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
            onClick={handleSubmitReview}
            disabled={submittingReview}
          >
            {submittingReview ? <CircularProgress size={20} color="inherit" /> : reviewAction.toUpperCase()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
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

export default WhitelistRequests;
