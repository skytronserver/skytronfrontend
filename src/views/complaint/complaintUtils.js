export const STATUS_CONFIG = {
  created: { label: "Created", color: "default" },
  in_review: { label: "In Review", color: "info" },
  pending: { label: "Pending", color: "warning" },
  closed: { label: "Closed", color: "success" },
  canceled: { label: "Canceled", color: "error" },
};

export const ESCALATION_CONFIG = {
  teamlead: { label: "Team Lead", color: "secondary" },
  sosadmin: { label: "SOS Admin", color: "warning" },
  manufacturer: { label: "Manufacturer", color: "error" },
};

export const SOURCE_LABELS = {
  public_app: "Public App",
  helpdesk_call: "HelpDesk Call",
  helpdesk_email: "HelpDesk Email",
};

// Returns valid next statuses given current status
export const ALLOWED_TRANSITIONS = {
  created: ["in_review", "canceled"],
  in_review: ["pending", "closed", "canceled"],
  pending: ["in_review", "closed", "canceled"],
  closed: [],
  canceled: [],
};

// Returns which escalation targets the given role can use
export const ROLE_ESCALATION_TARGETS = {
  helpdesk: ["teamlead", "sosadmin"],
  teamlead: ["sosadmin", "manufacturer"],
  sosexecutive: ["manufacturer"],
  stateadmin: ["teamlead", "sosadmin", "manufacturer"],
  superadmin: ["teamlead", "sosadmin", "manufacturer"],
};

export const getRoleFromCookie = () => {
  try {
    const { decipherEncryption } = require("../../helper");
    const myDecipher = decipherEncryption("skytrack");
    const userData =
      sessionStorage.getItem("cookiesData") ||
      localStorage.getItem("cookiesData");
    if (!userData) return "";
    const parts = userData.split("-").map((item) => myDecipher(item));
    return parts.length > 1 ? (parts[1] || "").toLowerCase().trim() : "";
  } catch {
    return "";
  }
};

export const formatDateTime = (dt) => {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
