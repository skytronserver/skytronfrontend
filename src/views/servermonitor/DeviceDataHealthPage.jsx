import React, { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  WarningAmber as WarningAmberIcon,
  Error as ErrorIcon,
  Memory as MemoryIcon,
  DataUsage as DataUsageIcon,
  AccessTime as AccessTimeIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Storage as StorageIcon,
  Sensors as SensorsIcon,
  LocalFireDepartment as EmergencyIcon,
  Login as LoginIcon,
} from "@mui/icons-material";

import ServerHealthService from "../../services/ServerHealthService";

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  login: {
    label: "Login",
    icon: <LoginIcon />,
  },

  health: {
    label: "Health",
    icon: <MemoryIcon />,
  },

  tracking: {
    label: "Tracking",
    icon: <DataUsageIcon />,
  },

  emergency: {
    label: "Emergency",
    icon: <EmergencyIcon />,
  },

  packet: {
    label: "Packet",
    icon: <StorageIcon />,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  available: {
    label: "Available",
    color: "success",
    icon: <CheckCircleIcon fontSize="small" />,
  },

  not_available: {
    label: "Not Available",
    color: "warning",
    icon: <WarningAmberIcon fontSize="small" />,
  },

  error: {
    label: "Error",
    color: "error",
    icon: <ErrorIcon fontSize="small" />,
  },

  failed: {
    label: "Failed",
    color: "error",
    icon: <CancelIcon fontSize="small" />,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const formatLabel = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: formatLabel(status),
      color: "default",
      icon: null,
    }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const DeviceDataHealthPage = () => {
  // ───────────────────────────────────────────────────────────────────────────
  // FORM STATE
  // ───────────────────────────────────────────────────────────────────────────

  const [imei, setImei] = useState("");

  const [protocolFormat, setProtocolFormat] =
    useState("");

  const [lookbackDays, setLookbackDays] =
    useState(3);

  // ───────────────────────────────────────────────────────────────────────────
  // FORMAT API STATE
  // ───────────────────────────────────────────────────────────────────────────

  const [formatOptions, setFormatOptions] =
    useState([]);

  const [currentServerFormat, setCurrentServerFormat] =
    useState("");

  const [formatsLoading, setFormatsLoading] =
    useState(false);

  const [formatsError, setFormatsError] =
    useState("");

  // ───────────────────────────────────────────────────────────────────────────
  // API STATE
  // ───────────────────────────────────────────────────────────────────────────

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ───────────────────────────────────────────────────────────────────────────
  // UI STATE
  // ───────────────────────────────────────────────────────────────────────────

  const [
    expandedCategories,
    setExpandedCategories,
  ] = useState({});

  const [showRawResponse, setShowRawResponse] =
    useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // LOAD PROTOCOL FORMATS
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const loadFormats = async () => {
      try {
        setFormatsLoading(true);
        setFormatsError("");

        const response =
          await ServerHealthService.getDeviceDataHealthFormats();

        console.log(
          "Device Data Health Formats:",
          response.data
        );

        const responseData = response.data;

        const options =
          responseData?.options || [];

        setFormatOptions(options);

        setCurrentServerFormat(
          responseData?.current_server_format || ""
        );

        /*
         * Automatically select the current server format.
         *
         * Example:
         * current_server_format = ARAI_2025
         *
         * Therefore dropdown will initially select
         * ARAI_2025.
         */
        if (responseData?.current_server_format) {
          setProtocolFormat(
            responseData.current_server_format
          );
        } else if (options.length > 0) {
          setProtocolFormat(
            options[0].value
          );
        }
      } catch (err) {
        console.error(
          "Device Data Health Formats API Error:",
          err
        );

        setFormatsError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Failed to load protocol formats."
        );
      } finally {
        setFormatsLoading(false);
      }
    };

    loadFormats();
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // SEARCH API
  // ───────────────────────────────────────────────────────────────────────────

  const handleSearch = async () => {
    const trimmedImei = imei.trim();

    if (!trimmedImei) {
      setError("Please enter an IMEI.");
      return;
    }

    if (!protocolFormat) {
      setError("Please select a protocol format.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setData(null);
      setExpandedCategories({});
      setShowRawResponse(false);

      const response =
        await ServerHealthService.lookupDeviceDataHealth(
          trimmedImei,
          protocolFormat,
          lookbackDays
        );

      console.log(
        "Device Data Health API Response:",
        response.data
      );

      setData(response.data);
    } catch (err) {
      console.error(
        "Device Data Health API Error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to fetch device data health."
      );
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // REFRESH
  // ───────────────────────────────────────────────────────────────────────────

  const handleRefresh = () => {
    if (imei.trim()) {
      handleSearch();
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // ENTER KEY
  // ───────────────────────────────────────────────────────────────────────────

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !loading
    ) {
      handleSearch();
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY TOGGLE
  // ───────────────────────────────────────────────────────────────────────────

  const toggleCategory = (category) => {
    setExpandedCategories((previous) => ({
      ...previous,
      [category]: !previous[category],
    }));
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY COUNTS
  // ───────────────────────────────────────────────────────────────────────────

  const categoryEntries = data?.categories
    ? Object.entries(data.categories)
    : [];

  const availableCategories =
    categoryEntries.filter(
      ([, category]) =>
        category.status === "available"
    ).length;

  const unavailableCategories =
    categoryEntries.filter(
      ([, category]) =>
        category.status === "not_available"
    ).length;

  const availableAlerts =
    data?.alert_reference?.filter(
      (alert) => alert.available
    ).length || 0;

  const totalAlerts =
    data?.alert_reference?.length || 0;

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        backgroundColor: "background.default",
        minHeight: "100vh",
      }}
    >
      {/* ═════════════════════════════════════════════════════════════════════
          HEADER
      ═════════════════════════════════════════════════════════════════════ */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          md: "center",
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Device Data Health
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Monitor device packets, data categories,
            protocol health and alert availability.
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
          disabled={
            loading || !imei.trim()
          }
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Stack>

      {/* ═════════════════════════════════════════════════════════════════════
          FORMAT ERROR
      ═════════════════════════════════════════════════════════════════════ */}

      {formatsError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() =>
            setFormatsError("")
          }
        >
          {formatsError}
        </Alert>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          SEARCH
      ═════════════════════════════════════════════════════════════════════ */}

      <Card
        elevation={1}
        sx={{ mb: 3 }}
      >
        <CardContent>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Device Lookup
          </Typography>

          <Grid container spacing={2}>
            {/* IMEI */}

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                label="IMEI"
                placeholder="Enter IMEI"
                value={imei}
                onChange={(event) =>
                  setImei(event.target.value)
                }
                onKeyDown={handleKeyDown}
              />
            </Grid>

            {/* PROTOCOL FORMAT */}

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                size="small"
                label="Protocol Format"
                value={protocolFormat}
                onChange={(event) =>
                  setProtocolFormat(
                    event.target.value
                  )
                }
                disabled={
                  formatsLoading ||
                  formatOptions.length === 0
                }
                helperText={
                  currentServerFormat
                    ? `Current server format: ${currentServerFormat}`
                    : ""
                }
              >
                {formatsLoading ? (
                  <MenuItem disabled value="">
                    Loading formats...
                  </MenuItem>
                ) : formatOptions.length === 0 ? (
                  <MenuItem disabled value="">
                    No formats available
                  </MenuItem>
                ) : (
                  formatOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      disabled={
                        option.implemented === false
                      }
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          width: "100%",
                        }}
                      >
                        <Typography
                          sx={{
                            flexGrow: 1,
                          }}
                        >
                          {option.label}
                        </Typography>

                        {option.implemented ? (
                          <Chip
                            label="Implemented"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Not Implemented"
                            color="default"
                            size="small"
                          />
                        )}
                      </Stack>
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            {/* LOOKBACK */}

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                select
                size="small"
                label="Lookback Days"
                value={lookbackDays}
                onChange={(event) =>
                  setLookbackDays(
                    Number(event.target.value)
                  )
                }
              >
                <MenuItem value={1}>
                  1 Day
                </MenuItem>

                <MenuItem value={3}>
                  3 Days
                </MenuItem>

                <MenuItem value={7}>
                  7 Days
                </MenuItem>

                <MenuItem value={15}>
                  15 Days
                </MenuItem>

                <MenuItem value={30}>
                  30 Days
                </MenuItem>
              </TextField>
            </Grid>

            {/* SEARCH BUTTON */}

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={
                  loading ||
                  formatsLoading ||
                  !protocolFormat
                }
                startIcon={
                  loading ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <SearchIcon />
                  )
                }
                sx={{
                  height: 40,
                }}
              >
                {loading
                  ? "Checking..."
                  : "Search"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ═════════════════════════════════════════════════════════════════════
          RESULT ERROR
      ═════════════════════════════════════════════════════════════════════ */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          RESULT
      ═════════════════════════════════════════════════════════════════════ */}

      {data && (
        <>
          {/* DEVICE INFORMATION */}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: "flex-start",
                  md: "center",
                }}
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Device Information
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Data health information for the
                    selected device.
                  </Typography>
                </Box>

                <Chip
                  label={
                    data.status === "success"
                      ? "API Success"
                      : formatLabel(data.status)
                  }
                  color={
                    data.status === "success"
                      ? "success"
                      : "error"
                  }
                  icon={
                    data.status === "success" ? (
                      <CheckCircleIcon />
                    ) : (
                      <ErrorIcon />
                    )
                  }
                />
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    IMEI
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={600}
                  >
                    {data.imei || "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Protocol Format
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={600}
                  >
                    {data.protocol_format ||
                      "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Current Server Format
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={600}
                  >
                    {data.current_server_format ||
                      currentServerFormat ||
                      "-"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Lookback Period
                  </Typography>

                  <Typography
                    variant="body1"
                    fontWeight={600}
                  >
                    {data.lookback_days} Days
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SUMMARY CARDS */}

          <Grid
            container
            spacing={2}
            sx={{ mb: 3 }}
          >
            {/* FORMAT IMPLEMENTED */}

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Format Implemented
                      </Typography>

                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ mt: 1 }}
                      >
                        {data.format_implemented
                          ? "Yes"
                          : "No"}
                      </Typography>
                    </Box>

                    {data.format_implemented ? (
                      <CheckCircleIcon
                        color="success"
                        sx={{ fontSize: 40 }}
                      />
                    ) : (
                      <CancelIcon
                        color="error"
                        sx={{ fontSize: 40 }}
                      />
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* AVAILABLE CATEGORIES */}

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Available Categories
                      </Typography>

                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ mt: 1 }}
                      >
                        {availableCategories}

                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {" "}
                          /{" "}
                          {categoryEntries.length}
                        </Typography>
                      </Typography>
                    </Box>

                    <DataUsageIcon
                      sx={{ fontSize: 40 }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* NOT AVAILABLE */}

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Not Available
                      </Typography>

                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ mt: 1 }}
                      >
                        {unavailableCategories}
                      </Typography>
                    </Box>

                    <WarningAmberIcon
                      color="warning"
                      sx={{ fontSize: 40 }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* ALERTS */}

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Alerts Available
                      </Typography>

                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ mt: 1 }}
                      >
                        {availableAlerts}

                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {" "}
                          / {totalAlerts}
                        </Typography>
                      </Typography>
                    </Box>

                    <SensorsIcon
                      sx={{ fontSize: 40 }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* CHECKED AT */}

          <Alert
            severity="info"
            icon={<AccessTimeIcon />}
            sx={{ mb: 3 }}
          >
            <strong>Last checked:</strong>{" "}
            {formatDate(data.checked_at)}
          </Alert>

          {/* DATA CATEGORIES */}

          <Typography
            variant="h6"
            fontWeight={700}
            sx={{ mb: 2 }}
          >
            Data Categories
          </Typography>

          <Grid
            container
            spacing={2}
            sx={{ mb: 4 }}
          >
            {Object.entries(
              data.categories || {}
            ).map(
              ([categoryKey, category]) => {
                const config =
                  CATEGORY_CONFIG[
                    categoryKey
                  ] || {
                    label:
                      formatLabel(
                        categoryKey
                      ),
                    icon: <StorageIcon />,
                  };

                const statusConfig =
                  getStatusConfig(
                    category.status
                  );

                const expanded =
                  expandedCategories[
                    categoryKey
                  ];

                return (
                  <Grid
                    item
                    xs={12}
                    md={6}
                    lg={4}
                    key={categoryKey}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        border:
                          "1px solid",
                        borderColor:
                          category.status ===
                          "available"
                            ? "success.light"
                            : category.status ===
                              "error"
                            ? "error.light"
                            : "warning.light",
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                backgroundColor:
                                  "action.hover",
                              }}
                            >
                              {config.icon}
                            </Box>

                            <Box>
                              <Typography
                                variant="h6"
                                fontWeight={700}
                              >
                                {config.label}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {categoryKey}
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip
                            size="small"
                            label={
                              statusConfig.label
                            }
                            color={
                              statusConfig.color
                            }
                            icon={
                              statusConfig.icon
                            }
                          />
                        </Stack>

                        <Divider
                          sx={{ my: 2 }}
                        />

                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Received At
                            </Typography>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {formatDate(
                                category.received_at
                              )}
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Checksum
                            </Typography>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {category.checksum_ok ===
                              null
                                ? "-"
                                : category.checksum_ok
                                ? "Valid"
                                : "Invalid"}
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              Errors
                            </Typography>

                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {category
                                .errors
                                ?.length || 0}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Button
                          fullWidth
                          size="small"
                          sx={{ mt: 2 }}
                          endIcon={
                            expanded ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )
                          }
                          onClick={() =>
                            toggleCategory(
                              categoryKey
                            )
                          }
                        >
                          {expanded
                            ? "Hide Details"
                            : "View Details"}
                        </Button>

                        <Collapse
                          in={expanded}
                        >
                          <Divider
                            sx={{ my: 2 }}
                          />

                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            sx={{ mb: 1 }}
                          >
                            Raw Data
                          </Typography>

                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              backgroundColor:
                                "background.default",
                              overflow: "auto",
                              maxHeight: 200,
                            }}
                          >
                            <Typography
                              component="pre"
                              sx={{
                                margin: 0,
                                fontSize: 12,
                                fontFamily:
                                  "monospace",
                                whiteSpace:
                                  "pre-wrap",
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {category.raw
                                ? typeof category.raw ===
                                  "string"
                                  ? category.raw
                                  : JSON.stringify(
                                      category.raw,
                                      null,
                                      2
                                    )
                                : "No raw data available"}
                            </Typography>
                          </Paper>

                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            sx={{
                              mt: 2,
                              mb: 1,
                            }}
                          >
                            Fields
                          </Typography>

                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              backgroundColor:
                                "background.default",
                              overflow: "auto",
                              maxHeight: 250,
                            }}
                          >
                            <Typography
                              component="pre"
                              sx={{
                                margin: 0,
                                fontSize: 12,
                                fontFamily:
                                  "monospace",
                                whiteSpace:
                                  "pre-wrap",
                                wordBreak:
                                  "break-word",
                              }}
                            >
                              {category.fields
                                ? JSON.stringify(
                                    category.fields,
                                    null,
                                    2
                                  )
                                : "No parsed fields available"}
                            </Typography>
                          </Paper>

                          {category.errors &&
                            category.errors
                              .length > 0 && (
                              <>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={700}
                                  sx={{
                                    mt: 2,
                                    mb: 1,
                                  }}
                                >
                                  Errors
                                </Typography>

                                <Alert severity="error">
                                  <ul
                                    style={{
                                      margin: 0,
                                      paddingLeft:
                                        20,
                                    }}
                                  >
                                    {category.errors.map(
                                      (
                                        categoryError,
                                        index
                                      ) => (
                                        <li
                                          key={
                                            index
                                          }
                                        >
                                          {typeof categoryError ===
                                          "string"
                                            ? categoryError
                                            : JSON.stringify(
                                                categoryError
                                              )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </Alert>
                              </>
                            )}
                        </Collapse>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              }
            )}
          </Grid>

          {/* ALERT REFERENCE */}

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: "flex-start",
                  md: "center",
                }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Alert Reference
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Protocol alert definitions and
                    their availability for this
                    device.
                  </Typography>
                </Box>

                <Chip
                  label={`${availableAlerts} / ${totalAlerts} Available`}
                  color={
                    availableAlerts > 0
                      ? "success"
                      : "warning"
                  }
                  size="small"
                />
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <TableContainer
                component={Paper}
                variant="outlined"
              >
                <Table
                  size="small"
                  stickyHeader
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>
                          Packet Type
                        </strong>
                      </TableCell>

                      <TableCell>
                        <strong>
                          Alert ID
                        </strong>
                      </TableCell>

                      <TableCell>
                        <strong>
                          Trigger
                        </strong>
                      </TableCell>

                      <TableCell align="center">
                        <strong>
                          Available
                        </strong>
                      </TableCell>

                      <TableCell>
                        <strong>
                          Last Seen
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {data.alert_reference &&
                    data.alert_reference.length >
                      0 ? (
                      data.alert_reference.map(
                        (
                          alert,
                          index
                        ) => (
                          <TableRow
                            key={`${alert.packet_type}-${alert.alert_id}-${index}`}
                            hover
                          >
                            <TableCell>
                              <Chip
                                label={
                                  alert.packet_type
                                }
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>

                            <TableCell>
                              <Typography fontWeight={600}>
                                {
                                  alert.alert_id
                                }
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2">
                                {
                                  alert.trigger
                                }
                              </Typography>
                            </TableCell>

                            <TableCell align="center">
                              {alert.available ? (
                                <Chip
                                  label="Available"
                                  color="success"
                                  size="small"
                                  icon={
                                    <CheckCircleIcon />
                                  }
                                />
                              ) : (
                                <Chip
                                  label="Not Available"
                                  color="warning"
                                  size="small"
                                  icon={
                                    <WarningAmberIcon />
                                  }
                                />
                              )}
                            </TableCell>

                            <TableCell>
                              {formatDate(
                                alert.last_seen
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                        >
                          No alert reference
                          data found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* RAW API RESPONSE */}

        </>
      )}

      {/* INITIAL EMPTY STATE */}

      {!data &&
        !loading &&
        !error && (
          <Card>
            <CardContent>
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1.5}
                sx={{ py: 8 }}
              >
                <MemoryIcon
                  sx={{
                    fontSize: 60,
                    opacity: 0.25,
                  }}
                />

                <Typography
                  variant="h6"
                  fontWeight={600}
                >
                  Search for a Device
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Enter an IMEI above to check
                  device data health.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
    </Box>
  );
};

export default DeviceDataHealthPage;