import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  CheckCircle,
  Error as ErrorIcon,
  Memory,
  Storage,
  Speed,
  StorageOutlined,
  Router,
  Refresh,
  Dns,
  CloudQueue,
  Lan,
} from "@mui/icons-material";

import ServerHealthService from "../../services/ServerHealthService";


const ServerHealthDashboard = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchServerHealth = useCallback(async () => {
  try {
    setRefreshing(true);
    setError("");

    const response =
      await ServerHealthService.getServerHealthSummary();

    setHealthData(response.data);
  } catch (err) {
    console.error("Server health API error:", err);

    setError(
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Unable to fetch server health."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  useEffect(() => {
    fetchServerHealth();

    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      fetchServerHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchServerHealth]);

  const getStatusColor = (ok) => {
    return ok ? "success" : "error";
  };

  const getStatusText = (ok) => {
    return ok ? "Healthy" : "Down";
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return "-";

    const number = Number(value);

    if (Number.isNaN(number)) return value;

    return number.toLocaleString();
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "-";

    const totalSeconds = Number(seconds);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  const MetricCard = ({
    title,
    value,
    subtitle,
    icon,
    progress,
    progressLabel,
  }) => {
    return (
      <Card
        elevation={0}
        sx={{
          height: "100%",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
            >
              {title}
            </Typography>

            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
              }}
            >
              {icon}
            </Box>
          </Stack>

          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}

          {progress !== undefined && (
            <Box mt={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                mb={0.7}
              >
                <Typography variant="caption" color="text.secondary">
                  {progressLabel}
                </Typography>

                <Typography variant="caption" fontWeight={600}>
                  {progress}%
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={Math.min(Number(progress), 100)}
                sx={{
                  height: 7,
                  borderRadius: 10,
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const SectionHeader = ({ icon, title, status }) => {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon}

          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Stack>

        <Chip
          icon={
            status ? (
              <CheckCircle fontSize="small" />
            ) : (
              <ErrorIcon fontSize="small" />
            )
          }
          label={getStatusText(status)}
          color={getStatusColor(status)}
          size="small"
        />
      </Stack>
    );
  };

  const DetailRow = ({ label, value }) => {
    return (
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        py={1.2}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        <Typography variant="body2" fontWeight={600} textAlign="right">
          {value}
        </Typography>
      </Stack>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading server health...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f8fa",
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Server Health Dashboard
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Monitor host, Postgre, MQTT and TCP services
            </Typography>

            {healthData?.collected_at && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={1}
              >
                Last collected:{" "}
                {new Date(healthData.collected_at).toLocaleString()}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            {healthData?.status && (
              <Chip
                icon={<CheckCircle />}
                label="System Operational"
                color="success"
              />
            )}

            <Tooltip title="Refresh">
              <span>
                <IconButton
                  onClick={fetchServerHealth}
                  disabled={refreshing}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={20} />
                  ) : (
                    <Refresh />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {healthData && (
        <>
          {/* Overall Status */}
          <Grid container spacing={2.5} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="CPU Usage"
                value={`${healthData.host.cpu_percent}%`}
                subtitle={`${healthData.host.cpu_count} CPU cores`}
                progress={healthData.host.cpu_percent}
                progressLabel="CPU utilization"
                icon={<Speed />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Memory Usage"
                value={`${healthData.host.memory_percent}%`}
                subtitle={`${formatNumber(
                  healthData.host.memory_used_mb
                )} MB used`}
                progress={healthData.host.memory_percent}
                progressLabel="Memory utilization"
                icon={<Memory />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Disk Usage"
                value={`${healthData.host.disk_percent}%`}
                subtitle={`${healthData.host.disk_used_gb} GB used`}
                progress={healthData.host.disk_percent}
                progressLabel="Disk utilization"
                icon={<Storage />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Database Connections"
                value={healthData.postgres.total_connections}
                subtitle={`Maximum ${healthData.postgres.max_connections}`}
                progress={
                  (healthData.postgres.total_connections /
                    healthData.postgres.max_connections) *
                  100
                }
                progressLabel="Connection usage"
                icon={<Dns />}
              />
            </Grid>
          </Grid>

          {/* Host */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                icon={<CloudQueue />}
                title="Host Health"
                status={healthData.host.ok}
              />

              <Divider />

              <Grid container spacing={3} mt={0.5}>
                <Grid item xs={12} md={6}>
                  <DetailRow
                    label="Hostname"
                    value={healthData.host.hostname}
                  />

                  <DetailRow
                    label="IP Address"
                    value={healthData.host.ip_address}
                  />

                  <DetailRow
                    label="CPU Cores"
                    value={healthData.host.cpu_count}
                  />

                  <DetailRow
                    label="CPU Usage"
                    value={`${healthData.host.cpu_percent}%`}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <DetailRow
                    label="Memory"
                    value={`${healthData.host.memory_used_mb} / ${healthData.host.memory_total_mb} MB`}
                  />

                  <DetailRow
                    label="Memory Usage"
                    value={`${healthData.host.memory_percent}%`}
                  />

                  <DetailRow
                    label="Disk"
                    value={`${healthData.host.disk_used_gb} / ${healthData.host.disk_total_gb} GB`}
                  />

                  <DetailRow
                    label="Disk Usage"
                    value={`${healthData.host.disk_percent}%`}
                  />
                </Grid>
              </Grid>

              <Box mt={2}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  mb={1}
                >
                  Load Average
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        textAlign: "center",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        1 min
                      </Typography>

                      <Typography variant="h6" fontWeight={700}>
                        {healthData.host.load_avg_1m}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        textAlign: "center",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        5 min
                      </Typography>

                      <Typography variant="h6" fontWeight={700}>
                        {healthData.host.load_avg_5m}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        textAlign: "center",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        15 min
                      </Typography>

                      <Typography variant="h6" fontWeight={700}>
                        {healthData.host.load_avg_15m}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* PostgreSQL + MQTT */}
          <Grid container spacing={3} mb={3}>
            {/* PostgreSQL */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <SectionHeader
                    icon={<StorageOutlined />}
                    title="Postgre"
                    status={healthData.postgres.ok}
                  />

                  <Divider />

                  <Box mt={1}>
                    <DetailRow
                      label="Total Connections"
                      value={healthData.postgres.total_connections}
                    />

                    <DetailRow
                      label="Active Connections"
                      value={healthData.postgres.active_connections}
                    />

                    <DetailRow
                      label="Idle Connections"
                      value={healthData.postgres.idle_connections}
                    />

                    <DetailRow
                      label="Idle in Transaction"
                      value={
                        healthData.postgres
                          .idle_in_transaction_connections
                      }
                    />

                    <DetailRow
                      label="Maximum Connections"
                      value={healthData.postgres.max_connections}
                    />

                    <DetailRow
                      label="Longest Query"
                      value={`${Math.max(
                        0,
                        Number(
                          healthData.postgres
                            .longest_running_active_query_seconds
                        )
                      ).toFixed(2)} sec`}
                    />
                  </Box>

                  <Box mt={2}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Active connection usage
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={
                        (healthData.postgres.active_connections /
                          healthData.postgres.max_connections) *
                        100
                      }
                      sx={{
                        mt: 1,
                        height: 8,
                        borderRadius: 10,
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* MQTT */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <SectionHeader
                    icon={<Router />}
                    title="MQTT"
                    status={healthData.mqtt.ok}
                  />

                  <Divider />

                  <Box mt={1}>
                    <DetailRow
                      label="Clients Connected"
                      value={healthData.mqtt.clients_connected}
                    />

                    <DetailRow
                      label="Messages In / min"
                      value={healthData.mqtt.messages_per_min_in}
                    />

                    <DetailRow
                      label="Messages Out / min"
                      value={healthData.mqtt.messages_per_min_out}
                    />

                    <DetailRow
                      label="Bytes Received"
                      value={formatNumber(
                        healthData.mqtt.bytes_received_total
                      )}
                    />

                    <DetailRow
                      label="Bytes Sent"
                      value={formatNumber(
                        healthData.mqtt.bytes_sent_total
                      )}
                    />

                    <DetailRow
                      label="Uptime"
                      value={formatUptime(healthData.mqtt.uptime)}
                    />
                  </Box>

                  <Stack direction="row" spacing={1} mt={2}>
                    <Chip
                      size="small"
                      label={`Keys ${healthData.mqtt.collected_keys}/${healthData.mqtt.expected_keys}`}
                      color={
                        healthData.mqtt.collected_keys ===
                        healthData.mqtt.expected_keys
                          ? "success"
                          : "warning"
                      }
                    />

                    <Chip
                      size="small"
                      label={
                        healthData.mqtt.partial
                          ? "Partial Data"
                          : "Complete Data"
                      }
                      color={
                        healthData.mqtt.partial
                          ? "warning"
                          : "success"
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* TCP */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <SectionHeader
                icon={<Lan />}
                title="TCP Connections"
                status={
                  healthData.tcp.tcp_live_count >= 0 &&
                  healthData.tcp.tcpem_live_count >= 0
                }
              />

              <Divider />

              <Grid container spacing={2.5} mt={0.5}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      TCP Live Connections
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={800}
                      mt={1}
                    >
                      {healthData.tcp.tcp_live_count}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Currently active
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      TCPEM Live Connections
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={800}
                      mt={1}
                    >
                      {healthData.tcp.tcpem_live_count}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Currently active
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default ServerHealthDashboard;