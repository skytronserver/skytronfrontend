import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";

import {
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsActiveIcon,
  Devices as DevicesIcon,
  WarningAmber as WarningAmberIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";

import ServerHealthService from "../../services/ServerHealthService";

const ALERT_TYPES = [
  "HarshAcceleration",
  "HarshBreak",
  "HarshTurn",
  "OverSpeed",
  "Route_overspeed",
];

const AlertStatsPage = () => {
  const [data, setData] = useState(null);

  const [range, setRange] = useState("this_week");
  const [selectedType, setSelectedType] = useState("");

  const [sortBy, setSortBy] = useState("alert_count");
  const [sortDir, setSortDir] = useState("desc");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAlertStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await ServerHealthService.getAlertStatsSummary({
        types: selectedType,
        range,
        sortBy,
        sortDir,
        page: page + 1,
        pageSize,
      });

      setData(response.data);
    } catch (err) {
      console.error("Alert statistics API error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load alert statistics."
      );
    } finally {
      setLoading(false);
    }
  }, [
    range,
    selectedType,
    sortBy,
    sortDir,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchAlertStats();
  }, [fetchAlertStats]);

  const handleRangeChange = (event) => {
    setRange(event.target.value);
    setPage(0);
  };

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setPage(0);
  };

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    setPage(0);
  };

  const handleSortDirChange = (event) => {
    setSortDir(event.target.value);
    setPage(0);
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getAlertCount = (type) => {
    if (!data?.devices) {
      return 0;
    }

    return data.devices.reduce((total, device) => {
      return total + Number(device?.[type] || 0);
    }, 0);
  };

  const getDisplayName = (type) => {
    const names = {
      HarshAcceleration: "Harsh Acceleration",
      HarshBreak: "Harsh Braking",
      HarshTurn: "Harsh Turn",
      OverSpeed: "Over Speed",
      Route_overspeed: "Route Overspeed",
    };

    return names[type] || type;
  };

  const getAlertIcon = (type) => {
    if (type === "OverSpeed" || type === "Route_overspeed") {
      return <SpeedIcon />;
    }

    if (type === "HarshAcceleration") {
      return <WarningAmberIcon />;
    }

    return <NotificationsActiveIcon />;
  };

  const totalAlerts = data?.devices?.reduce((total, device) => {
    return (
      total +
      data.types?.reduce((typeTotal, type) => {
        return typeTotal + Number(device?.[type] || 0);
      }, 0)
    );
  }, 0) || 0;

  const devices = data?.devices || [];

  return (
    <Box sx={{ p: 3 }}>
      {/* ───────────────── HEADER ───────────────── */}

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Alert Statistics
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Monitor device alerts and alert activity
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            loading ? (
              <CircularProgress size={18} />
            ) : (
              <RefreshIcon />
            )
          }
          onClick={fetchAlertStats}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {/* ───────────────── FILTERS ───────────────── */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Range</InputLabel>

                <Select
                  value={range}
                  label="Range"
                  onChange={handleRangeChange}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="this_week">
                    This Week
                  </MenuItem>
                  <MenuItem value="last_week">
                    Last Week
                  </MenuItem>
                  <MenuItem value="this_month">
                    This Month
                  </MenuItem>
                  <MenuItem value="last_month">
                    Last Month
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Alert Type</InputLabel>

                <Select
                  value={selectedType}
                  label="Alert Type"
                  onChange={handleTypeChange}
                >
                  <MenuItem value="">
                    All Alert Types
                  </MenuItem>

                  {ALERT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {getDisplayName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>

                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={handleSortByChange}
                >
                  <MenuItem value="alert_count">
                    Alert Count
                  </MenuItem>

                  <MenuItem value="device_count">
                    Device Count
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort Direction</InputLabel>

                <Select
                  value={sortDir}
                  label="Sort Direction"
                  onChange={handleSortDirChange}
                >
                  <MenuItem value="desc">
                    Highest First
                  </MenuItem>

                  <MenuItem value="asc">
                    Lowest First
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ───────────────── ERROR ───────────────── */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ───────────────── SUMMARY CARDS ───────────────── */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Devices
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ mt: 1 }}
                  >
                    {data?.total_devices ?? 0}
                  </Typography>
                </Box>

                <DevicesIcon
                  sx={{
                    fontSize: 42,
                    opacity: 0.7,
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Total Alerts
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ mt: 1 }}
                  >
                    {totalAlerts}
                  </Typography>
                </Box>

                <NotificationsActiveIcon
                  sx={{
                    fontSize: 42,
                    opacity: 0.7,
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Alert Types
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ mt: 1 }}
                  >
                    {data?.types?.length || 0}
                  </Typography>
                </Box>

                <WarningAmberIcon
                  sx={{
                    fontSize: 42,
                    opacity: 0.7,
                  }}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ───────────────── ALERT TYPE CARDS ───────────────── */}

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 2 }}
      >
        Alert Breakdown
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {(data?.types || ALERT_TYPES).map((type) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={type}>
            <Card>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    {getAlertIcon(type)}

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {getDisplayName(type)}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {getAlertCount(type)}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ───────────────── DEVICE TABLE ───────────────── */}

      <Card>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>
            Device Alert Statistics
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Device-wise alert count for{" "}
            {data?.range || range}
          </Typography>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Device</strong>
                </TableCell>

                {(data?.types || ALERT_TYPES).map((type) => (
                  <TableCell key={type} align="right">
                    <strong>{getDisplayName(type)}</strong>
                  </TableCell>
                ))}

                <TableCell align="right">
                  <strong>Total</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={(data?.types?.length || 5) + 2}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <CircularProgress />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 2 }}
                    >
                      Loading alert statistics...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : devices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={(data?.types?.length || 5) + 2}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <NotificationsActiveIcon
                      sx={{
                        fontSize: 48,
                        opacity: 0.3,
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{ mt: 1 }}
                    >
                      No alert data found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      There are no devices with alerts for
                      the selected period.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device, index) => {
                  const deviceTotal = (
                    data?.types || ALERT_TYPES
                  ).reduce(
                    (total, type) =>
                      total +
                      Number(device?.[type] || 0),
                    0
                  );

                  return (
                    <TableRow key={device.id || index}>
                      <TableCell>
                        {device.imei ||
                          device.device_imei ||
                          device.device_id ||
                          device.id ||
                          "-"}
                      </TableCell>

                      {(data?.types || ALERT_TYPES).map(
                        (type) => (
                          <TableCell
                            key={type}
                            align="right"
                          >
                            {Number(
                              device?.[type] || 0
                            )}
                          </TableCell>
                        )
                      )}

                      <TableCell align="right">
                        <strong>
                          {deviceTotal}
                        </strong>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={data?.total_devices || 0}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handlePageSizeChange}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* ───────────────── API INFO ───────────────── */}

      {data && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Data range:{" "}
            {data.date_from
              ? new Date(data.date_from).toLocaleString()
              : "-"}{" "}
            —{" "}
            {data.date_to
              ? new Date(data.date_to).toLocaleString()
              : "-"}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AlertStatsPage;