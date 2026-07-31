/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars, no-unreachable */
import React, { useEffect, useRef, useState } from "react";
import { useTheme, alpha } from '@mui/material/styles';
import {
    Button,
    Tooltip,
    Box,
    IconButton,
    Typography,
    CircularProgress,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Snackbar,
    Alert,
    InputBase,
    Divider,
    Switch,
    FormControlLabel
} from "@mui/material";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import {
    Style,
    Fill,
    Stroke,
    Circle as CircleStyle,
    Text
} from "ol/style";
import {
    Search as SearchIcon,
    LocationOn as LocationOnIcon,
    Close as CloseIcon,
    Layers as LayersIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Check as CheckIcon,
    Map as MapIcon,
    Satellite as SatelliteIcon,
    Public as PublicIcon
} from "@mui/icons-material";
import { Map, View } from "ol";
import { Tile as TileLayer, } from "ol/layer";
import { TileWMS, XYZ, Cluster } from "ol/source";
import { ZoomSlider, FullScreen, ScaleLine } from "ol/control";
import {
    Icon,
} from "ol/style";
import { getAxiosInstance } from "../../services/axiosInstance";

import { Draw } from "ol/interaction";
import Polygon from "ol/geom/Polygon";
import Circle from "ol/geom/Circle";
import LineString from "ol/geom/LineString";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import POIService from "../../services/POIService";
import HomePageService from "../../services/HomePage";
import { getUseOldGeocodingApi, setUseOldGeocodingApi } from "../../services/HomePage";
import axios from "axios";
import { renderSecureIncidentMedia } from "../../utils/incidentImageLoader";

const vehicleIconContext = require.context('../../assets/images', true, /\.png$/);

const formatDateDDMMYY = (raw) => {
    if (!raw || raw.length < 8) return raw || "-";
    const d = raw.slice(0, 2); // 16
    const m = raw.slice(2, 4); // 12
    const y = raw.slice(6, 8); // 25 from 2025
    return `${d}-${m}-${y}`;
};

const formatTimeHHMMSS = (raw) => {
    if (!raw || raw.length < 6) return raw || "-";

    const h24 = parseInt(raw.slice(0, 2), 10); // 0–23
    const m = raw.slice(2, 4);
    const s = raw.slice(4, 6);

    if (Number.isNaN(h24)) return raw;

    const period = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12; // 0 -> 12 AM/PM

    const h = String(h12).padStart(2, "0");
    return `${h}:${m}:${s} ${period}`;
};

const ALERT_CODE_LABELS = {
    // Normal
    NR1: "Normal ",
    NR: "Normal ", // Handle both NR1 and NR
    NR2: "Normal History",

    // Battery Alerts
    BD3: "Battery Disconnected",
    BL4: "Low Battery",
    BH5: "Battery Charged",
    BR6: "Mains Reconnected",

    // Ignition Alerts
    IN7: "Ignition On",
    IF8: "Ignition Off",

    // Security Alerts
    TA9: "Tamper Alert",

    // Emergency Alerts
    EA10: "Emergency Alert (Panic)",
    EA11: "Emergency Alert Cleared",

    // System Alerts
    OT12: "Configuration Updated",

    // Driving Behavior Alerts
    HB13: "Harsh Braking",
    HA14: "Harsh Acceleration",
    RT15: "Rash Turning"
};

const resolveAlertCode = (entry) => {
    if (!entry) return "-";
    const alertPrefix = entry.packet_type || entry.packetType;
    const alertId = entry.alert_id;
    if (
        alertPrefix &&
        alertId !== null &&
        alertId !== undefined &&
        alertId !== "" &&
        /^[A-Za-z]{1,3}$/.test(String(alertPrefix)) &&
        /^\d{1,3}$/.test(String(alertId))
    ) {
        const combined = `${String(alertPrefix).toUpperCase()}${String(alertId)}`;
        if (ALERT_CODE_LABELS[combined]) return combined;
    }

    const candidates = [
        entry.alert_type,
        entry.alert_code,
        // some payloads send alert code in packet_type
        entry.packet_type,
        entry.packetType,
        // fallback to numeric id (least preferred)
        entry.alert_id,
    ];

    const raw = candidates.find((value) => value !== null && value !== undefined && value !== "");
    if (!raw) return "-";

    const normalized = String(raw).toUpperCase().replace(/\s+/g, "");
    // Prefer exact match if possible (e.g., NR1, EA10)
    if (ALERT_CODE_LABELS[normalized]) return normalized;

    // Fallback: extract first CODE pattern like AA99, A9, AAA999
    const match = normalized.match(/[A-Z]{1,3}\d{1,3}/);
    return match?.[0] || normalized;
};

const resolveAlertLabel = (entry) => {
    const code = resolveAlertCode(entry);
    if (!code || code === "-") return "-";
    return ALERT_CODE_LABELS[code] ? `${ALERT_CODE_LABELS[code]} (${code})` : code;
};

const resolvePacketTypeLabel = (entry) => {
    if (!entry) return "-";

    if (isEntryStale15Min(entry)) return "Offline";
    // In your payload, packet_status often contains L/H (Live/History)
    const raw =
        entry.packet_status ||
        entry.packetStatus ||
        entry.packet_type_code ||
        entry.packet_type_flag ||
        entry.packetTypeFlag ||
        entry.packet_category ||
        entry.packetCategory ||
        entry.packet_source ||
        entry.packetSource;

    if (!raw) return "-";
    const normalized = String(raw).toUpperCase();
    if (normalized === "L" || normalized === "LIVE") return "Live";
    if (normalized === "H" || normalized === "HISTORY") return "History";
    return String(raw);
};

const isEntryStale15Min = (entry) => {
    if (!entry) return true;

    const parseDateTimeParts = (dateStr, timeStr) => {
        if (!dateStr || !timeStr) return NaN;

        const dateTrimmed = String(dateStr).trim();
        const timeTrimmed = String(timeStr).trim();

        // Format: DDMMYYYY + HHMMSS
        const dmyCompact = dateTrimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
        const hmsCompact = timeTrimmed.match(/^(\d{2})(\d{2})(\d{2})$/);
        if (dmyCompact && hmsCompact) {
            const day = Number(dmyCompact[1]);
            const month = Number(dmyCompact[2]);
            const year = Number(dmyCompact[3]);
            const hours = Number(hmsCompact[1]);
            const minutes = Number(hmsCompact[2]);
            const seconds = Number(hmsCompact[3]);
            const dt = new Date(year, month - 1, day, hours, minutes, seconds);
            const ms = dt.getTime();
            return Number.isFinite(ms) ? ms : NaN;
        }

        // Format: DD-MM-YY or DD-MM-YYYY
        const dmy = dateTrimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
        if (dmy) {
            const day = Number(dmy[1]);
            const month = Number(dmy[2]);
            let year = Number(dmy[3]);
            if (String(dmy[3]).length === 2) year = 2000 + year;

            const tm = timeTrimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
            if (!tm) return NaN;
            let hours = Number(tm[1]);
            const minutes = Number(tm[2]);
            const seconds = Number(tm[3] ?? 0);
            const ampm = tm[4]?.toUpperCase();
            if (ampm === "AM") {
                if (hours === 12) hours = 0;
            } else if (ampm === "PM") {
                if (hours !== 12) hours += 12;
            }

            const dt = new Date(year, month - 1, day, hours, minutes, seconds);
            const ms = dt.getTime();
            return Number.isFinite(ms) ? ms : NaN;
        }

        const fallbackMs = new Date(`${dateTrimmed} ${timeTrimmed}`).getTime();
        return Number.isFinite(fallbackMs) ? fallbackMs : NaN;
    };

    const normalizeEpoch = (value) => {
        const num = typeof value === "number" ? value : Number(value);
        if (!Number.isFinite(num)) return NaN;
        return num < 1e12 ? num * 1000 : num;
    };

    const candidate = entry.entry_time ?? entry.timestamp ?? null;
    let lastUpdateTime = NaN;

    if (typeof candidate === "number") {
        lastUpdateTime = normalizeEpoch(candidate);
    } else if (typeof candidate === "string") {
        const trimmed = candidate.trim();
        if (/^\d+$/.test(trimmed)) {
            lastUpdateTime = normalizeEpoch(trimmed);
        } else {
            lastUpdateTime = new Date(trimmed).getTime();
        }
    }

    if (!Number.isFinite(lastUpdateTime)) {
        const datePart = entry?.date;
        const timePart = entry?.time;
        if (datePart && timePart) {
            lastUpdateTime = parseDateTimeParts(datePart, timePart);
            if (!Number.isFinite(lastUpdateTime)) {
                lastUpdateTime = new Date(`${datePart}T${timePart}`).getTime();
            }
        }
    }

    if (!Number.isFinite(lastUpdateTime)) return true;
    const now = new Date().getTime();
    return now - lastUpdateTime > 15 * 60 * 1000;
};

const resolveDeviceStatusLabel = (entry) => {
    if (!entry) return "Offline";

    // Check for explicit online/offline status
    const raw =
        entry.device_status ||
        entry.deviceStatus ||
        entry.status;

    if (raw === undefined || raw === null) {
        // If no explicit status, determine based on last update time
        const lastUpdate = entry.entry_time || entry.timestamp;
        let lastUpdateTime = lastUpdate ? new Date(lastUpdate).getTime() : NaN;

        const parseDateTimeParts = (dateStr, timeStr) => {
            if (!dateStr || !timeStr) return NaN;

            const dateTrimmed = String(dateStr).trim();
            const timeTrimmed = String(timeStr).trim();

            // Format: DDMMYYYY + HHMMSS (e.g., 15122025 + 234041)
            const dmyCompact = dateTrimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
            const hmsCompact = timeTrimmed.match(/^(\d{2})(\d{2})(\d{2})$/);
            if (dmyCompact && hmsCompact) {
                const day = Number(dmyCompact[1]);
                const month = Number(dmyCompact[2]);
                const year = Number(dmyCompact[3]);
                const hours = Number(hmsCompact[1]);
                const minutes = Number(hmsCompact[2]);
                const seconds = Number(hmsCompact[3]);
                const dt = new Date(year, month - 1, day, hours, minutes, seconds);
                const ms = dt.getTime();
                return Number.isFinite(ms) ? ms : NaN;
            }

            const dmy = dateTrimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
            if (dmy) {
                const day = Number(dmy[1]);
                const month = Number(dmy[2]);
                let year = Number(dmy[3]);
                if (String(dmy[3]).length === 2) year = 2000 + year;

                const tm = timeTrimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
                if (!tm) return NaN;
                let hours = Number(tm[1]);
                const minutes = Number(tm[2]);
                const seconds = Number(tm[3] ?? 0);
                const ampm = tm[4]?.toUpperCase();
                if (ampm === "AM") {
                    if (hours === 12) hours = 0;
                } else if (ampm === "PM") {
                    if (hours !== 12) hours += 12;
                }

                const dt = new Date(year, month - 1, day, hours, minutes, seconds);
                const ms = dt.getTime();
                return Number.isFinite(ms) ? ms : NaN;
            }

            const fallbackMs = new Date(`${dateTrimmed} ${timeTrimmed}`).getTime();
            return Number.isFinite(fallbackMs) ? fallbackMs : NaN;
        };

        if (!Number.isFinite(lastUpdateTime)) {
            const datePart = entry?.date;
            const timePart = entry?.time;
            if (datePart && timePart) {
                lastUpdateTime = parseDateTimeParts(datePart, timePart);

                if (!Number.isFinite(lastUpdateTime)) {
                    lastUpdateTime = new Date(`${datePart}T${timePart}`).getTime();
                }
            }
        }

        if (Number.isFinite(lastUpdateTime)) {
            const currentTime = new Date().getTime();
            // Consider offline if no update in last 15 minutes
            return (currentTime - lastUpdateTime) < (15 * 60 * 1000) ? "Online" : "Offline";
        }
        return "Offline";
    }

    if (raw === null || raw === undefined || raw === "") return "-";

    const normalized = String(raw).toLowerCase();
    if (["online", "on", "1", "true", "connected"].includes(normalized)) return "Online";
    if (["offline", "off", "0", "false", "disconnected"].includes(normalized)) return "Offline";
    return String(raw);
};

const resolveNearestPoiLabel = (entry) => {
    if (!entry) return "-";
    const poiName =
        entry?.nearest_poi?.data?.name ||
        entry?.nearestPoi?.name ||
        entry?.nearest_poi_name ||
        entry?.nearestPoiName;
    const poiAddress =
        entry?.nearest_poi?.data?.address ||
        entry?.nearestPoi?.address ||
        entry?.nearest_poi_address ||
        entry?.nearestPoiAddress;

    const best = poiName || poiAddress;
    if (!best) return "-";

    const details = poiName && poiAddress ? `${poiName} - ${poiAddress}` : best;
    return `Near to ${details}`;
};

const resolveNearestPoliceDetails = (entry) => {
    if (!entry) return { name: "-", address: "-", lat: "-", lng: "-" };

    const name =
        entry?.nearestPoliceStation ||
        entry?.nearest_police_station_name ||
        entry?.nearest_police_name ||
        entry?.nearest_police?.data?.name ||
        entry?.nearest_police?.name ||
        entry?.nearest_police_station?.data?.name ||
        entry?.nearest_police_station?.name ||
        entry?.nearestPolice?.name ||
        "-";

    const address =
        entry?.nearestPoliceAddress ||
        entry?.nearest_police_address ||
        entry?.nearest_police_station_address ||
        entry?.nearest_police?.data?.address ||
        entry?.nearest_police?.address ||
        entry?.nearest_police_station?.data?.address ||
        entry?.nearest_police_station?.address ||
        entry?.nearestPolice?.address ||
        "-";

    const lat =
        entry?.nearestPoliceLat ||
        entry?.nearest_police?.data?.lat ||
        entry?.nearest_police?.data?.latitude ||
        entry?.nearest_police_station?.data?.latitude ||
        entry?.nearest_police_station?.latitude ||
        entry?.nearestPolice?.latitude ||
        "-";

    const lng =
        entry?.nearestPoliceLng ||
        entry?.nearest_police?.data?.lon ||
        entry?.nearest_police?.data?.lng ||
        entry?.nearest_police?.data?.longitude ||
        entry?.nearest_police_station?.data?.longitude ||
        entry?.nearest_police_station?.longitude ||
        entry?.nearestPolice?.longitude ||
        "-";

    return {
        name: name ? String(name) : "-",
        address: address ? String(address) : "-",
        lat: lat === null || lat === undefined || lat === "" ? "-" : String(lat),
        lng: lng === null || lng === undefined || lng === "" ? "-" : String(lng),
    };
};

const resolveEntrySpeedValue = (entry) => {
    const raw = entry?.speed ?? entry?.vehicle_speed ?? entry?.vehicleSpeed;
    const num = typeof raw === "number" ? raw : Number(raw);
    return Number.isFinite(num) ? num : 0;
};



const findFirstValidLatLng = (entries) => {
    if (!Array.isArray(entries)) return null;

    for (const item of entries) {
        const latValue = item?.latitude ?? item?.lat;
        const lngValue = item?.longitude ?? item?.lng ?? item?.lon;

        const lat = Number(latValue);
        const lng = Number(lngValue);

        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            return { lat, lng };
        }
    }

    return null;
};

