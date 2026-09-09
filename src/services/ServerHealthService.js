import { getAxiosInstance } from "./axiosInstance";

// ─── SERVER HEALTH ──────────────────────────────────────────────────────────

const getServerHealthSummary = () => {
  return getAxiosInstance().get("/api/server-health/summary/");
};

const lookupDevice = (imei) => {
  return getAxiosInstance().get("/api/device-inspector/lookup/", {
    params: {
      imei,
    },
  });
};

// ─── DEVICE LOGS ────────────────────────────────────────────────────────────

/**
 * GET /api/device-inspector/logs/
 *
 * logType:
 *   both
 *   tracking
 *   connection
 */
const getDeviceLogs = (
  imei,
  logType = "both",
  page = 1,
  pageSize = 20
) => {
  return getAxiosInstance().get("/api/device-inspector/logs/", {
    params: {
      imei,
      log_type: logType,
      page,
      page_size: pageSize,
    },
  });
};

// ─── COMMAND HISTORY ────────────────────────────────────────────────────────

/**
 * GET /api/device-inspector/command/history/?imei=100000
 */
const getCommandHistory = (imei) => {
  return getAxiosInstance().get("/api/device-inspector/command/history/", {
    params: {
      imei,
    },
  });
};

// ─── SEND COMMAND ───────────────────────────────────────────────────────────

/**
 * POST /api/device-inspector/command/send/
 *
 * Body:
 * {
 *   imei: "100000",
 *   payload: "abc",
 *   transport: "auto"
 * }
 */
const sendCommand = (imei, payload, transport = "auto") => {
  return getAxiosInstance().post("/api/device-inspector/command/send/", {
    imei,
    payload,
    transport,
  });
};

const getAlertStatsSummary = ({
  types = "",
  range = "this_week",
  sortBy = "alert_count",
  sortDir = "desc",
  page = 1,
  pageSize = 20,
} = {}) => {
  return getAxiosInstance().get("/api/alert-stats/summary/", {
    params: {
      types,
      range,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
      page_size: pageSize,
    },
  });
};

const lookupDeviceDataHealth = (
  imei,
  protocolFormat = "ARAI_2025",
  lookbackDays = 3
) => {
  return getAxiosInstance().get(
    "/api/device-data-health/lookup/",
    {
      params: {
        imei,
        protocol_format: protocolFormat,
        lookback_days: lookbackDays,
      },
    }
  );
};

const getDeviceDataHealthFormats = () => {
  return getAxiosInstance().get(
    "/api/device-data-health/formats/"
  );
};

// ─── EXPORT ─────────────────────────────────────────────────────────────────

const ServerHealthService = {
  getServerHealthSummary,
  lookupDevice,
  getDeviceLogs,
  getCommandHistory,
  sendCommand,
  getAlertStatsSummary,
  lookupDeviceDataHealth,
  getDeviceDataHealthFormats,
};

export default ServerHealthService;