import React, { useEffect, useState } from 'react';
import HomePageService from 'services/HomePage';
import Grid from '@mui/material/Grid';
import {
  Card, CardContent, Typography, TextField, Button, Box,
  Chip, CircularProgress, Paper, Tooltip, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { gridSpacing } from '../../store/constant';
import MainCard from '../../ui-component/cards/MainCard';

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatDT = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });
};

/**
 * Parse a raw AIS-140 packet.
 * Handles both Login Packets ($HLM...) and GPS/PVT packets ($,PVT,...)
 * Extracts IMEI and other fields where available.
 */
const parsePacket = (rawData = '') => {
  try {
    const parts = rawData.split(',');
    const firstToken = (parts[0] || '').replace('$', '').trim().toUpperCase();
    const secondToken = (parts[1] || '').trim().toUpperCase();

    // Handle AIS-140 Login packet: $LGN,VehicleReg,IMEI,ICCID,Firmware,Protocol,...
    if (firstToken === 'LGN' || firstToken === 'HLM' || firstToken === 'HLT' || firstToken === 'NML') {
      const isLGN = firstToken === 'LGN';
      return {
        packetType: firstToken,
        vendorId: '—',
        firmware: isLGN ? (parts[4] || '—') : (parts[2] || '—'),
        protocolVersion: isLGN ? (parts[5] || '—') : '—',
        imei: isLGN ? (parts[2] || '—') : (parts[3] || '—'),
        iccid: isLGN ? (parts[3] || '—') : '—',
        vehicleName: isLGN ? (parts[1] || '—') : (parts[4] || '—').replace(/\*.*$/, '').trim(),
        latitude: '—',
        longitude: '—',
      };
    }

    /**
     * Real AIS-140 PVT Packet format (confirmed from live API data):
     * $  , PVT , VendorID , Firmware , Protocol , Alert , VehicleStatus , IMEI     , VehicleReg , GPSFix , Date     , Time   , Lat       , LatDir , Lon       , LonDir
     * [0]  [1]   [2]        [3]        [4]        [5]     [6]             [7]         [8]          [9]      [10]       [11]    [12]         [13]    [14]         [15]
     * e.g: $  , PVT , MAPW , 04.03.01 , NR , 01 , L , 866192070567043 , AA00AA7043 , 1 , 28072026 , 075805 , 26.193016 , N , 91.752907 , E , ...
     */
    const packetType      = secondToken || firstToken || 'GPS';
    const vendorId        = parts[2] || '—';       // e.g. 'MAPW', 'DTPL'
    const firmware        = parts[3] || '—';       // e.g. '04.03.01', '1.1.1'
    const protocolVersion = parts[4] || '—';       // e.g. 'NR'
    const imei            = parts[7] || '—';       // 15-digit IMEI
    const vehicleName     = parts[8] || '—';       // Vehicle Reg No e.g. 'AA00AA7043'
    const iccid           = '—';                   // Not present in PVT packets

    // Lat at index 12 (already decimal degrees), Lon at index 14
    const rawLat = parts[12] || '';
    const latDir = parts[13] || '';
    const rawLon = parts[14] || '';
    const lonDir = parts[15] || '';

    const toDeg = (raw, dir) => {
      if (!raw || raw === 'NA' || raw === '0.000000' || raw === '0') return '—';
      const val = parseFloat(raw);
      if (isNaN(val) || val === 0) return '—';
      let decimal = +val.toFixed(6);
      if (dir === 'S' || dir === 'W') decimal = -decimal;
      return decimal;
    };

    const latitude  = toDeg(rawLat, latDir);
    const longitude = toDeg(rawLon, lonDir);

    return { packetType, vendorId, firmware, protocolVersion, imei, iccid, vehicleName, latitude, longitude };
  } catch {
    return { packetType: '—', vendorId: '—', firmware: '—', protocolVersion: '—', imei: '—', iccid: '—', vehicleName: '—', latitude: '—', longitude: '—' };
  }
};


