import React, { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import RouterIcon from "@mui/icons-material/Router";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import WifiIcon from "@mui/icons-material/Wifi";
import HistoryIcon from "@mui/icons-material/History";

import ServerHealthService from "../../services/ServerHealthService";

const DeviceInspector = () => {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [imei, setImei] = useState("");

  const [device, setDevice] = useState(null);

  const [logs, setLogs] = useState([]);

  const [commandHistory, setCommandHistory] = useState([]);

  const [payload, setPayload] = useState("");

  const [transport, setTransport] = useState("auto");

  const [logType, setLogType] = useState("both");

  const [activeTab, setActiveTab] = useState(0);

  const [loading, setLoading] = useState(false);

  const [logsLoading, setLogsLoading] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [commandLoading, setCommandLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ─────────────────────────────────────────────────────────────────────────
  // LOOKUP DEVICE
  // ─────────────────────────────────────────────────────────────────────────

  const handleLookup = async () => {
    if (!imei.trim()) {
      setError("Please enter an IMEI.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await ServerHealthService.lookupDevice(imei.trim());

      const data = response.data;

      if (data.status === "success") {
        setDevice(data);

        // Load related information after successful lookup
        await Promise.all([
          loadLogs(imei.trim(), logType),
          loadCommandHistory(imei.trim()),
        ]);
      } else {
        setDevice(null);
        setError("Device was not found.");
      }
    } catch (err) {
      console.error("Device lookup error:", err);

      setDevice(null);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to lookup device."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD LOGS
  // ─────────────────────────────────────────────────────────────────────────

  const loadLogs = async (
    imeiValue = imei,
    type = logType
  ) => {
    if (!imeiValue?.trim()) return;

    setLogsLoading(true);

    try {
      const response =
        await ServerHealthService.getDeviceLogs(
          imeiValue.trim(),
          type,
          1,
          20
        );

      setLogs(response.data?.logs || []);
    } catch (err) {
      console.error("Logs error:", err);

      setLogs([]);

      setError(
        err?.response?.data?.detail ||
          "Unable to load device logs."
      );
    } finally {
      setLogsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD COMMAND HISTORY
  // ─────────────────────────────────────────────────────────────────────────

  const loadCommandHistory = async (
    imeiValue = imei
  ) => {
    if (!imeiValue?.trim()) return;

    setHistoryLoading(true);

    try {
      const response =
        await ServerHealthService.getCommandHistory(
          imeiValue.trim()
        );

      setCommandHistory(response.data?.history || []);
    } catch (err) {
      console.error("Command history error:", err);

      setCommandHistory([]);

      setError(
        err?.response?.data?.detail ||
          "Unable to load command history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SEND COMMAND
  // ─────────────────────────────────────────────────────────────────────────

  const handleSendCommand = async () => {
    if (!imei.trim()) {
      setError("Please enter an IMEI.");
      return;
    }

    if (!payload.trim()) {
      setError("Please enter a command payload.");
      return;
    }

    setCommandLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await ServerHealthService.sendCommand(
          imei.trim(),
          payload.trim(),
          transport
        );

      console.log("Command response:", response.data);

      setSuccess("Command sent successfully.");

      setPayload("");

      // Refresh history after sending command
      await loadCommandHistory(imei.trim());
    } catch (err) {
      console.error("Send command error:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to send command."
      );
    } finally {
      setCommandLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CHANGE LOG TYPE
  // ─────────────────────────────────────────────────────────────────────────

  const handleLogTypeChange = async (event) => {
    const value = event.target.value;

    setLogType(value);

    await loadLogs(imei, value);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  const getStatusColor = (status) => {
    if (!status) return "default";

    const value = status.toLowerCase();

    if (
      value.includes("verified") ||
      value.includes("active") ||
      value.includes("online")
    ) {
      return "success";
    }

    if (
      value.includes("pending") ||
      value.includes("waiting")
    ) {
      return "warning";
    }

    if (
      value.includes("failed") ||
      value.includes("error") ||
      value.includes("offline")
    ) {
      return "error";
    }

    return "default";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
      }}
    >
      {/* PAGE HEADER */}

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={700}
          >
            Device Inspector
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
          >
            Inspect device status, connection, logs and commands
          </Typography>
        </Box>
      </Stack>

      {/* SEARCH */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
          >
            <TextField
              fullWidth
              label="IMEI"
              placeholder="Enter IMEI"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLookup();
                }
              }}
            />

            <Button
              variant="contained"
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
              onClick={handleLookup}
              disabled={loading}
              sx={{
                minWidth: 150,
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Searching..." : "Inspect Device"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ALERTS */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* DEVICE INFORMATION */}

      {device && (
        <>
          <Grid
            container
            spacing={2}
            mb={3}
          >
            {/* DEVICE */}

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={2}
                  >
                    <RouterIcon color="primary" />

                    <Typography fontWeight={700}>
                      Device
                    </Typography>
                  </Stack>

                  <InfoRow
                    label="IMEI"
                    value={device.imei}
                  />

                  <InfoRow
                    label="Device ESN"
                    value={device.device_esn}
                  />

                  <InfoRow
                    label="Stock ID"
                    value={device.device_stock_id}
                  />

                  <InfoRow
                    label="Device Tag ID"
                    value={device.device_tag_id}
                  />

                  <InfoRow
                    label="Status"
                    value={
                      <Chip
                        size="small"
                        label={device.device_status || "Unknown"}
                        color={getStatusColor(
                          device.device_status
                        )}
                      />
                    }
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* VEHICLE */}

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={2}
                  >
                    <DirectionsCarIcon color="primary" />

                    <Typography fontWeight={700}>
                      Vehicle
                    </Typography>
                  </Stack>

                  <InfoRow
                    label="Registration"
                    value={device.vehicle_reg_no}
                  />

                  <InfoRow
                    label="Owner"
                    value={
                      device.vehicle_owner || "Not available"
                    }
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* CONNECTION */}

            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    mb={2}
                  >
                    <WifiIcon color="primary" />

                    <Typography fontWeight={700}>
                      Connection
                    </Typography>
                  </Stack>

                  <InfoRow
                    label="Live"
                    value={
                      <Chip
                        size="small"
                        label={
                          device.connection?.live
                            ? "LIVE"
                            : "OFFLINE"
                        }
                        color={
                          device.connection?.live
                            ? "success"
                            : "error"
                        }
                      />
                    }
                  />

                  <InfoRow
                    label="Primary Transport"
                    value={
                      device.connection?.primary_transport ||
                      "None"
                    }
                  />

                  <InfoRow
                    label="Primary State"
                    value={
                      device.connection?.primary_state ||
                      "None"
                    }
                  />

                  <InfoRow
                    label="Other Transports"
                    value={
                      device.connection?.other_transports
                        ?.length || 0
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* TABS */}

          <Card>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(event, value) =>
                  setActiveTab(value)
                }
              >
                <Tab label="Logs" />

                <Tab label="Command History" />

                <Tab label="Send Command" />
              </Tabs>
            </Box>

            {/* LOGS */}

            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  spacing={2}
                  mb={2}
                >
                  <FormControl
                    size="small"
                    sx={{ minWidth: 180 }}
                  >
                    <InputLabel>
                      Log Type
                    </InputLabel>

                    <Select
                      value={logType}
                      label="Log Type"
                      onChange={handleLogTypeChange}
                    >
                      <MenuItem value="both">
                        Both
                      </MenuItem>

                      <MenuItem value="tracking">
                        Tracking
                      </MenuItem>

                      <MenuItem value="connection">
                        Connection
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() =>
                      loadLogs(imei, logType)
                    }
                    disabled={logsLoading}
                  >
                    Refresh
                  </Button>
                </Stack>

                {logsLoading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    py={5}
                  >
                    <CircularProgress />
                  </Box>
                ) : logs.length === 0 ? (
                  <Alert severity="info">
                    No logs found for this device.
                  </Alert>
                ) : (
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            Timestamp
                          </TableCell>

                          <TableCell>
                            Type
                          </TableCell>

                          <TableCell>
                            Message
                          </TableCell>

                          <TableCell>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {logs.map((log, index) => (
                          <TableRow
                            key={log.id || index}
                          >
                            <TableCell>
                              {log.timestamp ||
                                log.created_at ||
                                "-"}
                            </TableCell>

                            <TableCell>
                              {log.log_type ||
                                log.type ||
                                "-"}
                            </TableCell>

                            <TableCell>
                              {log.message ||
                                log.event ||
                                log.description ||
                                "-"}
                            </TableCell>

                            <TableCell>
                              {log.status || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* COMMAND HISTORY */}

            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <HistoryIcon color="primary" />

                    <Typography fontWeight={600}>
                      Command History
                    </Typography>
                  </Stack>

                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() =>
                      loadCommandHistory(imei)
                    }
                    disabled={historyLoading}
                  >
                    Refresh
                  </Button>
                </Stack>

                {historyLoading ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    py={5}
                  >
                    <CircularProgress />
                  </Box>
                ) : commandHistory.length === 0 ? (
                  <Alert severity="info">
                    No command history found.
                  </Alert>
                ) : (
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            Command
                          </TableCell>

                          <TableCell>
                            Transport
                          </TableCell>

                          <TableCell>
                            Status
                          </TableCell>

                          <TableCell>
                            Time
                          </TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {commandHistory.map(
                          (item, index) => (
                            <TableRow
                              key={
                                item.id || index
                              }
                            >
                              <TableCell>
                                {item.payload ||
                                  item.command ||
                                  "-"}
                              </TableCell>

                              <TableCell>
                                {item.transport || "-"}
                              </TableCell>

                              <TableCell>
                                {item.status || "-"}
                              </TableCell>

                              <TableCell>
                                {item.created_at ||
                                  item.timestamp ||
                                  "-"}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* SEND COMMAND */}

            {activeTab === 2 && (
              <Box sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  mb={1}
                >
                  Send Device Command
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={3}
                >
                  Send a command directly to the selected
                  device.
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="IMEI"
                      value={imei}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>
                        Transport
                      </InputLabel>

                      <Select
                        value={transport}
                        label="Transport"
                        onChange={(e) =>
                          setTransport(e.target.value)
                        }
                      >
                        <MenuItem value="auto">
                          Auto
                        </MenuItem>

                        <MenuItem value="sms">
                          SMS
                        </MenuItem>

                        <MenuItem value="tcp">
                          TCP
                        </MenuItem>

                        <MenuItem value="mqtt">
                          MQTT
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Command Payload"
                      placeholder="Enter command payload"
                      value={payload}
                      onChange={(e) =>
                        setPayload(e.target.value)
                      }
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={
                        commandLoading ? (
                          <CircularProgress
                            size={18}
                            color="inherit"
                          />
                        ) : (
                          <SendIcon />
                        )
                      }
                      onClick={handleSendCommand}
                      disabled={commandLoading}
                    >
                      {commandLoading
                        ? "Sending..."
                        : "Send Command"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Card>
        </>
      )}
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// INFO ROW
// ─────────────────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        py: 1.2,
        borderBottom: "1px solid #eee",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        textAlign="right"
      >
        {value}
      </Typography>
    </Box>
  );
};

export default DeviceInspector;