const setMapCenterSafely = (mapInstance, lat, lng) => {
    if (!mapInstance || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

    // LegacyMap prefers object format {lat, lng}, but we try both formats
    try {
        if (typeof mapInstance.setCenter === "function") {
            mapInstance.setCenter([lng, lat]);
            return;
        }
    } catch (primaryError) {
        try {
            mapInstance.setCenter({ lat, lng });
            return;
        } catch (secondaryError) {
            try {
                mapInstance.panTo?.([lng, lat]);
                return;
            } catch (tertiaryError) {
                console.warn(
                    "Unable to update LegacyMap map center",
                    primaryError,
                    secondaryError,
                    tertiaryError
                );
            }
        }
    }

    try {
        mapInstance.panTo?.({ lat, lng });
    } catch (error) {
        // Silently ignore - best effort
    }
};

const LEGACYMAP_HD_POPUP_STYLE_ID = "legacyMap-hd-popup-styles";

const ensureHdPopupStyles = () => { return; 
    if (typeof document === "undefined") return;

    if (document.getElementById(LEGACYMAP_HD_POPUP_STYLE_ID)) {
        return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = LEGACYMAP_HD_POPUP_STYLE_ID;
    styleElement.textContent = `
.legacyMap-hd-popup-card {
background-color: #ffffff;
border-radius: 10px;
padding: 8px 10px;
box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
border: 1px solid rgba(0, 0, 0, 0.08);
min-width: 170px;
max-width: 200px;
font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-size: 11px;
color: #1f2933;
}

/*
LegacyMap HD marker label positioning:
Their SDK renders a marker container with an icon + a separate label element.
Default placement varies (often label below icon). We normalize to label ABOVE icon.
This is best-effort across SDK versions by targeting common class names.
*/
.legacyMap-marker,
.legacyMap-marker-container,
.legacyMap-marker-container > div {
display: flex !important;
flex-direction: column !important;
align-items: center !important;
}

.legacyMap-marker-label,
.legacyMap-marker-text,
.legacyMap-label {
order: -1 !important;
margin: 0 0 4px 0 !important;
white-space: nowrap !important;
}

.legacyMap-hd-popup-header {
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 6px;
gap: 8px;
}

.legacyMap-hd-popup-title {
font-weight: 600;
font-size: 13px;
color: #111827;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
}

.legacyMap-hd-popup-pill {
padding: 2px 8px;
border-radius: 999px;
font-size: 10px;
font-weight: 600;
letter-spacing: 0.03em;
text-transform: uppercase;
border: 1px solid transparent;
}

.legacyMap-hd-popup-pill--normal {
background-color: #ecfdf3;
color: #15803d;
border-color: #bbf7d0;
}

.legacyMap-hd-popup-pill--offline {
background-color: #f3f4f6;
color: #4b5563;
border-color: #d1d5db;
}

.legacyMap-hd-popup-pill--alert {
background-color: #fef2f2;
color: #b91c1c;
border-color: #fecaca;
}

.legacyMap-hd-popup-body {
border-top: 1px solid #f1f5f9;
padding-top: 6px;
margin-top: 4px;
display: grid;
row-gap: 4px;
}

.legacyMap-hd-popup-row {
display: flex;
justify-content: space-between;
align-items: baseline;
gap: 8px;
}

.legacyMap-hd-popup-label {
font-size: 11px;
color: #6b7280;
}

.legacyMap-hd-popup-value {
font-size: 11px;
font-weight: 500;
color: #111827;
white-space: nowrap;
}

.drawing-mode-active,
.drawing-mode-active * {
cursor: crosshair!important;
}


`;

    document.head.appendChild(styleElement);
};

const formatDisplayValue = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return String(value);
};

const getMarkerLabelText = (entry, mode = "vehicle") => {
    if (!entry) return "";

    switch (mode) {
        case "block": {
            return (
                entry.block_name ||
                entry.block ||
                entry.blockName ||
                entry.area_name ||
                entry.area ||
                entry.device_tag_info?.block?.name ||
                entry.device_tag_info?.block_name ||
                entry.device_tag_info?.device?.block_name ||
                entry.device_tag_info?.device?.district ||
                entry.district ||
                entry.address ||
                entry.nearest_poi?.data?.address ||
                ""
            );
        }
        case "route": {
            const routeId = entry.route_id ||
                entry.route_ref?.id ||
                entry.device_tag_info?.route?.id ||
                entry.nearby_routes_within_100m?.[0]?.data?.id;
            return (
                entry.route_name ||
                entry.route ||
                (routeId ? `Route: ${routeId}` : "") ||
                entry.route_info ||
                entry.routeInformation ||
                entry.route_ref?.name ||
                ""
            );
        }
        case "vehicle":
        default: {
            return (
                entry.vehicle_registration_number ||
                entry.vehicle_reg_no ||
                entry.device_tag_info?.device?.vehicle_reg_no ||
                entry.device_tag_info?.vehicle?.vehicle_reg_no ||
                entry.imei ||
                ""
            );
        }
    }
};

const COLUMN_LABELS = {
    vehicle_registration_number: "Vehicle No",
    imei: "IMEI",
    entry_time: "Entry Time",
    packet_type: "Packet Type",
    alert_id: "Alert ID",
    packet_status: "Packet Status",
    gps_status: "GPS Status",
    date: "Date",
    time: "Time",
    latitude: "Latitude",
    latitude_dir: "Latitude Dir",
    longitude: "Longitude",
    longitude_dir: "Longitude Dir",
    speed: "Speed",
    heading: "Heading",
    satellites: "Satellites",
    altitude: "Altitude",
    pdop: "PDOP",
    hdop: "HDOP",
    network_operator: "Network Operator",
    ignition_status: "Ignition Status",
    main_power_status: "Main Power Status",
    main_input_voltage: "Main Input Voltage",
    internal_battery_voltage: "Internal Battery Voltage",
    emergency_status: "Emergency Status",
    box_tamper_alert: "Box Tamper Alert",
    gsm_signal_strength: "GSM Signal Strength",
    mcc: "MCC",
    mnc: "MNC",
    lac: "LAC",
    cell_id: "Cell ID",
    nbr1_cell_id: "NBR1 Cell ID",
    nbr1_lac: "NBR1 LAC",
    nbr1_signal_strength: "NBR1 Signal",
    nbr2_cell_id: "NBR2 Cell ID",
    nbr2_lac: "NBR2 LAC",
    nbr2_signal_strength: "NBR2 Signal",
    nbr3_cell_id: "NBR3 Cell ID",
    nbr3_lac: "NBR3 LAC",
    nbr3_signal_strength: "NBR3 Signal",
    nbr4_cell_id: "NBR4 Cell ID",
    nbr4_lac: "NBR4 LAC",
    nbr4_signal_strength: "NBR4 Signal",
    digital_input_status: "Digital Input Status",
    digital_output_status: "Digital Output Status",
    frame_number: "Frame Number",
    odometer: "Odometer",
    packet_datetime: "Packet Datetime",
    category_name: "Category",
    max_speed: "Max Speed",
    warn_speed: "Warn Speed",
    vehicle_make: "Vehicle Make",
    vehicle_model: "Vehicle Model",
    engine_no: "Engine No",
    chassis_no: "Chassis No",
    sale_type: "Sale Type",
    owner_name: "Owner Name",
    owner_email: "Owner Email",
    owner_mobile: "Owner Mobile",
    owner_role: "Owner Role",
    device_id: "Device ID",
    dealer_name: "Dealer Name",
    manufacturer_name: "Manufacturer Name",
    tag_status: "Tag Status",
    tagged_date: "Tagged Date",
    nearest_poi: "Nearest POI",
    nearest_police: "Nearest Police",
};

const getColumnValue = (entry, key) => {

    switch (key) {

        case "packet_status":
            return resolvePacketTypeLabel(entry);

        case "nearest_poi":
            return resolveNearestPoiLabel(entry);

        case "nearest_police":
            return resolveNearestPoliceDetails(entry)?.name || "-";

        case "category_name":
            return (
                entry?.device_tag_info?.category_info?.category ||
                "-"
            );

        case "max_speed":
            return (
                entry?.device_tag_info?.category_info?.maxSpeed ||
                "-"
            );

        case "warn_speed":
            return (
                entry?.device_tag_info?.category_info?.warnSpeed ||
                "-"
            );

        case "owner_name":
            return (
                entry?.device_tag_info?.vehicle_owner?.users?.[0]?.name ||
                "-"
            );

        case "owner_email":
            return (
                entry?.device_tag_info?.vehicle_owner?.users?.[0]?.email ||
                "-"
            );

        case "owner_mobile":
            return (
                entry?.device_tag_info?.vehicle_owner?.users?.[0]?.mobile ||
                "-"
            );

        case "dealer_name":
            return (
                entry?.device_tag_info?.device_info?.dealer?.company_name ||
                "-"
            );

        case "manufacturer_name":
            return (
                entry?.device_tag_info?.device_info?.manufacturer?.company_name ||
                "-"
            );

        case "ignition_status":
            return Number(entry?.ignition_status) === 1
                ? "ON"
                : "OFF";

        default:
            return entry?.[key] ?? "-";
    }
};
const buildHdPopupHtml = (entry, markerLabelMode = "vehicle") => {
    const displayLabel = getMarkerLabelText(entry, markerLabelMode) || "-";
    const isStale = isEntryStale15Min(entry);
    const alertType = isStale ? "Offline" : formatDisplayValue(entry?.packet_type, "NR");
    const normalizedAlertType = String(alertType).trim().toUpperCase();
    const alertClass =
        normalizedAlertType === "OFFLINE"
            ? "legacyMap-hd-popup-pill--offline"
            : (normalizedAlertType === "NR" || normalizedAlertType === "NORMAL")
                ? "legacyMap-hd-popup-pill--normal"
                : "legacyMap-hd-popup-pill--alert";

    const speedValue =
        typeof entry?.speed === "number" && entry.speed > 2
            ? `${entry.speed.toFixed(2)} km / h`
            : "0 km/h";

    const dateValue = formatDisplayValue(entry?.date);
    const timeValue = formatDisplayValue(entry?.time);
    const addressValue = formatDisplayValue(entry?.address);
    const nearestPolice = resolveNearestPoliceDetails(entry);
    const nearestStationValue =
        nearestPolice?.name && nearestPolice.name !== "-" ? formatDisplayValue(nearestPolice.name) : null;
    const policeContactValue = formatDisplayValue(
        entry?.nearestPoliceContact || entry?.nearest_police?.data?.phone
    );
    const batteryValue = `${formatDisplayValue(
        entry?.internal_battery_voltage
    )
        } - ${formatDisplayValue(entry?.main_input_voltage)} `;

    const categoryValue = formatDisplayValue(
        entry?.device_tag_info?.category_info?.category || entry?.category
    ).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

    const policeRows = [
        nearestStationValue
            ? `<div class="legacyMap-hd-popup-row"><span class="legacyMap-hd-popup-label">Nearest Police Station</span><span class="legacyMap-hd-popup-value">${nearestStationValue}</span></div>`
            : "",
        policeContactValue
            ? `<div class="legacyMap-hd-popup-row"><span class="legacyMap-hd-popup-label">Police Contact</span><span class="legacyMap-hd-popup-value">${policeContactValue}</span></div>`
            : "",
    ].join("");

    return `
< div class="legacyMap-hd-popup-card" >
<div class="legacyMap-hd-popup-header">
<div class="legacyMap-hd-popup-title">${displayLabel}</div>
<div class="legacyMap-hd-popup-pill ${alertClass}">${alertType}</div>
</div>
<div class="legacyMap-hd-popup-body">
<div class="legacyMap-hd-popup-row">
<span class="legacyMap-hd-popup-label">Date</span>
<span class="legacyMap-hd-popup-value">${dateValue}</span>
</div>
<div class="legacyMap-hd-popup-row">
<span class="legacyMap-hd-popup-label">Time</span>
<span class="legacyMap-hd-popup-value">${timeValue}</span>
</div>
<div class="legacyMap-hd-popup-row">
<span class="legacyMap-hd-popup-label">Address</span>
<span class="legacyMap-hd-popup-value">${addressValue}</span>
</div>
${policeRows}
        <div class="legacyMap-hd-popup-row">
<span class="legacyMap-hd-popup-label">Category</span>
<span class="legacyMap-hd-popup-value">${categoryValue}</span>
</div>
<div class="legacyMap-hd-popup-row">
<span class="legacyMap-hd-popup-label">Battery</span>
<span class="legacyMap-hd-popup-value">${batteryValue}</span>
</div>
</div>
</div >
`;
};

const ensureHdZoomLevel = (mapInstance, targetZoom = 12) => {
    if (!mapInstance) return;

    try {
        const currentZoom =
            typeof mapInstance.getZoom === "function" ? mapInstance.getZoom() : null;
        if (!Number.isFinite(currentZoom) || currentZoom < targetZoom) {
            if (typeof mapInstance.setZoom === "function") {
                mapInstance.setZoom(targetZoom);
            }
        }
    } catch (error) {
        // Ignore zoom errors - best effort only
    }
};

const resolveBhuvanWmsUrl = () => {
    const envUrl = process.env.REACT_APP_BHUVAN_URL || "https://bhuvan-vec1.nrsc.gov.in";
    const normalizedUrl = envUrl.replace(/\/$/, "");
    if (normalizedUrl.includes("/bhuvan/gwc/service/wms")) {
        return normalizedUrl;
    }

    return `${normalizedUrl}/bhuvan/gwc/service/wms`;
};

const BHUVAN_WMS_URL = resolveBhuvanWmsUrl();

const DEFAULT_BHUVAN_LAYER_NAMES = [
    "basemap:admin_group",
    "india3",
    // "mmi:mmi_india", // Replaced with custom XYZ layer from map2.gromed.in
];

const BHUVAN_CROSS_ORIGIN =
    process.env.REACT_APP_BHUVAN_ENABLE_CORS === "true" ? "anonymous" : undefined;

const createBhuvanSource = (layerName) => {
    const options = {
        url: BHUVAN_WMS_URL,
        params: {
            LAYERS: layerName,
            STYLES: "",
            TILED: true,
            VERSION: "1.1.1",
            FORMAT: "image/png",
            TRANSPARENT: "true",
            SRS: "EPSG:4326",
            WIDTH: 256,
            HEIGHT: 256,
        },
        serverType: "geoserver",
        projection: "EPSG:4326",
        transition: 0,
    };

    if (BHUVAN_CROSS_ORIGIN) {
        options.crossOrigin = BHUVAN_CROSS_ORIGIN;
    }

    return new TileWMS(options);
};

const MapComponent = ({
    gpsData = [],
    policeData = [],
    incidentData = [],
    width = "100%",
    height = "400px",
    selectedPoi,
    onVehicleClick,
    onPolygonComplete,
    autoFit = false, // Set to true to auto-fit map to markers, false to keep Guwahati center
    focusEntry = null,
    markerLabelMode = "vehicle",
    nmrArea = null,
    allMode = false,
    selectedTransitLayer = [],
    schoolRoutes = [],
    pisRoutes = [],
    schoolBuses = [],
    pisBuses = [],
    pisStops = [],
    alertHeatmapData,
    showAlertHeatmap,
    selectedColumns = [],
}) => {
    const overlayElement = useRef();
    const lastClickedVehicleRef = useRef(null);
    const lastCenteredFocusImeiRef = useRef(null);
    const trackingDetailCacheRef = useRef({});
    const trackingDetailInFlightRef = useRef({});
    const trackingDetailLastFetchAtRef = useRef({});
    // NEW: Ref to store position history for moving average
    const positionHistoryRef = useRef({}); // Format: { [imei]: [{lat, lng}, ...] }
    // Inside MapComponent, add this ref
    const activeFeaturesRef = useRef({}); // Format: { [imei]: FeatureObject }
    const hasAutoFittedRef = useRef(false);

    const [map, setMap] = useState(null);
    const [vectorLayer, setVectorLayer] = useState(null);
    const [dynamicOverlay, setDynamicOverlay] = useState(null);
    const [drawVectorLayer, setDrawVectorLayer] = useState(null);
    const [drawInteraction, setDrawInteraction] = useState(null);
    const [poiVectorLayer, setPoiVectorLayer] = useState(null);
    const [incidentVectorLayer, setIncidentVectorLayer] = useState(null);
    const [nmrVectorLayer, setNmrVectorLayer] = useState(null);
    const [pois, setPois] = useState([]);
    const [selectedPoiData, setSelectedPoiData] = useState(null);
    const [transitLayer, setTransitLayer] =
        useState(null);
    const transitLayerRef = useRef(null);
    const [selectedTransitData, setSelectedTransitData] = useState(null);
    const [popupType, setPopupType] = useState(null); // vehicle | poi | transit
    const poiTransitOverlayElement = useRef();
    const [
        poiTransitOverlay,
        setPoiTransitOverlay,
    ] = useState(null);
    // Get Direction feature refs
    const routeVectorLayerRef = useRef(null);
    const activeVehicleForRouteRef = useRef(null); // { lat, lng } of vehicle when "Get Direction" clicked
    const isPickingDestinationRef = useRef(false);  // true while waiting for user map click
    const routeInfoOverlayRef = useRef(null);        // OL Overlay for route info popup
    const routeInfoOverlayElementRef = useRef(null);
    const drawSourceRef = useRef(new VectorSource());
    const [initialMap, setInitialMap] = useState(null);
    const alertLayerRef = useRef(null);

    const ALERT_TYPE_COLORS = {
        // NetworkLoss: "#ff9800",
        // ExtBatDiscnt: "#f44336",
        // LowExtBat: "#9c27b0",
        // LowIntBat: "#673ab7",
        // GPSLoss: "#795548",
        // OverSpeed: "#e91e63",
        // HarshBreak: "#2196f3",
        // HarshAcceleration: "#00bcd4",
        // HarshTurn: "#3f51b5",
        // Em: "#d50000",
        // Eng: "#4caf50",
        // BoxTemp: "#ff5722",
        NetworkLoss: "rgba(244, 67, 54, 0.5)",
        ExtBatDiscnt: "rgba(244, 67, 54, 0.5)",
        LowExtBat: "rgba(244, 67, 54, 0.5)",
        LowIntBat: "rgba(244, 67, 54, 0.5)",
        GPSLoss: "rgba(244, 67, 54, 0.5)",
        OverSpeed: "rgba(244, 67, 54, 0.5)",
        HarshBreak: "rgba(244, 67, 54, 0.5)",
        HarshAcceleration: "rgba(244, 67, 54, 0.5)",
        HarshTurn: "rgba(244, 67, 54, 0.5)",
        Em: "rgba(244, 67, 54, 0.5)",
        Eng: "rgba(244, 67, 54, 0.5)",
        BoxTemp: "rgba(244, 67, 54, 0.5)",
    };

    const showAlertMarkersOnMap = (
        map,
        alertData = []
    ) => {

        if (!map) return;

        if (alertLayerRef.current) {
            map.removeLayer(alertLayerRef.current);
        }

        const features = [];

        alertData.forEach((alert) => {

            const lat = Number(alert.latitude);
            const lon = Number(alert.longitude);

            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lon)
            ) {
                return;
            }

            const color =
                ALERT_TYPE_COLORS[
                alert.alert_type
                ] || "#000000";

            const feature = new Feature({
                geometry: new Point([
                    lon,
                    lat,
                ]),
                alertData: alert,
            });

            feature.setStyle(
                new Style({
                    image: new CircleStyle({
                        radius: 8,
                        fill: new Fill({
                            color,
                        }),
                        stroke: new Stroke({
                            color: "#ffffff",
                            width: 2,
                        }),
                    }),
                })
            );

            features.push(feature);

        });

        const source =
            new VectorSource({
                features,
            });

        const layer =
            new VectorLayer({
                source,
                zIndex: 9999,
            });

        map.addLayer(layer);

        alertLayerRef.current =
            layer;
    };

    useEffect(() => {

        const activeMap =
            map || initialMap;

        if (!activeMap) return;


        if (!showAlertHeatmap) {

            if (
                alertLayerRef.current
            ) {

                activeMap.removeLayer(
                    alertLayerRef.current
                );

                alertLayerRef.current =
                    null;
            }


        }

        showAlertMarkersOnMap(
            activeMap,
            alertHeatmapData
        );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        map,
        initialMap,
        alertHeatmapData,
        showAlertHeatmap
    ]);

    useEffect(() => {
        if (!map) return;

        const drawLayer = new VectorLayer({
            source: drawSourceRef.current,
            zIndex: 999999,
            style: new Style({
                stroke: new Stroke({
                    color: "#ff0000",
                    width: 3,
                }),
                fill: new Fill({
                    color: "rgba(255,0,0,0.15)",
                }),
            }),
        });

        map.addLayer(drawLayer);

        setDrawVectorLayer(drawLayer);

        return () => {
            map.removeLayer(drawLayer);
        };
    }, [map]);

    const renderTransitPopup = () => {
        if (!selectedTransitData) return null;

        const {
            type,
            data,
        } = selectedTransitData;

        switch (type) {

            case "school_route":
                return (
                    <div
                        style={{
                            padding: "12px",
                            minWidth: "320px",
                            maxWidth: "450px",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: "10px",
                                color: "#1976d2",
                            }}
                        >
                            School Route
                        </h3>

                        <table
                            style={{
                                width: "100%",
                                fontSize: "13px",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td><b>Route</b></td>
                                    <td>{data?.name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Route ID</b></td>
                                    <td>{data?.id || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Status</b></td>
                                    <td>{data?.status || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>School</b></td>
                                    <td>{data?.school_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>District</b></td>
                                    <td>{data?.district_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>State</b></td>
                                    <td>{data?.state_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Total Stops</b></td>
                                    <td>{data?.stops?.length || 0}</td>
                                </tr>

                                <tr>
                                    <td><b>Route Points</b></td>
                                    <td>
                                        {data?.route_points?.length || 0}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {data?.description && (
                            <div
                                style={{
                                    marginTop: "10px",
                                }}
                            >
                                <b>Description:</b>
                                <div>{data.description}</div>
                            </div>
                        )}

                        {data?.stops?.length > 0 && (
                            <div
                                style={{
                                    marginTop: "12px",
                                }}
                            >
                                <b>Stops</b>

                                <div
                                    style={{
                                        maxHeight: "150px",
                                        overflowY: "auto",
                                        marginTop: "5px",
                                    }}
                                >
                                    {data.stops.map(
                                        (stop) => (
                                            <div
                                                key={stop.id}
                                                style={{
                                                    border:
                                                        "1px solid #ddd",
                                                    padding: "6px",
                                                    marginBottom: "4px",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                <div>
                                                    <b>
                                                        {stop.order}.
                                                    </b>{" "}
                                                    {stop.name}
                                                </div>

                                                <div>
                                                    Time:
                                                    {" "}
                                                    {stop.timing}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "pis_route":
                return (
                    <div
                        style={{
                            padding: "12px",
                            minWidth: "320px",
                            maxWidth: "450px",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: "10px",
                                color: "green",
                            }}
                        >
                            PIS Route
                        </h3>

                        <table
                            style={{
                                width: "100%",
                                fontSize: "13px",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td><b>Route Name</b></td>
                                    <td>{data?.name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Route No</b></td>
                                    <td>{data?.route_number || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Route ID</b></td>
                                    <td>{data?.id || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Status</b></td>
                                    <td>{data?.status || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Source</b></td>
                                    <td>{data?.source_stop_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Destination</b></td>
                                    <td>{data?.destination_stop_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>District</b></td>
                                    <td>{data?.district_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>State</b></td>
                                    <td>{data?.state_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Total Stops</b></td>
                                    <td>{data?.stops?.length || 0}</td>
                                </tr>

                                <tr>
                                    <td><b>Path Points</b></td>
                                    <td>{data?.route_path?.length || 0}</td>
                                </tr>
                            </tbody>
                        </table>

                        {data?.stops?.length > 0 && (
                            <div
                                style={{
                                    marginTop: "12px",
                                }}
                            >
                                <b>Stops</b>

                                <div
                                    style={{
                                        maxHeight: "180px",
                                        overflowY: "auto",
                                        marginTop: "6px",
                                    }}
                                >
                                    {data.stops.map((stop) => (
                                        <div
                                            key={stop.id}
                                            style={{
                                                border: "1px solid #ddd",
                                                padding: "6px",
                                                marginBottom: "4px",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            <div>
                                                <b>{stop.order}.</b> {stop.name}
                                            </div>

                                            <div>
                                                Arrival:
                                                {" "}
                                                {stop.arrival_time_min} min
                                            </div>

                                            <div>
                                                Halt:
                                                {" "}
                                                {stop.halt_time_min} min
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            case "school_bus":
                return (
                    <div
                        style={{
                            padding: "12px",
                            minWidth: "340px",
                            maxWidth: "450px",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: "10px",
                                color: "#1976d2",
                            }}
                        >
                            School Bus Details
                        </h3>

                        <table
                            style={{
                                width: "100%",
                                fontSize: "13px",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td><b>Vehicle No</b></td>
                                    <td>{data?.vehicle_reg_no || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Vehicle Make</b></td>
                                    <td>{data?.vehicle_make || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Vehicle Model</b></td>
                                    <td>{data?.vehicle_model || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>School</b></td>
                                    <td>{data?.school_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Bus ID</b></td>
                                    <td>{data?.bus_id || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Speed</b></td>
                                    <td>
                                        {data?.speed !== null &&
                                            data?.speed !== undefined
                                            ? `${data.speed} km/h`
                                            : "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <td><b>Heading</b></td>
                                    <td>
                                        {data?.heading !== null &&
                                            data?.heading !== undefined
                                            ? `${data.heading}°`
                                            : "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <td><b>Ignition</b></td>
                                    <td>
                                        {data?.ignition_status === "1"
                                            ? "ON"
                                            : data?.ignition_status === "0"
                                                ? "OFF"
                                                : "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <td><b>Latitude</b></td>
                                    <td>{data?.latitude || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Longitude</b></td>
                                    <td>{data?.longitude || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Last Updated</b></td>
                                    <td>{data?.last_updated || "-"}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div
                            style={{
                                marginTop: "12px",
                                borderTop: "1px solid #ddd",
                                paddingTop: "10px",
                            }}
                        >
                            <h4
                                style={{
                                    margin: 0,
                                    marginBottom: "8px",
                                }}
                            >
                                Driver Details
                            </h4>

                            <table
                                style={{
                                    width: "100%",
                                    fontSize: "13px",
                                }}
                            >
                                <tbody>
                                    <tr>
                                        <td><b>Name</b></td>
                                        <td>
                                            {data?.driver?.name || "-"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td><b>Phone</b></td>
                                        <td>
                                            {data?.driver?.phone_no || "-"}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td><b>Driver ID</b></td>
                                        <td>
                                            {data?.driver?.id || "-"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "pis_bus":
                return (
                    <div
                        style={{
                            padding: "12px",
                            minWidth: "340px",
                            maxWidth: "450px",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: "10px",
                                color: "green",
                            }}
                        >
                            Public Bus Details
                        </h3>

                        <table
                            style={{
                                width: "100%",
                                fontSize: "13px",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td><b>Vehicle No</b></td>
                                    <td>{data?.vehicle_reg_no || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Bus ID</b></td>
                                    <td>{data?.bus_id || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Route No</b></td>
                                    <td>{data?.route_number || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Route Name</b></td>
                                    <td>{data?.route_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Service Type</b></td>
                                    <td>{data?.service_type || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Schedule ID</b></td>
                                    <td>{data?.schedule_id || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Schedule Status</b></td>
                                    <td>
                                        <span
                                            style={{
                                                color:
                                                    data?.schedule_status === "started"
                                                        ? "green"
                                                        : "red",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {data?.schedule_status || "-"}
                                        </span>
                                    </td>
                                </tr>

                                <tr>
                                    <td><b>Speed</b></td>
                                    <td>
                                        {data?.speed !== null &&
                                            data?.speed !== undefined
                                            ? `${data.speed} km/h`
                                            : "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <td><b>Heading</b></td>
                                    <td>
                                        {data?.heading !== null &&
                                            data?.heading !== undefined
                                            ? `${data.heading}°`
                                            : "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <td><b>Ignition</b></td>
                                    <td>
                                        {data?.ignition_status === "1"
                                            ? "ON"
                                            : data?.ignition_status === "0"
                                                ? "OFF"
                                                : "-"}
                                    </td>
                                </tr>

                                <tr>
                                    <td><b>Latitude</b></td>
                                    <td>{data?.latitude || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Longitude</b></td>
                                    <td>{data?.longitude || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Last Updated</b></td>
                                    <td>{data?.last_updated || "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            case "pis_stop":
                return (
                    <div
                        style={{
                            padding: "12px",
                            minWidth: "320px",
                            maxWidth: "450px",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: "10px",
                                color: "#ff9800",
                            }}
                        >
                            Public Bus Stop
                        </h3>

                        <table
                            style={{
                                width: "100%",
                                fontSize: "13px",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td><b>Stop ID</b></td>
                                    <td>{data?.id || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Stop Name</b></td>
                                    <td>{data?.name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Address</b></td>
                                    <td>{data?.address || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>District</b></td>
                                    <td>{data?.district_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>State</b></td>
                                    <td>{data?.state_name || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Latitude</b></td>
                                    <td>{data?.latitude || "-"}</td>
                                </tr>

                                <tr>
                                    <td><b>Longitude</b></td>
                                    <td>{data?.longitude || "-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            default:
                return (
                    <pre>
                        {JSON.stringify(
                            data,
                            null,
                            2
                        )}
                    </pre>
                );
        }
    };
    useEffect(() => {
        if (!map) return;

        if (transitLayerRef.current) {
            map.removeLayer(transitLayerRef.current);
        }

        const layer = new VectorLayer({
            source: new VectorSource(),
            zIndex: 99999,
            visible: true,
        });

        map.addLayer(layer);

        transitLayerRef.current = layer;

        return () => {
            if (map && layer) {
                map.removeLayer(layer);
            }
        };
    }, [map]);

    useEffect(() => {
        if (!map || transitLayer) return;

        const transitSource = new VectorSource();

        const layer = new VectorLayer({
            source: transitSource,
            zIndex: 9999,
        });

        map.addLayer(layer);
        setTransitLayer(layer);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, transitLayer]);


    useEffect(() => {
        if (!map || !transitLayerRef.current) return;

        const source =
            transitLayerRef.current.getSource();

        if (!source) return;

        source.clear();


        // ==========================
        // SCHOOL ROUTES
        // ==========================
        if (selectedTransitLayer.includes("school_routes")) {
            schoolRoutes.forEach((route) => {
                const routePoints = route?.route_points || [];

                if (!Array.isArray(routePoints)) return;
                if (routePoints.length < 2) return;

                const coordinates = routePoints
                    .filter(
                        (p) =>
                            Number.isFinite(Number(p?.lat)) &&
                            Number.isFinite(Number(p?.lng))
                    )
                    .map((p) => [
                        Number(p.lng),
                        Number(p.lat),
                    ]);

                if (coordinates.length < 2) return;



                const routeFeature = new Feature({
                    geometry: new LineString(coordinates),
                    transitData: route,
                    transitType: "school_route",
                });


                routeFeature.setStyle(
                    new Style({
                        stroke: new Stroke({
                            color: "#1976d2",
                            width: 4,
                        }),
                    })
                );

                source.addFeature(routeFeature);

            });
        }

        // ==========================
        // PIS ROUTES
        // ==========================
        if (selectedTransitLayer.includes("pis_routes")) {
            pisRoutes.forEach((route) => {
                const routePoints =
                    route?.route_path || [];

                if (!Array.isArray(routePoints)) return;
                if (routePoints.length < 2) return;

                const coordinates = routePoints
                    .filter(
                        (p) =>
                            Number.isFinite(Number(p?.lat)) &&
                            Number.isFinite(Number(p?.lng))
                    )
                    .map((p) => [
                        Number(p.lng),
                        Number(p.lat),
                    ]);

                if (coordinates.length < 2) return;

                const routeFeature = new Feature({
                    geometry: new LineString(coordinates),
                    transitData: route,
                    transitType: "pis_route",
                });

                routeFeature.setStyle(
                    new Style({
                        stroke: new Stroke({
                            color: "green",
                            width: 4,
                        }),
                    })
                );

                source.addFeature(routeFeature);

            });
        }

        // ==========================
        // SCHOOL BUSES
        // ==========================
        if (selectedTransitLayer.includes("school_buses")) {
            schoolBuses.forEach((bus) => {
                const lat = Number(bus?.latitude ?? bus?.lat);
                const lon = Number(
                    bus?.longitude ??
                    bus?.lng ??
                    bus?.lon
                );

                if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lon)
                )
                    return;

                const feature = new Feature({
                    geometry: new Point([
                        lon,
                        lat,
                    ]),
                    transitData: bus,
                    transitType: "school_bus",
                });

                feature.setStyle(
                    new Style({
                        image: new CircleStyle({
                            radius: 8,
                            fill: new Fill({
                                color: "#1976d2",
                            }),
                            stroke: new Stroke({
                                color: "#fff",
                                width: 2,
                            }),
                        }),
                    })
                );

                source.addFeature(feature);

            });
        }

        // ==========================
        // PIS BUSES
        // ==========================
        if (selectedTransitLayer.includes("pis_buses")) {
            pisBuses.forEach((bus) => {
                const lat = Number(bus?.latitude ?? bus?.lat);
                const lon = Number(
                    bus?.longitude ??
                    bus?.lng ??
                    bus?.lon
                );

                if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lon)
                )
                    return;

                const feature = new Feature({
                    geometry: new Point([
                        lon,
                        lat,
                    ]),
                    transitData: bus,
                    transitType: "pis_bus",
                });

                feature.setStyle(
                    new Style({
                        image: new CircleStyle({
                            radius: 8,
                            fill: new Fill({
                                color: "green",
                            }),
                            stroke: new Stroke({
                                color: "#fff",
                                width: 2,
                            }),
                        }),
                    })
                );

                source.addFeature(feature);
            });
        }

        // ==========================
        // PIS STOPS
        // ==========================
        if (selectedTransitLayer.includes("pis_stops")) {
            pisStops.forEach((stop) => {
                const lat = Number(stop?.latitude ?? stop?.lat);
                const lon = Number(
                    stop?.longitude ??
                    stop?.lng ??
                    stop?.lon
                );

                if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lon)
                )
                    return;

                const feature = new Feature({
                    geometry: new Point([
                        lon,
                        lat,
                    ]),
                    transitData: stop,
                    transitType: "pis_stop",
                });

                feature.setStyle(
                    new Style({
                        image: new CircleStyle({
                            radius: 7,
                            fill: new Fill({
                                color: "#ff9800",
                            }),
                            stroke: new Stroke({
                                color: "#fff",
                                width: 2,
                            }),
                        }),
                    })
                );

                source.addFeature(feature);
            });
        }


        const extent = source.getExtent();


        if (
            extent &&
            extent.every((v) =>
                Number.isFinite(v)
            )
        ) {
            map.getView().fit(extent, {
                padding: [50, 50, 50, 50],
                duration: 1000,
                maxZoom: 17,
            });
        }
    }, [
        map,
        transitLayer,
        selectedTransitLayer,
        schoolRoutes,
        pisRoutes,
        schoolBuses,
        pisBuses,
        pisStops,
    ]);
    useEffect(() => {
        if (!map || !selectedPoi || !poiVectorLayer) return;

        poiVectorLayer.setVisible(true);
 
        const source = poiVectorLayer.getSource();
        source.clear();

        try {
            const location = JSON.parse(selectedPoi.location);
            if (!Array.isArray(location) || location.length === 0) return;

            let feature;
            let focusCenter = null;

            switch (selectedPoi.mark_type) {
                case "Point": {
                    if (location[0] && location[0].length === 2) {
                        const [lat, lon] = location[0];
                        const longitude = Number(lon);
                        const latitude = Number(lat);
                        if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                            feature = new Feature({
                                geometry: new Point([longitude, latitude]),
                                poiData: selectedPoi,
                            });
                            focusCenter = [longitude, latitude];
                        }
                    }
                    break;
                }

                case "Circle": {
                    if (location[0] && location[0].length === 2) {
                        const [lat, lon] = location[0];
                        const longitude = Number(lon);
                        const latitude = Number(lat);
                        if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                            const radiusMeters = parseFloat(selectedPoi.radius) || 100;
                            const metersPerDegree =
                                111320 * Math.cos((latitude * Math.PI) / 180) || 111320;
                            const radiusDegrees = radiusMeters / metersPerDegree;
                            feature = new Feature({
                                geometry: new Circle([longitude, latitude], radiusDegrees),
                                poiData: selectedPoi,
                            });
                            focusCenter = [longitude, latitude];
                        }
                    }
                    break;
                }

                case "Polygon": {
                    if (location.length >= 3) {
                        const polygonCoords = location
                            .map((coord) => {
                                if (coord && coord.length === 2) {
                                    const [lat, lon] = coord;
                                    const longitude = Number(lon);
                                    const latitude = Number(lat);
                                    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                                        return [longitude, latitude];
                                    }
                                }
                                return null;
                            })
                            .filter((coord) => coord !== null);

                        if (polygonCoords.length >= 3) {
                            feature = new Feature({
                                geometry: new Polygon([polygonCoords]),
                                poiData: selectedPoi,
                            });
                            // Focus on centroid of first coordinate
                            focusCenter = polygonCoords[0];
                        }
                    }
                    break;
                }

                case "Road": {
                    if (location.length >= 2) {
                        const roadCoords = location
                            .map((coord) => {
                                if (coord && coord.length === 2) {
                                    const [lat, lon] = coord;
                                    const longitude = Number(lon);
                                    const latitude = Number(lat);
                                    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                                        return [longitude, latitude];
                                    }
                                }
                                return null;
                            })
                            .filter((coord) => coord !== null);

                        if (roadCoords.length >= 2) {
                            feature = new Feature({
                                geometry: new LineString(roadCoords),
                                poiData: selectedPoi,
                            });
                            // Focus on midpoint of the road
                            const midIdx = Math.floor(roadCoords.length / 2);
                            focusCenter = roadCoords[midIdx];
                        }
                    }
                    break;
                }

                default:
                    break;
            }

            if (feature) {
                const styles = getPoiStyles(selectedPoi);
                feature.setStyle(styles);
                source.addFeature(feature);

                if (focusCenter) {
                    map.getView().animate({
                        center: focusCenter,
                        zoom: 17,
                        duration: 1000,
                    });
                }
            }
        } catch (error) {
            console.error("Error rendering selectedPoi on map:", selectedPoi?.id, error);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPoi, map, poiVectorLayer]);

    const [soiLayerVisibility, setSoiLayerVisibility] = useState({
        states: false,
        assamDistrict: false,
        assamDistrictBdy2: false,
        assamDistrictHq: false,
        assamStateBdy: false,
        assamSubdistrictBdy: false,
        cartTrackHills: false,
        contours: false,
        kamrupRural: false,
        majorTowns: false,
        name: false,
        railwayTracks: false,
        roads: false,
        roadsAllWeatherMotorable: false,
        roadsMotorableInFairWeather: false,
        roadsNationalHighway: false,
        roadOthers: false,
        roadTunnel: false,
        stateHighway: false,
        buildingFootprint: false,
        roadSurface: false,
        busStop: false,
        block: false,
        skytronAssamCombined: false,
        assamTowns: false,
        bhuvanAmrutNogaon: false,
        bhuvanNuisSilchar: false,
        bhuvanSikkim: false,
        bhuvanAssam: false,
        bhuvanKamrupMetro: false,
        bhuvanFloodAssam: false,
        bhuvanAmrutSilchar: false,
        bhuvanAmrutDibrugarh: false,
        bhuvanAmrutGuwahati: false,
        bhuvanManipur: false,
        bhuvanWestBengal: false,
        bhuvanTripura: false,
        bhuvanNagaland: false,
        bhuvanMeghalaya: false,
        bhuvanMizoram: false,
        bhuvanArunachal: false,
    });

    const soiLayersRef = useRef({
        states: null,
        assamDistrict: null,
        assamDistrictBdy2: null,
        assamDistrictHq: null,
        assamStateBdy: null,
        assamSubdistrictBdy: null,
        cartTrackHills: null,
        contours: null,
        kamrupRural: null,
        majorTowns: null,
        name: null,
        railwayTracks: null,
        roads: null,
        roadsAllWeatherMotorable: null,
        roadsMotorableInFairWeather: null,
        roadsNationalHighway: null,
        roadOthers: null,
        roadTunnel: null,
        stateHighway: null,
        buildingFootprint: null,
        roadSurface: null,
        busStop: null,
        block: null,
        skytronAssamCombined: null,
        assamTowns: null,
        bhuvanAmrutNogaon: null,
        bhuvanNuisSilchar: null,
        bhuvanSikkim: null,
        bhuvanAssam: null,
        bhuvanKamrupMetro: null,
        bhuvanFloodAssam: null,
        bhuvanAmrutSilchar: null,
        bhuvanAmrutDibrugarh: null,
        bhuvanAmrutGuwahati: null,
        bhuvanManipur: null,
        bhuvanWestBengal: null,
        bhuvanTripura: null,
        bhuvanNagaland: null,
        bhuvanMeghalaya: null,
        bhuvanMizoram: null,
        bhuvanArunachal: null,
    });

    // Map type state for 3-layer system
    const [mapType, setMapType] = useState("normal"); // 'normal', 'satellite', 'hd'
    const legacyMapMapRef = useRef(null);
    const olMapRef = useRef(null);
    const normalMapRef = useRef(null);
    const olWasDraggingRef = useRef(false);
    const normalMapContainerRef = useRef(null);
    const satelliteMapContainerRef = useRef(null);
    const soiMapContainerRef = useRef(null);
    const hdMapContainerRef = useRef(null); // LegacyMap SDK Refs
    const hdMapInnerRef = useRef(null);
    const hdVehicleMarkersRef = useRef([]); // Store vehicle markers for HD map
    const hdPoiMarkersRef = useRef([]); // Store POI markers for HD map
    const hdIncidentMarkersRef = useRef([]); // Store incident markers for HD map
    const legacyMapInstanceRef = useRef(null);
    const legacyMapInitializedRef = useRef(false);
    const legacyMapInitInProgressRef = useRef(false);
    const legacyMapLibraryPollRef = useRef(null);
    const hdMapContainerIdRef = useRef(null);

    // HD Map Drawing State & Refs
    const [drawingMode, setDrawingMode] = useState(null); // 'polygon' or null
    const [drawingPoints, setDrawingPoints] = useState([]);
    const tempPolyRef = useRef(null);
    const tempMarkersRef = useRef([]);

    /**
    * Logic to calculate averaged location
    */
    const getAveragedLocation = (entry) => {
        const imei = entry.imei || entry.imei_no || "unknown";
        const rawLat = Number(entry.latitude);
        const rawLng = Number(entry.longitude);

        if (!Number.isFinite(rawLat) || !Number.isFinite(rawLng)) {
            return { lat: rawLat, lng: rawLng };
        }

        if (!positionHistoryRef.current[imei]) {
            positionHistoryRef.current[imei] = [];
        }

        const history = positionHistoryRef.current[imei];
        history.push({ lat: rawLat, lng: rawLng });

        if (history.length > 5) {
            history.shift();
        }

        const sum = history.reduce((acc, curr) => ({
            lat: acc.lat + curr.lat,
            lng: acc.lng + curr.lng
        }), { lat: 0, lng: 0 });

        const avgLat = sum.lat / history.length;
        const avgLng = sum.lng / history.length;

        // console.log(`[Verify Average] Vehicle: ${entry.vehicle_registration_number || imei}`);
        // console.table({
        //     Raw: { lat: rawLat, lng: rawLng },
        //     Averaged: { lat: avgLat, lng: avgLng },
        //     PointsUsed: history.length
        // });

        return { lat: avgLat, lng: avgLng };
    };



    const fetchVehicleTrackingDetail = async (entry) => {
        const imei =
            entry?.imei ||
            entry?.imei_no ||
            entry?.imeiNo ||
            entry?.device_tag_info?.device?.imei ||
            entry?.device_tag_info?.imei;
        const regno =
            entry?.vehicle_registration_number ||
            entry?.vehicle_reg_no ||
            entry?.device_tag_info?.device?.vehicle_reg_no ||
            entry?.device_tag_info?.vehicle?.vehicle_reg_no ||
            "";

        const cacheKey = imei ? `imei:${imei}` : regno ? `regno:${regno}` : null;
        if (!cacheKey) return null;

        const cached = trackingDetailCacheRef.current[cacheKey];
        if (cached) return cached;

        const inFlight = trackingDetailInFlightRef.current[cacheKey];
        if (inFlight) return inFlight;

        const now = Date.now();
        const lastFetchAt = trackingDetailLastFetchAtRef.current[cacheKey];
        if (lastFetchAt && now - lastFetchAt < 15000) {
            return null;
        }
        trackingDetailLastFetchAtRef.current[cacheKey] = now;

        const reqPromise = HomePageService.getLiveTracking_data({
            imei: imei || "",
            regno,
            owner: "",
            poi: "",
            roads: "",
            polygon: "",
            category: "",
            make: "",
            district: "",
            speed_limit: "",
            poi_id: "",
            in_range: false,
            poi_as_polygon: false,
        })
            .then((resp) => {
                const detail = Array.isArray(resp?.data?.data) ? resp.data.data[0] : null;
                if (detail) {
                    trackingDetailCacheRef.current[cacheKey] = detail;
                    return detail;
                }
                return null;
            })
            .catch(() => null)
            .finally(() => {
                delete trackingDetailInFlightRef.current[cacheKey];
            });

        trackingDetailInFlightRef.current[cacheKey] = reqPromise;
        return reqPromise;
    };

    // Geocoding State
    const [geoSearchQuery, setGeoSearchQuery] = useState('');
    const [geoSearchResults, setGeoSearchResults] = useState([]); // Store search results
    const [showVehicles, setShowVehicles] = useState(true);
    const [showPois, setShowPois] = useState(false);
    const [showIncidents, setShowIncidents] = useState(false);
    const [geoSearchLoading, setGeoSearchLoading] = useState(false);
    const [useOldGeocodingApi, setUseOldGeocodingApiState] = useState(getUseOldGeocodingApi());
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const LEGACYMAP_GEOCODING_TOKEN = "hbetrqpnyaoqssztkakwzjjmoxkowalvbwus";
    const theme = useTheme();

    const USE_TYPE_COLORS = {
        school: "#1E88E5",
        hospital: "#E53935",
        dealership: "#8E24AA",
        dealer: "#8E24AA",
        personal: "#43A047",
        prohibited_area: "#D81B60",
        Prohibited_Area: "#D81B60",
        unauthorised_stop: "#D81B60",
        permitroute: "#FB8C00",
        tollgate: "#6D4C41",
        parking: "#00897B",
        no_parking: "#C62828",
        NoParking: "#C62828",
        noparking: "#C62828",
        villageboundary: "#5E35B1",
        cityboundary: "#3949AB",
        districtboundary: "#00838F",
        stateboundary: "#00695C",
        fuelstation: "#FDD835",
        busstop: "#7CB342",
        railwaystation: "#5C6BC0",
        airport: "#039BE5",
        other: "#546E7A",
    };

    const hexToRgba = (hex, alpha) => {
        if (!hex) {
            return `rgba(30, 136, 229, ${alpha})`;
        }

        let normalized = hex.replace("#", "");
        if (normalized.length === 3) {
            normalized = normalized
                .split("")
                .map((char) => char + char)
                .join("");
        }

        const bigint = parseInt(normalized, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const getUseTypeColor = (poi) => {
        const key = poi?.use_type?.toLowerCase();
        return USE_TYPE_COLORS[key] || "#1E88E5";
    };

    const createIconStyle = (color, vehicleType, labelText) => {
        const normalizedVehicleType = vehicleType
            ? vehicleType.toLowerCase().replace(/\s+/g, "_")
            : "bus";

        const availableTypes = [
            "ambulance",
            "bus",
            "dumper",
            "police",
            "school_bus",
            "tanker",
            "taxi",
            "truck",
        ];
        const iconType = availableTypes.includes(normalizedVehicleType)
            ? normalizedVehicleType
            : "bus";

        let iconPath;
        try {
            iconPath = vehicleIconContext(`./${color}/${iconType}.png`);
        } catch (error) {
            try {
                iconPath = vehicleIconContext(`./${color}/bus.png`);
            } catch (fallbackError) {
                iconPath = vehicleIconContext(`./default/bus.png`);
            }
        }

        const standardWidth = 45;
        const iconWidth = standardWidth;
        // Reduce gap to make it "stick" to top of the icon
        const labelGap = color === "grey" ? 5 : 0;
        const labelOffsetY = -(Math.round(iconWidth / 2) + labelGap);

        const textStyle = labelText
            ? new Text({
                text: labelText,
                font: '11px "Roboto", sans-serif',
                fill: new Fill({ color: "#0D47A1" }),
                stroke: new Stroke({ color: "#ffffff", width: 3 }),
                backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.92)" }),
                padding: [1, 3, 1, 3],
                textAlign: 'center',
                textBaseline: 'bottom',
                offsetY: labelOffsetY,
            })
            : undefined;

        // Force rotation to 0
        const rotation = 0;
        const rotationInRadians = (rotation * Math.PI) / 180;

        return new Style({
            image: new Icon({
                anchor: [0.5, 0.5],
                src: iconPath,
                width: iconWidth,
                rotation: rotationInRadians,
                rotateWithView: true,
            }),
            text: textStyle,
        });
    };

    const getMarkerLabel = (entry, mode) => {
        if (!entry) return "";
        switch (mode) {
            case "block": {
                return (
                    entry.block_name ||
                    entry.block ||
                    entry.blockName ||
                    entry.area_name ||
                    entry.area ||
                    entry.device_tag_info?.block?.name ||
                    entry.device_tag_info?.block_name ||
                    entry.device_tag_info?.device?.block_name ||
                    entry.device_tag_info?.device?.district ||
                    entry.device_tag_info?.state_info?.state ||
                    entry.district ||
                    entry.address ||
                    entry.nearest_poi?.data?.address ||
                    ""
                );
            }
            case "route": {
                const routeId = entry.route_id ||
                    entry.route_ref?.id ||
                    entry.device_tag_info?.route?.id ||
                    entry.nearby_routes_within_100m?.[0]?.data?.id;
                return (
                    entry.route_name ||
                    entry.route ||
                    (routeId ? `Route: ${routeId}` : "") ||
                    entry.route_info ||
                    entry.routeInformation ||
                    entry.route_ref?.name ||
                    ""
                );
            }
            case "vehicle":
            default: {
                return (
                    entry.vehicle_registration_number ||
                    entry.vehicle_reg_no ||
                    entry.device_tag_info?.device?.vehicle_reg_no ||
                    entry.device_tag_info?.vehicle?.vehicle_reg_no ||
                    entry.imei ||
                    ""
                );
            }
        }
    };

    const getVehicleMarkerIconUrl = (color, vehicleType) => {
        const categoryName = typeof vehicleType === 'object' ? vehicleType?.category : vehicleType;
        const normalizedVehicleType = categoryName
            ? categoryName.toLowerCase().replace(/\s+/g, "_")
            : "bus";
        const availableTypes = [
            "ambulance",
            "bus",
            "dumper",
            "police",
            "school_bus",
            "tanker",
            "taxi",
            "truck",
        ];
        const iconType = availableTypes.includes(normalizedVehicleType)
            ? normalizedVehicleType
            : "bus";

        const allowedColors = ["red", "orange", "blue", "green", "grey", "default"];
        const safeColor = allowedColors.includes(color) ? color : "default";

        try {
            return require(`../../assets/images/${safeColor}/${iconType}.png`);
        } catch (error) {
            try {
                return require(`../../assets/images/default/bus.png`);
            } catch (fallbackError) {
                console.error("Failed to resolve vehicle icon for HD map marker", {
                    error,
                    fallbackError,
                });
                return null;
            }
        }
    };

    const getPoiMarkerIcon = (color) => {
        const safeColor = color || "#1E88E5";
        const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
<g fill="none" fill-rule="evenodd">
<path d="M0 0h24v24H0z"/>
<path fill="${safeColor}" d="M12 2c4.418 0 8 3.134 8 7 0 5.25-8 13-8 13S4 14.25 4 9c0-3.866 3.582-7 8-7Zm0 4a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 6Z"/>
</g>
</svg>`;

        if (typeof window !== "undefined" && typeof window.btoa === "function") {
            return `data:image/svg+xml;base64,${window.btoa(svg)}`;
        }

        return null;
    };

    const getPoiStyles = (poi) => {
        const baseColor = getUseTypeColor(poi);
        const fillColor = hexToRgba(baseColor, 0.18);

        const primaryLabel = poi?.name?.trim();
        const secondaryLabel = poi?.use_type?.trim();
        const fallbackLabel = poi?.description?.trim();
        const displayText =
            primaryLabel || secondaryLabel || fallbackLabel || `POI ${poi?.id ?? ""}`;

        const createText = (overrides = {}) =>
            new Text({
                text: displayText,
                font: '12px "Roboto", sans-serif',
                fill: new Fill({ color: "#0D47A1" }),
                stroke: new Stroke({ color: "#ffffff", width: 3 }),
                backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.92)" }),
                padding: [2, 4, 2, 4],
                ...overrides,
            });

        switch (poi?.mark_type) {
            case "Point":
                return [
                    new Style({
                        image: new CircleStyle({
                            radius: 7,
                            fill: new Fill({ color: baseColor }),
                            stroke: new Stroke({ color: "#ffffff", width: 2 }),
                        }),
                        text: createText({ offsetY: -20 }),
                        zIndex: 1000,
                    }),
                ];

            case "Circle":
                return [
                    new Style({
                        fill: new Fill({ color: fillColor }),
                        stroke: new Stroke({ color: baseColor, width: 2 }),
                        zIndex: 900,
                    }),
                    new Style({
                        text: createText(),
                        geometry: (feature) => {
                            const geometry = feature.getGeometry();
                            if (!geometry || !geometry.getCenter) return null;
                            return new Point(geometry.getCenter());
                        },
                        zIndex: 950,
                    }),
                ];

            case "Polygon":
                return [
                    new Style({
                        fill: new Fill({ color: fillColor }),
                        stroke: new Stroke({ color: baseColor, width: 2 }),
                        zIndex: 900,
                    }),
                    new Style({
                        text: createText(),
                        geometry: (feature) => {
                            const geometry = feature.getGeometry();
                            return geometry && geometry.getInteriorPoint
                                ? geometry.getInteriorPoint()
                                : null;
                        },
                        zIndex: 950,
                    }),
                ];

            case "Road":
                return [
                    new Style({
                        stroke: new Stroke({ color: baseColor, width: 3 }),
                        zIndex: 900,
                    }),
                    new Style({
                        text: createText(),
                        geometry: (feature) => {
                            const geometry = feature.getGeometry();
                            if (!geometry || !geometry.getCoordinateAt) return null;
                            const coordinate = geometry.getCoordinateAt(0.5);
                            return coordinate ? new Point(coordinate) : null;
                        },
                        zIndex: 950,
                    }),
                ];

            default:
                return [
                    new Style({
                        image: new CircleStyle({
                            radius: 7,
                            fill: new Fill({ color: baseColor }),
                            stroke: new Stroke({ color: "#ffffff", width: 2 }),
                        }),
                        text: createText({ offsetY: -20 }),
                        zIndex: 1000,
                    }),
                ];
        }
    };

    const clusterStyleFunction = (feature) => {
        const features = feature.get('features');
        const size = features.length;

        if (size === 1) {
            // Return the style of the original feature
            return features[0].getStyle();
        }

        return new Style({
            image: new CircleStyle({
                radius: 12 + Math.min(size * 0.5, 8),
                stroke: new Stroke({ color: '#fff', width: 2 }),
                fill: new Fill({ color: '#1976d2' }),
            }),
            text: new Text({
                text: size.toString(),
                fill: new Fill({ color: '#fff' }),
                font: 'bold 12px "Roboto", sans-serif',
            }),
        });
    };

    // Initialize Normal Map (Default)
    useEffect(() => {
        if (mapType !== "normal" || !normalMapContainerRef.current) return;

        // Create the three WMS layers matching POIViewer.jsx configuration exactly
        const india3Layer = new TileLayer({
            source: createBhuvanSource("india3"),
            zIndex: 1,
        });

        const adminGroupLayer = new TileLayer({
            source: createBhuvanSource("basemap%3Aadmin_group"),
            zIndex: 4,
        });

        const roadsLayer = new TileLayer({
            source: new XYZ({
                url: process.env.REACT_APP_TILE_SERVER_URL || "https://map2.gromed.in/tile/{z}/{x}/{y}.png",
                attributions: '&copy; OpenStreetMap contributors',
                maxZoom: 20,
                projection: "EPSG:3857"
            }),
            zIndex: 3,
            minZoom: 11,
        });

        const initialMap = new Map({
            target: normalMapContainerRef.current,
            layers: [india3Layer, adminGroupLayer, roadsLayer],

            view: new View({
                projection: "EPSG:4326",
                center: [91.7362, 26.1445], // Guwahati, Assam
                zoom: 6,
                maxZoom: 32,
                constrainResolution: true,
            }),

            controls: [
                new ZoomSlider(),
                new FullScreen(),
                // new ScaleLine()
            ],

            pixelRatio: 1,
        });

        // Initialize vector layer for markers
        // Initialize vector layer for markers (with Clustering)
        const initialVectorLayer = new VectorLayer({
            source: new Cluster({
                distance: 40,
                source: new VectorSource(),
            }),
            zIndex: 200,
            style: clusterStyleFunction,
        });
        initialMap.addLayer(initialVectorLayer);

        // Initialize POI vector layer
        const poiSource = new VectorSource();
        const initialPoiVectorLayer = new VectorLayer({
            source: poiSource,
            zIndex: 100,
            declutter: true,
            visible: false,
        });
        initialMap.addLayer(initialPoiVectorLayer);
        setPoiVectorLayer(initialPoiVectorLayer);

        // Initialize incident vector layer
        const incidentSource = new VectorSource();
        const initialIncidentVectorLayer = new VectorLayer({
            source: incidentSource,
            zIndex: 300,
            visible: false,
        });
        initialMap.addLayer(initialIncidentVectorLayer);
        setIncidentVectorLayer(initialIncidentVectorLayer);

        // Initialize NMR circle vector layer
        const nmrSource = new VectorSource();
        const initialNmrVectorLayer = new VectorLayer({
            source: nmrSource,
            zIndex: 250,
            visible: true,
        });
        initialMap.addLayer(initialNmrVectorLayer);
        setNmrVectorLayer(initialNmrVectorLayer);

        // Initialize vector layer for drawing
        const drawSource = new VectorSource();
        const drawLayer = new VectorLayer({
            source: drawSource,
            style: new Style({
                fill: new Fill({
                    color: "rgba(255, 255, 255, 0.2)",
                }),
                stroke: new Stroke({
                    color: "#ffcc33",
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: "#ffcc33",
                    }),
                }),
            }),
        });
        initialMap.addLayer(drawLayer);

        // Create dynamic overlay
        const initialOverlay = new Overlay({
            element: overlayElement.current,
        });
        initialMap.addOverlay(initialOverlay);
        // initialMap.on("singleclick", (evt) => {
        //     let poiFound = false;

        //     initialMap.forEachFeatureAtPixel(evt.pixel, (feature) => {
        //         const poiData = feature.get("poiData");

        //         if (poiData) {
        //             setSelectedPoiData(poiData);

        //             initialOverlay.setPosition(
        //                 feature.getGeometry().getCoordinates()
        //             );

        //             poiFound = true;
        //             return true;
        //         }
        //     });

        //     if (!poiFound) {
        //         setSelectedPoiData(null);
        //         initialOverlay.setPosition(undefined);
        //     }
        // });

        const poiTransitPopupOverlay =
            new Overlay({
                element:
                    poiTransitOverlayElement.current,
                autoPan: true,
            });

        initialMap.addOverlay(
            poiTransitPopupOverlay
        );

        setPoiTransitOverlay(
            poiTransitPopupOverlay
        );
        initialMap.on("singleclick", (evt) => {


            let clickedPoi = false;
            let clickedTransit = false;

            initialMap.forEachFeatureAtPixel(evt.pixel, (feature) => {

                const poiData = feature.get("poiData");
                const transitData = feature.get("transitData");

                // POI Popup
                if (poiData) {

                    setPopupType("poi");
                    console.log("POI CLICK DATA:", poiData);
                    setSelectedPoiData(poiData);
                    setSelectedTransitData(null);

                    poiTransitPopupOverlay.setPosition(
                        feature.getGeometry().getCoordinates()
                    );

                    clickedPoi = true;
                    return true;
                }

                // Transit Popup
                if (transitData) {

                    const transitType =
                        feature.get("transitType");

                    setPopupType("transit");

                    setSelectedTransitData({
                        type: transitType,
                        data: transitData,
                    });

                    setSelectedPoiData(null);

                    let coordinate;

                    if (
                        feature.getGeometry() &&
                        feature.getGeometry().getType() === "LineString"
                    ) {
                        coordinate =
                            feature.getGeometry().getCoordinateAt(0.5);
                    } else {
                        coordinate =
                            feature.getGeometry().getCoordinates();
                    }

                    poiTransitPopupOverlay.setPosition(
                        coordinate
                    );

                    clickedTransit = true;
                    return true;
                }
            });

            if (!clickedPoi && !clickedTransit) {
                setSelectedPoiData(null);
                setSelectedTransitData(null);
                initialOverlay.setPosition(undefined);
            }
        });

        if (routeInfoOverlayElementRef.current) {
            const routeInfoOverlay = new Overlay({
                element: routeInfoOverlayElementRef.current,
                autoPan: true,
                positioning: "bottom-center",
                stopEvent: true,
            });
            initialMap.addOverlay(routeInfoOverlay);
            routeInfoOverlayRef.current = routeInfoOverlay;
        }

        setMap(initialMap);
        setVectorLayer(initialVectorLayer);
        setDynamicOverlay(initialOverlay);
        setDrawVectorLayer(drawLayer);
        normalMapRef.current = initialMap;

        return () => {
            if (normalMapRef.current) {
                normalMapRef.current.setTarget(null);
                normalMapRef.current = null;
            }
        };
    }, [mapType]);

    // Initialize Satellite Map (OpenLayers)
    useEffect(() => {
        if (mapType !== "satellite" || !satelliteMapContainerRef.current) return;

        try {

            // OSM Satellite layer
            const osmLayer = new TileLayer({
                title: "OSM Satellite",
                source: new XYZ({
                    url: process.env.REACT_APP_SATELLITE_TILE_URL || "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    attributions: " Esri",
                    maxZoom: 18,
                }),
                zIndex: 0,
            });

            const satelliteMap = new Map({
                target: satelliteMapContainerRef.current,
                layers: [osmLayer],
                view: new View({
                    projection: "EPSG:4326",
                    center: [91.7362, 26.1445],
                    zoom: 13,
                    maxZoom: 22,
                    constrainResolution: true,
                }),
                controls: [
                    new ZoomSlider(),
                    new FullScreen(),
                    new ScaleLine()
                ],
                pixelRatio: 1,
            });

            // Initialize vector layer for markers
            // Initialize vector layer for markers (with Clustering)
            const initialVectorLayer = new VectorLayer({
                source: new Cluster({
                    distance: 40,
                    source: new VectorSource(),
                }),
                zIndex: 200,
                style: clusterStyleFunction,
            });
            satelliteMap.addLayer(initialVectorLayer);

            // Initialize POI vector layer
            const poiSource = new VectorSource();
            const initialPoiVectorLayer = new VectorLayer({
                source: poiSource,
                zIndex: 100,
                declutter: true,
                visible: false,
            });
            satelliteMap.addLayer(initialPoiVectorLayer);
            setPoiVectorLayer(initialPoiVectorLayer);

            // Initialize incident vector layer for satellite
            const incidentSource = new VectorSource();
            const initialIncidentVectorLayer = new VectorLayer({
                source: incidentSource,
                zIndex: 300,
                visible: false,
            });
            satelliteMap.addLayer(initialIncidentVectorLayer);
            setIncidentVectorLayer(initialIncidentVectorLayer);

            // Initialize NMR circle vector layer for satellite
            const nmrSource = new VectorSource();
            const initialNmrVectorLayer = new VectorLayer({
                source: nmrSource,
                zIndex: 250,
                visible: true,
            });
            satelliteMap.addLayer(initialNmrVectorLayer);
            setNmrVectorLayer(initialNmrVectorLayer);

            // Initialize vector layer for drawing
            const drawSource = new VectorSource();
            const drawLayer = new VectorLayer({
                source: drawSource,
                style: new Style({
                    fill: new Fill({
                        color: "rgba(255, 255, 255, 0.2)",
                    }),
                    stroke: new Stroke({
                        color: "#ffcc33",
                        width: 2,
                    }),
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({
                            color: "#ffcc33",
                        }),
                    }),
                }),
            });
            satelliteMap.addLayer(drawLayer);

            // Create dynamic overlay
            const initialOverlay = new Overlay({
                element: overlayElement.current,
            });
            satelliteMap.addOverlay(initialOverlay);

            setMap(satelliteMap);
            setVectorLayer(initialVectorLayer);
            setDynamicOverlay(initialOverlay);
            setDrawVectorLayer(drawLayer);
            olMapRef.current = satelliteMap;
        } catch (error) {
            console.error("Error initializing satellite map:", error);
        }

        return () => {
            if (olMapRef.current) {
                olMapRef.current.setTarget(null);
                olMapRef.current = null;
            }
        };
    }, [mapType]);

    // Initialize Survey of India Map
    useEffect(() => {
        if (mapType !== "soi" || !soiMapContainerRef.current) return;

        try {
            const geoserverURL = `${process.env.REACT_APP_GEOSERVER_URL || 'https://map.gromed.in/geoserver'}/skytron/wms`;
            const assamGeoserverURL = `${process.env.REACT_APP_GEOSERVER_URL || 'https://map.gromed.in/geoserver'}/assam/wms`;
            const bhuvanAmrutWmsUrl = `${process.env.REACT_APP_BHUVAN_V3_URL || 'https://bhuvan-vec3.nrsc.gov.in'}/bhuvan/wms`;
            const bhuvanNuisWmsUrl = `${process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in'}/bhuvan/nuis/ows`;
            const bhuvanSikkimWmsUrl = `${process.env.REACT_APP_BHUVAN_V2_URL || 'https://bhuvan-vec2.nrsc.gov.in'}/bhuvan/wms`;
            const bhuvanSisdpv2WmsUrl = `${process.env.REACT_APP_BHUVAN_V2_URL || 'https://bhuvan-vec2.nrsc.gov.in'}/bhuvan/sisdpv2/wms`;
            const bhuvanHazardWmsUrl = `${process.env.REACT_APP_BHUVAN_RAS_URL || 'https://bhuvan-ras2.nrsc.gov.in'}/cgi-bin/hazard.exe`;

            // Bhuvan base map (same as normal map)
            const bhuvanIndia3Layer = new TileLayer({
                source: createBhuvanSource("india3"),
                zIndex: 0,
            });

            const bhuvanAdminLayer = new TileLayer({
                source: createBhuvanSource("basemap%3Aadmin_group"),
                zIndex: 4,
            });

            const bhuvanRoadsLayer = new TileLayer({
                source: new XYZ({
                    url: process.env.REACT_APP_TILE_SERVER_URL || "https://map2.gromed.in/tile/{z}/{x}/{y}.png",
                    attributions: '&copy; OpenStreetMap contributors',
                    maxZoom: 20,
                    projection: "EPSG:3857"
                }),
                zIndex: 2,
                minZoom: 11,
            });

            // SOI / skytron overlays
            const soiStatesLayer = new TileLayer({
                title: "States",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:states",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.7,
                visible: soiLayerVisibility.states,
                zIndex: 10,
            });

            const soiAssamDistrictLayer = new TileLayer({
                title: "ASSAM District Boundary",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_DISTRICT_BDY",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.assamDistrict,
                zIndex: 11,
            });

            const soiAssamDistrictBdy2Layer = new TileLayer({
                title: "ASSAM District Boundary 2",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_DISTRICT_BDY2",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.assamDistrictBdy2,
                zIndex: 12,
            });

            const soiAssamDistrictHqLayer = new TileLayer({
                title: "ASSAM District HQ",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_DISTRICT_HQ",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.assamDistrictHq,
                zIndex: 13,
            });

            const soiAssamStateBdyLayer = new TileLayer({
                title: "ASSAM State Boundary",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_STATE_BDY",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.assamStateBdy,
                zIndex: 14,
            });

            const soiAssamSubdistrictBdyLayer = new TileLayer({
                title: "ASSAM Subdistrict Boundary",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ASSAM_SUBDISTRICT_BDY",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.assamSubdistrictBdy,
                zIndex: 15,
            });

            const soiCartTrackHillsLayer = new TileLayer({
                title: "Cart Track Hills",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:CART_TRACK_HILLS",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.cartTrackHills,
                zIndex: 16,
            });

            const soiContoursLayer = new TileLayer({
                title: "Contours",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:Contours",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.8,
                visible: soiLayerVisibility.contours,
                zIndex: 12,
            });

            const soiKamrupRuralLayer = new TileLayer({
                title: "Kamrup Rural",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:KAMRUP_RURAL",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.kamrupRural,
                zIndex: 17,
            });

            const soiMajorTownsLayer = new TileLayer({
                title: "Major Towns / Headquarters",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:MajortownsHeadquarters",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.majorTowns,
                zIndex: 13,
            });

            const soiNameLayer = new TileLayer({
                title: "Name",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:NAME",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.name,
                zIndex: 18,
            });

            const soiRailwayTracksLayer = new TileLayer({
                title: "Railway Tracks",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:RailwayTracks",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.railwayTracks,
                zIndex: 14,
            });

            const soiRoadsLayer = new TileLayer({
                title: "SOI Roads",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:Roads",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roads,
                zIndex: 15,
            });

            const soiRoadsAllWeatherMotorableLayer = new TileLayer({
                title: "Roads (All Weather Motorable)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROADS_ALL_WEATHER_MOTORABLE",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadsAllWeatherMotorable,
                zIndex: 19,
            });

            const soiRoadsMotorableInFairWeatherLayer = new TileLayer({
                title: "Roads (Motorable in Fair Weather)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROADS_MOTORABLE_IN_FAIR_WEATHER",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadsMotorableInFairWeather,
                zIndex: 20,
            });

            const soiRoadsNationalHighwayLayer = new TileLayer({
                title: "Roads (National Highway)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROADS_NATIONAL_HIGHWAY",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadsNationalHighway,
                zIndex: 21,
            });

            const soiRoadOthersLayer = new TileLayer({
                title: "Road Others",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROAD_OTHERS",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadOthers,
                zIndex: 22,
            });

            const soiRoadTunnelLayer = new TileLayer({
                title: "Road Tunnel",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:ROAD_TUNNEL",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadTunnel,
                zIndex: 23,
            });

            const soiStateHighwayLayer = new TileLayer({
                title: "State Highway",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:STATE_HIGHWAY",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.stateHighway,
                zIndex: 24,
            });

            const soiBuildingFootprintLayer = new TileLayer({
                title: "Building Footprint",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:building_footprint",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.buildingFootprint,
                zIndex: 25,
            });

            const soiRoadSurfaceLayer = new TileLayer({
                title: "Road Surface",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:road_surface",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.roadSurface,
                zIndex: 26,
            });

            const soiBusStopLayer = new TileLayer({
                title: "Bus Stop",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:bus_stop",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.busStop,
                zIndex: 27,
            });

            const soiBlockLayer = new TileLayer({
                title: "Block",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:block",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.block,
                zIndex: 28,
            });

            const soiSkytronAssamCombinedLayer = new TileLayer({
                title: "Assam Combined (skytron)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:assam_combined",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.skytronAssamCombined,
                zIndex: 30,
            });

            const soiAssamTownsLayer = new TileLayer({
                title: "Assam Towns (skytron)",
                source: new TileWMS({
                    url: geoserverURL,
                    params: {
                        LAYERS: "skytron:AssamTowns",
                        TILED: true,
                    },
                    serverType: "geoserver",
                    crossOrigin: "anonymous",
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.assamTowns,
                zIndex: 31,
            });

            const bhuvanAmrutNogaonLayer = new TileLayer({
                title: "Bhuvan AMRUT Nogaon",
                source: new TileWMS({
                    url: bhuvanAmrutWmsUrl,
                    params: {
                        LAYERS: "amrut_ph1:AS_Nagaon_amrutph1_4k",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanAmrutNogaon,
                zIndex: 32,
            });

            const bhuvanAmrutSilcharLayer = new TileLayer({
                title: "Bhuvan AMRUT Silchar",
                source: new TileWMS({
                    url: bhuvanAmrutWmsUrl,
                    params: {
                        LAYERS: "amrut_ph1:AS_Silchar_amrutph1_4k",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanAmrutSilchar,
                zIndex: 38,
            });

            const bhuvanAmrutDibrugarhLayer = new TileLayer({
                title: "Bhuvan AMRUT Dibrugarh",
                source: new TileWMS({
                    url: bhuvanAmrutWmsUrl,
                    params: {
                        LAYERS: "amrut_ph1:AS_Dibrugarh_amrutph1_4k",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanAmrutDibrugarh,
                zIndex: 39,
            });

            const bhuvanAmrutGuwahatiLayer = new TileLayer({
                title: "Bhuvan AMRUT Guwahati",
                source: new TileWMS({
                    url: bhuvanAmrutWmsUrl,
                    params: {
                        LAYERS: "amrut_ph1:AS_Guwahati_amrutph1_4k",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanAmrutGuwahati,
                zIndex: 40,
            });

            const bhuvanNuisSilcharLayer = new TileLayer({
                title: "Bhuvan NUIS Silchar",
                source: new TileWMS({
                    url: bhuvanNuisWmsUrl,
                    params: {
                        LAYERS: "AS_SI_UL10K",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [92.75, 24.75, 92.817, 24.875],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanNuisSilchar,
                zIndex: 33,
            });

            const bhuvanSikkimLayer = new TileLayer({
                title: "Bhuvan Sikkim",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_SK",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [88.012, 27.082, 88.922, 28.131],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanSikkim,
                zIndex: 34,
            });

            const bhuvanAssamLayer = new TileLayer({
                title: "Bhuvan Assam",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_AS",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [89.701, 24.135, 96.021, 27.977],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanAssam,
                zIndex: 35,
            });

            const bhuvanManipurLayer = new TileLayer({
                title: "Bhuvan Manipur",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_MN",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [92.974, 23.843, 94.747, 25.968],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanManipur,
                zIndex: 41,
            });

            const bhuvanWestBengalLayer = new TileLayer({
                title: "Bhuvan WestBengal",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_WB",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [85.82, 21.481, 89.886, 27.22],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanWestBengal,
                zIndex: 42,
            });

            const bhuvanTripuraLayer = new TileLayer({
                title: "Bhuvan Tripura",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_TR",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanTripura,
                zIndex: 43,
            });

            const bhuvanNagalandLayer = new TileLayer({
                title: "Bhuvan Nagaland",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_NL",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [93.332, 25.202, 95.245, 27.043],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanNagaland,
                zIndex: 44,
            });

            const bhuvanMeghalayaLayer = new TileLayer({
                title: "Bhuvan Meghalaya",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_ML",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [89.822, 25.032, 92.804, 26.119],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanMeghalaya,
                zIndex: 45,
            });

            const bhuvanMizoramLayer = new TileLayer({
                title: "Bhuvan Mizoram",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_MZ",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [92.259, 21.948, 93.438, 24.521],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanMizoram,
                zIndex: 46,
            });

            const bhuvanArunachalLayer = new TileLayer({
                title: "Bhuvan Arunachal",
                source: new TileWMS({
                    url: bhuvanSikkimWmsUrl,
                    params: {
                        LAYERS: "sisdp_phase2:SISDP_P2_LULC_10K_2016_2019_AR",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [91.605, 26.656, 97.415, 29.376],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanArunachal,
                zIndex: 47,
            });

            const bhuvanKamrupMetroLayer = new TileLayer({
                title: "Bhuvan Kamrup Metro",
                source: new TileWMS({
                    url: bhuvanSisdpv2WmsUrl,
                    params: {
                        LAYERS: "AS_Kamrup_Metro_lulc_v2",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    serverType: "geoserver",
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [91.550399, 25.996357, 92.17674, 26.274106],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanKamrupMetro,
                zIndex: 36,
            });

            const bhuvanFloodAssamLayer = new TileLayer({
                title: "Bhuvan Flood Assam",
                source: new TileWMS({
                    url: bhuvanHazardWmsUrl,
                    params: {
                        LAYERS: "as_hz",
                        TILED: true,
                        VERSION: "1.1.1",
                        FORMAT: "image/png",
                        TRANSPARENT: "true",
                        SRS: "EPSG:4326",
                        WIDTH: 256,
                        HEIGHT: 256,
                    },
                    crossOrigin: BHUVAN_CROSS_ORIGIN,
                    transition: 0,
                }),
                extent: [89.701, 24.135, 96.021, 27.977],
                opacity: 0.9,
                visible: soiLayerVisibility.bhuvanFloodAssam,
                zIndex: 37,
            });

            soiLayersRef.current = {
                states: soiStatesLayer,
                assamDistrict: soiAssamDistrictLayer,
                assamDistrictBdy2: soiAssamDistrictBdy2Layer,
                assamDistrictHq: soiAssamDistrictHqLayer,
                assamStateBdy: soiAssamStateBdyLayer,
                assamSubdistrictBdy: soiAssamSubdistrictBdyLayer,
                cartTrackHills: soiCartTrackHillsLayer,
                contours: soiContoursLayer,
                kamrupRural: soiKamrupRuralLayer,
                majorTowns: soiMajorTownsLayer,
                name: soiNameLayer,
                railwayTracks: soiRailwayTracksLayer,
                roads: soiRoadsLayer,
                roadsAllWeatherMotorable: soiRoadsAllWeatherMotorableLayer,
                roadsMotorableInFairWeather: soiRoadsMotorableInFairWeatherLayer,
                roadsNationalHighway: soiRoadsNationalHighwayLayer,
                roadOthers: soiRoadOthersLayer,
                roadTunnel: soiRoadTunnelLayer,
                stateHighway: soiStateHighwayLayer,
                buildingFootprint: soiBuildingFootprintLayer,
                roadSurface: soiRoadSurfaceLayer,
                busStop: soiBusStopLayer,
                block: soiBlockLayer,
                skytronAssamCombined: soiSkytronAssamCombinedLayer,
                assamTowns: soiAssamTownsLayer,
                bhuvanAmrutNogaon: bhuvanAmrutNogaonLayer,
                bhuvanAmrutSilchar: bhuvanAmrutSilcharLayer,
                bhuvanAmrutDibrugarh: bhuvanAmrutDibrugarhLayer,
                bhuvanAmrutGuwahati: bhuvanAmrutGuwahatiLayer,
                bhuvanNuisSilchar: bhuvanNuisSilcharLayer,
                bhuvanSikkim: bhuvanSikkimLayer,
                bhuvanAssam: bhuvanAssamLayer,
                bhuvanKamrupMetro: bhuvanKamrupMetroLayer,
                bhuvanFloodAssam: bhuvanFloodAssamLayer,
                bhuvanManipur: bhuvanManipurLayer,
                bhuvanWestBengal: bhuvanWestBengalLayer,
                bhuvanTripura: bhuvanTripuraLayer,
                bhuvanNagaland: bhuvanNagalandLayer,
                bhuvanMeghalaya: bhuvanMeghalayaLayer,
                bhuvanMizoram: bhuvanMizoramLayer,
                bhuvanArunachal: bhuvanArunachalLayer,
            };

            const soiMap = new Map({
                target: soiMapContainerRef.current,
                layers: [
                    bhuvanIndia3Layer,
                    bhuvanAdminLayer,
                    bhuvanRoadsLayer,
                    soiStatesLayer,
                    soiAssamDistrictLayer,
                    soiAssamDistrictBdy2Layer,
                    soiAssamDistrictHqLayer,
                    soiAssamStateBdyLayer,
                    soiAssamSubdistrictBdyLayer,
                    soiCartTrackHillsLayer,
                    soiContoursLayer,
                    soiKamrupRuralLayer,
                    soiMajorTownsLayer,
                    soiNameLayer,
                    soiRailwayTracksLayer,
                    soiRoadsLayer,
                    soiRoadsAllWeatherMotorableLayer,
                    soiRoadsMotorableInFairWeatherLayer,
                    soiRoadsNationalHighwayLayer,
                    soiRoadOthersLayer,
                    soiRoadTunnelLayer,
                    soiStateHighwayLayer,
                    soiBuildingFootprintLayer,
                    soiRoadSurfaceLayer,
                    soiBusStopLayer,
                    soiBlockLayer,
                    soiSkytronAssamCombinedLayer,
                    soiAssamTownsLayer,
                    bhuvanAmrutNogaonLayer,
                    bhuvanAmrutSilcharLayer,
                    bhuvanAmrutDibrugarhLayer,
                    bhuvanAmrutGuwahatiLayer,
                    bhuvanNuisSilcharLayer,
                    bhuvanSikkimLayer,
                    bhuvanAssamLayer,
                    bhuvanKamrupMetroLayer,
                    bhuvanFloodAssamLayer,
                    bhuvanManipurLayer,
                    bhuvanWestBengalLayer,
                    bhuvanTripuraLayer,
                    bhuvanNagalandLayer,
                    bhuvanMeghalayaLayer,
                    bhuvanMizoramLayer,
                    bhuvanArunachalLayer,
                ],
                view: new View({
                    projection: "EPSG:4326",
                    center: [91.7362, 26.1445],
                    zoom: 13,
                    maxZoom: 19,
                    constrainResolution: true,
                }),
                pixelRatio: 1,
            });

            // Initialize vector layer for markers
            // Initialize vector layer for markers (with Clustering)
            const initialVectorLayer = new VectorLayer({
                source: new Cluster({
                    distance: 40,
                    source: new VectorSource(),
                }),
                zIndex: 200,
                style: clusterStyleFunction,
            });
            soiMap.addLayer(initialVectorLayer);

            // Initialize POI vector layer
            const poiSource = new VectorSource();
            const initialPoiVectorLayer = new VectorLayer({
                source: poiSource,
                zIndex: 100,
                declutter: true,
            });
            soiMap.addLayer(initialPoiVectorLayer);
            setPoiVectorLayer(initialPoiVectorLayer);

            // Initialize incident vector layer for SOI
            const incidentSource = new VectorSource();
            const initialIncidentVectorLayer = new VectorLayer({
                source: incidentSource,
                zIndex: 300,
                visible: false,
            });
            soiMap.addLayer(initialIncidentVectorLayer);
            setIncidentVectorLayer(initialIncidentVectorLayer);

            // Initialize vector layer for drawing
            const drawSource = new VectorSource();
            const drawLayer = new VectorLayer({
                source: drawSource,
                style: new Style({
                    fill: new Fill({
                        color: "rgba(255, 255, 255, 0.2)",
                    }),
                    stroke: new Stroke({
                        color: "#ffcc33",
                        width: 2,
                    }),
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({
                            color: "#ffcc33",
                        }),
                    }),
                }),
            });
            soiMap.addLayer(drawLayer);

            // Create dynamic overlay
            const initialOverlay = new Overlay({
                element: overlayElement.current,
            });
            soiMap.addOverlay(initialOverlay);

            setMap(soiMap);
            setVectorLayer(initialVectorLayer);
            setDynamicOverlay(initialOverlay);
            setDrawVectorLayer(drawLayer);

        } catch (error) {
            console.error("Error initializing SOI map:", error);
        }

        return () => {
            // Cleanup logic if needed, but usually strictly setting target null is enough for OL
            // React strict mode might cause double init so we just let it be replaced
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapType]);

    useEffect(() => {
        const layers = soiLayersRef.current;
        if (!layers) return;

        layers.states?.setVisible?.(!!soiLayerVisibility.states);
        layers.assamDistrict?.setVisible?.(!!soiLayerVisibility.assamDistrict);
        layers.assamDistrictBdy2?.setVisible?.(!!soiLayerVisibility.assamDistrictBdy2);
        layers.assamDistrictHq?.setVisible?.(!!soiLayerVisibility.assamDistrictHq);
        layers.assamStateBdy?.setVisible?.(!!soiLayerVisibility.assamStateBdy);
        layers.assamSubdistrictBdy?.setVisible?.(!!soiLayerVisibility.assamSubdistrictBdy);
        layers.cartTrackHills?.setVisible?.(!!soiLayerVisibility.cartTrackHills);
        layers.contours?.setVisible?.(!!soiLayerVisibility.contours);
        layers.kamrupRural?.setVisible?.(!!soiLayerVisibility.kamrupRural);
        layers.majorTowns?.setVisible?.(!!soiLayerVisibility.majorTowns);
        layers.name?.setVisible?.(!!soiLayerVisibility.name);
        layers.railwayTracks?.setVisible?.(!!soiLayerVisibility.railwayTracks);
        layers.roads?.setVisible?.(!!soiLayerVisibility.roads);
        layers.roadsAllWeatherMotorable?.setVisible?.(!!soiLayerVisibility.roadsAllWeatherMotorable);
        layers.roadsMotorableInFairWeather?.setVisible?.(!!soiLayerVisibility.roadsMotorableInFairWeather);
        layers.roadsNationalHighway?.setVisible?.(!!soiLayerVisibility.roadsNationalHighway);
        layers.roadOthers?.setVisible?.(!!soiLayerVisibility.roadOthers);
        layers.roadTunnel?.setVisible?.(!!soiLayerVisibility.roadTunnel);
        layers.stateHighway?.setVisible?.(!!soiLayerVisibility.stateHighway);
        layers.buildingFootprint?.setVisible?.(!!soiLayerVisibility.buildingFootprint);
        layers.roadSurface?.setVisible?.(!!soiLayerVisibility.roadSurface);
        layers.busStop?.setVisible?.(!!soiLayerVisibility.busStop);
        layers.block?.setVisible?.(!!soiLayerVisibility.block);
        layers.skytronAssamCombined?.setVisible?.(!!soiLayerVisibility.skytronAssamCombined);
        layers.assamTowns?.setVisible?.(!!soiLayerVisibility.assamTowns);
        layers.bhuvanAmrutNogaon?.setVisible?.(!!soiLayerVisibility.bhuvanAmrutNogaon);
        layers.bhuvanAmrutSilchar?.setVisible?.(!!soiLayerVisibility.bhuvanAmrutSilchar);
        layers.bhuvanAmrutDibrugarh?.setVisible?.(!!soiLayerVisibility.bhuvanAmrutDibrugarh);
        layers.bhuvanAmrutGuwahati?.setVisible?.(!!soiLayerVisibility.bhuvanAmrutGuwahati);
        layers.bhuvanNuisSilchar?.setVisible?.(!!soiLayerVisibility.bhuvanNuisSilchar);
        layers.bhuvanSikkim?.setVisible?.(!!soiLayerVisibility.bhuvanSikkim);
        layers.bhuvanAssam?.setVisible?.(!!soiLayerVisibility.bhuvanAssam);
        layers.bhuvanKamrupMetro?.setVisible?.(!!soiLayerVisibility.bhuvanKamrupMetro);
        layers.bhuvanFloodAssam?.setVisible?.(!!soiLayerVisibility.bhuvanFloodAssam);
        layers.bhuvanManipur?.setVisible?.(!!soiLayerVisibility.bhuvanManipur);
        layers.bhuvanWestBengal?.setVisible?.(!!soiLayerVisibility.bhuvanWestBengal);
        layers.bhuvanTripura?.setVisible?.(!!soiLayerVisibility.bhuvanTripura);
        layers.bhuvanNagaland?.setVisible?.(!!soiLayerVisibility.bhuvanNagaland);
        layers.bhuvanMeghalaya?.setVisible?.(!!soiLayerVisibility.bhuvanMeghalaya);
        layers.bhuvanMizoram?.setVisible?.(!!soiLayerVisibility.bhuvanMizoram);
        layers.bhuvanArunachal?.setVisible?.(!!soiLayerVisibility.bhuvanArunachal);
    }, [soiLayerVisibility]);

    // Initialize HD Map (LegacyMap)
    useEffect(() => {
        return; if(false || !hdMapContainerRef.current) return;

        let isMounted = true;

        const cleanup = () => {
            if (legacyMapLibraryPollRef.current) {
                clearInterval(legacyMapLibraryPollRef.current);
                legacyMapLibraryPollRef.current = null;
            }

            // Clear all markers first
            hdVehicleMarkersRef.current.forEach((marker) => {
                try {
                    marker?.remove?.();
                } catch (e) { }
            });
            hdPoiMarkersRef.current.forEach((marker) => {
                try {
                    marker?.remove?.();
                } catch (e) { }
            });

            // Try to remove/destroy the map instance
            if (legacyMapMapRef.current) {
                try {
                    if (typeof legacyMapMapRef.current.remove === "function") {
                        legacyMapMapRef.current.remove();
                    }
                } catch (e) {
                    console.warn("Error removing HD map:", e);
                }
            }

            if (hdMapInnerRef.current) {
                hdMapInnerRef.current.innerHTML = "";
            }

            hdMapContainerIdRef.current = null;
            legacyMapMapRef.current = null;
            hdVehicleMarkersRef.current = [];
            hdPoiMarkersRef.current = [];
        };

        const instantiateHdMap = () => {
            if (!isMounted || !hdMapInnerRef.current) return;

            const legacyMapInstance = legacyMapInstanceRef.current;
            if (!legacyMapInstance || typeof legacyMapInstance.Map !== "function") {
                console.error("LegacyMap instance is not ready or Map method unavailable");
                return;
            }

            // If map already exists, don't reset it - just return
            if (legacyMapMapRef.current) {
                return;
            }

            // Use fixed Guwahati center like normal map, not dynamic GPS data
            const initialCenter = { lat: 26.1445, lng: 91.7362 };

            const hostElement = hdMapInnerRef.current;
            if (!hostElement) return;
            hostElement.innerHTML = "";

            const mapElement = document.createElement("div");
            mapElement.style.width = "100%";
            mapElement.style.height = "100%";
            const containerId = `legacyMap-hd-map-${Date.now()}`;
            mapElement.id = containerId;
            hdMapContainerIdRef.current = containerId;
            hostElement.appendChild(mapElement);

            try {
                const centerToUse = { lng: 91.7362, lat: 26.1445 };
                console.log('Creating HD map with center:', centerToUse);

                const hdMap = legacyMapInstance.Map({
                    id: containerId,
                    properties: {
                        center: [26.1445, 91.7362], // Guwahati - [lat, lng] array format
                        draggable: true,
                        zoom: 13,
                        minZoom: 4,
                        maxZoom: 18,
                        backgroundColor: "#fff",
                        traffic: false,
                        geolocation: false,
                        disableDoubleClickZoom: false,
                        fullscreenControl: false,
                        scrollWheel: true,
                        scrollZoom: true,
                        rotateControl: false,
                        scaleControl: false,
                        zoomControl: false,
                        clickableIcons: true,
                    },
                });

                console.log('HD map created, instance:', hdMap);

                // LegacyMap ignores center in properties, set it explicitly
                const guwahatiCenter = { lng: 91.7362, lat: 26.1445 };

                if (typeof hdMap.setCenter === 'function') {
                    hdMap.setCenter(guwahatiCenter);
                }

                if (typeof hdMap.setZoom === 'function') {
                    hdMap.setZoom(14);
                }

                // Verify after a short delay
                setTimeout(() => {
                    if (typeof hdMap.getCenter === 'function') {
                        const actualCenter = hdMap.getCenter();
                        console.log('HD map center after setCenter:', actualCenter);
                    }
                }, 100);

                legacyMapMapRef.current = hdMap;

                // Hide LegacyMap controls using CSS after map loads
                setTimeout(() => {
                    try {
                        const mapContainer = document.getElementById(containerId);
                        if (mapContainer) {
                            // Hide all LegacyMap control elements
                            const style = document.createElement('style');
                            style.id = 'legacyMap-controls-hide';
                            style.textContent = `
#${containerId} .legacyMap-ctrl-zoom,
#${containerId} .legacyMap-ctrl-fullscreen,
#${containerId} .legacyMap-ctrl-rotate,
#${containerId} .legacyMap-ctrl-scale,
#${containerId} .legacyMap-ctrl-geolocate,
#${containerId} .legacyMap-ctrl-attrib,
#${containerId} .legacyMap-ctrl-logo,
#${containerId} .legacyMap-attrib,
#${containerId} .legacyMap-logo,
#${containerId} .mapboxgl-ctrl-zoom-in,
#${containerId} .mapboxgl-ctrl-zoom-out,
#${containerId} .mapboxgl-ctrl-compass,
#${containerId} .mapboxgl-ctrl-scale,
#${containerId} .mapboxgl-ctrl-group,
#${containerId} .mapboxgl-ctrl-top-right,
#${containerId} .mapboxgl-ctrl-bottom-right,
#${containerId} .mapboxgl-ctrl-bottom-left,
#${containerId} .mapboxgl-ctrl-attrib,
#${containerId} .mapboxgl-ctrl-logo {
display: none !important;
}
`;
                            // Remove existing style if present
                            const existingStyle = document.getElementById('legacyMap-controls-hide');
                            if (existingStyle) {
                                existingStyle.remove();
                            }
                            document.head.appendChild(style);
                        }
                    } catch (error) {
                        console.warn('Could not hide LegacyMap controls:', error);
                    }
                }, 500);

                // Map will use the initial center set in properties above
                // Don't reset on load event to preserve user's zoom/pan
            } catch (error) {
                console.error("Failed to create LegacyMap HD map instance", error);
            }
        };

        const ensureLegacyMapInitialized = () => { return; 
            if (!isMounted) return;

            if (!legacyMapInstanceRef.current) {
                try {
                    let instanceCandidate = null;

                    if (typeof window.legacyMap === "function") {
                        try {
                            instanceCandidate = new window.legacyMap();
                        } catch (ctorError) {
                            instanceCandidate = window.legacyMap();
                        }
                    } else if (false && window.legacyMap) {
                        instanceCandidate = window.legacyMap;
                    }

                    if (!instanceCandidate) {
                        throw new Error("LegacyMap SDK instance could not be created");
                    }

                    legacyMapInstanceRef.current = instanceCandidate;
                } catch (error) {
                    console.error("Unable to instantiate LegacyMap SDK", error);
                    return;
                }
            }

            const legacyMapInstance = legacyMapInstanceRef.current;
            const initializeFn = legacyMapInstance?.initialize;

            if (legacyMapInitializedRef.current) {
                instantiateHdMap();
                return;
            }

            if (legacyMapInitInProgressRef.current) {
                return;
            }

            const token = null;

            if (!token) {
                console.error(
                    "LegacyMap SDK token not found. Set REACT_APP_LEGACYMAP_TOKEN or include key in script URL."
                );
                return;
            }

            const markReady = () => {
                if (!isMounted) return;
                legacyMapInitInProgressRef.current = false;
                legacyMapInitializedRef.current = true;
                instantiateHdMap();
            };

            if (typeof initializeFn === "function") {
                legacyMapInitInProgressRef.current = true;

                try {
                    initializeFn.call(
                        legacyMapInstance,
                        token,
                        { map: true, plugins: ["marker"] },
                        markReady
                    );
                } catch (error) {
                    legacyMapInitInProgressRef.current = false;
                    console.error("Failed to initialize LegacyMap SDK", error);
                }

                return;
            }

            // Some SDK variants expose a pre-initialized object without explicit initialize call.
            markReady();
        };

        if (false && window.legacyMap) {
            ensureLegacyMapInitialized();
        } else {
            legacyMapLibraryPollRef.current = setInterval(() => {
                if (false && window.legacyMap) {
                    clearInterval(legacyMapLibraryPollRef.current);
                    legacyMapLibraryPollRef.current = null;
                    ensureLegacyMapInitialized();
                }
            }, 400);
        }

        return () => {
            isMounted = false;
            cleanup();
        };
    }, [mapType]); // Only reinitialize when map type changes, not on data updates

    // Plot vehicles and POIs on HD map
    useEffect(() => {
        return; if(false || !legacyMapMapRef.current) return;

        const hdMap = legacyMapMapRef.current;
        const legacyMapInstance = legacyMapInstanceRef.current;

        const markerFactoryAvailable =
            typeof legacyMapInstance?.marker === "function" ||
            typeof window.legacyMap?.Marker === "function";

        if (!legacyMapInstance || !markerFactoryAvailable) {
            console.warn(
                "LegacyMap marker plugin not ready. Skipping HD markers render for now."
            );
            return;
        }

        const clearVehicleMarkers = () => {
            hdVehicleMarkersRef.current.forEach((marker) => {
                try {
                    marker?.remove?.();
                } catch (error) {
                    console.warn("Error removing vehicle marker from HD map", error);
                }
            });
            hdVehicleMarkersRef.current = [];
        };

        const clearPoiMarkers = () => {
            hdPoiMarkersRef.current.forEach((marker) => {
                try {
                    marker?.remove?.();
                } catch (error) {
                    console.warn("Error removing POI marker from HD map", error);
                }
            });
            hdPoiMarkersRef.current = [];
        };

        const clearIncidentMarkers = () => {
            hdIncidentMarkersRef.current.forEach((marker) => {
                try {
                    marker?.remove?.();
                } catch (error) {
                    console.warn("Error removing incident marker from HD map", error);
                }
            });
            hdIncidentMarkersRef.current = [];
        };

        const createMarker = (options) => {
            const markerFactory = legacyMapInstance?.marker;

            try {
                if (typeof markerFactory === "function") {
                    return markerFactory.call(legacyMapInstance, options);
                }

                if (typeof window.legacyMap?.Marker === "function") {
                    try {
                        return new window.legacyMap.Marker(options);
                    } catch (ctorError) {
                        return window.legacyMap.Marker(options);
                    }
                }
            } catch (error) {
                console.error("Failed to create LegacyMap marker", { options, error });
            }

            return null;
        };

        clearVehicleMarkers();
        clearPoiMarkers();
        clearIncidentMarkers();

        let allMarkers = [];

        try {
            // Add vehicle markers
            allMarkers = [...(Array.isArray(gpsData) ? gpsData : []), ...(Array.isArray(policeData) ? policeData : [])];
            if (allMarkers.length > 0) {
                allMarkers.forEach((entry) => {
                    const averagedPos = getAveragedLocation(entry);
                    const longitude = Number(averagedPos.lng);
                    const latitude = Number(averagedPos.lat);

                    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
                        return;
                    }

                    const entryTimeMs = resolveEntryTimestampMs(entry);
                    const currentTimeMs = new Date().getTime();
                    const timeDifference = Number.isFinite(entryTimeMs)
                        ? calculateTimeDifference(entryTimeMs, currentTimeMs)
                        : Number.POSITIVE_INFINITY;
                    const isStale = timeDifference > 15;
                    const isPoliceMarker = entry.markerCategory === "police";

                    let markerColor = "blue";
                    if (isPoliceMarker) {
                        markerColor = "blue";
                        if (isEntryStale15Min(entry)) {
                            markerColor = "grey";
                        } else if (entry.packet_type === "EA") {
                            markerColor = "red";
                        } else if (entry.packet_type !== "NR") {
                            markerColor = "orange";
                        } else if (resolveEntrySpeedValue(entry) > 0) {
                            markerColor = "green";
                        } else if (String(entry.ignition_status) === "1" && resolveEntrySpeedValue(entry) === 0) {
                            markerColor = "blue";
                        }
                    }

                    const vehicleType = entry?.device_tag_info?.category_info?.category;
                    const iconUrl = getVehicleMarkerIconUrl(markerColor, vehicleType);

                    // Build the styled popup HTML matching normal map
                    ensureHdPopupStyles();
                    const popupContent = buildHdPopupHtml(entry, markerLabelMode);
                    const labelText = getMarkerLabelText(entry, markerLabelMode) || undefined;

                    const markerOptions = iconUrl
                        ? {
                            map: hdMap,
                            position: { lat: latitude, lng: longitude },
                            icon: iconUrl,
                            label: labelText,
                            title: labelText,
                            width: 60,
                            height: 60,
                            popupHtml: popupContent,
                            popupOptions: {
                                openPopup: false,
                            },
                        }
                        : {
                            map: hdMap,
                            position: { lat: latitude, lng: longitude },
                            label: labelText,
                            title: labelText,
                            popupHtml: popupContent,
                            popupOptions: {
                                openPopup: false,
                            },
                        };

                    const markerInstance = createMarker(markerOptions);
                    if (markerInstance) {
                        hdVehicleMarkersRef.current.push(markerInstance);
                    }
                });
            }

            // Add POI markers
            if (pois.length > 0) {
                pois.forEach((poi) => {
                    try {
                        const location = JSON.parse(poi.location);
                        if (!Array.isArray(location) || location.length === 0) return;

                        if (
                            poi.mark_type === "Point" &&
                            location[0] &&
                            location[0].length === 2
                        ) {
                            const [lat, lon] = location[0];
                            const longitude = Number(lon);
                            const latitude = Number(lat);

                            if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
                                return;
                            }

                            const poiColor = getUseTypeColor(poi);
                            const poiIconUrl = getPoiMarkerIcon(poiColor);

                            const markerOptions = {
                                map: showPois ? hdMap : null,
                                position: { lat: latitude, lng: longitude },
                                label: poi.name || undefined,
                                title: poi.name || "Point of Interest",
                                draggable: false,
                                icon: poiIconUrl
                                    ? {
                                        url: poiIconUrl,
                                        width: 28,
                                        height: 36,
                                    }
                                    : undefined,
                            };

                            const markerInstance = createMarker(markerOptions);
                            if (markerInstance) {
                                hdPoiMarkersRef.current.push(markerInstance);
                            }
                        }
                    } catch (error) {
                        console.error("Error processing POI for HD map:", poi?.id, error);
                    }
                });
            }
        } catch (error) {
            console.error("Error updating HD map markers:", error);
        }

        // Add Incident Markers
        if (incidentData.length > 0) {
            incidentData.forEach((incident) => {
                try {
                    const longitude = Number(incident.longitude);
                    const latitude = Number(incident.latitude);

                    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

                    const hdMediaContainerId = `incident-media-hd-${incident.id}-${Date.now()}`;

                    const popupContent = `
<div style="padding: 12px; min-width: 250px; font-family: 'Roboto', sans-serif;">
<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
<h4 style="margin: 0; color: #d32f2f; font-size: 16px;">Incident #${incident.id}</h4>
<span style="background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; border: 1px solid #ffcdd2;">ALERT</span>
</div>
<p style="margin: 0 0 10px 0; font-size: 13px; color: #374151; line-height: 1.4;">${incident.details || "No details available."}</p>
${incident.image_file ? `<div id="${hdMediaContainerId}" style="margin-top: 8px;"></div>` : ''}
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between;">
<span>Registered:</span>
<span style="font-weight: 500;">${incident.registered_at ? new Date(incident.registered_at).toLocaleString() : '-'}</span>
</div>
</div>
`;

                    const svgIcon = `
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2L1 21H23L12 2Z" fill="#F44336" stroke="#B71C1C" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M12 9V15" stroke="white" stroke-width="2" stroke-linecap="round"/>
<path d="M12 18V18.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
`;
                    const iconUrl = `data:image/svg+xml;base64,${window.btoa(svgIcon)}`;

                    const markerOptions = {
                        map: showIncidents ? hdMap : null,
                        position: { lat: latitude, lng: longitude },
                        icon: {
                            url: iconUrl,
                            width: 40,
                            height: 40
                        },
                        popupHtml: popupContent,
                    };

                    const markerInstance = createMarker(markerOptions);
                    if (markerInstance) {
                        hdIncidentMarkersRef.current.push(markerInstance);

                        if (incident.image_file) {
                            const loadMedia = () => {
                                // Wait a tick for popup DOM to be mounted
                                setTimeout(() => {
                                    try {
                                        renderSecureIncidentMedia(incident.image_file, hdMediaContainerId, {
                                            maxWidth: "100%",
                                            maxHeight: "160px",
                                            borderRadius: "6px",
                                        });
                                    } catch (e) {
                                        console.error("Failed to load secure incident media in HD popup", e);
                                    }
                                }, 50);
                            };

                            try {
                                if (typeof markerInstance.addListener === "function") {
                                    markerInstance.addListener("click", loadMedia);
                                } else if (typeof markerInstance.on === "function") {
                                    markerInstance.on("click", loadMedia);
                                }
                            } catch (e) {
                                // Best-effort only (SDK variants differ)
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error creating incident marker", error);
                }
            });
        }

        // Don't reset center/zoom on marker updates - let user control the map
        // Only set initial center/zoom when map is first created

        return () => {
            clearVehicleMarkers();
            clearPoiMarkers();
            clearIncidentMarkers();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapType, gpsData, policeData, pois, incidentData]);

    // HD Map Drawing Logic - Handle Clicks
    useEffect(() => {
        return; if(false || !legacyMapMapRef.current) return;

        const hdMap = legacyMapMapRef.current;

        // Manage Cursor with CSS Class
        if (hdMapContainerIdRef.current) {
            const container = document.getElementById(hdMapContainerIdRef.current);
            if (container) {
                if (drawingMode === 'polygon') {
                    container.classList.add('drawing-mode-active');
                } else {
                    container.classList.remove('drawing-mode-active');
                }
            }
        }

        if (drawingMode !== 'polygon') return;

        const clickHandler = (e) => {
            let lat, lng;
            if (e.lngLat) { lat = e.lngLat.lat; lng = e.lngLat.lng; }
            else if (e.latLng) { lat = e.latLng.lat; lng = e.latLng.lng; }

            if (lat && lng) {
                setDrawingPoints(prev => [...prev, [lat, lng]]);
            }
        };

        if (hdMap.addListener) hdMap.addListener('click', clickHandler);
        else if (hdMap.on) hdMap.on('click', clickHandler);

        return () => {
            if (hdMap.removeListener) hdMap.removeListener('click', clickHandler);
            else if (hdMap.off) hdMap.off('click', clickHandler);

            // Cleanup cursor class
            if (hdMapContainerIdRef.current) {
                const container = document.getElementById(hdMapContainerIdRef.current);
                if (container) container.classList.remove('drawing-mode-active');
            }
        };
    }, [mapType, drawingMode]);

    // HD Map Drawing Logic - Visualization
    useEffect(() => {
        return; if(false || !legacyMapMapRef.current) return;
        const hdMap = legacyMapMapRef.current;

        // Cleanup temp poly
        if (tempPolyRef.current) {
            try { tempPolyRef.current.remove(); } catch (e) { }
            tempPolyRef.current = null;
        }

        // Cleanup temp markers
        if (tempMarkersRef.current) {
            tempMarkersRef.current.forEach(m => {
                try { m.remove(); } catch (e) { }
            });
            tempMarkersRef.current = [];
        }

        if (drawingMode === 'polygon' && drawingPoints.length > 0) {
            const paths = drawingPoints.map(pt => ({ lat: pt[0], lng: pt[1] }));

            // Draw markers for each point to give feedback
            paths.forEach(pt => {
                // Create a small dot icon
                const dotSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
<circle cx="6" cy="6" r="4" fill="#333" stroke="#fff" stroke-width="2"/>
</svg>`;
                const iconUrl = `data:image/svg+xml;base64,${window.btoa(dotSvg)}`;

                try {
                    if (window.legacyMap && window.legacyMap.Marker) {
                        const marker = new window.legacyMap.Marker({
                            map: hdMap,
                            position: pt,
                            icon: iconUrl,
                            width: 12,
                            height: 12
                        });
                        tempMarkersRef.current.push(marker);
                    }
                } catch (e) {
                    console.error("Error creating temp marker", e);
                }
            });

            if (drawingPoints.length > 1) {
                try {
                    if (window.legacyMap && window.legacyMap.Polyline) {
                        const tempPoly = new window.legacyMap.Polyline({
                            map: hdMap,
                            paths: paths,
                            strokeColor: '#333333',
                            strokeWeight: 2,
                            strokeOpacity: 0.8,
                            strokeStyle: 'dashed'
                        });
                        tempPolyRef.current = tempPoly;
                    }
                } catch (e) {
                    console.error("Error drawing temp polyline", e);
                }
            }
        }
    }, [mapType, drawingMode, drawingPoints]);

    const startHdDrawing = () => {
        setDrawingMode('polygon');
        setDrawingPoints([]);
        if (onPolygonComplete) onPolygonComplete([]);
    };

    const clearHdDrawing = () => {
        setDrawingMode(null);
        setDrawingPoints([]);

        // Cleanup temp elements immediately
        if (tempPolyRef.current) {
            try { tempPolyRef.current.remove(); } catch (e) { }
            tempPolyRef.current = null;
        }
        if (tempMarkersRef.current) {
            tempMarkersRef.current.forEach(m => {
                try { m.remove(); } catch (e) { }
            });
            tempMarkersRef.current = [];
        }

        if (onPolygonComplete) onPolygonComplete([]);
    };

    const finishHdDrawing = () => {
        setDrawingMode(null);
        if (onPolygonComplete && drawingPoints.length >= 3) {
            onPolygonComplete(drawingPoints);

            // We keep the drawing visualized until cleared?
            // Or maybe we change style to closed polygon?
            // For now, let's just leave the temp drawing or clear it?
            // Usually "Finish" implies committing.
            // The calling component might use these points to filter.
            // But we should probably visualize the closed polygon if we want to be nice.
            // However, LiveMap seems to use 'drawVectorLayer' for OL.
            // Let's create a "closed" polygon visualization if needed or just leave it.
            // Modifying behavior: we will clear temp drawing and let the parent component handle it?
            // Actually, if onPolygonComplete is used for filtering, maybe we should keep the polygon visible.
            // But let's stick to simple "Finish" -> Callback flow.
            // We will create a closed polygon to show "it is done" if we want,
            // but simplistic approach is fine.

            // Let's create a closed polygon visualization for persistency until cleared
            if (legacyMapMapRef.current && window.legacyMap && window.legacyMap.Polygon) {
                // Clear temp lines/dots
                if (tempPolyRef.current) try { tempPolyRef.current.remove(); } catch (e) { }
                tempMarkersRef.current.forEach(m => { try { m.remove(); } catch (e) { } });
                tempMarkersRef.current = [];

                // Draw closed polygon
                const paths = drawingPoints.map(pt => ({ lat: pt[0], lng: pt[1] }));
                try {
                    const finalPoly = new window.legacyMap.Polygon({
                        map: legacyMapMapRef.current,
                        paths: paths,
                        fillColor: 'rgba(255, 255, 255, 0.2)',
                        strokeColor: '#ffcc33',
                        strokeWeight: 2
                    });
                    // Store it in tempPolyRef so "Clear" can remove it
                    tempPolyRef.current = finalPoly;
                } catch (e) { console.error("Error drawing final polygon", e); }
            }
        }
    };

    // Fetch POIs on component mount
    useEffect(() => {
        const fetchPOIs = async () => {
            try {
                const response = await POIService.getAllPOIs();
                if (response && response.data) {
                    setPois(response.data);
                }
            } catch (error) {
                console.error("Error fetching POIs:", error);
            }
        };

        fetchPOIs();
    }, []);

    // Update POI markers when POIs change
    useEffect(() => {
        if (!poiVectorLayer || pois.length === 0) return;

        const poiSource = poiVectorLayer.getSource();
        poiSource.clear();

        pois.forEach((poi) => {
            // eslint-disable-next-line default-case
            try {
                // eslint-disable-next-line default-case
                const location = JSON.parse(poi.location);
                if (Array.isArray(location) && location.length > 0) {
                    let feature;

                    // eslint-disable-next-line default-case
                    // eslint-disable-next-line default-case
                    switch (poi.mark_type) {
                        case "Point":
                            if (location[0] && location[0].length === 2) {
                                const [lat, lon] = location[0];
                                const longitude = Number(lon);
                                const latitude = Number(lat);
                                if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                                    const coordinates = [longitude, latitude];
                                    feature = new Feature({
                                        geometry: new Point(coordinates),
                                        data: poi,
                                    });
                                }
                            }
                            break;

                        case "Circle":
                            if (location[0] && location[0].length === 2) {
                                const [lat, lon] = location[0];
                                const longitude = Number(lon);
                                const latitude = Number(lat);
                                if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
                                    const center = [longitude, latitude];
                                    const radiusMeters = parseFloat(poi.radius) || 100;
                                    const metersPerDegree =
                                        111320 * Math.cos((latitude * Math.PI) / 180) || 111320;
                                    const radiusDegrees = radiusMeters / metersPerDegree;
                                    feature = new Feature({
                                        geometry: new Circle(center, radiusDegrees),
                                        data: poi,
                                    });
                                }
                            }
                            break;

                        case "Polygon":
                            if (location.length >= 3) {
                                const polygonCoords = location
                                    .map((coord) => {
                                        if (coord && coord.length === 2) {
                                            const [lat, lon] = coord;
                                            const longitude = Number(lon);
                                            const latitude = Number(lat);
                                            if (
                                                Number.isFinite(longitude) &&
                                                Number.isFinite(latitude)
                                            ) {
                                                return [longitude, latitude];
                                            }
                                        }
                                        return null;
                                    })
                                    .filter((coord) => coord !== null);

                                if (polygonCoords.length >= 3) {
                                    feature = new Feature({
                                        geometry: new Polygon([polygonCoords]),
                                        data: poi,
                                    });
                                }
                            }
                            break;

                        case "Road":
                            if (location.length >= 2) {
                                const roadCoords = location
                                    .map((coord) => {
                                        if (coord && coord.length === 2) {
                                            const [lat, lon] = coord;
                                            const longitude = Number(lon);
                                            const latitude = Number(lat);
                                            if (
                                                Number.isFinite(longitude) &&
                                                Number.isFinite(latitude)
                                            ) {
                                                return [longitude, latitude];
                                            }
                                        }
                                        return null;
                                    })
                                    .filter((coord) => coord !== null);

                                if (roadCoords.length >= 2) {
                                    feature = new Feature({
                                        geometry: new LineString(roadCoords),
                                        data: poi,
                                    });
                                }
                            }
                            break;
                    }

                    if (feature) {
                        const styles = getPoiStyles(poi);
                        feature.setStyle(styles);
                        poiSource.addFeature(feature);
                    }
                }
            } catch (error) {
                console.error("Error processing POI:", poi.id, error);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pois, poiVectorLayer]);

    // Helper to calculate time difference in minutes
    const calculateTimeDifference = (startTime, endTime) => {
        const timeDifferenceMillis = endTime - startTime;
        return timeDifferenceMillis / (1000 * 60); // Convert milliseconds to minutes
    };

    const resolveEntryTimestampMs = (data) => {
        if (!data) return NaN;

        const raw = data.entry_time ?? data.timestamp ?? null;

        const normalizeEpoch = (value) => {
            const num = typeof value === "number" ? value : Number(value);
            if (!Number.isFinite(num)) return NaN;
            return num < 1e12 ? num * 1000 : num;
        };

        if (typeof raw === "number") {
            return normalizeEpoch(raw);
        }

        if (typeof raw === "string") {
            const trimmed = raw.trim();
            if (/^\d+$/.test(trimmed)) {
                return normalizeEpoch(trimmed);
            }
            const parsed = new Date(trimmed).getTime();
            if (Number.isFinite(parsed)) return parsed;
        }

        const parseDateTimeParts = (dateStr, timeStr) => {
            if (!dateStr || !timeStr) return NaN;

            const dateTrimmed = String(dateStr).trim();
            const timeTrimmed = String(timeStr).trim();

            // Format: DDMMYYYY + HHMMSS (e.g., 15122025 + 234041)
            const dmyCompact = dateTrimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
            const hmsCompact = timeTrimmed.match(/^(\d{2})(\d{2})(\d{2})$/);
            if (dmyCompact && hmsCompact) {
                const day = Number(dmyCompact[1]);
                const month = Number(dmyCompact[2]);
                const year = Number(dmyCompact[3]);
                const hours = Number(hmsCompact[1]);
                const minutes = Number(hmsCompact[2]);
                const seconds = Number(hmsCompact[3]);
                const dt = new Date(year, month - 1, day, hours, minutes, seconds);
                const ms = dt.getTime();
                return Number.isFinite(ms) ? ms : NaN;
            }

            // Format: DD-MM-YY or DD-MM-YYYY
            const dmy = dateTrimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/);
            if (dmy) {
                const day = Number(dmy[1]);
                const month = Number(dmy[2]);
                let year = Number(dmy[3]);
                if (String(dmy[3]).length === 2) year = 2000 + year;

                const tm = timeTrimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
                if (!tm) return NaN;
                let hours = Number(tm[1]);
                const minutes = Number(tm[2]);
                const seconds = Number(tm[3] ?? 0);
                const ampm = tm[4]?.toUpperCase();
                if (ampm === "AM") {
                    if (hours === 12) hours = 0;
                } else if (ampm === "PM") {
                    if (hours !== 12) hours += 12;
                }

                const dt = new Date(year, month - 1, day, hours, minutes, seconds);
                const ms = dt.getTime();
                return Number.isFinite(ms) ? ms : NaN;
            }

            const fallbackMs = new Date(`${dateTrimmed} ${timeTrimmed}`).getTime();
            return Number.isFinite(fallbackMs) ? fallbackMs : NaN;
        };

        const datePart = data?.date;
        const timePart = data?.time;
        if (datePart && timePart) {
            const compositeMs = parseDateTimeParts(datePart, timePart);
            if (Number.isFinite(compositeMs)) return compositeMs;

            const compositeParsed = new Date(`${datePart}T${timePart}`).getTime();
            if (Number.isFinite(compositeParsed)) return compositeParsed;
        }

        return NaN;
    };

    // Set the correct icon style based on data conditions and vehicle type
    // const getIconStyle = (data, vehicleType, labelMode, forceDefault = false, rotation = 0) => {
    //     const entryTimeMs = resolveEntryTimestampMs(data);
    //     const currentTimeMs = new Date().getTime();
    //     const timeDifference = Number.isFinite(entryTimeMs)
    //         ? calculateTimeDifference(entryTimeMs, currentTimeMs)
    //         : Number.POSITIVE_INFINITY;
    //     const isStale = timeDifference > 15;
    //     const isPoliceMarker = data.markerCategory === "police";

    //     let color;

    //     if (forceDefault) {
    //         color = "default";
    //     } else if (isPoliceMarker) {
    //         color = "blue";
    //     } else if (isStale) {
    //         color = "grey"; // Offline device (no packets from device for 15+ minutes) - Grey Icon
    //     } else if (data.packet_type === "EA") {
    //         color = "red"; // EA Packet - Red Icon
    //     } else if (data.packet_type !== "NR") {
    //         color = "orange"; // Any Alert Packet except EA - Orange Icon
    //     } else if (resolveEntrySpeedValue(data) > 0) {
    //         color = "green"; // Moving - Green Icon
    //     } else if (String(data.ignition_status) === "1" && resolveEntrySpeedValue(data) === 0) {
    //         color = "blue"; // Ignition ON but stationary - Blue Icon
    //     } else {
    //         color = "default"; // Default color
    //     }

    //     const iconVehicleType = isPoliceMarker ? "police" : vehicleType;
    //     const labelText = getMarkerLabel(data, labelMode);
    //     console.debug(`[LiveMap] getIconStyle: color=${color}, type=${iconVehicleType}, mode=${labelMode}, label="${labelText}"`);
    //     return createIconStyle(color, iconVehicleType, labelText, false, rotation);
    // };

    const getIconStyle = (data, vehicleType, labelMode, forceDefault = false) => {
        const entryTimeMs = resolveEntryTimestampMs(data);
        const currentTimeMs = new Date().getTime();
        const timeDifference = Number.isFinite(entryTimeMs)
            ? calculateTimeDifference(entryTimeMs, currentTimeMs)
            : Number.POSITIVE_INFINITY;
        const isStale = timeDifference > 15;
        const isPoliceMarker = data.markerCategory === "police";

        let color = "default";
        if (forceDefault) { color = "default"; }
        else if (isPoliceMarker) { color = "blue"; }
        else if (isStale) { color = "grey"; }
        else if (data.packet_type === "EA") { color = "red"; }
        else if (data.packet_type !== "NR") { color = "orange"; }
        else if (resolveEntrySpeedValue(data) > 0) { color = "green"; }
        else if (String(data.ignition_status) === "1" && resolveEntrySpeedValue(data) === 0) { color = "blue"; }

        const iconVehicleType = isPoliceMarker ? "police" : vehicleType;
        const labelText = getMarkerLabel(data, labelMode);

        // Enforce 0 rotation
        return createIconStyle(color, iconVehicleType, labelText);
    };

    useEffect(() => {
        if (!map || !vectorLayer) {
            return;
        }

        const allMarkers = [...(Array.isArray(gpsData) ? gpsData : []), ...(Array.isArray(policeData) ? policeData : [])];

        if (allMarkers.length > 0) {
            // REDUNDANT MARKER LOGIC - Conflicts with animation effect at line 4866
            /*
            const vectorSource = vectorLayer.getSource().getSource();
            vectorSource.clear();

            const features = allMarkers
                .map((entry) => {
                    const averagedPos = getAveragedLocation(entry);
                    const longitude = averagedPos.lng;
                    const latitude = averagedPos.lat;

                    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
                        return null;
                    }

                    const vehicleType = entry?.device_tag_info?.category_info?.category;

                    const markerFeature = new Feature({
                        geometry: new Point([longitude, latitude]),
                        entryData: entry,
                        vehicleType: vehicleType,
                    });

                    markerFeature.setStyle(
                        getIconStyle(entry, vehicleType, markerLabelMode, allMode)
                    );

                    return markerFeature;
                })
                .filter(Boolean);

            vectorSource.addFeatures(features);

            if (autoFit && features.length > 0) {
                const extent = vectorLayer.getSource().getExtent();
                map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
            }
            */

            // Handle map click to display the overlay and zoom to street level or expand cluster
            const clickHandler = function (event) {
                // Ignore clicks that are actually the end of a drag-pan.
                // OpenLayers may still emit a click/singleclick after small drags on some devices.
                if (olWasDraggingRef.current || event?.dragging) {
                    olWasDraggingRef.current = false;
                    return;
                }

                dynamicOverlay.getElement().style.display = "none";

                let allHits = [];
                // Collect ALL features at pixel
                map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    allHits.push(feature);
                }, { hitTolerance: 5 });

                if (allHits.length === 0) return;

                // Temporary compatibility: define 'feature' as the first hit so subsequent code works
                const feature = allHits[0];

                const aggregatedItems = [];

                allHits.forEach(f => {
                    if (f.get("isIncident")) {
                        aggregatedItems.push({ type: 'incident', data: f.get("data"), coord: f.getGeometry().getCoordinates() });
                        return;
                    }
                    const subFeatures = f.get('features');
                    if (subFeatures && subFeatures.length > 0) {
                        subFeatures.forEach(sf => {
                            const entry = sf.get('entryData');
                            if (entry) aggregatedItems.push({ type: 'vehicle', data: entry, coord: sf.getGeometry().getCoordinates() });
                        });
                    } else {
                        const entry = f.get('entryData');
                        if (entry) aggregatedItems.push({ type: 'vehicle', data: entry, coord: f.getGeometry().getCoordinates() });
                    }
                });

                const uniqueItems = [];
                const seen = new Set();
                aggregatedItems.forEach(item => {
                    const id = item.type === 'incident' ? `inc_${item.data.id}` : `veh_${item.data.vehicle_registration_number}`;
                    if (!seen.has(id)) {
                        seen.add(id);
                        uniqueItems.push(item);
                    }
                });

                if (uniqueItems.length > 0) {
                    // Logic for Handling Consolidated Items
                    const firstHit = allHits[0];
                    const firstHitFeatures = firstHit.get('features');
                    const isVisualCluster = allHits.length === 1 && firstHitFeatures && firstHitFeatures.length > 1;

                    if (isVisualCluster) {
                        const currentZoom = map.getView().getZoom();
                        const isSameLocation = firstHitFeatures.every(f => {
                            const c = f.getGeometry().getCoordinates();
                            const c0 = firstHitFeatures[0].getGeometry().getCoordinates();
                            return c[0] === c0[0] && c[1] === c0[1];
                        });

                        if (!isSameLocation && currentZoom < 16) {
                            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                            firstHitFeatures.forEach(f => {
                                const c = f.getGeometry().getCoordinates();
                                if (c[0] < minX) minX = c[0];
                                if (c[0] > maxX) maxX = c[0];
                                if (c[1] < minY) minY = c[1];
                                if (c[1] > maxY) maxY = c[1];
                            });
                            map.getView().fit([minX, minY, maxX, maxY], { padding: [100, 100, 100, 100], duration: 500 });
                            return;
                        }
                    }

                    if (uniqueItems.length > 1) {
                        renderListView(uniqueItems);
                        return;
                    }

                    void renderSingleView(uniqueItems[0]);
                    return; // Important: Stop processing OLD logic
                }

                // --- Helper Functions Definitions ---
                function renderListView(items) {
                    let listHtml = `
<div class="overlay-card" style="min-width: 280px; max-height: 320px; overflow-y: auto; font-family: 'Roboto', sans-serif;">
<div class="overlay-header" style="position: sticky; top: 0; background: white; z-index: 1; border-bottom: 1px solid #eee; margin-bottom: 0;">
<div class="overlay-title">${items.length} Items Here</div>
</div>
<div class="overlay-body" style="padding: 0;">
`;

                    items.forEach(item => {
                        if (item.type === 'incident') {
                            listHtml += `
<div class="clustered-vehicle-row" style="padding: 10px; border-bottom: 1px solid #ffebee; background: #fff5f5; cursor: pointer;">
<div style="font-weight: 600; color: #b71c1c; margin-bottom: 2px;">Incident #${item.data.id}</div>
<div style="font-size: 11px; color: #6b7280;">${item.data.details || "Alert"}</div>
</div>`;
                        } else {
                            const entry = item.data;
                            const title = entry.vehicle_registration_number || entry.imei || "Unknown";
                            const speed = entry.speed > 0 ? `${entry.speed} km/h` : "Stopped";
                            listHtml += `
<div class="clustered-vehicle-row" style="padding: 10px; border-bottom: 1px solid #f3f4f6; cursor: pointer;">
<div style="font-weight: 600; color: #111827; margin-bottom: 2px;">${title}</div>
<div style="font-size: 11px; color: #6b7280; display: flex; justify-content: space-between;">
<span>${speed}</span>
<span>${entry.time || ""}</span>
</div>
</div>`;
                        }
                    });
                    listHtml += `</div></div>`;

                    const el = document.getElementById("overlay-content");
                    if (el) el.innerHTML = listHtml;
                    dynamicOverlay.setPosition(items[0].coord);
                    dynamicOverlay.getElement().style.display = "block";
                }

                async function renderSingleView(item) {
                    const coordinates = item.coord;

                    if (item.type === 'incident') {
                        const incident = item.data;
                        const imageContainerId = `incident-media-${incident.id}-${Date.now()}`;
                        document.getElementById("overlay-content").innerHTML = `
<div class="overlay-card" style="min-width: 250px; font-family: 'Roboto', sans-serif;">
<div class="overlay-header">
<div class="overlay-title">Incident #${incident.id}</div>
<div class="overlay-pill overlay-pill--alert">ALERT</div>
</div>
<div class="overlay-body">
<p style="margin: 0 0 10px 0; font-size: 13px; color: #374151; line-height: 1.4;">${incident.details || "No details available."}</p>
${incident.image_file ? `<div id="${imageContainerId}" style="margin-top: 8px;"></div>` : ''}
<div class="overlay-row" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #6b7280; display: flex; justify-content: space-between;">
<span class="overlay-label">Registered:</span>
<span class="overlay-value" style="font-weight: 500;">${incident.registered_at ? new Date(incident.registered_at).toLocaleString() : '-'}</span>
</div>
</div>
</div>
`;

                        dynamicOverlay.setPosition(coordinates);
                        dynamicOverlay.getElement().style.display = "block";

                        const currentZoom = map.getView().getZoom();
                        const targetZoom = currentZoom > 16 ? currentZoom : 16;
                        map.getView().animate({ center: coordinates, zoom: targetZoom, duration: 500 });

                        // Load secure incident media asynchronously if it exists
                        if (incident.image_file) {
                            renderSecureIncidentMedia(incident.image_file, imageContainerId, {
                                maxWidth: "100%",
                                maxHeight: "160px",
                                borderRadius: "6px",
                            }).catch((err) => {
                                console.error("Failed to load incident media:", err);
                            });
                        }

                    } else {
                        const entryDataRaw = item.data;
                        const renderVehicleOverlay = (entryData) => {
                            const isStale = isEntryStale15Min(entryData);
                            const speedValue = entryData.speed > 2 ? entryData.speed : 0;
                            const deviceStatusLabel = resolveDeviceStatusLabel(entryData);
                            const isOfflineResolved = deviceStatusLabel === "Offline";
                            const packetTypeCode = (isStale || isOfflineResolved)
                                ? "Offline"
                                : (resolveAlertCode(entryData) || "NR1");
                            const alertLabel = (isStale || isOfflineResolved)
                                ? "Offline"
                                : resolveAlertLabel(entryData);
                            const pillText = (isStale || isOfflineResolved)
                                ? "Offline"
                                : alertLabel.split(' (')[0];
                            const normalizedPacketTypeCode = String(packetTypeCode).trim().toUpperCase();
                            const pillClass = (isStale || isOfflineResolved || normalizedPacketTypeCode === "OFFLINE")
                                ? "overlay-pill--offline"
                                : (/^NR/i.test(packetTypeCode) || normalizedPacketTypeCode === "NORMAL")
                                    ? "overlay-pill--normal"
                                    : "overlay-pill--alert";

                            if (typeof onVehicleClick === "function") {
                                onVehicleClick(entryData);
                            }

                            lastClickedVehicleRef.current = {
                                imei: entryData?.imei,
                                coordinates,
                            };

                            const addressValue = entryData?.address ? entryData.address : "-";
                            const categoryValue = (entryData?.device_tag_info?.category_info?.category || entryData?.category || "-").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                            const packetTypeLabel = (isStale || isOfflineResolved)
                                ? "Offline"
                                : resolvePacketTypeLabel(entryData);
                            const nearestPoiLabel = resolveNearestPoiLabel(entryData);
                            const nearestPolice = resolveNearestPoliceDetails(entryData);
                            const policeContactValue =
                                entryData?.nearestPoliceContact || entryData?.nearest_police?.data?.phone || null;

                            const routeId =
                                entryData?.route_id ||
                                entryData?.route_ref?.id ||
                                entryData?.device_tag_info?.route?.id ||
                                entryData?.nearby_routes_within_100m?.[0]?.data?.id ||
                                "-";

                            const routeData = entryData?.route_ref || entryData?.device_tag_info?.route || {};

                            const routeName =
                                entryData?.route_name ||
                                entryData?.route ||
                                entryData?.route_info ||
                                entryData?.routeInformation ||
                                routeData?.name ||
                                (routeId && routeId !== "-" ? `Route ${routeId}` : "-");

                            const policeInfoRows = [
                                nearestPolice?.name && nearestPolice.name !== "-"
                                    ? `<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Police Station</span><span class="overlay-value overlay-value--multiline">${nearestPolice.name}</span></div>`
                                    : "",
                                nearestPolice?.address && nearestPolice.address !== "-"
                                    ? `<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Police Address</span><span class="overlay-value overlay-value--multiline">${nearestPolice.address}</span></div>`
                                    : "",
                                nearestPolice?.lat && nearestPolice.lat !== "-" && nearestPolice?.lng && nearestPolice.lng !== "-"
                                    ? `<div class="overlay-row"><span class="overlay-label">Police Lat/Lng</span><span class="overlay-value">${nearestPolice.lat}, ${nearestPolice.lng}</span></div>`
                                    : "",
                                policeContactValue
                                    ? `<div class="overlay-row"><span class="overlay-label">Police Contact</span><span class="overlay-value">${policeContactValue}</span></div>`
                                    : "",
                            ].filter(Boolean).join("");

                            const policeDetailsRows = [
                                nearestPolice?.name && nearestPolice.name !== "-"
                                    ? `<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Police</span><span class="overlay-value overlay-value--multiline">${nearestPolice.name}</span></div>`
                                    : "",
                                nearestPolice?.address && nearestPolice.description !== "-"
                                    ? `<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Police Addr</span><span class="overlay-value overlay-value--multiline">${nearestPolice.description}</span></div>`
                                    : "",
                                nearestPolice?.lat && nearestPolice.lat !== "-" && nearestPolice?.lng && nearestPolice.lng !== "-"
                                    ? `<div class="overlay-row"><span class="overlay-label">Police Lat/Lng</span><span class="overlay-value">${nearestPolice.lat}, ${nearestPolice.lng}</span></div>`
                                    : "",
                            ].join("");

                            document.getElementById("overlay-content").innerHTML = `
<div class="overlay-card">
<div class="overlay-header">
<div class="overlay-header-content">
<div class="overlay-title">${entryData.vehicle_registration_number || "-"}</div>
</div>
<div class="overlay-pill ${pillClass}">${pillText}</div>
</div>
<div class="overlay-tabs" data-overlay-tabs>
<div class="overlay-tab-list" role="tablist">
<button class="overlay-tab overlay-tab--active" type="button" data-overlay-tab="vehicle" role="tab">Vehicle</button>
<button class="overlay-tab" type="button" data-overlay-tab="geographic" role="tab">Geographic</button>
<button class="overlay-tab" type="button" data-overlay-tab="route" role="tab">Route</button>
<button class="overlay-tab" type="button" data-overlay-tab="police-support" role="tab">Police Support</button>
</div>

<div class="overlay-panel overlay-panel--active" data-overlay-panel="vehicle" role="tabpanel">
<div class="overlay-section">
<div class="overlay-section-title">Vehicle Information</div>
<div class="overlay-section-body">
<div class="overlay-row">
<span class="overlay-label">Packet Status</span>
<span class="overlay-value">${packetTypeLabel}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Device Status</span>
<span class="overlay-value">${deviceStatusLabel}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Date</span>
<span class="overlay-value">${formatDateDDMMYY(entryData.date)}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Time</span>
<span class="overlay-value">${formatTimeHHMMSS(entryData.time)}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Speed</span>
<span class="overlay-value">${speedValue} km/h</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Category</span>
<span class="overlay-value">${categoryValue}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Battery</span>
<span class="overlay-value">${entryData.internal_battery_voltage || "-"} - ${entryData.main_input_voltage || "-"}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Latitude</span>
<span class="overlay-value">${entryData.latitude || "-"}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Longitude</span>
<span class="overlay-value">${entryData.longitude || "-"}</span>
</div>
</div>
</div>
</div>

<div class="overlay-panel" data-overlay-panel="geographic" role="tabpanel">
<div class="overlay-section">
<div class="overlay-section-body">
<div class="overlay-row overlay-row--multiline">
<span class="overlay-label">Address</span>
<span class="overlay-value overlay-value--multiline">${addressValue}</span>
</div>
<div class="overlay-row overlay-row--multiline">
<span class="overlay-label">Nearest Poi</span>
<span class="overlay-value overlay-value--multiline">${nearestPoiLabel || 'No nearby POI found'}</span>
</div>
</div>
</div>
</div>

<div class="overlay-panel" data-overlay-panel="route" role="tabpanel">
<div class="overlay-section">
<div class="overlay-section-title">Route Information</div>
<div class="overlay-section-body">
<!-- Basic Route Info -->
<div class="overlay-row">
<span class="overlay-label">Route Name</span>
<span class="overlay-value">${routeName}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Route ID</span>
<span class="overlay-value">${routeId}</span>
</div>
</div>
</div>
</div>

<div class="overlay-panel" data-overlay-panel="police-support" role="tabpanel">
<div class="overlay-section">
<div class="overlay-section-title">Police Support</div>
<div class="overlay-section-body">
${policeInfoRows || policeDetailsRows
                                    ? `${policeInfoRows}${policeDetailsRows}`
                                    : `<div class="overlay-row overlay-row--multiline"><span class="overlay-value overlay-value--multiline">No police details available</span></div>`
                                }
</div>
</div>
</div>
</div>
<div style="padding: 8px 10px 4px; border-top: 1px solid #f1f5f9; margin-top: 4px;">
<button
  id="get-direction-btn"
  data-vehicle-lat="${entryData.latitude}"
  data-vehicle-lng="${entryData.longitude}"
  style="width:100%;padding:7px 0;background:#1e40af;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;letter-spacing:0.03em;"
>
  🧭 Get Direction
</button>
<div id="get-direction-hint" style="display:none;margin-top:6px;font-size:11px;color:#1e40af;text-align:center;padding:4px 6px;background:#eff6ff;border-radius:4px;">
  Click anywhere on the map to draw route from this vehicle
</div>
</div>
`;
                        };

                        renderVehicleOverlay(entryDataRaw);

                        dynamicOverlay.setPosition(coordinates);
                        dynamicOverlay.getElement().style.display = "block";

                        fetchVehicleTrackingDetail(entryDataRaw)
                            .then((trackingDetail) => {
                                if (!trackingDetail) return;
                                const lastClick = lastClickedVehicleRef.current;
                                if (!lastClick?.imei || lastClick.imei !== trackingDetail?.imei) return;
                                renderVehicleOverlay(trackingDetail);
                            })
                            .catch(() => {
                                // best-effort only
                            });

                        const currentZoom = map.getView().getZoom();
                        // Only zoom if we're significantly below the target zoom level
                        // This prevents redundant zoom animations when clicking on an already-selected vehicle
                        if (currentZoom < 15) {
                            const targetZoom = currentZoom > 18 ? currentZoom : 18;
                            map.getView().animate({ center: coordinates, zoom: targetZoom, duration: 500 });
                        } else {
                            // Just pan to the coordinate without zooming
                            map.getView().animate({ center: coordinates, duration: 300 });
                        }
                    }
                }
            };

            const pointerDownHandler = () => {
                olWasDraggingRef.current = false;
            };

            const pointerDragHandler = () => {
                olWasDraggingRef.current = true;
            };

            map.on("pointerdown", pointerDownHandler);
            map.on("pointerdrag", pointerDragHandler);
            map.on("singleclick", clickHandler);

            return () => {
                map.un("singleclick", clickHandler);
                map.un("pointerdown", pointerDownHandler);
                map.un("pointerdrag", pointerDragHandler);
            };
        } else {
            vectorLayer.getSource().clear();
        }
    }, [
        gpsData,
        policeData,
        map,
        vectorLayer,
        dynamicOverlay,
        onVehicleClick,
        markerLabelMode,
        autoFit,
    ]);

    useEffect(() => {
        if (!dynamicOverlay || !map || !focusEntry?.address) return;

        const lastClicked = lastClickedVehicleRef.current;
        if (!lastClicked?.imei || lastClicked.imei !== focusEntry?.imei) return;

        const overlayContent = document.getElementById("overlay-content");
        if (!overlayContent) return;

        const isStale = isEntryStale15Min(focusEntry);
        const speedValue = focusEntry.speed > 2 ? focusEntry.speed : 0;
        const deviceStatusLabel = resolveDeviceStatusLabel(focusEntry);
        const isOfflineResolved = deviceStatusLabel === "Offline";
        const packetTypeCode = (isStale || isOfflineResolved)
            ? "Offline"
            : (resolveAlertCode(focusEntry) || "NR1");
        const alertLabel = (isStale || isOfflineResolved)
            ? "Offline"
            : resolveAlertLabel(focusEntry);
        // Extract just the name part (without the code in parentheses if present)
        const pillText = (isStale || isOfflineResolved)
            ? "Offline"
            : alertLabel.split(' (')[0];
        const normalizedPacketTypeCode = String(packetTypeCode).trim().toUpperCase();
        const pillClass = (isStale || isOfflineResolved || normalizedPacketTypeCode === "OFFLINE")
            ? "overlay-pill--offline"
            : (/^NR/i.test(packetTypeCode) || normalizedPacketTypeCode === "NORMAL")
                ? "overlay-pill--normal"
                : "overlay-pill--alert";

        const packetTypeLabel = (isStale || isOfflineResolved)
            ? "Offline"
            : resolvePacketTypeLabel(focusEntry);
        const nearestPoiLabel = resolveNearestPoiLabel(focusEntry);
        const nearestPolice = resolveNearestPoliceDetails(focusEntry);

        const nearestPoliceStationValue =
            focusEntry?.markerCategory === "police"
                ? (focusEntry.nearestPoliceStation || "uzanbazr policestation")
                : null;
        const policeContactValue =
            focusEntry?.markerCategory === "police"
                ? (focusEntry.nearestPoliceContact || "987654123")
                : null;

        const wardValue =
            focusEntry?.ward_name ||
            focusEntry?.ward ||
            focusEntry?.wardName ||
            focusEntry?.device_tag_info?.ward?.name ||
            focusEntry?.device_tag_info?.ward_name ||
            "-";
        const districtValue =
            focusEntry?.district ||
            focusEntry?.district_name ||
            focusEntry?.districtName ||
            focusEntry?.device_tag_info?.device?.district ||
            focusEntry?.device_tag_info?.district?.name ||
            focusEntry?.device_tag_info?.district_name ||
            "-";
        const stateValue =
            focusEntry?.state ||
            focusEntry?.state_name ||
            focusEntry?.stateName ||
            focusEntry?.device_tag_info?.state_info?.state ||
            focusEntry?.device_tag_info?.state?.name ||
            focusEntry?.device_tag_info?.state_name ||
            "-";

        // Extract route information with fallbacks
        const routeId =
            focusEntry?.route_id ||
            focusEntry?.route_ref?.id ||
            focusEntry?.device_tag_info?.route?.id ||
            focusEntry?.nearby_routes_within_100m?.[0]?.data?.id ||
            "-";

        const routeData = focusEntry?.route_ref || focusEntry?.device_tag_info?.route || {};

        const routeName =
            focusEntry?.route_name ||
            focusEntry?.route ||
            focusEntry?.route_info ||
            focusEntry?.routeInformation ||
            routeData?.name ||
            (routeId && routeId !== "-" ? `Route ${routeId}` : "-");

        const routeCode = routeData?.code || focusEntry?.route_code || "-";
        const routeType = routeData?.type || focusEntry?.route_type || "-";
        const startPoint = routeData?.start_point || focusEntry?.start_point || "-";
        const endPoint = routeData?.end_point || focusEntry?.end_point || "-";
        const stops = routeData?.stops || focusEntry?.route_stops || [];
        const distance = routeData?.distance ? `${routeData.distance} km` : "-";
        const duration = routeData?.duration || focusEntry?.route_duration || "-";
        const schedule = routeData?.schedule || focusEntry?.route_schedule || "-";
        const operator = routeData?.operator || focusEntry?.route_operator || "-";

        const policeInfoRows = [
            nearestPoliceStationValue
                ? `<div class="overlay-row"><span class="overlay-label">Nearest Police Station</span><span class="overlay-value">${nearestPoliceStationValue}</span></div>`
                : "",
            policeContactValue
                ? `<div class="overlay-row"><span class="overlay-label">Police Contact</span><span class="overlay-value">${policeContactValue}</span></div>`
                : "",
        ].join("");

        const policeDetailsRows = [
            nearestPolice?.name && nearestPolice.name !== "-"
                ? `<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Police</span><span class="overlay-value overlay-value--multiline">${nearestPolice.name}</span></div>`
                : "",
            nearestPolice?.address && nearestPolice.address !== "-"
                ? `<div class="overlay-row overlay-row--multiline"><span class="overlay-label">Police Addr</span><span class="overlay-value overlay-value--multiline">${nearestPolice.address}</span></div>`
                : "",
            nearestPolice?.lat && nearestPolice.lat !== "-" && nearestPolice?.lng && nearestPolice.lng !== "-"
                ? `<div class="overlay-row"><span class="overlay-label">Police Lat/Lng</span><span class="overlay-value">${nearestPolice.lat}, ${nearestPolice.lng}</span></div>`
                : "",
        ].join("");

        const showSelectedOnly =
    Array.isArray(selectedColumns) &&
    selectedColumns.length > 0;
        overlayContent.innerHTML = `
<div class="overlay-card">
<div class="overlay-header">
<div class="overlay-header-content">
<div class="overlay-title">${focusEntry.vehicle_registration_number || "-"}</div>
</div>
<div class="overlay-pill ${pillClass}">${pillText}</div>
</div>


${!showSelectedOnly ? `
<div class="overlay-panel overlay-panel--active" data-overlay-panel="vehicle" role="tabpanel">
<div class="overlay-section">
<div class="overlay-section-title">Vehicle Information</div>
<div class="overlay-section-body">
<div class="overlay-row">
<span class="overlay-label">Vehicle No</span>
<span class="overlay-value">${focusEntry.vehicle_registration_number || "-"}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">IMEI</span>
<span class="overlay-value">${focusEntry.imei || "-"}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Alert Id</span>
<span class="overlay-value">${focusEntry.alert_id || "-"}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Latitude</span>
<span class="overlay-value">${focusEntry.latitude || "-"}</span>
</div>
<div class="overlay-row">
<span class="overlay-label">Longitude</span>
<span class="overlay-value">${focusEntry.longitude || "-"}</span>
</div>
</div>
</div>
</div>


` : `
<div class="overlay-section">
<div class="overlay-section-title">
Selected Fields
</div>

<div class="overlay-section-body">

${selectedColumns.map((key) => {
    const label = COLUMN_LABELS[key] || key;
    const value = getColumnValue(focusEntry, key);

    return `
    <div class="overlay-row">
        <span class="overlay-label">${label}</span>
        <span class="overlay-value">
            ${
                value !== null &&
                value !== undefined &&
                value !== ""
                    ? String(value)
                    : "-"
            }
        </span>
    </div>
    `;
}).join("")}

</div>
</div>
`}

<div style="padding: 8px 10px 4px; border-top: 1px solid #f1f5f9; margin-top: 4px;">
<button
  id="get-direction-btn"
  data-vehicle-lat="${focusEntry.latitude}"
  data-vehicle-lng="${focusEntry.longitude}"
  style="width:100%;padding:7px 0;background:#1e40af;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;letter-spacing:0.03em;"
>
  🧭 Get Direction
</button>
<div id="get-direction-hint" style="display:none;margin-top:6px;font-size:11px;color:#1e40af;text-align:center;padding:4px 6px;background:#eff6ff;border-radius:4px;">
  Click anywhere on the map to draw route from this vehicle
</div>

</div>
`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dynamicOverlay, map, focusEntry?.imei, focusEntry?.address, selectedColumns]);

    useEffect(() => {
        const container = overlayElement.current;
        if (!container) return;

        const handleClick = (event) => {
            const tabButton = event.target?.closest?.("[data-overlay-tab]");
            if (!tabButton) return;

            const tabName = tabButton.getAttribute("data-overlay-tab");
            if (!tabName) return;

            const tabsRoot = tabButton.closest("[data-overlay-tabs]");
            if (!tabsRoot) return;

            const allTabs = tabsRoot.querySelectorAll("[data-overlay-tab]");
            allTabs.forEach((btn) => {
                btn.classList.toggle("overlay-tab--active", btn === tabButton);
            });

            const panels = tabsRoot.querySelectorAll("[data-overlay-panel]");
            panels.forEach((panel) => {
                panel.classList.toggle(
                    "overlay-panel--active",
                    panel.getAttribute("data-overlay-panel") === tabName
                );
            });
        };

        container.addEventListener("click", handleClick);
        return () => container.removeEventListener("click", handleClick);
    }, []);

    // Handle Incident Data for OpenLayers (Normal/Satellite)
    useEffect(() => {
        if (!map || !incidentVectorLayer) return;

        const source = incidentVectorLayer.getSource();
        source.clear();

        if (incidentData.length > 0) {
            const features = incidentData
                .map((incident) => {
                    const longitude = Number(incident.longitude);
                    const latitude = Number(incident.latitude);

                    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

                    const feature = new Feature({
                        geometry: new Point([longitude, latitude]),
                        data: incident,
                        isIncident: true,
                    });

                    // Style for incident
                    const svgIcon = `
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 2L1 21H23L12 2Z" fill="#F44336" stroke="#B71C1C" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M12 9V15" stroke="white" stroke-width="2" stroke-linecap="round"/>
<path d="M12 18V18.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
`;
                    const iconUrl = `data:image/svg+xml;base64,${window.btoa(svgIcon)}`;

                    feature.setStyle(
                        new Style({
                            image: new Icon({
                                anchor: [0.5, 1],
                                src: iconUrl,
                                scale: 1.0,
                            }),
                        })
                    );
                    return feature;
                })
                .filter(Boolean);

            source.addFeatures(features);
        }
    }, [incidentData, map, incidentVectorLayer]);

    useEffect(() => {
        if (!map) return;

        const routeSource = new VectorSource();
        const routeLayer = new VectorLayer({
            source: routeSource,
            zIndex: 500,
            style: new Style({
                stroke: new Stroke({ color: "#1e40af", width: 4 }),
            }),
        });
        map.addLayer(routeLayer);
        routeVectorLayerRef.current = routeLayer;

        return () => {
            map.removeLayer(routeLayer);
            routeVectorLayerRef.current = null;
        };
    }, [map]);

    // ── Clear route when a different vehicle is selected ──────────────────────
    useEffect(() => {
        // Cancel any pending destination-pick
        isPickingDestinationRef.current = false;
        activeVehicleForRouteRef.current = null;

        // Hide the hint text if it's visible
        const hint = document.getElementById("get-direction-hint");
        if (hint) hint.style.display = "none";

        // Clear previously drawn route from the map
        const routeSource = routeVectorLayerRef.current?.getSource();
        if (routeSource) routeSource.clear();

        // Hide route info popup
        if (routeInfoOverlayElementRef.current) {
            routeInfoOverlayElementRef.current.style.display = "none";
        }
        if (routeInfoOverlayRef.current) {
            routeInfoOverlayRef.current.setPosition(undefined);
        }

    }, [focusEntry?.imei]);   // fires only when the selected vehicle changes

    // Listen for clicks on the "Get Direction" button inside the overlay card
    useEffect(() => {
        const container = overlayElement.current;
        if (!container) return;

        const handleGetDirectionClick = (event) => {
            const btn = event.target?.closest?.("#get-direction-btn");
            if (!btn) return;

            const vLat = parseFloat(btn.getAttribute("data-vehicle-lat"));
            const vLng = parseFloat(btn.getAttribute("data-vehicle-lng"));
            if (!Number.isFinite(vLat) || !Number.isFinite(vLng)) return;

            activeVehicleForRouteRef.current = { lat: vLat, lng: vLng };
            isPickingDestinationRef.current = true;

            // Show hint inside overlay
            const hint = document.getElementById("get-direction-hint");
            if (hint) hint.style.display = "block";
            // CLOSE VEHICLE POPUP IMMEDIATELY
    if (dynamicOverlay) {
        dynamicOverlay.setPosition(undefined);
    }
        };

        container.addEventListener("click", handleGetDirectionClick);
        return () => container.removeEventListener("click", handleGetDirectionClick);
    }, [dynamicOverlay]);

    // Listen for map clicks when in destination-picking mode
    useEffect(() => {
        if (!map) return;

        const handleMapClickForRoute = async (event) => {
            if (!isPickingDestinationRef.current) return;
            if (!activeVehicleForRouteRef.current) return;

            isPickingDestinationRef.current = false;

            // Hide hint
            const hint = document.getElementById("get-direction-hint");
            if (hint) hint.style.display = "none";

            const [destLon, destLat] = event.coordinate;

            const { lat: vLat, lng: vLng } = activeVehicleForRouteRef.current;

            try {
                const http = getAxiosInstance();
                const response = await http.post("/api/get_routePath/", {
                    points: [
                        [vLng, vLat],
                        [destLon, destLat],
                    ],
                });

                const routeData = response?.data?.data ?? response?.data;
                const paths = routeData?.paths ?? [];
                if (!paths.length) {
                    console.warn("Get Direction: no paths returned");
                    return;
                }

                const coordinates = paths[0]?.points?.coordinates ?? [];
                if (coordinates.length < 2) return;

                // Draw route on map
                const routeSource = routeVectorLayerRef.current?.getSource();
                if (!routeSource) return;

                routeSource.clear();

                // Route line
                const lineCoords = coordinates.map(([lon, lat]) => [lon, lat]);
                const lineFeature = new Feature({ geometry: new LineString(lineCoords) });
                lineFeature.setStyle(new Style({ stroke: new Stroke({ color: "#1e40af", width: 5 }) }));
                routeSource.addFeature(lineFeature);

                // Destination pin
                const destFeature = new Feature({ geometry: new Point([destLon, destLat]) });
                destFeature.setStyle(new Style({
                    image: new CircleStyle({
                        radius: 8,
                        fill: new Fill({ color: "#dc2626" }),
                        stroke: new Stroke({ color: "#fff", width: 2 }),
                    }),
                }));
                routeSource.addFeature(destFeature);

                // Fit view to route
                const extent = routeSource.getExtent();
                if (extent && extent.every(Number.isFinite)) {
                    map.getView().fit(extent, { padding: [60, 60, 60, 60], duration: 600 });
                }
                // ── Route Info Popup ──────────────────────────────────────────
                // Distance from API response (metres), fallback to 0
                const distanceM = paths[0]?.distance ?? 0;
                const distanceKm = distanceM / 1000;

                // ETA based on avg speed of 15 km/h
                const etaHours = distanceKm / 15;
                const etaMinutes = Math.round(etaHours * 60);
                const etaDisplay = etaMinutes < 60
                    ? `${etaMinutes} min`
                    : `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}min`;

                // Show loading state in popup immediately
                const infoEl = routeInfoOverlayElementRef.current;
                if (infoEl) {
                    infoEl.style.display = "block";
                    infoEl.innerHTML = `
                    <div style="
                      background:#fff;border-radius:10px;padding:14px 16px;
                      box-shadow:0 6px 24px rgba(0,0,0,.22);border:1px solid #e5e7eb;
                      min-width:280px;max-width:340px;font-family:'Roboto',sans-serif;font-size:12px;color:#1f2933;
                    ">
                      <div style="font-weight:700;font-size:14px;color:#1e40af;margin-bottom:10px;">🧭 Route Info</div>
                      <div style="color:#6b7280;font-size:11px;margin-bottom:8px;">Fetching addresses…</div>
                      <div style="display:flex;gap:16px;margin-top:8px;padding-top:8px;border-top:1px solid #f1f5f9;">
                        <div style="text-align:center;">
                          <div style="font-size:11px;color:#6b7280;">Distance</div>
                          <div style="font-weight:700;font-size:13px;color:#111827;">${distanceKm.toFixed(2)} km</div>
                        </div>
                        <div style="text-align:center;">
                          <div style="font-size:11px;color:#6b7280;">ETA <span style="font-size:9px;">(avg 15 km/h)</span></div>
                          <div style="font-weight:700;font-size:13px;color:#111827;">${etaDisplay}</div>
                        </div>
                      </div>
                    </div>`;
                    // Position popup at midpoint of the route
                    const midIdx = Math.floor(lineCoords.length / 2);
                    if (routeInfoOverlayRef.current) {
                        routeInfoOverlayRef.current.setPosition(lineCoords[midIdx]);
                    }
                }

                // Fetch source & destination addresses via reverse geocoding
                const geocodeUrl = process.env.REACT_APP_GEOCODING_URL || "https://map-geocoding.gromed.in";
                const fetchAddress = async (lat, lon) => {
                    try {
                        const resp = await HomePageService.getReverseGeocode(lat, lon);
                        return resp?.data?.address || resp?.data?.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
                    } catch {
                        return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
                    }
                };

                const [srcAddress, destAddress] = await Promise.all([
                    fetchAddress(vLat, vLng),
                    fetchAddress(destLat, destLon),
                ]);

                // Update popup with full address info
                if (infoEl && infoEl.style.display !== "none") {
                    infoEl.innerHTML = `
                    <div style="
                      background:#fff;border-radius:10px;padding:14px 16px;
                      box-shadow:0 6px 24px rgba(0,0,0,.22);border:1px solid #e5e7eb;
                      min-width:280px;max-width:340px;font-family:'Roboto',sans-serif;font-size:12px;color:#1f2933;position:relative;
                    ">
                      <button id="route-info-close-btn" style="
                        position:absolute;top:8px;right:10px;background:none;border:none;
                        font-size:16px;cursor:pointer;color:#6b7280;line-height:1;
                      ">✕</button>
                      <div style="font-weight:700;font-size:14px;color:#1e40af;margin-bottom:10px;">🧭 Route Info</div>
                      <div style="margin-bottom:8px;">
                        <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px;">📍 Source</div>
                        <div style="font-size:11px;font-weight:500;color:#111827;line-height:1.4;">${srcAddress}</div>
                      </div>
                      <div style="margin-bottom:10px;">
                        <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px;">🏁 Destination</div>
                        <div style="font-size:11px;font-weight:500;color:#111827;line-height:1.4;">${destAddress}</div>
                      </div>
                      <div style="display:flex;gap:16px;padding-top:10px;border-top:1px solid #f1f5f9;">
                        <div style="flex:1;text-align:center;background:#eff6ff;border-radius:8px;padding:8px 4px;">
                          <div style="font-size:10px;color:#3b82f6;">Distance</div>
                          <div style="font-weight:700;font-size:15px;color:#1e40af;">${distanceKm.toFixed(2)} km</div>
                        </div>
                        <div style="flex:1;text-align:center;background:#f0fdf4;border-radius:8px;padding:8px 4px;">
                          <div style="font-size:10px;color:#16a34a;">ETA <span style="font-size:9px;">(avg 15 km/h)</span></div>
                          <div style="font-weight:700;font-size:15px;color:#15803d;">${etaDisplay}</div>
                        </div>
                      </div>
                    </div>`;
                    // Wire up close button
                    const closeBtn = infoEl.querySelector("#route-info-close-btn");
                    if (closeBtn) {
                        closeBtn.addEventListener("click", () => {
                            infoEl.style.display = "none";
                            const routeSource = routeVectorLayerRef.current?.getSource();
                            if (routeSource) routeSource.clear();
                        });
                    }
                }
            } catch (err) {
                console.error("Get Direction API error:", err);
            }
        };

        map.on("singleclick", handleMapClickForRoute);
        return () => map.un("singleclick", handleMapClickForRoute);
    }, [map]);
    // ── End Get Direction ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!map || !incidentVectorLayer) return;

        const source = incidentVectorLayer.getSource();
        source.clear();

        if (incidentData.length > 0) {
            const features = incidentData
                .map((incident) => {
                    const longitude = Number(incident.longitude);
                    const latitude = Number(incident.latitude);

                    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;

                    const feature = new Feature({
                        geometry: new Point([longitude, latitude]),
                        data: incident,
                        isIncident: true,
                    });

                    // Style for incident
                    const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L1 21H23L12 2Z" fill="#F44336" stroke="#B71C1C" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M12 9V15" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 18V18.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
    `;
                    const iconUrl = `data:image/svg+xml;base64,${window.btoa(svgIcon)}`;

                    feature.setStyle(
                        new Style({
                            image: new Icon({
                                anchor: [0.5, 1],
                                src: iconUrl,
                                scale: 1.0,
                            }),
                        })
                    );
                    return feature;
                })
                .filter(Boolean);

            source.addFeatures(features);
        }
    }, [incidentData, map, incidentVectorLayer]);

    // Handle NMR circular area (normal / satellite OpenLayers maps)
    useEffect(() => {
        if (!map || !nmrVectorLayer) return;

        const source = nmrVectorLayer.getSource();
        source.clear();

        if (!nmrArea) return;

        const lat = Number(nmrArea.latitude);
        const lon = Number(nmrArea.longitude);
        const radiusKm = Number(nmrArea.radiusKm) || 5;

        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

        // Approximate conversion: 1 degree of latitude ~ 111.32 km
        const radiusDeg = radiusKm / 111.32;

        const circleGeom = new Circle([lon, lat], radiusDeg);
        const feature = new Feature({ geometry: circleGeom });

        feature.setStyle(
            new Style({
                fill: new Fill({ color: 'rgba(33, 150, 243, 0.15)' }), // light blue fill
                stroke: new Stroke({ color: '#2196F3', width: 2 }), // blue border
            })
        );

        source.addFeature(feature);
    }, [map, nmrVectorLayer, nmrArea]);

    // Handle clustering distance based on zoom level to reveal tight clusters
    // useEffect(() => {
    //     if (!map || !vectorLayer) return;

    //     const source = vectorLayer.getSource();
    //     // Ensure we are working with a Cluster source which supports setDistance
    //     if (!source || typeof source.setDistance !== 'function') return;

    //     const handleZoomChange = () => {
    //         const zoom = map.getView().getZoom();
    //         // Disable clustering at high zoom levels (e.g., >= 17) to reveal individual items
    //         // 40 is the default distance we set during initialization
    //         const targetDistance = zoom >= 14 ? 0 : 30;

    //         if (source.getDistance() !== targetDistance) {
    //             source.setDistance(targetDistance);
    //         }
    //     };

    //     const view = map.getView();
    //     // Initial check
    //     handleZoomChange();

    //     // Listen to changes
    //     view.on('change:resolution', handleZoomChange);

    //     return () => {
    //         view.un('change:resolution', handleZoomChange);
    //     };
    // }, [map, vectorLayer]);


    // useEffect(() => {
    //     if (!map || !vectorLayer || false /* LegacyMap disabled */) return;

    //     const vectorSource = vectorLayer.getSource().getSource();
    //     const allMarkers = [...gpsData, ...policeData];
    //     const currentImeis = new Set();

    //     allMarkers.forEach((entry) => {
    //         const imei = entry.imei || entry.vehicle_registration_number;
    //         if (!imei) return;
    //         currentImeis.add(imei);

    //         const newPos = getAveragedLocation(entry);
    //         const newCoords = [newPos.lng, newPos.lat];
    //         const vehicleType = entry?.device_tag_info?.category_info?.category || "unknown";
    //         const rotation = entry.course || entry.heading || 0;


    //         let feature = activeFeaturesRef.current[imei];

    //         if (!feature) {
    //             // 1. CREATE NEW FEATURE if it doesn't exist
    //             feature = new Feature({
    //                 geometry: new Point(newCoords),
    //                 entryData: entry,
    //             });
    //             feature.setStyle(getIconStyle(entry, entry?.device_tag_info?.category_info?.category, markerLabelMode, allMode, rotation, vehicleType));
    //             activeFeaturesRef.current[imei] = feature;
    //             vectorSource.addFeature(feature);
    //         } else {
    //             // 2. ANIMATE EXISTING FEATURE
    //             const startCoords = feature.getGeometry().getCoordinates();
    //             const duration = 2000; // Match this to your GPS polling interval (e.g., 2-5 seconds)
    //             const start = Date.now();
    //             const startRotation = feature.get("currentRotation") || 0; // Store last rotation on feature
    //             const endRotation = entry.course ?? entry.heading ?? 0;


    //             const animate = () => {
    //                 const elapsed = Date.now() - start;
    //                 const fraction = Math.min(elapsed / duration, 1);

    //                 // Linear interpolation formula: start + (end - start) * fraction
    //                 const currentLng = startCoords[0] + (newCoords[0] - startCoords[0]) * fraction;
    //                 const currentLat = startCoords[1] + (newCoords[1] - startCoords[1]) * fraction;

    //                 feature.getGeometry().setCoordinates([currentLng, currentLat]);
    //                 // This handles the "shortest path" (e.g. turning from 350 to 10 degrees)
    //                 let rotationDiff = endRotation - startRotation;
    //                 if (rotationDiff > 180) rotationDiff -= 360;
    //                 if (rotationDiff < -180) rotationDiff += 360;
    //                 const currentRotation = startRotation + (rotationDiff * fraction);
    //                 feature.set("currentRotation", currentRotation);
    //                 // feature.set("entryData", entry); // Update data for overlay
    //                 feature.setStyle(getIconStyle(entry, vehicleType, markerLabelMode, allMode));
    //                 if (fraction < 1) {
    //                     requestAnimationFrame(animate);
    //                 }
    //             };

    //             // Only animate if the distance is significant to save CPU
    //             if (Math.abs(startCoords[0] - newCoords[0]) > 0.00001 || Math.abs(startCoords[1] - newCoords[1]) > 0.00001) {
    //                 animate();
    //             }

    //             // Update style in case status changed (Green/Red/Orange)
    //             feature.setStyle(getIconStyle(entry, entry?.device_tag_info?.category_info?.category, markerLabelMode, allMode));
    //         }
    //     });

    //     // 3. REMOVE OFFLINE VEHICLES
    //     Object.keys(activeFeaturesRef.current).forEach(imei => {
    //         if (!currentImeis.has(imei)) {
    //             vectorSource.removeFeature(activeFeaturesRef.current[imei]);
    //             delete activeFeaturesRef.current[imei];
    //         }
    //     });

    // }, [gpsData, policeData, map, vectorLayer, mapType, markerLabelMode, allMode  ]);


    useEffect(() => {
        if (!map || !vectorLayer || false /* LegacyMap disabled */) return;

        const vectorSource = vectorLayer.getSource().getSource();
        const allMarkers = [...gpsData, ...policeData];
        const currentImeis = new Set();

        // Duration should be slightly less than your polling interval (e.g., if you poll every 5s, use 4500)
        const animationDuration = 2500;

        allMarkers.forEach((entry) => {
            const imei = entry.imei || entry.vehicle_registration_number;
            if (!imei) return;
            currentImeis.add(imei);

            const targetPos = getAveragedLocation(entry);
            const targetCoords = [targetPos.lng, targetPos.lat];
            const vehicleType = entry?.device_tag_info?.category_info?.category || "bus";

            let feature = activeFeaturesRef.current[imei];

            if (!feature) {
                // First time seeing this vehicle: Create it
                feature = new Feature({
                    geometry: new Point(targetCoords),
                    entryData: entry,
                });
                feature.set("currentRotation", 0);
                feature.setStyle(getIconStyle(entry, vehicleType, markerLabelMode, allMode));
                activeFeaturesRef.current[imei] = feature;
                vectorSource.addFeature(feature);
            } else {
                // Existing vehicle: Animate movement
                const startCoords = feature.getGeometry().getCoordinates();
                const startTime = performance.now();

                // Cancel any previous animation frame for this specific car
                if (feature.get("animFrameId")) {
                    cancelAnimationFrame(feature.get("animFrameId"));
                }

                const frame = (now) => {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / animationDuration, 1);

                    // 1. Smoothly slide coordinates
                    const currLng = startCoords[0] + (targetCoords[0] - startCoords[0]) * progress;
                    const currLat = startCoords[1] + (targetCoords[1] - startCoords[1]) * progress;
                    const currentPos = [currLng, currLat];
                    feature.getGeometry().setCoordinates(currentPos);

                    // 2. Rotation is fixed to 0
                    feature.set("currentRotation", 0);

                    // 3. Update Style
                    feature.setStyle(getIconStyle(entry, vehicleType, markerLabelMode, allMode));

                    // 4. MAP FOLLOWING (Move camera with car if focused)
                    if (focusEntry && (focusEntry.imei === imei || focusEntry.vehicle_registration_number === imei)) {
                        map.getView().setCenter(currentPos);
                    }

                    if (progress < 1) {
                        feature.set("animFrameId", requestAnimationFrame(frame));
                    }
                };

                // Only start animation if the car has actually moved a bit
                if (Math.abs(startCoords[0] - targetCoords[0]) > 0.000001 || Math.abs(startCoords[1] - targetCoords[1]) > 0.000001) {
                    feature.set("animFrameId", requestAnimationFrame(frame));
                } else {
                    // Car is stationary, just update metadata/style
                    feature.setStyle(getIconStyle(entry, vehicleType, markerLabelMode, allMode));
                }
            }
        });

        // Clean up features for cars that are no longer in the list
        Object.keys(activeFeaturesRef.current).forEach(imei => {
            if (!currentImeis.has(imei)) {
                vectorSource.removeFeature(activeFeaturesRef.current[imei]);
                delete activeFeaturesRef.current[imei];
            }
        });

        if (autoFit && allMarkers.length > 0 && !hasAutoFittedRef.current) {
            const extent = vectorSource.getExtent();
            // Check if extent is valid (not infinite)
            if (extent && extent[0] !== Infinity) {
                map.getView().fit(extent, { padding: [100, 100, 100, 100], maxZoom: 16, duration: 800 });
                hasAutoFittedRef.current = true;
            }
        } else if (allMarkers.length === 0) {
            // Reset the auto-fitted ref if data is cleared so next time we fit again
            hasAutoFittedRef.current = false;
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gpsData, policeData, map, mapType, markerLabelMode, allMode, focusEntry, autoFit]);

    useEffect(() => {
        if (!focusEntry) return;

        // Avoid re-centering on every focusEntry update (e.g., live polling updates for the same vehicle)
        // This prevents the map from snapping back to the vehicle after the user manually zooms/pans.
        if (lastCenteredFocusImeiRef.current === focusEntry.imei) return;
        lastCenteredFocusImeiRef.current = focusEntry.imei;

        const longitude = Number(focusEntry.longitude);
        const latitude = Number(focusEntry.latitude);

        if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return;

        // Handle OpenLayers maps (normal and satellite)
        if (map && mapType !== "hd") {
            map
                .getView()
                .animate({ center: [longitude, latitude], zoom: 16, duration: 500 });
        }

        // Handle HD LegacyMap map
        if (false && false /* LegacyMap disabled */ && legacyMapMapRef.current) {
            const hdMap = legacyMapMapRef.current;

            // Try to pan to the location
            // Note: LegacyMap expects object format {lat, lng}
            try {
                if (typeof hdMap.setCenter === "function") {
                    hdMap.setCenter({ lat: latitude, lng: longitude });
                } else if (typeof hdMap.panTo === "function") {
                    hdMap.panTo({ lat: latitude, lng: longitude });
                }

                // Set zoom level
                if (typeof hdMap.setZoom === "function") {
                    hdMap.setZoom(16);
                }
            } catch (error) {
                console.warn("Could not focus on vehicle in HD map:", error);
            }
        }
    }, [focusEntry, map, mapType]);

    // const startDrawing = () => {
    //     if (!map || !drawVectorLayer) return;

    //     // Clear previous drawings
    //     // drawVectorLayer.getSource().clear();

    //     // Remove existing interaction if any
    //     if (drawInteraction) {
    //         map.removeInteraction(drawInteraction);
    //     }

    //     const draw = new Draw({
    //         source: drawVectorLayer.getSource(),
    //         type: "Polygon",
    //     });

    //     draw.on("drawend", (event) => {
    //         const feature = event.feature;
    //         const geometry = feature.getGeometry();
    //         const coordinates = geometry.getCoordinates()[0]; // Outer ring

    //         // Transform to [Lat, Lon]
    //         const transformedCoords = coordinates.map((coord) => {
    //             const [longitude, latitude] = coord;
    //             return [latitude, longitude];
    //         });

    //         if (onPolygonComplete) {
    //             onPolygonComplete(transformedCoords);
    //         }

    //         // Remove interaction after drawing
    //         map.removeInteraction(draw);
    //         setDrawInteraction(null);
    //     });

    //     map.addInteraction(draw);
    //     setDrawInteraction(draw);
    // };

    const startDrawing = () => {
        if (!map) return;

        if (drawInteraction) {
            map.removeInteraction(drawInteraction);
        }

        const draw = new Draw({
            source: drawSourceRef.current,
            type: "Polygon", // Polyline
        });

        map.addInteraction(draw);
        setDrawInteraction(draw);

       draw.on("drawend", (event) => {
    console.log("DRAW END");

    const feature = event.feature;
    const geometry = feature.getGeometry();

    if (geometry.getType() === "Polygon") {

        const coordinates =
            geometry.getCoordinates()[0];

        console.log(
            "POLYGON COORDS:",
            coordinates
        );

        if (onPolygonComplete) {
            onPolygonComplete(coordinates);
        }
    }

    map.removeInteraction(draw);
    setDrawInteraction(null);
});
    };

    // const clearPolygon = () => {
    //     if (drawVectorLayer) {
    //         drawVectorLayer.getSource().clear();
    //     }
    //     if (drawInteraction) {
    //         map.removeInteraction(drawInteraction);
    //         setDrawInteraction(null);
    //     }
    //     if (onPolygonComplete) {
    //         onPolygonComplete([]);
    //     }
    // };
    const clearPolygon = () => {
        drawSourceRef.current.clear();

        if (drawInteraction) {
            map.removeInteraction(drawInteraction);
            setDrawInteraction(null);
        }
    };

    // Geocoding Handlers
    const showSnackbar = (message, severity = 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const handleGeoSearch = async () => {
        if (!geoSearchQuery.trim()) return;

        try {
            setGeoSearchLoading(true);
            // const url = `/legacyMap/search/address/geocode?address=${encodeURIComponent(geoSearchQuery)}&access_token=${LEGACYMAP_GEOCODING_TOKEN}`;
            const response = await HomePageService.getGeocode(geoSearchQuery, 5);

            if (response.status === 200) {
                const data = response.data;
                console.log('Geocoding response data:', data);

                let results = [];
                if (data.copResults) {
                    if (Array.isArray(data.copResults)) {
                        results = data.copResults;
                    } else {
                        results = [data.copResults];
                    }
                } else if (Array.isArray(data)) {
                    results = data;
                } else if (Array.isArray(data.results)) {
                    // Support gromed.in geocode format: { results: [...] }
                    results = data.results;
                }

                setGeoSearchResults(results);
                if (results.length === 0) {
                    showSnackbar('No results found', 'info');
                } else {
                    // Auto-focus map on the first geocode result
                    try {
                        handleGeoResultClick(results[0]);
                    } catch (e) {
                        console.error('Error focusing map on geocode result:', e);
                    }
                }
            } else {
                console.warn('Geocoding status:', response.status);
                showSnackbar(`Error: ${response.statusText}`, 'error');
            }
        } catch (error) {
            console.error('Geocoding exception:', error);
            if (error.code === "ERR_NETWORK") {
                showSnackbar('Network Error (Likely CORS). Try using the SDK or a proxy.', 'error');
            } else {
                showSnackbar('Error searching address', 'error');
            }
        } finally {
            setGeoSearchLoading(false);
        }
    };

    const handleGeoResultClick = async (result) => {
        console.log('Selected geo result:', result);
// eslint-disable-next-line no-mixed-operators

        // Support multiple response formats:
        // eslint-disable-next-line no-mixed-operators
        // - LegacyMap: { latitude, longitude }
        // - Generic: { lat, lng }
        // - Gromed geocode: { lat, lon, address }
        let lat = result.latitude || result.lat;
        let lng = result.longitude || result.lng || result.lon;

        // If lat/lng are missing, try to fetch them using eLoc
        if ((!lat || !lng) && result.eLoc) {
            try {
                const url = `https://place.legacyMap.com/O2O/entity/place-details/${result.eLoc}?access_token=${LEGACYMAP_GEOCODING_TOKEN}`;
                console.log('Fetching detailed place info for eLoc:', result.eLoc);
                const response = await axios.get(url);
                if (response.status === 200 && response.data) {
                    lat = response.data.latitude;
                    lng = response.data.longitude;
                    console.log('Resolved eLoc to coordinates:', lat, lng);
                }
            } catch (err) {
                console.error('Error resolving eLoc details:', err);
            }
        }

        if (lat && lng) {
            const latNum = parseFloat(lat);
            const lngNum = parseFloat(lng);

            // Handle HD Map (LegacyMap)
            if (false && false /* LegacyMap disabled */ && legacyMapMapRef.current) {
                const hdMap = legacyMapMapRef.current;
                const pos = { lat: latNum, lng: lngNum };

                try {
                    if (typeof hdMap.panTo === 'function') {
                        hdMap.panTo({ lat: pos.lat, lng: pos.lng });
                    }
                    if (typeof hdMap.setCenter === 'function') {
                        hdMap.setCenter({ lat: pos.lat, lng: pos.lng });
                    }
                    if (typeof hdMap.setZoom === 'function') {
                        hdMap.setZoom(16);
                    }

                    // Clear previous search marker if exists
                    if (window.searchMarker) {
                        try { window.searchMarker.remove(); } catch (e) { }
                    }

                    // Add marker at the searched location
                    if (window.legacyMap && window.legacyMap.Marker) {
                        const iconUrl = getPoiMarkerIcon('#FF0000');
                        const marker = new window.legacyMap.Marker({
                            map: hdMap,
                            position: pos,
                            icon: iconUrl,
                            width: 30,
                            height: 40,
                            popupHtml: `
<div style="padding: 10px; width: 250px; font-family: 'Roboto', sans-serif;">
<h3 style="margin: 0 0 5px 0; font-size: 14px; font-weight: 600; color: #333; line-height: 1.3; overflow-wrap: break-word;">
${result.poi || result.placeName || result.locality || result.name || 'Location'}
</h3>
<p style="margin: 0 0 5px 0; font-size: 12px; color: #666; line-height: 1.4; overflow-wrap: break-word;">
${result.formattedAddress || result.address || result.description || 'No address available'}
</p>
<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;">
${result.district ? `<span style="font-size: 11px; color: #888; background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">${result.district}</span>` : ''}
${result.state ? `<span style="font-size: 11px; color: #888; background: #f5f5f5; padding: 2px 6px; border-radius: 4px;">${result.state}</span>` : ''}
</div>
<p style="margin: 8px 0 0 0; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 6px;">
${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}
</p>
</div>
`
                        });
                        window.searchMarker = marker;
                    }
                } catch (error) {
                    console.error('Error during pan on HD map:', error);
                    showSnackbar('Error moving map to location', 'error');
                }
            }
            // Handle OpenLayers maps (Normal, Satellite, SOI)
            else if (map && ["normal", "satellite", "soi"].includes(mapType)) {
                try {
                    // Pan to location
                    map.getView().animate({
                        center: [lngNum, latNum],
                        zoom: 16,
                        duration: 500
                    });

                    // Clear previous search marker if exists
                    if (window.olSearchMarker) {
                        try {
                            vectorLayer.getSource().removeFeature(window.olSearchMarker);
                        } catch (e) { }
                    }

                    // Add marker at the searched location
                    const markerFeature = new Feature({
                        geometry: new Point([lngNum, latNum]),
                    });

                    markerFeature.setStyle(new Style({
                        image: new Icon({
                            anchor: [0.5, 1],
                            src: 'data:image/svg+xml;base64,' + window.btoa(`
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 24 24">
<path fill="#FF0000" d="M12 2c4.418 0 8 3.134 8 7 0 5.25-8 13-8 13S4 14.25 4 9c0-3.866 3.582-7 8-7Zm0 4a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 6Z"/>
</svg>
`),
                            scale: 1.2,
                        }),
                    }));

                    vectorLayer.getSource().addFeature(markerFeature);
                    window.olSearchMarker = markerFeature;

                    // Show popup with location info
                    if (dynamicOverlay) {
                        const overlayContent = document.getElementById('overlay-content');
                        if (overlayContent) {
                            overlayContent.innerHTML = `
<div class="overlay-card" style="max-width: 250px; overflow: hidden;">
<div class="overlay-header">
<div class="overlay-title" style="word-wrap: break-word;">${result.poi || result.placeName || result.locality || 'Location'}</div>
</div>
<div class="overlay-body">
<div class="overlay-row" style="display: flex; gap: 8px; margin-bottom: 4px;">
<span class="overlay-label" style="min-width: 70px; font-weight: 500; color: #666;">Address</span>
<span class="overlay-value" style="flex: 1; word-break: break-word; overflow-wrap: break-word; color: #333;">${result.formattedAddress || result.address || 'N/A'}</span>
</div>
${result.district ? `<div class="overlay-row" style="display: flex; gap: 8px; margin-bottom: 4px;"><span class="overlay-label" style="min-width: 70px; font-weight: 500; color: #666;">District</span><span class="overlay-value" style="flex: 1; word-break: break-word; overflow-wrap: break-word; color: #333;">${result.district}</span></div>` : ''}
${result.state ? `<div class="overlay-row" style="display: flex; gap: 8px; margin-bottom: 4px;"><span class="overlay-label" style="min-width: 70px; font-weight: 500; color: #666;">State</span><span class="overlay-value" style="flex: 1; word-break: break-word; overflow-wrap: break-word; color: #333;">${result.state}</span></div>` : ''}
<div class="overlay-row" style="display: flex; gap: 8px; margin-bottom: 4px;">
<span class="overlay-label" style="min-width: 70px; font-weight: 500; color: #666;">Coordinates</span>
<span class="overlay-value" style="flex: 1; word-break: break-all; color: #333;">${latNum.toFixed(6)}, ${lngNum.toFixed(6)}</span>
</div>
</div>
</div>
`;
                            dynamicOverlay.setPosition([lngNum, latNum]);
                            overlayElement.current.style.display = 'block';
                        }
                    }
                } catch (error) {
                    console.error('Error during pan on OpenLayers map:', error);
                    showSnackbar('Error moving map to location', 'error');
                }
            }
        } else {
            showSnackbar('Could not determine location coordinates', 'error');
        }

        // Clear search results and query after selection
        setGeoSearchResults([]);
        setGeoSearchQuery('');
    };


    // Handle Layer Visibility Toggles (OpenLayers)
    useEffect(() => {
        if (vectorLayer) {
            vectorLayer.setVisible(showVehicles);
        }
    }, [showVehicles, vectorLayer]);

    useEffect(() => {
        if (poiVectorLayer) {
            poiVectorLayer.setVisible(showPois);
        }
    }, [showPois, poiVectorLayer]);

    useEffect(() => {
        if (incidentVectorLayer) {
            incidentVectorLayer.setVisible(showIncidents);
        }
    }, [showIncidents, incidentVectorLayer]);

    // Handle Layer Visibility Toggles (LegacyMap HD)
    useEffect(() => {
        // Toggle Vehicle Markers
        if (hdVehicleMarkersRef.current) {
            hdVehicleMarkersRef.current.forEach(marker => {
                try {
                    if (showVehicles) {
                        if (!marker.getMap()) marker.addTo(legacyMapMapRef.current);
                    } else {
                        marker.remove();
                    }
                } catch (e) { console.warn("Error toggling HD vehicle marker", e); }
            });
        }

        // Toggle POI Markers
        if (hdPoiMarkersRef.current) {
            hdPoiMarkersRef.current.forEach(marker => {
                try {
                    if (showPois) {
                        if (!marker.getMap()) marker.addTo(legacyMapMapRef.current);
                    } else {
                        marker.remove();
                    }
                } catch (e) { console.warn("Error toggling HD POI marker", e); }
            });
        }
        // Toggle Incident Markers
        if (hdIncidentMarkersRef.current) {
            hdIncidentMarkersRef.current.forEach(marker => {
                try {
                    if (showIncidents) {
                        if (!marker.getMap()) marker.addTo(legacyMapMapRef.current);
                    } else {
                        marker.remove();
                    }
                } catch (e) { console.warn("Error toggling HD incident marker", e); }
            });
        }
    }, [showVehicles, showPois, showIncidents, mapType]);


    // Controls State
    const [showLayerMenu, setShowLayerMenu] = useState(false);

    return (
        <div style={{ width, height, position: "relative", overflow: "hidden", borderRadius: '12px' }}>

            {/* --- Top Left: Search Bar --- */}
            <Box
                sx={{
                    position: "absolute",
                    top: 6,
                    left: 30,
                    zIndex: 1100,
                    width: '320px',
                    maxWidth: 'calc(100% - 80px)', // Leave room for right controls
                }}
            >
                <Paper
                    elevation={4}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        borderRadius: '12px',
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(8px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                            backgroundColor: alpha(theme.palette.background.paper, 0.98),
                        }
                    }}
                >
                    <IconButton sx={{ p: '8px' }} aria-label="search">
                        <SearchIcon color="action" />
                    </IconButton>
                    <InputBase
                        sx={{ ml: 1, flex: 1, fontSize: '0.95rem' }}
                        placeholder="Search location..."
                        value={geoSearchQuery}
                        onChange={(e) => setGeoSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleGeoSearch();
                            if (e.key === 'Escape') {
                                setGeoSearchQuery('');
                                setGeoSearchResults([]);
                            }
                        }}
                    />
                    {geoSearchQuery && (
                        <IconButton
                            size="small"
                            onClick={() => {
                                setGeoSearchQuery('');
                                setGeoSearchResults([]);
                            }}
                            sx={{ p: '8px' }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <IconButton
                        color="primary"
                        sx={{ p: '8px' }}
                        onClick={handleGeoSearch}
                        disabled={geoSearchLoading}
                    >
                        {geoSearchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                    </IconButton>
                </Paper>

                {/* Search Results Dropdown */}
                {geoSearchResults && geoSearchResults.length > 0 && (
                    <Paper
                        elevation={6}
                        sx={{
                            mt: 1,
                            maxHeight: '300px',
                            overflowY: 'auto',
                            borderRadius: '12px',
                            backgroundColor: alpha(theme.palette.background.paper, 0.95),
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        <List disablePadding>
                            {geoSearchResults.map((result, index) => (
                                <ListItemButton
                                    key={index}
                                    onClick={() => handleGeoResultClick(result)}
                                    divider={index !== geoSearchResults.length - 1}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <LocationOnIcon color="error" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={result.poi || result.formattedAddress || result.locality}
                                        secondary={[result.district, result.state].filter(Boolean).join(', ') || result.display_name}
                                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                        secondaryTypographyProps={{ variant: 'caption' }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>

            {/* --- Top Right: Map Controls (Layers & Tools) --- */}
            <Box
                sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    zIndex: 1100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    alignItems: 'end',
                }}
            >
                {/* Layer Toggle */}
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', flexDirection: 'row-reverse' }}>
                    <Tooltip title="Map Layers" placement="left">
                        <Paper
                            elevation={4}
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                backdropFilter: 'blur(8px)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'white', transform: 'scale(1.05)' }
                            }}
                            onClick={() => setShowLayerMenu(!showLayerMenu)}
                        >
                            <LayersIcon color="primary" />
                        </Paper>
                    </Tooltip>

                    {/* Expanded Layer Menu */}
                    {showLayerMenu && (
                        <Paper
                            elevation={6}
                            sx={{
                                mr: 1,
                                p: 1.5,
                                borderRadius: '12px',
                                backgroundColor: alpha(theme.palette.background.paper, 0.95),
                                backdropFilter: 'blur(10px)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                maxHeight: '70vh',
                                overflowY: 'auto'
                            }}
                        >
                            {/* Map Type Selection */}
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {[
                                    { id: 'normal', label: 'Normal', icon: <MapIcon /> },
                                    { id: 'satellite', label: 'Satellite', icon: <SatelliteIcon /> },
                                    // { id: 'hd', label: 'LegacyMap HD', icon: <HdIcon /> },
                                    { id: 'soi', label: 'SOI', icon: <PublicIcon /> }
                                ].map((type) => (
                                    <Tooltip key={type.id} title={type.label} arrow>
                                        <IconButton
                                            size="small"
                                            onClick={() => setMapType(type.id)}
                                            sx={{
                                                color: mapType === type.id ? 'primary.main' : 'text.secondary',
                                                bgcolor: mapType === type.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                                borderRadius: '8px',
                                                border: mapType === type.id ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent'
                                            }}
                                        >
                                            {type.icon}
                                        </IconButton>
                                    </Tooltip>
                                ))}
                            </Box>

                            <Divider />

                            {/* Layer Toggles */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={useOldGeocodingApi}
                                            onChange={(e) => {
                                                const next = e.target.checked;
                                                setUseOldGeocodingApi(next);
                                                setUseOldGeocodingApiState(next);
                                            }}
                                        />
                                    }
                                    label={<Typography variant="caption" fontWeight={500}>Old Geocoding API</Typography>}
                                    sx={{ ml: 0, mr: 0, justifyContent: 'space-between', flexDirection: 'row-reverse', width: '100%' }}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={showVehicles}
                                            onChange={(e) => setShowVehicles(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="caption" fontWeight={500}>Vehicles</Typography>}
                                    sx={{ ml: 0, mr: 0, justifyContent: 'space-between', flexDirection: 'row-reverse', width: '100%' }}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={showPois}
                                            onChange={(e) => setShowPois(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="caption" fontWeight={500}>POIs</Typography>}
                                    sx={{ ml: 0, mr: 0, justifyContent: 'space-between', flexDirection: 'row-reverse', width: '100%' }}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={showIncidents}
                                            onChange={(e) => setShowIncidents(e.target.checked)}
                                        />
                                    }
                                    label={<Typography variant="caption" fontWeight={500}>Incidents</Typography>}
                                    sx={{ ml: 0, mr: 0, justifyContent: 'space-between', flexDirection: 'row-reverse', width: '100%' }}
                                />
                            </Box>

                            {mapType === 'soi' && (
                                <>
                                    <Divider />
                                    <Typography variant="caption" fontWeight={700} sx={{ px: 0.5, color: 'text.secondary' }}>
                                        SOI Layers
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.assamStateBdy}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamStateBdy: e.target.checked }))}
                                                />
                                            }
                                            label="ASSAM State BDY"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.states}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, states: e.target.checked }))}
                                                />
                                            }
                                            label="States"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.assamDistrict}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamDistrict: e.target.checked }))}
                                                />
                                            }
                                            label="ASSAM District BDY"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.assamDistrictBdy2}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamDistrictBdy2: e.target.checked }))}
                                                />
                                            }
                                            label="ASSAM District BDY2"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.assamDistrictHq}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamDistrictHq: e.target.checked }))}
                                                />
                                            }
                                            label="ASSAM District HQ"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.assamSubdistrictBdy}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamSubdistrictBdy: e.target.checked }))}
                                                />
                                            }
                                            label="ASSAM Subdistrict BDY"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.kamrupRural}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, kamrupRural: e.target.checked }))}
                                                />
                                            }
                                            label="Kamrup Rural"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.cartTrackHills}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, cartTrackHills: e.target.checked }))}
                                                />
                                            }
                                            label="Cart Track Hills"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.contours}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, contours: e.target.checked }))}
                                                />
                                            }
                                            label="Contours"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.majorTowns}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, majorTowns: e.target.checked }))}
                                                />
                                            }
                                            label="Major Towns HQ"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.name}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, name: e.target.checked }))}
                                                />
                                            }
                                            label="Name"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.railwayTracks}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, railwayTracks: e.target.checked }))}
                                                />
                                            }
                                            label="Railway Tracks"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.roads}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roads: e.target.checked }))}
                                                />
                                            }
                                            label="Roads"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.roadsAllWeatherMotorable}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadsAllWeatherMotorable: e.target.checked }))}
                                                />
                                            }
                                            label="Roads All Weather"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.roadsMotorableInFairWeather}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadsMotorableInFairWeather: e.target.checked }))}
                                                />
                                            }
                                            label="Roads Fair Weather"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.roadsNationalHighway}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadsNationalHighway: e.target.checked }))}
                                                />
                                            }
                                            label="National Highway"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.stateHighway}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, stateHighway: e.target.checked }))}
                                                />
                                            }
                                            label="State Highway"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.roadTunnel}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadTunnel: e.target.checked }))}
                                                />
                                            }
                                            label="Road Tunnel"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.roadOthers}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadOthers: e.target.checked }))}
                                                />
                                            }
                                            label="Road Others"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.buildingFootprint}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, buildingFootprint: e.target.checked }))}
                                                />
                                            }
                                            label="Building Footprint"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.roadSurface}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, roadSurface: e.target.checked }))}
                                                />
                                            }
                                            label="Road Surface"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.busStop}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, busStop: e.target.checked }))}
                                                />
                                            }
                                            label="Bus Stop"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.block}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, block: e.target.checked }))}
                                                />
                                            }
                                            label="Block"
                                        />
                                        {/*
*/}
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.skytronAssamCombined}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, skytronAssamCombined: e.target.checked }))}
                                                />
                                            }
                                            label="Assam Combined (skytron)"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.assamTowns}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, assamTowns: e.target.checked }))}
                                                />
                                            }
                                            label="Assam Towns (skytron)"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanAmrutNogaon}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanAmrutNogaon: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan AMRUT Nogaon"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanAmrutSilchar}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanAmrutSilchar: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan AMRUT Silchar"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanAmrutDibrugarh}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanAmrutDibrugarh: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan AMRUT Dibrugarh"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanAmrutGuwahati}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanAmrutGuwahati: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan AMRUT Guwahati"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanNuisSilchar}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanNuisSilchar: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan NUIS Silchar"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanSikkim}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanSikkim: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Sikkim"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanAssam}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanAssam: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Assam"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanKamrupMetro}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanKamrupMetro: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Kamrup Metro"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanFloodAssam}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanFloodAssam: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Flood Assam"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanManipur}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanManipur: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Manipur"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanWestBengal}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanWestBengal: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan WestBengal"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanTripura}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanTripura: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Tripura"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanNagaland}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanNagaland: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Nagaland"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanMeghalaya}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanMeghalaya: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Meghalaya"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanMizoram}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanMizoram: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Mizoram"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={soiLayerVisibility.bhuvanArunachal}
                                                    onChange={(e) => setSoiLayerVisibility((prev) => ({ ...prev, bhuvanArunachal: e.target.checked }))}
                                                />
                                            }
                                            label="Bhuvan Arunachal"
                                        />
                                    </Box>
                                </>
                            )}

                        </Paper>
                    )}
                </Box>

                {/* Drawing Tools */}
                {(mapType !== "soi") && ( // Only show drawing tools if supported (Normal, Sat, HD)
                    <Paper
                        elevation={4}
                        sx={{
                            p: 0.5,
                            borderRadius: '12px',
                            backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                        }}
                    >
                        <Tooltip title={drawingMode === 'polygon' || drawInteraction ? "Drawing Active" : "Draw Polygon"} placement="left">
                            <IconButton
                                onClick={false /* LegacyMap disabled */ ? startHdDrawing : startDrawing}
                                color={(drawingMode === 'polygon' || drawInteraction) ? "secondary" : "default"}
                                sx={{
                                    borderRadius: '8px',
                                    '&.Mui-active': { bgcolor: alpha(theme.palette.secondary.main, 0.1) }
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                        {/* Clear Button - Show only if something is drawn or drawing */}
                        <Tooltip title="Clear Map" placement="left">
                            <IconButton
                                onClick={false /* LegacyMap disabled */ ? clearHdDrawing : clearPolygon}
                                color="error"
                                size="small"
                                sx={{ borderRadius: '8px' }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Paper>
                )}
            </Box>

            {/* --- Finish Drawing Action (Floating Bottom Center) --- */}
            {((drawingMode === 'polygon' && drawingPoints.length > 2) || (drawInteraction)) && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1100,
                    }}
                >
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={false /* LegacyMap disabled */ ? finishHdDrawing : () => { /* OpenLayers handles finish automatically on double click usually, but we can add manual finish if customization allows */ }}
                        sx={{
                            borderRadius: '24px',
                            px: 3,
                            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Finish Drawing
                    </Button>
                </Box>
            )}

            {/* --- Map Containers --- */}
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
                {/* Normal Map */}
                <div
                    ref={normalMapContainerRef}
                    style={{
                        width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
                        visibility: mapType === "normal" ? "visible" : "hidden",
                        zIndex: mapType === "normal" ? 1 : 0
                    }}
                />

                {/* Satellite Map */}
                <div
                    ref={satelliteMapContainerRef}
                    style={{
                        width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
                        visibility: mapType === "satellite" ? "visible" : "hidden",
                        zIndex: mapType === "satellite" ? 1 : 0
                    }}
                />

                {/* HD Map */}
                <div
                    ref={hdMapContainerRef}
                    style={{
                        width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
                        visibility: false /* LegacyMap disabled */ ? "visible" : "hidden",
                        zIndex: false /* LegacyMap disabled */ ? 1 : 0
                    }}
                >
                    <div ref={hdMapInnerRef} style={{ width: "100%", height: "100%", position: "absolute" }} />
                </div>

                {/* SOI Map */}
                <div
                    ref={soiMapContainerRef}
                    style={{
                        width: "100%", height: "100%", position: "absolute", top: 0, left: 0,
                        visibility: mapType === "soi" ? "visible" : "hidden",
                        zIndex: mapType === "soi" ? 1 : 0
                    }}
                >
                    {/* Map div injected by useEffect */}
                </div>
            </div>

            {/* --- Attribution Logos --- */}
            <Box sx={{ position: 'absolute', bottom: 4, right: 4, zIndex: 1000, pointerEvents: 'none' }}>
                <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ height: '50px' }} alt="Skytron" />
            </Box>

            {/* Overlay for displaying marker details */}
            <div ref={overlayElement} className="dynamic-overlay">
                <div id="overlay-content"></div>
            </div>
            {/* Route Info Popup Overlay (Get Direction result) */}
            <div ref={routeInfoOverlayElementRef} style={{ display: "none" }} />
            <div
                ref={poiTransitOverlayElement}
                className="ol-popup"
            >
         {popupType === "poi" && selectedPoiData && (
    <div 
        style={{
            width: "280px",
            background: "#fff",
            borderRadius: "6px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            padding: "12px",
            position: "relative",
            fontFamily: "Arial, sans-serif",
            margin:"55px"
        }}
    >
        {/* Close Button */}
        <div
            onClick={() => {
                setSelectedPoiData(null);
                setPopupType(null);
            }}
            style={{
                position: "absolute",
                top: "8px",
                right: "10px",
                cursor: "pointer",
                color: "#777",
                fontSize: "18px",
                fontWeight: "bold",
            }}
        >
            ×
        </div>

        {/* POI Name */}
        <div
            style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#4a5568",
                marginBottom: "4px",
            }}
        >
            {selectedPoiData?.name || "-"}
        </div>

        {/* POI Type / Subtitle */}
        <div
            style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#718096",
                marginBottom: "4px",
            }}
        >
            {selectedPoiData?.area || "-"}
        </div>

        {/* Address */}
        <div
            style={{
                fontSize: "13px",
                color: "#6b7280",
                lineHeight: "1.4",
                marginBottom: "8px",
            }}
        >
            {selectedPoiData?.address || "-"}
        </div>

        {/* Phone */}
        <div
            style={{
                fontSize: "13px",
                color: "#4b5563",
                marginBottom: "10px",
            }}
        >
            <strong>Phone:</strong>{" "}
            {selectedPoiData?.phone || "-"}
        </div>
        <div
            style={{
                fontSize: "13px",
                color: "#4b5563",
                marginBottom: "10px",
            }}
        >
            <strong>Speed Limit:</strong>{" "}
            {selectedPoiData?.speed_limit || "-"}
        </div>

        {/* Tags */}
        <div
            style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
            }}
        >
            {/* School Tag */}
            <span
                style={{
                    background: "#2196f3",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                }}
            >
                {selectedPoiData?.use_type || "POI"}
            </span>

            {/* Active Tag */}
            <span
                style={{
                    background:
                        selectedPoiData?.status === "Active"
                            ? "#22c55e"
                            : "#ef4444",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                }}
            >
                {selectedPoiData?.status || "Inactive"}
            </span>
        </div>
    </div>
)}

                {popupType === "transit" &&
                    selectedTransitData && (
                        <div style={{
                            padding: "10px", minWidth: "320px", background: "#fff",
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                            boxShadow: "0 4px 20px rgba(0,0,0,.25)",
                        }}>
                            {renderTransitPopup()}
                        </div>
                    )}
            </div>

            <style>{`
.ol-attribution {
display: none !important;
}

.dynamic-overlay {
position: absolute;
display: none;
transform: translate(-5%, 0%);
z-index: 1200; /* above all else */
}

.overlay-card {
background-color: #ffffff;
border-radius: 10px;
padding: 8px 10px;
box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
border: 1px solid rgba(0, 0, 0, 0.08);
min-width: 160px;
max-width: 320px;
font-family: "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
font-size: 11px;
color: #1f2933;
}

.overlay-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
padding: 12px 16px;
border-bottom: 1px solid #e5e7eb;
gap: 8px;
}

.overlay-header-content {
flex: 1;
min-width: 0; /* Allows text truncation */
}

.overlay-title {
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
font-size: 16px;
font-weight: 600;
color: #111827;
}

.overlay-pill {
padding: 2px 8px;
border-radius: 999px;
font-size: 10px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.05em;
border: 1px solid transparent;
white-space: nowrap;
flex-shrink: 0;
margin-left: 8px;
}

.overlay-pill--normal {
background-color: #ecfdf3;
color: #15803d;
border-color: #bbf7d0;
}

.overlay-pill--offline {
background-color: #f3f4f6;
color: #4b5563;
border-color: #d1d5db;
}

.overlay-pill--alert {
background-color: #fef2f2;
color: #b91c1c;
border-color: #fecaca;
}

.overlay-body {
border-top: 1px solid #f1f5f9;
padding-top: 6px;
margin-top: 4px;
display: grid;
row-gap: 4px;
}

.overlay-sections {
display: grid;
row-gap: 8px;
border-top: 1px solid #f1f5f9;
padding-top: 8px;
margin-top: 4px;
}

.overlay-tabs {
border-top: 1px solid #f1f5f9;
padding-top: 8px;
margin-top: 4px;
}

.overlay-tab-list {
display: flex;
gap: 6px;
margin-bottom: 8px;
}

.overlay-tab {
appearance: none;
border: 1px solid #e5e7eb;
background: #f9fafb;
color: #374151;
font-size: 10px;
font-weight: 600;
padding: 4px 8px;
border-radius: 999px;
cursor: pointer;
}

.overlay-tab--active {
background: #eef2ff;
border-color: #c7d2fe;
color: #1e3a8a;
}

.overlay-panel {
display: none;
max-height: 220px;
overflow: auto;
padding-right: 2px;
}

.overlay-panel {
overflow-x: hidden;
}

.overlay-panel--active {
display: block;
}

.overlay-section {
border: 1px solid #eef2f7;
border-radius: 8px;
padding: 8px 10px;
background: #ffffff;
}

.overlay-section-title {
font-size: 12px;
font-weight: 700;
color: #111827;
margin-bottom: 6px;
}

.overlay-section-body {
display: grid;
row-gap: 4px;
}

.overlay-row {
display: grid;
grid-template-columns: 84px 1fr;
gap: 10px;
align-items: baseline;
}

.overlay-row--multiline {
align-items: start;
}

.overlay-label {
font-size: 11px;
color: #6b7280;
white-space: nowrap;
}

.overlay-value {
font-size: 11px;
font-weight: 500;
color: #111827;
text-align: left;
}

.overlay-value--multiline {
white-space: normal;
overflow-wrap: anywhere;
word-break: break-word;
text-align: left;
max-width: none;
line-height: 1.2;
overflow: visible;
}
`}</style>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

        </div>
    );
};

export default MapComponent;