// ─── Columns ──────────────────────────────────────────────────────────────────
const columns = [
  {
    field: 'timestamp',
    headerName: 'Login Timestamp',
    width: 180, minWidth: 170, flex: 1.2,
    valueFormatter: (p) => formatDT(p.value),
  },
  {
    field: 'imei',
    headerName: 'IMEI',
    width: 170, minWidth: 160, flex: 1,
  },
  {
    field: 'iccid',
    headerName: 'ICCID',
    width: 200, flex: 1.2,
    renderCell: (p) => (
      <Tooltip title={p.value || ''}>
        <span style={{ fontFamily: 'monospace', fontSize: 11 }}>
          {p.value || '—'}
        </span>
      </Tooltip>
    ),
  },
  {
    field: 'vehicleName',
    headerName: 'Vehicle Reg No',
    width: 160, minWidth: 130, flex: 1,
  },
  {
    field: 'firmware',
    headerName: 'Firmware Version',
    width: 140, minWidth: 120, flex: 0.9,
    renderCell: (p) => (
      <Chip
        label={p.value || '—'}
        size="small"
        variant="outlined"
        color={p.value && p.value !== '—' ? 'primary' : 'default'}
        sx={{ fontWeight: 600, fontSize: 11 }}
      />
    ),
  },
  {
    field: 'protocolVersion',
    headerName: 'Protocol Version',
    width: 140, minWidth: 120, flex: 0.9,
    renderCell: (p) => (
      <Chip
        label={p.value || '—'}
        size="small"
        variant="outlined"
        color={p.value && p.value !== '—' ? 'secondary' : 'default'}
        sx={{ fontWeight: 600, fontSize: 11 }}
      />
    ),
  },
  {
    field: 'latitude',
    headerName: 'Latitude',
    width: 120, flex: 0.8,
    valueFormatter: (p) => (p.value && p.value !== '—') ? p.value : '—',
  },
  {
    field: 'longitude',
    headerName: 'Longitude',
    width: 120, flex: 0.8,
    valueFormatter: (p) => (p.value && p.value !== '—') ? p.value : '—',
  },
  {
    field: 'vendorId',
    headerName: 'Vendor ID',
    width: 120, flex: 0.8,
  },
  {
    field: 'packetType',
    headerName: 'Packet Type',
    width: 110, flex: 0.7,
    renderCell: (p) => (
      <Chip label={p.value || '—'} size="small" color="default" sx={{ fontWeight: 600 }} />
    ),
  },
  {
    field: 'rawData',
    headerName: 'Raw Packet',
    width: 260, flex: 2,
    renderCell: (p) => (
      <Tooltip title={p.value || ''}>
        <span style={{
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', display: 'block', maxWidth: 250,
          fontFamily: 'monospace', fontSize: 11
        }}>
          {p.value || '—'}
        </span>
      </Tooltip>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const DeviceLoginHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0 });

  // ── Fetch & Parse ─────────────────────────────────────────────────────────
  const fetchData = async (search = '') => {
    setLoading(true);
    try {
      const response = await HomePageService.getGpsDataLog({ search });
      const responseData = response?.data;

      // Handle different response shapes from the API
      let parsed = [];
      if (responseData?.data && typeof responseData.data === 'string') {
        // Shape: { data: "[{...}]" } — JSON string
        parsed = JSON.parse(responseData.data);
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        // Shape: { data: [...] } — already an array
        parsed = responseData.data;
      } else if (Array.isArray(responseData)) {
        // Shape: direct array
        parsed = responseData;
      } else if (typeof responseData === 'string') {
        parsed = JSON.parse(responseData);
      } else {
        console.warn('Unexpected response shape:', responseData);
        setRows([]);
        return;
      }

      // Show ALL records — no strict login-packet filter
      const transformed = parsed.map((item) => {
        const { packetType, vendorId, firmware, protocolVersion, imei, iccid, vehicleName, latitude, longitude } =
          parsePacket(item.fields?.raw_data || '');
        return {
          id: item.pk,
          timestamp: item.fields?.timestamp,
          rawData: item.fields?.raw_data,
          packetType,
          vendorId,
          firmware,
          protocolVersion,
          imei,
          iccid,
          vehicleName,
          latitude,
          longitude,
        };
      });

      setRows(transformed);
      setStats({ total: transformed.length });
    } catch (err) {
      console.error('Error fetching device login history:', err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchData(searchQuery); };
  const handleRefresh = () => fetchData(searchQuery);

  // ── CSV Export ─────────────────────────────────────────────────────────────
  const exportCSV = () => {
    if (!rows.length) return;
    const headers = ['Login Timestamp', 'IMEI', 'ICCID', 'Vehicle Reg No', 'Firmware Version', 'Protocol Version', 'Latitude', 'Longitude', 'Vendor ID', 'Packet Type', 'Raw Packet'];
    const csvRows = rows.map((r) => [
      formatDT(r.timestamp), r.imei, r.iccid, r.vehicleName,
      r.firmware, r.protocolVersion, r.latitude, r.longitude,
      r.vendorId, r.packetType, r.rawData,
    ]);
    const csv = [headers, ...csvRows].map((row) => row.map((f) => `"${f || ''}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device_login_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ─── UI ──────────────────────────────────────────────────────────────────
  return (
    <MainCard title="Device Login History">
      <Grid container spacing={gridSpacing}>


        {/* ── Search / Filter bar ───────────────────────────────────── */}
        <Grid item xs={12}>
          <Card elevation={1} sx={{ borderRadius: 2 }}>
            <CardContent>
              <form onSubmit={handleSearch}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Search by IMEI / Device Name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      variant="outlined"
                      size="small"
                      placeholder="e.g. 860123456789012"
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SearchIcon />}
                      disabled={loading}
                      sx={{ fontWeight: 700 }}
                    >
                      Search
                    </Button>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Refresh">
                      <IconButton onClick={handleRefresh} color="primary" disabled={loading}>
                        <RefreshIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  {rows.length > 0 && (
                    <Grid item>
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<DownloadIcon />}
                        onClick={exportCSV}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      >
                        Export CSV
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Data Table ────────────────────────────────────────────── */}
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Device Connection Records
                {rows.length > 0 && (
                  <Chip label={`${rows.length} records`} size="small" color="primary" sx={{ ml: 1.5, fontWeight: 700 }} />
                )}
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={28} />
                <Typography color="text.secondary">Loading login packets...</Typography>
              </Box>
            ) : (
              <Box sx={{
                height: 560, width: '100%',
                '& .MuiDataGrid-root': { border: 'none' },
                '& .MuiDataGrid-columnHeaders': { background: '#f8f9fa', fontWeight: 700 },
                '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
              }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={25}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  pagination
                  disableSelectionOnClick
                  getRowHeight={() => 'auto'}
                  sx={{
                    '& .MuiDataGrid-cell': { padding: '8px', alignItems: 'center' },
                    '& .MuiDataGrid-columnHeader': { padding: '8px' },
                  }}
                  components={{
                    NoRowsOverlay: () => (
                      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">
                          No device login packets found. Try adjusting your search.
                        </Typography>
                      </Box>
                    ),
                  }}
                />
              </Box>
            )}
          </Paper>
        </Grid>

      </Grid>
    </MainCard>
  );
};

export default DeviceLoginHistory;
