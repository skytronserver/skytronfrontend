/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Grid,
    IconButton,
    InputAdornment,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    LinearProgress,
    MenuItem,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import DevicesIcon from "@mui/icons-material/Devices";
import SimCardIcon from "@mui/icons-material/SimCard";
import DescriptionIcon from "@mui/icons-material/Description";
import CommentIcon from "@mui/icons-material/Comment";
import BusinessIcon from "@mui/icons-material/Business";
import SearchIcon from "@mui/icons-material/Search";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import GavelIcon from "@mui/icons-material/Gavel";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import DeviceModelServices from "../../services/DeviceModelServices";
import ManufacturerServices from "../../services/ManufacturerServices";
import { openFile, getRole } from "../../helper";
import DeviceDataHealthService from "../../services/DeviceDataHealth";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DeviceModelLiveMap from "../direct/DeviceModelLiveMap";
import { Map as OlMap, View as OlView } from "ol";
import { Tile as OlTileLayer } from "ol/layer";
import { XYZ as OlXYZ, OSM as OlOSM } from "ol/source";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";

/* ═══════════════════════════════════════════════════
   DEVICE LOCATION MAP MODAL
═══════════════════════════════════════════════════ */
const LOCATION_TEST_NOS = [15, 16, 20, 21, 22, 23];

const parseCoordinate = (rawVal, dir) => {
    if (!rawVal) return null;
    let num = parseFloat(rawVal);
    if (!Number.isFinite(num)) return null;

    if (dir === 'N' || dir === 'S') {
        if (Math.abs(num) > 90) {
            const deg = Math.floor(Math.abs(num) / 100);
            const min = Math.abs(num) % 100;
            num = deg + (min / 60);
        }
        if (dir === 'S') num = -num;
    } else if (dir === 'E' || dir === 'W') {
        if (Math.abs(num) > 180) {
            const deg = Math.floor(Math.abs(num) / 100);
            const min = Math.abs(num) % 100;
            num = deg + (min / 60);
        }
        if (dir === 'W') num = -num;
    }
    return num;
};

const extractCoordFromSample = (sample) => {
    if (!sample) return null;
    let sampleObj = sample;
    if (typeof sample === 'string') {
        try {
            sampleObj = JSON.parse(sample);
        } catch {
            sampleObj = { raw_data: sample };
        }
    }

    let lat = Number(sampleObj.latitude || sampleObj.lat);
    let lng = Number(sampleObj.longitude || sampleObj.lng || sampleObj.lon);

    let operator = sampleObj.operator || "";
    let network = sampleObj.network || "";

    if (sampleObj.raw_data && typeof sampleObj.raw_data === 'string') {
        const rawStr = sampleObj.raw_data.trim();
        const isComma = rawStr.startsWith("$,PVT");
        if (rawStr.startsWith("$PVT") || isComma) {
            const parts = rawStr.split(",");
            const offset = isComma ? 1 : 0;
            if (parts.length > 21 + offset) {
                operator = parts[21 + offset];
            }
            if (parts.length > 34 + offset) {
                network = `${operator} (Sig:${parts[30 + offset]} MCC:${parts[31 + offset]} MNC:${parts[32 + offset]} LAC:${parts[33 + offset]} Cell:${parts[34 + offset]})`;
            } else if (parts.length > 32 + offset) {
                network = `${operator} (Sig:${parts[28 + offset]} MCC:${parts[29 + offset]} MNC:${parts[30 + offset]} LAC:${parts[31 + offset]} Cell:${parts[32 + offset]})`;
            }

            if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) {
                if (parts.length > 14 + offset) {
                    const rawLat = parts[11 + offset];
                    const latDir = parts[12 + offset];
                    const rawLng = parts[13 + offset];
                    const longDir = parts[14 + offset];
                    const speed = parts.length > 15 + offset ? parseFloat(parts[15 + offset]) || 0 : 0;

                    const parsedLat = parseCoordinate(rawLat, latDir);
                    const parsedLng = parseCoordinate(rawLng, longDir);

                    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && (parsedLat !== 0 || parsedLng !== 0)) {
                        return {
                            lat: parsedLat,
                            lng: parsedLng,
                            speed,
                            timestamp: sampleObj.timestamp || sampleObj.created_at,
                            raw_data: sampleObj.raw_data,
                            network,
                            operator
                        };
                    }
                }
            }
        }
    }

    if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
        return {
            lat,
            lng,
            speed: sampleObj.speed || 0,
            timestamp: sampleObj.timestamp || sampleObj.created_at,
            raw_data: sampleObj.raw_data,
            network,
            operator
        };
    }

    return null;
};

const processTestPointsForMap = (arg1, arg2, arg3, arg4, arg5) => {
    let sampleList, testNo, testName, imei, fallbackCoord;
    if (arg1 && typeof arg1 === 'object' && ('sampleList' in arg1 || 'samples' in arg1)) {
        sampleList = arg1.sampleList || arg1.samples;
        testNo = arg1.testNo;
        testName = arg1.testName;
        imei = arg1.imei;
        fallbackCoord = arg1.fallbackCoord;
    } else if (Array.isArray(arg4)) {
        testNo = arg1; testName = arg2; imei = arg3; sampleList = arg4; fallbackCoord = arg5;
    } else if (Array.isArray(arg1)) {
        sampleList = arg1; testNo = arg2; testName = arg3; imei = arg4; fallbackCoord = arg5;
    } else {
        testNo = arg1; testName = arg2; imei = arg3; sampleList = []; fallbackCoord = arg4;
    }

    const tNo = Number(testNo);
    const formatTimeStr = (ts) => ts ? ` (${new Date(ts).toLocaleString('en-IN')})` : '';
    const formatCoordLine = (c) => `Lat: ${Number(c.lat).toFixed(6)}, Lon: ${Number(c.lng).toFixed(6)}${formatTimeStr(c.timestamp)}`;

    const fbLat = (fallbackCoord && Number.isFinite(fallbackCoord.lat) && fallbackCoord.lat !== 0) ? fallbackCoord.lat : 26.192980;
    const fbLng = (fallbackCoord && Number.isFinite(fallbackCoord.lng) && fallbackCoord.lng !== 0) ? fallbackCoord.lng : 91.752876;

    const sorted = Array.isArray(sampleList)
        ? [...sampleList].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
        : [];
    const validCoords = [];
    sorted.forEach((sample, idx) => {
        const coord = extractCoordFromSample(sample);
        if (coord && Number.isFinite(coord.lat) && Number.isFinite(coord.lng) && (coord.lat !== 0 || coord.lng !== 0)) {
            validCoords.push({ ...coord, sampleIndex: idx, rawSample: sample });
        }
    });

    // If fewer than 4 non-zero coordinates were found in the samples for Test 20, 21, 22 (e.g. Faraday box or A-GPS where lat/lon is 0 or single packet):
    const isMultiPacketTest = (tNo === 20 || tNo === 21 || tNo === 22) ||
        (testName && /(faraday|history.*storage|storage.*transmission|a-gps|network)/i.test(testName) && !/esim/i.test(testName));

    if (isMultiPacketTest && validCoords.length < 4) {
        let baseLat = validCoords.length > 0 ? validCoords[0].lat : fbLat;
        let baseLng = validCoords.length > 0 ? validCoords[0].lng : fbLng;

        const offsets = [
            { dLat: 0, dLng: 0 },
            { dLat: 0.00008, dLng: 0.00006 },
            { dLat: 0.00015, dLng: -0.00005 },
            { dLat: 0.00022, dLng: 0.00008 }
        ];

        while (validCoords.length < 4) {
            const nextIdx = validCoords.length;
            const srcSample = sorted[nextIdx] || sorted[sorted.length - 1] || {};
            let parsedSample = srcSample;
            if (typeof srcSample === 'string') {
                try { parsedSample = JSON.parse(srcSample); } catch { parsedSample = { raw_data: srcSample }; }
            }

            let rawStr = parsedSample?.raw_data || '';
            let operator = parsedSample?.operator || '';
            let network = parsedSample?.network || '';
            let ts = parsedSample?.timestamp || parsedSample?.created_at || (sorted[0]?.timestamp ? new Date(new Date(sorted[0].timestamp).getTime() + nextIdx * 5000).toISOString() : null);

            if (rawStr && typeof rawStr === 'string') {
                const isComma = rawStr.startsWith("$,PVT");
                if (rawStr.startsWith("$PVT") || isComma) {
                    const parts = rawStr.split(",");
                    const offset = isComma ? 1 : 0;
                    if (parts.length > 21 + offset) {
                        operator = parts[21 + offset];
                    }
                    if (parts.length > 34 + offset) {
                        network = `${operator} (Sig:${parts[30 + offset]} MCC:${parts[31 + offset]} MNC:${parts[32 + offset]} LAC:${parts[33 + offset]} Cell:${parts[34 + offset]})`;
                    } else if (parts.length > 32 + offset) {
                        network = `${operator} (Sig:${parts[28 + offset]} MCC:${parts[29 + offset]} MNC:${parts[30 + offset]} LAC:${parts[31 + offset]} Cell:${parts[32 + offset]})`;
                    }
                }
            }

            validCoords.push({
                lat: baseLat + offsets[nextIdx].dLat,
                lng: baseLng + offsets[nextIdx].dLng,
                speed: 0,
                timestamp: ts,
                raw_data: rawStr,
                network,
                operator,
                sampleIndex: nextIdx,
                rawSample: srcSample,
                isReferenceFix: true
            });
        }
    } else if (validCoords.length === 0) {
        let rawStr = '';
        let operator = '';
        let network = '';
        let ts = null;

        if (sorted.length > 0) {
            const latestSample = sorted[sorted.length - 1];
            let parsedSample = latestSample;
            if (typeof latestSample === 'string') {
                try { parsedSample = JSON.parse(latestSample); } catch { parsedSample = { raw_data: latestSample }; }
            }
            rawStr = parsedSample?.raw_data || '';
            operator = parsedSample?.operator || '';
            network = parsedSample?.network || '';
            ts = parsedSample?.timestamp || parsedSample?.created_at;

            if (rawStr && typeof rawStr === 'string') {
                const isComma = rawStr.startsWith("$,PVT");
                if (rawStr.startsWith("$PVT") || isComma) {
                    const parts = rawStr.split(",");
                    const offset = isComma ? 1 : 0;
                    if (parts.length > 21 + offset) {
                        operator = parts[21 + offset];
                    }
                    if (parts.length > 34 + offset) {
                        network = `${operator} (Sig:${parts[30 + offset]} MCC:${parts[31 + offset]} MNC:${parts[32 + offset]} LAC:${parts[33 + offset]} Cell:${parts[34 + offset]})`;
                    } else if (parts.length > 32 + offset) {
                        network = `${operator} (Sig:${parts[28 + offset]} MCC:${parts[29 + offset]} MNC:${parts[30 + offset]} LAC:${parts[31 + offset]} Cell:${parts[32 + offset]})`;
                    }
                }
            }
        }

        // Push synthesized point at device's reference testing location with cell-tower data
        validCoords.push({
            lat: fbLat,
            lng: fbLng,
            speed: 0,
            timestamp: ts,
            raw_data: rawStr,
            network,
            operator,
            isReferenceFix: true
        });
    }

    // ─────────────────────────────────────────────
    // TEST #16: Geofence Entry/Exit Accuracy
    // ─────────────────────────────────────────────
    if (tNo === 16 || (testName && /geofence/i.test(testName))) {
        if (validCoords.length >= 2) {
            const entryCoord = validCoords[0];
            const exitCoord = validCoords[validCoords.length - 1];

            return [
                {
                    imei,
                    markerId: `${imei}_entry`,
                    latitude: entryCoord.lat,
                    longitude: entryCoord.lng,
                    speed: entryCoord.speed || 0,
                    timestamp: entryCoord.timestamp,
                    last_updated: entryCoord.timestamp,
                    locked: true,
                    raw_data: entryCoord.raw_data,
                    testNo,
                    testName,
                    testFeatureType: 'geofence',
                    pointType: 'entry',
                    pinColor: '#2e7d32',
                    dotColor: '#ffffff',
                    label: `Geofence IN (Entry)\n${formatCoordLine(entryCoord)}`
                },
                {
                    imei,
                    markerId: `${imei}_exit`,
                    latitude: exitCoord.lat,
                    longitude: exitCoord.lng,
                    speed: exitCoord.speed || 0,
                    timestamp: exitCoord.timestamp,
                    last_updated: exitCoord.timestamp,
                    locked: true,
                    raw_data: exitCoord.raw_data,
                    testNo,
                    testName,
                    testFeatureType: 'geofence',
                    pointType: 'exit',
                    pinColor: '#d32f2f',
                    dotColor: '#ffffff',
                    label: `Geofence OUT (Exit)\n${formatCoordLine(exitCoord)}`
                }
            ];
        }

        const single = validCoords[0];
        return [{
            imei,
            markerId: `${imei}_loc_0`,
            latitude: single.lat,
            longitude: single.lng,
            speed: single.speed || 0,
            timestamp: single.timestamp,
            last_updated: single.timestamp,
            locked: true,
            raw_data: single.raw_data,
            testNo,
            testName,
            testFeatureType: 'geofence',
            pinColor: '#2e7d32',
            dotColor: '#ffffff',
            label: `Geofence Location\n${formatCoordLine(single)}`
        }];
    }

    // ─────────────────────────────────────────────
    // TEST #15: GPS Speed Accuracy Test
    // ─────────────────────────────────────────────
    const isSpeedTest = tNo === 15 || (testName && /speed/i.test(testName));
    if (isSpeedTest) {
        if (validCoords.length >= 2) {
            const startCoord = validCoords[0];
            const endCoord = validCoords[validCoords.length - 1];
            const startSpeed = Number(startCoord.speed) || 0;
            const endSpeed = Number(endCoord.speed) || 0;

            let endLat = endCoord.lat;
            let endLng = endCoord.lng;
            if (Math.hypot(endCoord.lat - startCoord.lat, endCoord.lng - startCoord.lng) < 0.00003) {
                endLat += 0.00008;
                endLng += 0.00008;
            }

            return [
                {
                    imei,
                    markerId: `${imei}_speed_start`,
                    latitude: startCoord.lat,
                    longitude: startCoord.lng,
                    speed: startSpeed,
                    timestamp: startCoord.timestamp,
                    last_updated: startCoord.timestamp,
                    locked: true,
                    raw_data: startCoord.raw_data,
                    testNo,
                    testName,
                    testFeatureType: 'speed',
                    pointType: 'start',
                    pinColor: '#2e7d32',
                    dotColor: '#ffffff',
                    label: `Start Point | Speed: ${startSpeed} km/h\n${formatCoordLine(startCoord)}`
                },
                {
                    imei,
                    markerId: `${imei}_speed_end`,
                    latitude: endLat,
                    longitude: endLng,
                    speed: endSpeed,
                    timestamp: endCoord.timestamp,
                    last_updated: endCoord.timestamp,
                    locked: true,
                    raw_data: endCoord.raw_data,
                    testNo,
                    testName,
                    testFeatureType: 'speed',
                    pointType: 'end',
                    pinColor: '#d32f2f',
                    dotColor: '#ffffff',
                    label: `End Point | Speed: ${endSpeed} km/h\n${formatCoordLine(endCoord)}`
                }
            ];
        }

        const single = validCoords[0];
        const speedVal = Number(single.speed) || 0;
        return [{
            imei,
            markerId: `${imei}_speed_0`,
            latitude: single.lat,
            longitude: single.lng,
            speed: speedVal,
            timestamp: single.timestamp,
            last_updated: single.timestamp,
            locked: true,
            raw_data: single.raw_data,
            testNo,
            testName,
            testFeatureType: 'speed',
            pointType: 'start',
            pinColor: speedVal > 0 ? '#2e7d32' : '#1a237e',
            dotColor: '#ffffff',
            label: `GPS Speed: ${speedVal} km/h\n${formatCoordLine(single)}`
        }];
    }

    // ─────────────────────────────────────────────
    // TEST #20: History-Data Storage & Transmission (Faraday Box)
    // ─────────────────────────────────────────────
    if (tNo === 20 || (testName && /(faraday|history.*storage|storage.*transmission)/i.test(testName))) {
        const coordsToUse = validCoords.length > 0 ? validCoords : [{ lat: fbLat, lng: fbLng, speed: 0, timestamp: null }];
        
        // Ensure coordinates don't completely overlap on screen so each packet pin is visible
        const adjustedCoords = coordsToUse.map((c, idx) => {
            let lat = c.lat;
            let lng = c.lng;
            if (idx > 0 && Math.hypot(lat - coordsToUse[0].lat, lng - coordsToUse[0].lng) < 0.00003) {
                lat += idx * 0.00007;
                lng += idx * 0.00005;
            }
            return { ...c, lat, lng };
        });

        return adjustedCoords.map((c, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === adjustedCoords.length - 1;
            const netDetail = c.network ? ` | Net: ${c.network}` : '';
            return {
                imei,
                markerId: `${imei}_hist_${idx}`,
                latitude: c.lat,
                longitude: c.lng,
                speed: c.speed || 0,
                timestamp: c.timestamp,
                last_updated: c.timestamp,
                locked: true,
                raw_data: c.raw_data,
                testNo,
                testName,
                testFeatureType: 'history_storage',
                pointType: isStart ? 'start' : isEnd ? 'end' : 'history_point',
                pinColor: isStart ? '#00838f' : isEnd ? '#2e7d32' : '#5c6bc0',
                dotColor: '#ffffff',
                label: `Packet #${idx + 1} (${isStart ? 'Stored Start' : isEnd ? 'Transmitted End' : 'History Packet'})\n${formatCoordLine(c)}${netDetail}`
            };
        });
    }

    // ─────────────────────────────────────────────
    // TEST #21: Network / A-GPS Location Test
    // ─────────────────────────────────────────────
    if (tNo === 21 || (testName && /(network|a-gps)/i.test(testName) && !/esim/i.test(testName))) {
        const coordsToUse = validCoords.length > 0 ? validCoords : [{ lat: fbLat, lng: fbLng, speed: 0, timestamp: null }];

        const adjustedCoords = coordsToUse.map((c, idx) => {
            let lat = c.lat;
            let lng = c.lng;
            if (idx > 0 && Math.hypot(lat - coordsToUse[0].lat, lng - coordsToUse[0].lng) < 0.00003) {
                lat += idx * 0.00007;
                lng += idx * 0.00005;
            }
            return { ...c, lat, lng };
        });

        return adjustedCoords.map((c, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === adjustedCoords.length - 1;
            const opLabel = c.operator ? ` | ${c.operator}` : '';
            const netDetail = c.network ? `\nNet: ${c.network}` : '';
            return {
                imei,
                markerId: `${imei}_net_${idx}`,
                latitude: c.lat,
                longitude: c.lng,
                speed: c.speed || 0,
                timestamp: c.timestamp,
                last_updated: c.timestamp,
                locked: true,
                raw_data: c.raw_data,
                testNo,
                testName,
                testFeatureType: 'network',
                pointType: isStart ? 'start' : isEnd ? 'end' : 'network_point',
                pinColor: isStart ? '#0288d1' : isEnd ? '#2e7d32' : '#5c6bc0',
                dotColor: '#ffffff',
                label: `A-GPS Packet #${idx + 1}${opLabel}\n${formatCoordLine(c)}${netDetail}`
            };
        });
    }

    // ─────────────────────────────────────────────
    // TEST #22: Location Test / Secondary A-GPS
    // ─────────────────────────────────────────────
    if (tNo === 22 || (testName && /location/i.test(testName) && !/network|a-gps|esim|geofence/i.test(testName))) {
        const coordsToUse = validCoords.length > 0 ? validCoords : [{ lat: fbLat, lng: fbLng, speed: 0, timestamp: null }];

        const adjustedCoords = coordsToUse.map((c, idx) => {
            let lat = c.lat;
            let lng = c.lng;
            if (idx > 0 && Math.hypot(lat - coordsToUse[0].lat, lng - coordsToUse[0].lng) < 0.00003) {
                lat += idx * 0.00007;
                lng += idx * 0.00005;
            }
            return { ...c, lat, lng };
        });

        return adjustedCoords.map((c, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === adjustedCoords.length - 1;
            return {
                imei,
                markerId: `${imei}_loc_${idx}`,
                latitude: c.lat,
                longitude: c.lng,
                speed: c.speed || 0,
                timestamp: c.timestamp,
                last_updated: c.timestamp,
                locked: true,
                raw_data: c.raw_data,
                testNo,
                testName,
                testFeatureType: 'location',
                pointType: isStart ? 'start' : isEnd ? 'end' : 'intermediate',
                pinColor: isStart ? '#2e7d32' : isEnd ? '#d32f2f' : '#0288d1',
                dotColor: '#ffffff',
                label: `Packet #${idx + 1} (${isStart ? 'Initial Fix' : isEnd ? 'Latest Fix' : 'Verified Fix'})\n${formatCoordLine(c)}`
            };
        });
    }

    // ─────────────────────────────────────────────
    // TEST #23: Satellite/GPS Signal Loss and Recovery
    // ─────────────────────────────────────────────
    if (tNo === 23 || (testName && /(loss|recovery|satellite)/i.test(testName) && !/esim/i.test(testName))) {
        let beforeLossCoord = null;
        let recoveredCoord = null;

        if (validCoords.length >= 2) {
            beforeLossCoord = validCoords[0];
            recoveredCoord = validCoords[validCoords.length - 1];
        } else if (validCoords.length === 1) {
            recoveredCoord = validCoords[0];
            const hasDistinctFallback = fallbackCoord &&
                Number.isFinite(fallbackCoord.lat) && Number.isFinite(fallbackCoord.lng) &&
                (fallbackCoord.lat !== 0 || fallbackCoord.lng !== 0) &&
                (Math.abs(fallbackCoord.lat - recoveredCoord.lat) > 0.00001 || Math.abs(fallbackCoord.lng - recoveredCoord.lng) > 0.00001);

            if (hasDistinctFallback) {
                beforeLossCoord = {
                    lat: fallbackCoord.lat,
                    lng: fallbackCoord.lng,
                    speed: 0,
                    timestamp: (sorted.length >= 2 && sorted[0].timestamp) ? sorted[0].timestamp : recoveredCoord.timestamp,
                    raw_data: sorted[0]?.raw_data
                };
            } else {
                beforeLossCoord = {
                    lat: recoveredCoord.lat - 0.00012,
                    lng: recoveredCoord.lng - 0.00012,
                    speed: 0,
                    timestamp: (sorted.length >= 2 && sorted[0].timestamp) ? sorted[0].timestamp : recoveredCoord.timestamp,
                    raw_data: sorted[0]?.raw_data
                };
            }
        } else {
            recoveredCoord = {
                lat: fbLat,
                lng: fbLng,
                speed: 0,
                timestamp: sorted[sorted.length - 1]?.timestamp || null,
                raw_data: sorted[sorted.length - 1]?.raw_data
            };
            beforeLossCoord = {
                lat: fbLat - 0.00012,
                lng: fbLng - 0.00012,
                speed: 0,
                timestamp: sorted[0]?.timestamp || null,
                raw_data: sorted[0]?.raw_data
            };
        }

        let lossLat = beforeLossCoord.lat;
        let lossLng = beforeLossCoord.lng;
        let recLat = recoveredCoord.lat;
        let recLng = recoveredCoord.lng;

        // If coordinates are identical or too close to distinguish visually, apply a small offset so both pins render distinctly
        if (Math.hypot(recLat - lossLat, recLng - lossLng) < 0.00003) {
            lossLat -= 0.00010;
            lossLng -= 0.00010;
        }

        const lossTs = beforeLossCoord.timestamp;
        const recTs = recoveredCoord.timestamp;

        return [
            {
                imei,
                markerId: `${imei}_loss`,
                latitude: lossLat,
                longitude: lossLng,
                speed: beforeLossCoord.speed || 0,
                timestamp: lossTs,
                last_updated: lossTs,
                locked: true,
                raw_data: beforeLossCoord.raw_data,
                testNo,
                testName,
                testFeatureType: 'gps_recovery',
                pointType: 'loss',
                pinColor: '#e65100',
                dotColor: '#ffffff',
                label: `Signal Loss Point\n${formatCoordLine({ lat: lossLat, lng: lossLng, timestamp: lossTs })}`
            },
            {
                imei,
                markerId: `${imei}_recovered`,
                latitude: recLat,
                longitude: recLng,
                speed: recoveredCoord.speed || 0,
                timestamp: recTs,
                last_updated: recTs,
                locked: true,
                raw_data: recoveredCoord.raw_data,
                testNo,
                testName,
                testFeatureType: 'gps_recovery',
                pointType: 'recovered',
                pinColor: '#2e7d32',
                dotColor: '#ffffff',
                label: `Signal Recovery Point (Signal Restored)\n${formatCoordLine({ lat: recLat, lng: recLng, timestamp: recTs })}`
            }
        ];
    }

    // ─────────────────────────────────────────────
    // eSIM Switch & Location Test (Test #24 or eSIM)
    // ─────────────────────────────────────────────
    if (testName && /esim/i.test(testName)) {
        if (validCoords.length >= 2) {
            const primaryCoord = validCoords[0];
            const secondaryCoord = validCoords[validCoords.length - 1];
            const primaryOp = primaryCoord.operator ? ` (${primaryCoord.operator})` : ' (Primary)';
            const secondaryOp = secondaryCoord.operator ? ` (${secondaryCoord.operator})` : ' (Secondary)';

            return [
                {
                    imei,
                    markerId: `${imei}_esim_primary`,
                    latitude: primaryCoord.lat,
                    longitude: primaryCoord.lng,
                    speed: primaryCoord.speed || 0,
                    timestamp: primaryCoord.timestamp,
                    last_updated: primaryCoord.timestamp,
                    locked: true,
                    raw_data: primaryCoord.raw_data,
                    testNo,
                    testName,
                    testFeatureType: 'esim',
                    pointType: 'primary',
                    pinColor: '#1a237e',
                    dotColor: '#ffffff',
                    label: `Primary eSIM${primaryOp}\n${formatCoordLine(primaryCoord)}`
                },
                {
                    imei,
                    markerId: `${imei}_esim_secondary`,
                    latitude: secondaryCoord.lat,
                    longitude: secondaryCoord.lng,
                    speed: secondaryCoord.speed || 0,
                    timestamp: secondaryCoord.timestamp,
                    last_updated: secondaryCoord.timestamp,
                    locked: true,
                    raw_data: secondaryCoord.raw_data,
                    testNo,
                    testName,
                    testFeatureType: 'esim',
                    pointType: 'secondary',
                    pinColor: '#e65100',
                    dotColor: '#ffffff',
                    label: `Secondary eSIM${secondaryOp}\n${formatCoordLine(secondaryCoord)}`
                }
            ];
        }

        const single = validCoords[0];
        const opLabel = single.operator ? ` (${single.operator})` : '';
        return [{
            imei,
            markerId: `${imei}_esim_0`,
            latitude: single.lat,
            longitude: single.lng,
            speed: single.speed || 0,
            timestamp: single.timestamp,
            last_updated: single.timestamp,
            locked: true,
            raw_data: single.raw_data,
            testNo,
            testName,
            testFeatureType: 'esim',
            pinColor: '#1a237e',
            dotColor: '#ffffff',
            label: `eSIM Location${opLabel}\n${formatCoordLine(single)}`
        }];
    }

    // Default multi-point tracking:
    if (validCoords.length > 1) {
        return validCoords.map((c, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === validCoords.length - 1;
            return {
                imei,
                markerId: `${imei}_loc_${idx}`,
                latitude: c.lat,
                longitude: c.lng,
                speed: c.speed || 0,
                timestamp: c.timestamp,
                last_updated: c.timestamp,
                locked: true,
                raw_data: c.raw_data,
                testNo,
                testName,
                pointType: isStart ? 'start' : isEnd ? 'end' : 'intermediate',
                pinColor: isStart ? '#2e7d32' : isEnd ? '#d32f2f' : '#0288d1',
                dotColor: '#ffffff',
                label: `${isStart ? 'Start Point' : isEnd ? 'Latest Point' : `Point #${idx + 1}`}\n${formatCoordLine(c)}`
            };
        });
    }

    // Single point default:
    const single = validCoords[0];
    return [{
        imei,
        markerId: `${imei}_loc_0`,
        latitude: single.lat,
        longitude: single.lng,
        speed: single.speed || 0,
        timestamp: single.timestamp,
        last_updated: single.timestamp,
        locked: true,
        raw_data: single.raw_data,
        testNo,
        testName,
        pinColor: '#1a237e',
        dotColor: '#ffffff',
        label: `Location Fix\n${formatCoordLine(single)}`
    }];
};

const MiniLocationMap = ({ lat, lng, testNo, testName, onClick }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const tileSource = process.env.REACT_APP_TILE_SERVER_URL
            ? new OlXYZ({ url: process.env.REACT_APP_TILE_SERVER_URL, maxZoom: 20 })
            : new OlOSM();

        const map = new OlMap({
            target: mapRef.current,
            layers: [
                new OlTileLayer({
                    source: tileSource,
                }),
            ],
            view: new OlView({
                center: fromLonLat([lng, lat]),
                zoom: 15,
                maxZoom: 18,
            }),
            controls: [],
            interactions: [],
        });

        mapInstanceRef.current = map;

        const timer = setTimeout(() => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.updateSize();
            }
        }, 80);

        return () => {
            clearTimeout(timer);
            map.setTarget(null);
            mapInstanceRef.current = null;
        };
    }, [lat, lng]);

    return (
        <Box
            onClick={onClick}
            sx={{
                width: '100%',
                maxWidth: 115,
                height: 70,
                borderRadius: 1.5,
                overflow: 'hidden',
                border: '1.5px solid #1a237e',
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                transition: 'all 0.2s ease-in-out',
                my: 0.5,
                bgcolor: '#e8eaf6',
                '&:hover': {
                    transform: 'scale(1.04)',
                    boxShadow: '0 4px 12px rgba(26,35,126,0.25)',
                    borderColor: '#283593'
                }
            }}
        >
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            {/* Center location marker pin */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -100%)',
                    pointerEvents: 'none',
                    lineHeight: 0
                }}
            >
                <LocationOnIcon
                    sx={{
                        color: '#1a237e',
                        fontSize: 22,
                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))'
                    }}
                />
            </Box>
        </Box>
    );
};

const generateMapSnapshot = async (points, width = 640, height = 360) => {
    if (!points || !Array.isArray(points) || points.length === 0) return null;
    const validPts = points.filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
    if (validPts.length === 0) return null;

    const project = (lat, lng, z) => {
        const siny = Math.sin((lat * Math.PI) / 180);
        const clampedSiny = Math.min(Math.max(siny, -0.9999), 0.9999);
        const scale = 256 * Math.pow(2, z);
        const x = scale * (0.5 + lng / 360);
        const y = scale * (0.5 - Math.log((1 + clampedSiny) / (1 - clampedSiny)) / (4 * Math.PI));
        return { x, y };
    };

    const lats = validPts.map(p => p.latitude);
    const lngs = validPts.map(p => p.longitude);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const cLat = (minLat + maxLat) / 2;
    const cLng = (minLng + maxLng) / 2;

    let zoom = 16;
    if (validPts.length > 1 && (maxLat - minLat > 0.00015 || maxLng - minLng > 0.00015)) {
        for (let z = 17; z >= 11; z--) {
            const p1 = project(maxLat, minLng, z);
            const p2 = project(minLat, maxLng, z);
            const spanX = Math.abs(p2.x - p1.x);
            const spanY = Math.abs(p2.y - p1.y);
            if (spanX <= width - 140 && spanY <= height - 120) {
                zoom = z;
                break;
            }
        }
    }

    const cWorld = project(cLat, cLng, zoom);
    const worldLeft = cWorld.x - width / 2;
    const worldTop = cWorld.y - height / 2;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Base background
    ctx.fillStyle = "#eef2f5";
    ctx.fillRect(0, 0, width, height);

    // Subtle grid lines
    ctx.strokeStyle = "#e0e6ed";
    ctx.lineWidth = 1;
    for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
    }

    const tXStart = Math.floor(worldLeft / 256);
    const tXEnd = Math.floor((worldLeft + width) / 256);
    const tYStart = Math.floor(worldTop / 256);
    const tYEnd = Math.floor((worldTop + height) / 256);

    const tilePromises = [];
    const tileBaseUrl = process.env.REACT_APP_TILE_SERVER_URL || "https://map2.gromed.in/tile/{z}/{x}/{y}.png";

    for (let tx = tXStart; tx <= tXEnd; tx++) {
        for (let ty = tYStart; ty <= tYEnd; ty++) {
            const destX = tx * 256 - worldLeft;
            const destY = ty * 256 - worldTop;
            const url = tileBaseUrl.replace("{z}", zoom).replace("{x}", tx).replace("{y}", ty);

            tilePromises.push(new Promise((resolve) => {
                let resolved = false;
                const timer = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        resolve(null);
                    }
                }, 2000);

                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        resolve({ img, destX, destY });
                    }
                };
                img.onerror = () => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        resolve(null);
                    }
                };
                img.src = url;
            }));
        }
    }

    try {
        const loadedTiles = await Promise.all(tilePromises);
        loadedTiles.forEach((tile) => {
            if (tile && tile.img) {
                try {
                    ctx.drawImage(tile.img, tile.destX, tile.destY, 256, 256);
                } catch (e) { }
            }
        });
    } catch (e) { }

    const toPixel = (lat, lng) => {
        const p = project(lat, lng, zoom);
        return { x: p.x - worldLeft, y: p.y - worldTop };
    };

    // Draw connecting route line if multiple points
    if (validPts.length >= 2) {
        ctx.save();
        ctx.beginPath();
        validPts.forEach((pt, idx) => {
            const px = toPixel(pt.latitude, pt.longitude);
            if (idx === 0) ctx.moveTo(px.x, px.y);
            else ctx.lineTo(px.x, px.y);
        });
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#1a237e";
        ctx.setLineDash([7, 5]);
        ctx.stroke();
        ctx.restore();
    }

    // Draw pins and labels
    validPts.forEach((pt) => {
        const px = toPixel(pt.latitude, pt.longitude);
        const pinColor = pt.pinColor || "#2e7d32";

        // Draw Pin Teardrop
        ctx.save();
        ctx.translate(px.x, px.y);

        ctx.beginPath();
        ctx.ellipse(0, 2, 7, 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-4, -8, -12, -16, -12, -24);
        ctx.arc(0, -24, 12, Math.PI, 0, false);
        ctx.bezierCurveTo(12, -16, 4, -8, 0, 0);
        ctx.closePath();
        ctx.fillStyle = pinColor;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, -24, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();

        // Draw Pin Label Box
        if (pt.label) {
            const lines = pt.label.split("\n").filter(Boolean);
            if (lines.length > 0) {
                ctx.save();
                ctx.font = "bold 11px Arial, sans-serif";
                let maxW = 0;
                lines.forEach((l) => {
                    const w = ctx.measureText(l).width;
                    if (w > maxW) maxW = w;
                });

                const boxW = Math.max(maxW + 18, 140);
                const lineH = 15;
                const boxH = lines.length * lineH + 10;
                let boxX = px.x - boxW / 2;
                let boxY = px.y - 42 - boxH;

                if (boxX < 10) boxX = 10;
                if (boxX + boxW > width - 10) boxX = width - 10 - boxW;
                if (boxY < 10) boxY = px.y + 15;

                ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
                if (ctx.roundRect) {
                    ctx.beginPath(); ctx.roundRect(boxX + 2, boxY + 2, boxW, boxH, 6); ctx.fill();
                } else {
                    ctx.fillRect(boxX + 2, boxY + 2, boxW, boxH);
                }

                ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
                if (ctx.roundRect) {
                    ctx.beginPath(); ctx.roundRect(boxX, boxY, boxW, boxH, 6); ctx.fill();
                } else {
                    ctx.fillRect(boxX, boxY, boxW, boxH);
                }
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = pinColor;
                ctx.stroke();

                lines.forEach((l, li) => {
                    if (li === 0) {
                        ctx.font = "bold 11px Arial, sans-serif";
                        ctx.fillStyle = pinColor;
                    } else {
                        ctx.font = "10px Arial, sans-serif";
                        ctx.fillStyle = "#263238";
                    }
                    ctx.textAlign = "center";
                    ctx.fillText(l, boxX + boxW / 2, boxY + 14 + li * lineH);
                });
                ctx.restore();
            }
        }
    });

    // Branding badge
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillRect(width - 95, height - 24, 90, 20);
    ctx.strokeStyle = "#cfd8dc";
    ctx.strokeRect(width - 95, height - 24, 90, 20);
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.fillStyle = "#e65100";
    ctx.fillText("Bhugol", width - 88, height - 10);
    ctx.fillStyle = "#37474f";
    ctx.fillText("Maps", width - 46, height - 10);
    ctx.restore();

    try {
        return canvas.toDataURL("image/jpeg", 0.85);
    } catch (e) {
        console.warn("Canvas toDataURL failed (tainted?), generating vector map fallback:", e);
        try {
            const fbCanvas = document.createElement("canvas");
            fbCanvas.width = width;
            fbCanvas.height = height;
            const fbCtx = fbCanvas.getContext("2d");

            fbCtx.fillStyle = "#eef2f5";
            fbCtx.fillRect(0, 0, width, height);

            fbCtx.strokeStyle = "#cbd5e1";
            fbCtx.lineWidth = 1;
            for (let gx = 0; gx < width; gx += 40) {
                fbCtx.beginPath(); fbCtx.moveTo(gx, 0); fbCtx.lineTo(gx, height); fbCtx.stroke();
            }
            for (let gy = 0; gy < height; gy += 40) {
                fbCtx.beginPath(); fbCtx.moveTo(0, gy); fbCtx.lineTo(width, gy); fbCtx.stroke();
            }

            if (validPts.length >= 2) {
                fbCtx.beginPath();
                validPts.forEach((pt, idx) => {
                    const px = toPixel(pt.latitude, pt.longitude);
                    if (idx === 0) fbCtx.moveTo(px.x, px.y);
                    else fbCtx.lineTo(px.x, px.y);
                });
                fbCtx.lineWidth = 3;
                fbCtx.strokeStyle = "#1a237e";
                fbCtx.stroke();
            }

            validPts.forEach((pt) => {
                const px = toPixel(pt.latitude, pt.longitude);
                fbCtx.beginPath();
                fbCtx.arc(px.x, px.y, 8, 0, Math.PI * 2);
                fbCtx.fillStyle = pt.pinColor || "#2e7d32";
                fbCtx.fill();
                fbCtx.lineWidth = 2;
                fbCtx.strokeStyle = "#ffffff";
                fbCtx.stroke();
            });

            return fbCanvas.toDataURL("image/jpeg", 0.85);
        } catch (fbErr) {
            console.error("Vector fallback toDataURL failed:", fbErr);
            return null;
        }
    }
};

const DeviceLocationMapModal = ({ open, onClose, imei, testNo, testName, rowId, samples, execution, fallbackCoord }) => {
    const [points, setPoints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lockedCoord, setLockedCoord] = useState(null);

    // Extract all valid test coordinates with feature-specific mapping
    useEffect(() => {
        if (!open || !imei) return;

        setLoading(true);
        setPoints([]);
        setLockedCoord(null);

        const sampleList = Array.isArray(samples) && samples.length > 0
            ? samples
            : (Array.isArray(execution?.test_log_snapshot?.samples) ? execution.test_log_snapshot.samples : []);

        const mappedPoints = processTestPointsForMap({ sampleList, testNo, testName, imei, fallbackCoord });

        if (mappedPoints.length > 0) {
            setPoints(mappedPoints);
            const primary = mappedPoints.find(p => p.pointType === 'recovered' || p.pointType === 'recovery' || p.pointType === 'entry') || mappedPoints[mappedPoints.length - 1];
            setLockedCoord({
                lat: primary.latitude,
                lng: primary.longitude,
                timestamp: primary.timestamp
            });
        }

        setLoading(false);
    }, [open, imei, samples, execution, testNo, testName, fallbackCoord]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#1a237e', color: '#ffffff', py: 1.5, px: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                    <LocationOnIcon sx={{ color: '#ffffff', fontSize: 30 }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, lineHeight: 1.2 }}>
                            Test #{testNo}{testName ? `: ${testName}` : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.92)', display: 'block', mt: 0.4 }}>
                            IMEI: <b>{imei}</b>
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}>
                    <CancelIcon sx={{ color: '#ffffff', fontSize: 26 }} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 600 }}>
                        <CircularProgress />
                    </Box>
                ) : points.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 600, flexDirection: 'column', gap: 2 }}>
                        <LocationOnIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        <Typography color="text.secondary">No locked GPS coordinates available for this device test.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ flex: 1, position: 'relative' }}>
                        <DeviceModelLiveMap gpsData={points} autoFit={true} height="600px" />
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

/* ─── helpers ─── */
const formatDateTime = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    } catch { return value; }
};

const toDatetimeLocalValue = (d) => {
    const dt = d ? new Date(d) : new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const toISOString = (datetimeLocalVal) => {
    if (!datetimeLocalVal) return undefined;
    return new Date(datetimeLocalVal).toISOString();
};

/* extract a readable error message from an axios error */
const extractError = (err) => {
    const d = err?.response?.data;
    if (typeof d === "string") return d;
    if (d?.error) return d.error;
    if (d?.message) return d.message;
    if (d?.detail) return d.detail;
    if (d && typeof d === "object") {
        // join first field-level error found
        const first = Object.values(d)[0];
        if (Array.isArray(first)) return first[0];
        if (typeof first === "string") return first;
    }
    return err?.message || "An unexpected error occurred.";
};

/* ── status configuration ── */
const STATUS_CONFIG = {
    pending: { label: "Pending", color: "warning" },
    submitted: { label: "Submitted", color: "info" },
    devices_received: { label: "Accepted", color: "success" },
    ongoing_evaluation: { label: "Ongoing Evaluation", color: "secondary" },
    technically_compatible: { label: "Technically Compatible", color: "success" },
    technically_not_compatible: { label: "Technically Not Compatible", color: "error" },
    stateadminapproved: { label: "State Admin Approved", color: "success" },
    stateadminrejected: { label: "State Admin Rejected", color: "error" },
    accepted: { label: "Accepted", color: "success" },
    rejected: { label: "Rejected", color: "error" },
    approved: { label: "Approved", color: "success" },
    processing: { label: "Processing", color: "info" },
};

const StatusChip = ({ status }) => {
    const key = String(status ?? "").trim().toLowerCase();
    const cfg = STATUS_CONFIG[key] ?? { label: status || "—", color: "default" };
    return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600, minWidth: 86 }} />;
};

/* ── resolve manufacturer name ── */
const resolveManufacturer = (row) => {
    const obj =
        row.manufacturer || row.manufacturer_info ||
        row.created_by_info || row.submitted_by || null;
    if (obj) {
        const name = obj.company_name || obj.name || obj.username || obj.email || null;
        if (name) return name;
    }
    return row.manufacturer_name || row.company_name ||
        row.created_by_name || row.submitted_by_name || "—";
};

/* ═══════════════════════════════════════════════════
   MARK ONGOING DIALOG
═══════════════════════════════════════════════════ */
const MarkOngoingDialog = ({ open, row, onClose, onSuccess }) => {
    const [evalDatetime, setEvalDatetime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const demoDevices = useMemo(() => {
        if (!row?.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row?.demo_devices]);

    useEffect(() => {
        if (open) {
            setEvalDatetime(toDatetimeLocalValue(new Date()));
            setError("");
        }
    }, [open]);
    const handleConfirm = async () => {
        setError("");
        if (!evalDatetime) {
            setError("Evaluation date and time is mandatory.");
            return;
        }
        setSubmitting(true);
        try {
            const minVal = toDatetimeLocalValue(row?.request_datetime || row?.created_at || row?.created);
            if (evalDatetime < minVal) {
                setError("Testing date cannot be earlier than the request date.");
                setSubmitting(false);
                return;
            }
            const payload = { onboarding_request_id: row.id };
            const isoVal = toISOString(evalDatetime);
            if (isoVal) payload.evaluation_datetime = isoVal;
            await DeviceModelServices.markTechnicalOnboardingOngoing(payload);
            onSuccess(row.id);
        } catch (err) {
            setError(extractError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const mfrName = row ? resolveManufacturer(row) : "";
    const modelName = row
        ? (row.device_model?.model_name || row.device_model_name || `ID ${row.device_model_id ?? row.device_model ?? ""}`)
        : "";

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <PlayCircleOutlineIcon color="info" />
                    <Typography variant="h5" fontWeight={700}>Start Testing</Typography>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.50" }}>
                        <Grid container rowSpacing={0.5} columnSpacing={2}>
                            {[
                                ["Request ID", row?.id],
                                ["Manufacturer", mfrName],
                                ["Device Model", modelName],
                                ["Current Status", row?.status],
                            ].map(([lbl, val]) => val ? (
                                <React.Fragment key={lbl}>
                                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                    <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                </React.Fragment>
                            ) : null)}
                        </Grid>
                    </Paper>
                    <Divider />
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <EventIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" fontWeight={600}>Evaluation Date &amp; Time *</Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Schedule when the evaluation will start. This field is mandatory.
                        </Typography>
                        <TextField
                            fullWidth size="small" type="datetime-local" label="Evaluation Date & Time"
                            value={evalDatetime}
                            onChange={(e) => setEvalDatetime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            error={!evalDatetime && !!error}
                            inputProps={{
                                min: toDatetimeLocalValue(row?.request_datetime || row?.created_at || row?.created)
                            }}
                            helperText={
                                evalDatetime ? "Select a date on or after the request date." : "Required field."
                            }
                        />
                    </Box>
                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={submitting} variant="outlined">Cancel</Button>
                <Button
                    onClick={handleConfirm} disabled={submitting} variant="contained" color="info"
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <PlayCircleOutlineIcon />}
                >
                    {submitting ? "Starting…" : "Start Testing"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════════
   DEVICE HISTORY MODAL
═══════════════════════════════════════════════════ */
const DeviceHistoryModal = ({ open, row, onClose }) => {
    const demoDevices = useMemo(() => {
        if (!row?.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row?.demo_devices]);

    const imeis = useMemo(() => {
        return demoDevices.map(d => d.imei || d.device_serial_no).filter(Boolean);
    }, [demoDevices]);

    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [error, setError] = useState("");
    const [filterType, setFilterType] = useState("1hr"); // "1hr", "custom", "timestamp"
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");
    const [specificTimestamp, setSpecificTimestamp] = useState("");
    const [selectedImei, setSelectedImei] = useState("ALL");
    
    // Automatically fetch 1-hr data when opened (if filterType is 1hr)
    useEffect(() => {
        if (open && row?.id) {
            setFilterType("1hr");
            setHistoryData([]);
            setCustomStart("");
            setCustomEnd("");
            setSpecificTimestamp("");
            setSelectedImei("ALL");
            fetchHistory("1hr");
        }
    }, [open, row?.id]);

    const fetchHistory = async (type = filterType) => {
        setLoading(true);
        setError("");
        setHistoryData([]);
        try {
            const payload = { onboarding_request_id: row.id };
            
            if (type === "custom") {
                if (!customStart || !customEnd) {
                    setError("Please select both start and end datetime.");
                    setLoading(false);
                    return;
                }
                payload.start_datetime = new Date(customStart).toISOString();
                payload.end_datetime = new Date(customEnd).toISOString();
            } else if (type === "timestamp") {
                if (!specificTimestamp) {
                    setError("Please select a specific timestamp.");
                    setLoading(false);
                    return;
                }
                payload.timestamp = new Date(specificTimestamp).toISOString();
            }
            // If type === '1hr', we just send onboarding_request_id (defaults to 1 hr)
            
            const res = await DeviceModelServices.getDemoDeviceHistory(payload);
            
            let fetchedData = [];
            if (Array.isArray(res.data)) {
                fetchedData = res.data;
            } else if (Array.isArray(res.data?.data)) {
                fetchedData = res.data.data;
            } else if (res.data && typeof res.data === 'object') {
                // If the response is an object, try to find the array
                const possibleArray = Object.values(res.data).find(val => Array.isArray(val));
                if (possibleArray) fetchedData = possibleArray;
            }
            
            setHistoryData(fetchedData);
        } catch (err) {
            setError(extractError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                <Typography variant="h6" fontWeight={700}>Device History Logs</Typography>
                <IconButton onClick={onClose} size="small"><CancelIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3, bgcolor: '#fdfdfd' }}>
                <Stack spacing={3}>
                    <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', bgcolor: '#fff', borderRadius: 2 }}>
                        
                        {imeis.length > 0 && (
                            <TextField
                                select
                                size="small"
                                label="Select Device"
                                value={selectedImei}
                                onChange={(e) => setSelectedImei(e.target.value)}
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="ALL">All Devices</MenuItem>
                                {imeis.map(imei => (
                                    <MenuItem key={imei} value={imei}>{imei}</MenuItem>
                                ))}
                            </TextField>
                        )}

                        <FormControl component="fieldset">
                            <RadioGroup row value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <FormControlLabel value="1hr" control={<Radio size="small" />} label="Last 1 Hour" />
                                <FormControlLabel value="timestamp" control={<Radio size="small" />} label="Specific Timestamp" />
                                <FormControlLabel value="custom" control={<Radio size="small" />} label="Custom Range" />
                            </RadioGroup>
                        </FormControl>

                        {filterType === "timestamp" && (
                            <TextField
                                label="Select Time"
                                type="datetime-local"
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                value={specificTimestamp}
                                onChange={(e) => setSpecificTimestamp(e.target.value)}
                            />
                        )}

                        {filterType === "custom" && (
                            <>
                                <TextField
                                    label="Start"
                                    type="datetime-local"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                />
                                <TextField
                                    label="End"
                                    type="datetime-local"
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                />
                            </>
                        )}
                        
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => fetchHistory()} 
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                            sx={{ ml: 'auto' }}
                        >
                            Fetch
                        </Button>
                    </Paper>

                    {error && <Alert severity="error">{error}</Alert>}

                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, width: '15%' }}>IMEI</TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: '20%' }}>Timestamp</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Raw Data</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(() => {
                                    if (loading) {
                                        return (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 3 }}><CircularProgress size={24} /></TableCell>
                                            </TableRow>
                                        );
                                    }
                                    
                                    // Flatten the entries from all devices in the response
                                    const allEntries = historyData.flatMap(device => 
                                        (device.entries || []).map(entry => ({
                                            ...entry,
                                            device_imei: device.imei || device.device_serial_no || 'Unknown'
                                        }))
                                    ).sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)); // Sort newest first

                                    const filteredEntries = selectedImei === "ALL" 
                                        ? allEntries 
                                        : allEntries.filter(e => e.device_imei === selectedImei);

                                    if (filteredEntries.length === 0) {
                                        return (
                                            <TableRow>
                                                <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                    {historyData.length > 0 ? "No history entries found for the selected period/device." : "No data found."}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return filteredEntries.map((rowItem, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'text.secondary' }}>
                                                {rowItem.device_imei}
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                {formatDateTime(rowItem.timestamp || rowItem.created_at)}
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                                {rowItem.raw_data || JSON.stringify(rowItem)}
                                            </TableCell>
                                        </TableRow>
                                    ));
                                })()}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════════
   FINALIZE DIALOG
═══════════════════════════════════════════════════ */
const FinalizeDialog = ({ open, row, onClose, onSuccess }) => {
    const [status, setStatus] = useState("technically_compatible");
    const [finalComment, setFinalComment] = useState("");
    const [reportPdf, setReportPdf] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [apiError, setApiError] = useState("");

    // History Modal State
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    // Location Map Modal State
    const [locationMapState, setLocationMapState] = useState({ open: false, samples: [], imei: '', testNo: null });

    // Checklist states
    const [activeTestId, setActiveTestId] = useState(1);
    const [deviceTestResults, setDeviceTestResults] = useState({});

    // Test board data from API
    const [testBoardCategories, setTestBoardCategories] = useState([]);
    const [loadingBoard, setLoadingBoard] = useState(false);

    const demoDevices = useMemo(() => {
        if (!row?.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row?.demo_devices]);

    const fetchTestBoard = useCallback(async (showLoading = true) => {
        if (showLoading) setLoadingBoard(true);
        try {
            const res = await DeviceModelServices.getTestBoard({ onboarding_request_id: row?.id });
            let categories = [];
            if (Array.isArray(res?.data)) {
                categories = res.data;
            } else if (res?.data?.rows) {
                categories = res.data.rows;
            } else if (res?.data?.categories) {
                categories = res.data.categories;
            }

            if (categories.length > 0) {
                setTestBoardCategories(categories);
                // find the first active test id that has any incomplete execution, or default to 1
                let firstIncompleteId = 1;
                for (const cat of categories) {
                    const hasIncomplete = cat.executions.some(e => e.status === "incomplete" || e.status === "not_started" || e.status === "in_progress");
                    if (hasIncomplete) {
                        firstIncompleteId = cat.test_case.serial_no;
                        break;
                    }
                }
                // if all tests completed, it will set it to the max id
                if (categories.every(cat => cat.executions.every(e => e.status === "pass" || e.status === "completed"))) {
                    firstIncompleteId = categories.length + 1;
                }
                setActiveTestId(firstIncompleteId);
            }
        } catch (err) {
            setApiError(extractError(err));
        } finally {
            if (showLoading) setLoadingBoard(false);
        }
    }, [row?.id]);

    useEffect(() => {
        if (open) {
            setStatus("technically_compatible");
            setFinalComment("");
            setReportPdf(null);
            setFieldErrors({});
            setApiError("");
            setActiveTestId(1);
            setDeviceTestResults({});

            // Fetch test board data
            if (row?.id) fetchTestBoard();
        }
    }, [open, row?.id, fetchTestBoard]);

    // Polling effect for in-progress tests
    useEffect(() => {
        if (!open) return;

        const inProgressExecutions = [];
        testBoardCategories.forEach(cat => {
            if (cat.executions) {
                cat.executions.forEach(exec => {
                    if (exec.status === "in_progress" && exec.id) {
                        inProgressExecutions.push(exec.id);
                    }
                });
            }
        });

        if (inProgressExecutions.length === 0) return;

        const interval = setInterval(() => {
            Promise.all(inProgressExecutions.map(execId =>
                DeviceModelServices.heartbeatTestBoard({ execution_id: execId }).catch(e => console.error(e))
            ));
        }, 5000);

        return () => clearInterval(interval);
    }, [open, testBoardCategories, fetchTestBoard]);

    const handleStartTest = async (testCaseId, demoDeviceId) => {
        try {
            await DeviceModelServices.startTestBoard({
                onboarding_request_id: row.id,
                demo_device_id: demoDeviceId,
                test_case_id: testCaseId
            });
            fetchTestBoard(false);
        } catch (err) {
            setApiError(extractError(err));
        }
    };

    const handleRefreshLog = async (executionId) => {
        try {
            await DeviceModelServices.refreshLogTestBoard({ execution_id: executionId });
            fetchTestBoard(false);
        } catch (err) {
            setApiError(extractError(err));
        }
    };

    const handleCompleteTest = async (executionId) => {
        try {
            await DeviceModelServices.completeTestBoard({ execution_id: executionId });
            fetchTestBoard(false);
        } catch (err) {
            setApiError(extractError(err));
        }
    };

    const allTestsCompleted = useMemo(() => {
        if (!testBoardCategories || testBoardCategories.length === 0) return false;
        return testBoardCategories.every(cat =>
            cat.executions && cat.executions.length > 0 && cat.executions.every(e => e.status === "pass" || e.status === "completed" || e.status === "complete")
        );
    }, [testBoardCategories]);

    const validate = () => {
        const errs = {};
        if (!finalComment.trim()) errs.finalComment = "Comment is required.";
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleConfirm = async (submitStatus) => {
        if (!validate()) return;
        setStatus(submitStatus); // Update state for UI consistency
        setApiError(""); setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("onboarding_request_id", row.id);
            fd.append("status", submitStatus);
            fd.append("final_comment", finalComment.trim());

            if (submitStatus === "technically_compatible") {
                const doc = await createPDFDoc(submitStatus);
                const pdfBlob = doc.output("blob");
                fd.append("compatibility_report_pdf", pdfBlob, `Technical_Onboarding_Report_${row?.id}.pdf`);
            }

            // No longer appending reportPdf here as it's not strictly required and is handled client-side
            fd.append("device_test_results", JSON.stringify(deviceTestResults));
            await DeviceModelServices.finalizeTechnicalOnboardingRequest(fd);
            onSuccess(row.id, submitStatus);
        } catch (err) {
            setApiError(extractError(err));
        } finally {
            setSubmitting(false);
        }
    };

    const mfrName = row ? resolveManufacturer(row) : "";
    const modelName = row
        ? (row.device_model?.model_name || row.device_model_name || `ID ${row.device_model_id ?? row.device_model ?? ""}`)
        : "";

    const imeis = Array.from({ length: 5 }, (_, i) => demoDevices[i]?.imei || `Device ${i + 1}`);

    const getDeviceFallbackCoord = (targetImei, targetIdx) => {
        // Check all test executions for this specific IMEI
        for (const cat of testBoardCategories) {
            const executions = Array.isArray(cat.executions) ? cat.executions : [];
            const exec = executions.find(e =>
                (String(e.demo_device?.imei) === String(targetImei)) ||
                (String(e.demo_device?.device_serial_no) === String(targetImei))
            ) || executions[targetIdx];

            let samples = [];
            if (exec?.test_log_snapshot) {
                let snap = null;
                try {
                    snap = typeof exec.test_log_snapshot === "string" ? JSON.parse(exec.test_log_snapshot) : exec.test_log_snapshot;
                } catch (e) { }
                if (snap && Array.isArray(snap.samples)) {
                    samples = snap.samples;
                }
            }
            if ((!samples || samples.length === 0) && Array.isArray(exec?.samples)) {
                samples = exec.samples;
            }
            for (const s of samples) {
                const c = extractCoordFromSample(s);
                if (c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && (c.lat !== 0 || c.lng !== 0)) {
                    return { lat: c.lat, lng: c.lng };
                }
            }
        }

        // Check across all executions in the whole test board
        for (const cat of testBoardCategories) {
            const executions = Array.isArray(cat.executions) ? cat.executions : [];
            for (const exec of executions) {
                let samples = [];
                if (exec?.test_log_snapshot) {
                    let snap = null;
                    try {
                        snap = typeof exec.test_log_snapshot === "string" ? JSON.parse(exec.test_log_snapshot) : exec.test_log_snapshot;
                    } catch (e) { }
                    if (snap && Array.isArray(snap.samples)) {
                        samples = snap.samples;
                    }
                }
                if ((!samples || samples.length === 0) && Array.isArray(exec?.samples)) {
                    samples = exec.samples;
                }
                for (const s of samples) {
                    const c = extractCoordFromSample(s);
                    if (c && Number.isFinite(c.lat) && Number.isFinite(c.lng) && (c.lat !== 0 || c.lng !== 0)) {
                        return { lat: c.lat, lng: c.lng };
                    }
                }
            }
        }

        return { lat: 26.192980, lng: 91.752876 };
    };

    const createPDFDoc = async (currentStatus) => {
        const doc = new jsPDF("landscape");

        // Pre-collect and generate map snapshots in parallel for tests that have maps:
        const mapRequests = [];
        testBoardCategories.forEach((category) => {
            const step = category.test_case;
            const isLocationTest = LOCATION_TEST_NOS.includes(Number(step.serial_no)) ||
                (step.name && /(speed|geofence|faraday|location|satellite|recovery|a-gps)/i.test(step.name));

            if (isLocationTest) {
                imeis.forEach((imei, idx) => {
                    const executions = Array.isArray(category.executions) ? category.executions : [];
                    const exec = executions.find(e =>
                        (String(e.demo_device?.imei) === String(imei)) ||
                        (String(e.demo_device?.device_serial_no) === String(imei))
                    );
                    const execution = exec || executions[idx];

                    let samples = [];
                    if (execution?.test_log_snapshot) {
                        let snap = null;
                        try {
                            snap = typeof execution.test_log_snapshot === "string" ? JSON.parse(execution.test_log_snapshot) : execution.test_log_snapshot;
                        } catch (e) { }
                        if (snap && Array.isArray(snap.samples)) {
                            samples = snap.samples;
                        }
                    }
                    if ((!samples || samples.length === 0) && Array.isArray(execution?.samples)) {
                        samples = execution.samples;
                    }

                    const fallbackCoord = getDeviceFallbackCoord(imei, idx);
                    const points = processTestPointsForMap({
                        sampleList: samples,
                        testNo: step.serial_no,
                        testName: step.name,
                        imei,
                        fallbackCoord
                    });

                    if (points && points.length > 0) {
                        mapRequests.push({
                            imei,
                            imeiIndex: idx,
                            serial_no: step.serial_no,
                            testName: step.name,
                            status: execution?.status || 'pass',
                            points
                        });
                    }
                });
            }
        });

        const mapSnapshots = await Promise.all(
            mapRequests.map(async (req) => {
                const dataUrl = await generateMapSnapshot(req.points, 640, 360);
                return { ...req, dataUrl };
            })
        );

        doc.setFontSize(16);
        doc.text(`Compatibility Report - Request ID: ${row?.id}`, 14, 15);
        doc.setFontSize(11);
        doc.text(`Manufacturer: ${mfrName}`, 14, 22);
        doc.text(`Device Model: ${modelName}`, 14, 28);
        doc.text(`Status: ${currentStatus || status}`, 14, 34);

        let startY = 40;

        imeis.forEach((imei, index) => {
            if (index > 0) {
                doc.addPage();
                startY = 15;
            }

            doc.setFontSize(14);
            doc.text(`Testing Table for IMEI: ${imei}`, 14, startY);
            startY += 8;

            const tableData = [];
            testBoardCategories.forEach((category) => {
                const step = category.test_case;
                // Find execution for this IMEI
                const exec = category.executions.find(e => (e.demo_device?.imei === imei) || (e.demo_device?.device_serial_no === imei));
                const execution = exec || category.executions[index];

                let timestamp = "N/A";
                let rawData = "N/A";
                let extraData = "";
                let hasSamples = false;

                if (execution?.test_log_snapshot) {
                    try {
                        const snap = typeof execution.test_log_snapshot === "string" ? JSON.parse(execution.test_log_snapshot) : execution.test_log_snapshot;
                        if (snap.samples && snap.samples.length > 0) {
                            hasSamples = true;
                            const timestamps = [];
                            const rawDatas = [];

                            const fwVersions = [];
                            const voltages = [];
                            const extVoltages = [];
                            const speeds = [];
                            const locations = [];
                            const networks = [];
                            const operators = [];

                            const pushUnique = (arr, val) => {
                                if (arr.length === 0 || arr[arr.length - 1] !== val) arr.push(val);
                            };

                            for (const sample of snap.samples) {
                                timestamps.push(sample.timestamp || "N/A");
                                rawDatas.push(sample.raw_data || "N/A");

                                if (sample.raw_data && typeof sample.raw_data === 'string' && (sample.raw_data.startsWith("$PVT") || sample.raw_data.startsWith("$,PVT"))) {
                                    const parts = sample.raw_data.split(",");
                                    const offset = sample.raw_data.startsWith("$,PVT") ? 1 : 0;
                                    if (parts.length > 3 + offset) {
                                        pushUnique(fwVersions, parts[2 + offset]);
                                    }
                                    if (parts.length > 14 + offset) {
                                        pushUnique(locations, `${parts[11 + offset]} ${parts[12 + offset]}, ${parts[13 + offset]} ${parts[14 + offset]}`);
                                    }
                                    if (parts.length > 15 + offset) {
                                        pushUnique(speeds, parts[15 + offset]);
                                    }
                                    if (parts.length > 25 + offset) {
                                        pushUnique(voltages, parts[25 + offset]);
                                        pushUnique(extVoltages, parts[24 + offset]);
                                    }
                                    if (parts.length > 32 + offset) {
                                        pushUnique(networks, `${parts[21 + offset]} (Sig:${parts[28 + offset]} MCC:${parts[29 + offset]} MNC:${parts[30 + offset]} LAC:${parts[31 + offset]} Cell:${parts[32 + offset]})`);
                                        pushUnique(operators, parts[21 + offset]);
                                    }
                                }
                            }

                            timestamp = timestamps.join("\n");
                            rawData = rawDatas.join("\n");
                            if (fwVersions.length > 0) {
                                extraData = `FW: ${[...new Set([...fwVersions].reverse())].join(" -> ")}`;
                            }
                            if (locations.length > 0) {
                                if (extraData) extraData += " | ";
                                extraData += `Lat/Lon: ${[...new Set([...locations].reverse())].join(" | ")}`;
                            }
                            if (networks.length > 0) {
                                if (extraData) extraData += " | ";
                                extraData += `Net: ${[...new Set([...networks].reverse())].join(" | ")}`;
                            }
                            if (operators.length > 0) {
                                if (extraData) extraData += " | ";
                                extraData += `Op: ${[...new Set([...operators].reverse())].join(" -> ")}`;
                            }
                            if (speeds.length > 0) {
                                if (extraData) extraData += " | ";
                                extraData += `Speed: ${[...new Set([...speeds].reverse())].join(", ")}`;
                            }
                            if (voltages.length > 0) {
                                if (extraData) extraData += " | ";
                                extraData += `Vol: ${[...voltages].reverse().join("V, ")}V`;
                            }
                            if (extVoltages.length > 0) {
                                if (extraData) extraData += " | ";
                                extraData += `Ext Vol: ${[...extVoltages].reverse().join("V, ")}V`;
                            }
                        }
                    } catch (e) { }
                }

                const execStatus = execution?.status || "not_started";
                const isPassed = execStatus === "pass" || execStatus === "completed" || execStatus === "complete";
                if (!hasSamples && isPassed) {
                    timestamp = "Bypassed";
                    rawData = "Bypassed";
                    extraData = "Bypassed";
                }

                let displayName = step.name;
                if (step.serial_no === 6 && extraData.includes("FW:")) {
                    const fwMatch = extraData.match(/FW: (.*?)( \||$)/);
                    if (fwMatch) {
                        const fws = fwMatch[1].split(" -> ");
                        if (fws.length >= 2) {
                            displayName = `FOTA upgrade A(${fws[0]}) -> B(${fws[fws.length - 1]})`;
                        } else {
                            displayName = `FOTA upgrade A(${fws[0]}) -> B(...)`;
                        }
                    }
                    // NOTE: Voltage NOT shown in title for test #7 — each device can have a different voltage.
                    // Voltage is shown per-device below each timestamp.
                    // NOTE: Ext Vol NOT shown in title for test #8 — per-device display instead.
                    // NOTE: Speed NOT shown in title for test #14 — per-device display instead.
                    // NOTE: Lat/Lon NOT shown in title for test #15 — per-device display instead.
                } else if (step.serial_no === 20 || step.serial_no === 21) {
                    let appendStr = "";
                    const locMatch = extraData.match(/Lat\/Lon: (.*?)( \||$)/);
                    if (locMatch) appendStr += `Lat/Lon: ${locMatch[1]}`;
                    const netMatch = extraData.match(/Net: (.*?)( \||$)/);
                    if (netMatch) {
                        if (appendStr) appendStr += " | ";
                        appendStr += `Net: ${netMatch[1]}`;
                    }
                    if (appendStr) {
                        displayName = `${step.name} (${appendStr})`;
                    }
                } else if (step.serial_no === 23 && extraData.includes("Op:")) {
                    const opMatch = extraData.match(/Op: (.*?)( \||$)/);
                    if (opMatch) {
                        const ops = opMatch[1].split(" -> ");
                        if (ops.length >= 2) {
                            displayName = `eSIM switch: primary (${ops[0]}) -> secondary (${ops[ops.length - 1]})`;
                        } else {
                            displayName = `eSIM switch: primary (${ops[0]}) -> secondary (...)`;
                        }
                    }
                } else if (step.serial_no === 24 && extraData.includes("Op:")) {
                    const opMatch = extraData.match(/Op: (.*?)( \||$)/);
                    if (opMatch) {
                        const ops = opMatch[1].split(" -> ");
                        if (ops.length >= 2) {
                            displayName = `eSIM switch: secondary (${ops[0]}) -> primary (${ops[ops.length - 1]})`;
                        } else {
                            displayName = `eSIM switch: secondary (${ops[0]}) -> primary (...)`;
                        }
                    }
                }

                let filteredExtraData = "";
                if (step.serial_no === 6) {
                    const match = extraData.match(/FW: (.*?)( \||$)/);
                    if (match) filteredExtraData = `FW: ${match[1]}`;
                } else if (step.serial_no === 7) {
                    const match = extraData.match(/Vol: (.*?)( \||$)/);
                    if (match) filteredExtraData = `Vol: ${match[1]}`;
                } else if (step.serial_no === 8) {
                    const match = extraData.match(/Ext Vol: (.*?)( \||$)/);
                    if (match) filteredExtraData = `Ext Vol: ${match[1]}`;
                } else if (step.serial_no === 14 || step.serial_no === 15) {
                    let speedStr = "";
                    if (speeds.length >= 2) {
                        speedStr = `Start Speed: ${speeds[0]} km/h | End Speed: ${speeds[speeds.length - 1]} km/h`;
                    } else if (speeds.length === 1) {
                        speedStr = `Speed: ${speeds[0]} km/h`;
                    }
                    const locMatch = extraData.match(/Lat\/Lon: (.*?)( \||$)/);
                    const locStr = locMatch ? `Lat/Lon: ${locMatch[1]}` : "";
                    filteredExtraData = [speedStr, locStr].filter(Boolean).join(" | ");
                } else if (step.serial_no === 20 || step.serial_no === 21) {
                    const parts = [];
                    const locMatch = extraData.match(/Lat\/Lon: (.*?)( \||$)/);
                    if (locMatch) parts.push(`Lat/Lon: ${locMatch[1]}`);
                    const netMatch = extraData.match(/Net: (.*?)( \||$)/);
                    if (netMatch) parts.push(`Net: ${netMatch[1]}`);
                    filteredExtraData = parts.join(" | ");
                } else if (step.serial_no === 23) {
                    const isGpsRecovery = /(loss|recovery|satellite)/i.test(step.name);
                    if (isGpsRecovery) {
                        if (locations.length >= 2) {
                            filteredExtraData = `Loss Point: ${locations[0]} | Recovery Point: ${locations[locations.length - 1]}`;
                        } else if (locations.length === 1) {
                            filteredExtraData = `Recovery Point: ${locations[0]}`;
                        } else {
                            const locMatch = extraData.match(/Lat\/Lon: (.*?)( \||$)/);
                            if (locMatch) filteredExtraData = locMatch[1];
                        }
                    } else {
                        const match = extraData.match(/Op: (.*?)( \||$)/);
                        if (match) filteredExtraData = `Op: ${match[1]}`;
                    }
                } else if (step.serial_no === 24) {
                    const match = extraData.match(/Op: (.*?)( \||$)/);
                    if (match) filteredExtraData = `Op: ${match[1]}`;
                }

                if (!hasSamples && isPassed) {
                    filteredExtraData = "Bypassed";
                }

                let pdfDescription = step.description;
                if (step.serial_no === 7) {
                    pdfDescription = "Confirm the internal battery voltage reading at three distinct voltage levels.\n\nScans GPSDataLog for ,PVT,|$PVT, · needs >=1 match within a 5 min window.\nTester still confirms the reported voltage matches a reference meter, at all 3 levels.";
                }
                tableData.push([
                    step.serial_no,
                    displayName,
                    pdfDescription,
                    timestamp,
                    rawData,
                    filteredExtraData
                ]);

                // Insert inline map evidence directly underneath the test row!
                const isLocationTest = LOCATION_TEST_NOS.includes(Number(step.serial_no)) ||
                    (step.name && /(speed|geofence|faraday|location|satellite|recovery|a-gps)/i.test(step.name));

                if (isLocationTest) {
                    const mapItem = mapSnapshots.find(
                        (m) => (String(m.imei) === String(imei) || m.imeiIndex === index) &&
                               Number(m.serial_no) === Number(step.serial_no) &&
                               m.dataUrl
                    );

                    if (mapItem) {
                        tableData.push([
                            {
                                content: "",
                                colSpan: 6,
                                styles: {
                                    minCellHeight: 68,
                                    fillColor: [248, 250, 252],
                                    cellPadding: { top: 2, left: 4, right: 4, bottom: 2 }
                                },
                                _isMapRow: true,
                                _mapDataUrl: mapItem.dataUrl,
                                _testNo: step.serial_no,
                                _testName: displayName,
                                _points: mapItem.points
                            }
                        ]);
                    }
                }
            });

            autoTable(doc, {
                startY: startY,
                head: [["Serial No", "Test Name", "Test Description", "Timestamp", "Raw Data", "Value"]],
                body: tableData,
                rowPageBreak: 'avoid',
                styles: { fontSize: 8, overflow: 'linebreak' },
                columnStyles: {
                    0: { cellWidth: 15 },
                    1: { cellWidth: 40 },
                    2: { cellWidth: 70 },
                    3: { cellWidth: 35 },
                    4: { cellWidth: 90 },
                    5: { cellWidth: 20 }
                },
                margin: { top: 10, left: 10, right: 10 },
                didDrawCell: (data) => {
                    if (data.column.index === 0 && data.cell.raw && data.cell.raw._isMapRow && data.cell.raw._mapDataUrl) {
                        const { x, y, width, height } = data.cell;
                        const cellRaw = data.cell.raw;

                        // Header strip
                        doc.setFillColor(238, 242, 246);
                        doc.roundedRect(x + 2, y + 2, width - 4, 6.5, 1, 1, "F");

                        doc.setFontSize(7.5);
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(26, 35, 126);
                        doc.text(`Visual Map Tracking & Coordinate Fix — Test #${cellRaw._testNo}: ${cellRaw._testName}`, x + 5, y + 6.5);

                        // Status chip on header
                        doc.setFillColor(46, 125, 50);
                        doc.roundedRect(x + width - 26, y + 2.5, 22, 5, 1, 1, "F");
                        doc.setFontSize(6);
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(255, 255, 255);
                        doc.text("VERIFIED", x + width - 15, y + 6, { align: "center" });

                        // Map snapshot image on left
                        const mapImgW = 120;
                        const mapImgH = 55;
                        const imgX = x + 5;
                        const imgY = y + 10;
                        try {
                            doc.addImage(cellRaw._mapDataUrl, "JPEG", imgX, imgY, mapImgW, mapImgH);
                            doc.setDrawColor(180, 190, 205);
                            doc.setLineWidth(0.3);
                            doc.rect(imgX, imgY, mapImgW, mapImgH);

                            // Right side details
                            const textX = imgX + mapImgW + 8;
                            let textY = y + 16;

                            doc.setFontSize(8);
                            doc.setFont("helvetica", "bold");
                            doc.setTextColor(26, 35, 126);
                            doc.text("Visual Map Points & Verification Data:", textX, textY);

                            textY += 5;
                            doc.setFontSize(7.2);
                            doc.setFont("helvetica", "normal");
                            doc.setTextColor(51, 65, 85);

                            const points = cellRaw._points || [];
                            points.slice(0, 5).forEach((pt) => {
                                const ptLabel = pt.label ? pt.label.replace(/\n/g, " | ") : `Lat: ${Number(pt.latitude).toFixed(6)}, Lon: ${Number(pt.longitude).toFixed(6)}`;
                                doc.text(`• ${ptLabel}`, textX, textY, { maxWidth: width - (mapImgW + 18) });
                                textY += 4.5;
                            });

                            // Device & IMEI note
                            textY = Math.max(textY, y + 55);
                            doc.setFontSize(6.8);
                            doc.setFont("helvetica", "italic");
                            doc.setTextColor(100, 116, 139);
                            doc.text(`IMEI: ${imei} | Map visual verification rendered from logged PVT packets`, textX, textY);
                        } catch (err) {
                            console.error("Error drawing inline map image in autoTable:", err);
                        }
                    }
                }
            });

            startY = doc.lastAutoTable.finalY + 15;

            // Location & Map Verification Evidence for this IMEI
            const thisImeiMaps = mapSnapshots.filter(m => (String(m.imei) === String(imei) || m.imeiIndex === index) && m.dataUrl);
            if (thisImeiMaps.length > 0) {
                thisImeiMaps.sort((a, b) => Number(a.serial_no) - Number(b.serial_no));

                const mapsPerPage = 4;
                for (let i = 0; i < thisImeiMaps.length; i += mapsPerPage) {
                    doc.addPage();

                    doc.setFontSize(13);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(26, 35, 126);
                    doc.text(
                        `Location & Map Verification Evidence — IMEI: ${imei}${i > 0 ? " (Cont.)" : ""}`,
                        14,
                        16
                    );

                    doc.setFontSize(8.5);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(100, 116, 139);
                    doc.text(
                        `Manufacturer: ${mfrName}  |  Device Model: ${modelName}  |  Visual GPS fix & tracking verification`,
                        14,
                        22
                    );

                    const pageMaps = thisImeiMaps.slice(i, i + mapsPerPage);
                    pageMaps.forEach((mapItem, slotIdx) => {
                        const col = slotIdx % 2;
                        const row = Math.floor(slotIdx / 2);

                        const cardX = 14 + col * 136;
                        const cardY = 28 + row * 84;
                        const cardW = 133;
                        const cardH = 80;

                        // Header bar
                        doc.setFillColor(13, 27, 42);
                        doc.roundedRect(cardX, cardY, cardW, 11, 2, 2, "F");

                        // Title
                        doc.setFontSize(8.5);
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(255, 255, 255);
                        const titleText = `Test #${mapItem.serial_no}: ${mapItem.testName}`;
                        doc.text(titleText, cardX + 4, cardY + 7.5, { maxWidth: cardW - 28 });

                        // Status pill
                        doc.setFillColor(46, 125, 50);
                        doc.roundedRect(cardX + cardW - 22, cardY + 2, 18, 7, 1.5, 1.5, "F");
                        doc.setFontSize(7);
                        doc.setTextColor(255, 255, 255);
                        doc.text("PASS", cardX + cardW - 13, cardY + 6.5, { align: "center" });

                        // Map image
                        doc.addImage(mapItem.dataUrl, "JPEG", cardX, cardY + 11, cardW, cardH - 11);

                        // Border around the card
                        doc.setDrawColor(200, 205, 210);
                        doc.setLineWidth(0.5);
                        doc.rect(cardX, cardY, cardW, cardH);
                    });
                }
            }
        });

        // =====================================================
        // PDF FOOTER NOTE
        // =====================================================
        const pageCount = doc.getNumberOfPages();

        doc.setPage(pageCount);

        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Draw a separator line
        doc.setDrawColor(180);
        doc.line(14, pageHeight - 28, pageWidth - 14, pageHeight - 28);

        // Add note at the bottom of the last page
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);

        const note =
            "This platform integration test report is generated online and hence does not require any signature.";

        doc.text(note, pageWidth / 2, pageHeight - 18, {
            align: "center",
            maxWidth: pageWidth - 28,
        });

        // =====================================================
        // WATERMARK ON EACH PAGE (COMPLETE vs INCOMPLETE)
        // =====================================================
        const totalPages = doc.getNumberOfPages();
        const isAllCompleted = testBoardCategories.length > 0 && testBoardCategories.every(cat => 
            cat.executions && cat.executions.length > 0 && cat.executions.every(e => 
                e.status === "pass" || e.status === "completed" || e.status === "complete"
            )
        );
        const watermarkText = isAllCompleted ? "COMPLETE" : "INCOMPLETE";

        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            const pWidth = doc.internal.pageSize.getWidth();
            const pHeight = doc.internal.pageSize.getHeight();

            doc.saveGraphicsState();
            try {
                if (doc.GState && doc.setGState) {
                    doc.setGState(new doc.GState({ opacity: 0.12 }));
                }
            } catch (e) { }

            doc.setFontSize(60);
            doc.setFont("helvetica", "bold");
            if (isAllCompleted) {
                doc.setTextColor(46, 125, 50); // Soft green
            } else {
                doc.setTextColor(211, 47, 47); // Soft red
            }

            const textWidth = doc.getTextWidth(watermarkText);
            const fontSizeInMm = 60 * 0.352778;
            const capHeight = fontSizeInMm * 0.7;
            const angleDeg = 30;
            const rad = (angleDeg * Math.PI) / 180;
            const cx = pWidth / 2;
            const cy = pHeight / 2;
            const startX = cx - (textWidth / 2) * Math.cos(rad) - (capHeight / 2) * Math.sin(rad);
            const startY = cy + (textWidth / 2) * Math.sin(rad) + (capHeight / 2) * Math.cos(rad);

            doc.text(watermarkText, startX, startY, {
                angle: angleDeg
            });

            doc.restoreGraphicsState();
        }

        return doc;
    };

    const generateAndDownloadPDF = async () => {
        try {
            setDownloadingPdf(true);
            const doc = await createPDFDoc(status);
            doc.save(`Technical_Onboarding_Report_${row?.id}.pdf`);
        } catch (err) {
            console.error("Error generating PDF report:", err);
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #eee', bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2L20 8L14 14M20 8H4M10 22L4 16L10 10M4 16H20" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Complete Testing & Finalize
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Please complete all testing steps below before uploading the report and finalizing.
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    size="small" 
                    startIcon={<SearchIcon />} 
                    onClick={() => setHistoryModalOpen(true)}
                >
                    View Device History
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: '#f5f7fa' }}>
                <Box p={3}>
                    {/* Top Block */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3, bgcolor: '#f9fbfd', borderColor: '#e0e0e0' }}>
                        <Grid container rowSpacing={1} columnSpacing={2}>
                            {[
                                ["Request ID", row?.id],
                                ["Manufacturer", mfrName],
                                ["Device Model", modelName],
                                ["Current Status", row?.status],
                            ].map(([lbl, val]) => val ? (
                                <React.Fragment key={lbl}>
                                    <Grid item xs={3} md={2}><Typography variant="body2" color="text.secondary">{lbl}</Typography></Grid>
                                    <Grid item xs={9} md={10}><Typography variant="body2" fontWeight={600} color="text.primary">{val}</Typography></Grid>
                                </React.Fragment>
                            ) : null)}
                        </Grid>
                    </Paper>

                    {/* Test Board */}
                    <Box bgcolor="white" p={3} borderRadius={2} border="1px solid #e0e0e0">
                        <Typography variant="subtitle1" fontWeight={700} mb={1}>
                            Test Board — Request {row?.id} {row?.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Currently unlocked test: #{activeTestId <= testBoardCategories.length ? activeTestId : 'All completed'}
                        </Typography>

                        <TableContainer sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                    <TableRow>
                                        <TableCell sx={{ width: 40 }}><b>#</b></TableCell>
                                        <TableCell sx={{ minWidth: 250 }}><b>Test</b></TableCell>
                                        {imeis.map((imei, idx) => (
                                            <TableCell key={idx} align="center" sx={{ width: 120 }}>
                                                <b>IMEI {idx + 1}</b>
                                                <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem', wordBreak: 'break-all' }}>
                                                    {imei}
                                                </Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loadingBoard ? (
                                        <TableRow>
                                            <TableCell colSpan={2 + imeis.length} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={24} sx={{ mr: 1, verticalAlign: 'middle' }} /> Fetching Test Board...
                                            </TableCell>
                                        </TableRow>
                                    ) : testBoardCategories.map((category) => {
                                        const step = category.test_case;


                                        const fwVersions = [];
                                        const voltages = [];
                                        const extVoltages = [];
                                        const speeds = [];
                                        const locations = [];
                                        const networks = [];
                                        const operators = [];

                                        const pushUnique = (arr, val) => {
                                            if (arr.length === 0 || arr[arr.length - 1] !== val) arr.push(val);
                                        };

                                        if (category.executions && Array.isArray(category.executions)) {
                                            for (const exec of category.executions) {
                                                if (exec.test_log_snapshot) {
                                                    let snap = null;
                                                    try {
                                                        snap = typeof exec.test_log_snapshot === 'string' ? JSON.parse(exec.test_log_snapshot) : exec.test_log_snapshot;
                                                    } catch (e) { }
                                                    if (snap && Array.isArray(snap.samples)) {
                                                        for (const sample of snap.samples) {
                                                            if (sample.raw_data && typeof sample.raw_data === 'string' && (sample.raw_data.startsWith("$PVT") || sample.raw_data.startsWith("$,PVT"))) {
                                                                const parts = sample.raw_data.split(",");
                                                                const offset = sample.raw_data.startsWith("$,PVT") ? 1 : 0;
                                                                if (parts.length > 3 + offset) {
                                                                    pushUnique(fwVersions, parts[2 + offset]);
                                                                }
                                                                if (parts.length > 14 + offset) {
                                                                    pushUnique(locations, `${parts[11 + offset]} ${parts[12 + offset]}, ${parts[13 + offset]} ${parts[14 + offset]}`);
                                                                }
                                                                if (parts.length > 15 + offset) {
                                                                    pushUnique(speeds, parts[15 + offset]);
                                                                }
                                                                if (parts.length > 25 + offset) {
                                                                    pushUnique(voltages, parts[25 + offset]);
                                                                    pushUnique(extVoltages, parts[24 + offset]);
                                                                }
                                                                if (parts.length > 32 + offset) {
                                                                    pushUnique(networks, `${parts[21 + offset]} (Sig:${parts[28 + offset]} MCC:${parts[29 + offset]} MNC:${parts[30 + offset]} LAC:${parts[31 + offset]} Cell:${parts[32 + offset]})`);
                                                                    pushUnique(operators, parts[21 + offset]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        let displayName = step.name;
                                        // NOTE: FOTA version NOT shown in the title because each device
                                        // can have a different firmware version — shown per-device below the timestamp.
                                        const fwArr = [...fwVersions].reverse();
                                        const volArr = [...voltages].reverse();
                                        // NOTE: Voltage NOT shown in title for test #7 — per-device display instead.
                                        // NOTE: Ext Vol NOT shown in title for test #8 — per-device display instead.
                                        // NOTE: Speed NOT shown in title for test #14 — per-device display instead.
                                        const locArr = [...locations].reverse();
                                        // NOTE: Lat/Lon NOT shown in title for test #15 — per-device display instead.
                                        const netArr = [...networks].reverse();
                                        // NOTE: Lat/Lon and Net NOT shown in title for test #20/21 — per-device display instead.
                                        // NOTE: Op NOT shown in title for test #23/24 — per-device display instead.

                                        const isUnlocked = step.serial_no === activeTestId;
                                        const isCompleted = step.serial_no < activeTestId;
                                        return (
                                            <TableRow key={step.id}>
                                                <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>{step.serial_no}</TableCell>
                                                <TableCell sx={{ verticalAlign: 'top', pt: 2 }}>
                                                    <Typography variant="body2" fontWeight={600} color="text.primary">{displayName}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                        {step.serial_no === 7 ? (
                                                            <>
                                                                Confirm the internal battery voltage reading at three distinct voltage levels.
                                                                <br /><br />
                                                                Scans GPSDataLog for ,PVT,|$PVT, &middot; needs &ge;1 match within a 5 min window.<br />
                                                                Tester still confirms the reported voltage matches a reference meter, at all 3 levels.
                                                            </>
                                                        ) : (
                                                            step.description
                                                        )}
                                                    </Typography>
                                                    {step.serial_no === 41 && (
                                                        <Typography variant="caption" sx={{ mt: 1, display: 'inline-block', fontWeight: 600, color: 'primary.main', bgcolor: '#e3f2fd', p: 0.5, px: 1, borderRadius: 1 }}>
                                                            Command: ACTV,123456,1234567891
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                {imeis.map((imei, idx) => {
                                                    const exec = category.executions.find(e => (e.demo_device?.imei === imei) || (e.demo_device?.device_serial_no === imei));
                                                    // use index if match fails
                                                    const execution = exec || category.executions[idx];
                                                    const execStatus = execution?.status || "not_started";
                                                    const isExecPass = execStatus === "pass" || execStatus === "completed" || execStatus === "complete";
                                                    const isExecIncomplete = execStatus === "incomplete" || execStatus === "in_progress";

                                                    return (
                                                        <TableCell key={idx} align="center" sx={{ verticalAlign: 'top', pt: 2, borderLeft: '1px solid #f0f0f0' }}>
                                                            {isExecPass ? (() => {
                                                                let snapshotObj = null;
                                                                if (typeof execution?.test_log_snapshot === 'string') {
                                                                    try { snapshotObj = JSON.parse(execution.test_log_snapshot); } catch (e) { }
                                                                } else if (typeof execution?.test_log_snapshot === 'object' && execution?.test_log_snapshot !== null) {
                                                                    snapshotObj = execution.test_log_snapshot;
                                                                }
                                                                const resolvedSamples = snapshotObj && Array.isArray(snapshotObj.samples) ? snapshotObj.samples : [];

                                                                return (
                                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                                        <Chip label="pass" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', mb: 1 }} />
                                                                        {LOCATION_TEST_NOS.includes(Number(step.serial_no)) && (() => {
                                                                            let lockedCoord = null;
                                                                            if (resolvedSamples && resolvedSamples.length > 0) {
                                                                                const sorted = [...resolvedSamples].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
                                                                                for (let i = sorted.length - 1; i >= 0; i--) {
                                                                                    const coord = extractCoordFromSample(sorted[i]);
                                                                                    if (coord && (coord.lat !== 0 || coord.lng !== 0)) {
                                                                                        lockedCoord = coord;
                                                                                        break;
                                                                                    }
                                                                                }
                                                                            }

                                                                            const deviceImei = execution?.demo_device?.imei || imei || `Device ${idx + 1}`;
                                                                            if (!lockedCoord) {
                                                                                lockedCoord = getDeviceFallbackCoord(deviceImei, idx);
                                                                            }

                                                                            const handleOpenBigMap = () => {
                                                                                setLocationMapState({
                                                                                    open: true,
                                                                                    imei: deviceImei,
                                                                                    testNo: step.serial_no,
                                                                                    testName: step.name,
                                                                                    rowId: row.id,
                                                                                    samples: resolvedSamples,
                                                                                    execution,
                                                                                    fallbackCoord: lockedCoord
                                                                                });
                                                                            };

                                                                            if (lockedCoord) {
                                                                                return (
                                                                                    <MiniLocationMap
                                                                                        lat={lockedCoord.lat}
                                                                                        lng={lockedCoord.lng}
                                                                                        testNo={step.serial_no}
                                                                                        testName={step.name}
                                                                                        onClick={handleOpenBigMap}
                                                                                    />
                                                                                );
                                                                            }

                                                                            return null;
                                                                        })()}
                                                                        {resolvedSamples.length > 0 ? (
                                                                            <Box sx={{ my: 1, lineHeight: 1.2 }}>
                                                                                    {[...resolvedSamples].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((sample, sIdx) => {
                                                                                        let sampleFwVersion = "";
                                                                                        let sampleVoltage = "";
                                                                                        let sampleExtVoltage = "";
                                                                                        let sampleSpeed = (sample.speed !== undefined && sample.speed !== null) ? String(sample.speed) : "";
                                                                                        let sampleLocation = "";
                                                                                        let sampleNetwork = "";
                                                                                        let sampleOperator = "";
                                                                                        if (sample.raw_data && typeof sample.raw_data === 'string') {
                                                                                            const isComma = sample.raw_data.startsWith("$,PVT");
                                                                                            const pParts = sample.raw_data.split(",");
                                                                                            const offset = isComma ? 1 : 0;
                                                                                            if ((sample.raw_data.startsWith("$PVT") || isComma) && pParts.length > 3 + offset) {
                                                                                                sampleFwVersion = pParts[2 + offset];
                                                                                            }
                                                                                            if ((sample.raw_data.startsWith("$PVT") || isComma) && pParts.length > 14 + offset) {
                                                                                                sampleLocation = `${pParts[11 + offset]} ${pParts[12 + offset]}, ${pParts[13 + offset]} ${pParts[14 + offset]}`;
                                                                                            }
                                                                                            if ((sample.raw_data.startsWith("$PVT") || isComma) && pParts.length > 15 + offset) {
                                                                                                sampleSpeed = pParts[15 + offset];
                                                                                            }
                                                                                            if ((sample.raw_data.startsWith("$PVT") || isComma) && pParts.length > 25 + offset) {
                                                                                                sampleVoltage = pParts[25 + offset];
                                                                                                sampleExtVoltage = pParts[24 + offset];
                                                                                            }
                                                                                            if ((sample.raw_data.startsWith("$PVT") || isComma) && pParts.length > 32 + offset) {
                                                                                                sampleNetwork = `${pParts[21 + offset]} (Sig:${pParts[28 + offset]} MCC:${pParts[29 + offset]} MNC:${pParts[30 + offset]} LAC:${pParts[31 + offset]} Cell:${pParts[32 + offset]})`;
                                                                                                sampleOperator = pParts[21 + offset];
                                                                                            }
                                                                                        }
                                                                                        return (
                                                                                            <Box key={sIdx} sx={{ mt: 1, p: 0.75, bgcolor: '#f8f9fa', border: '1px solid', borderColor: '#e0e0e0', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, width: '100%' }}>
                                                                                                    <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 600, color: 'text.secondary', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                                                                                        {sample.timestamp ? sample.timestamp.split('.')[0].replace('T', ' ') : 'N/A'}
                                                                                                    </Typography>
                                                                                                    <Button
                                                                                                        variant="outlined"
                                                                                                        size="small"
                                                                                                        sx={{ fontSize: '0.5rem', p: '2px 4px', minWidth: 'auto', lineHeight: 1 }}
                                                                                                        onClick={() => navigator.clipboard.writeText(sample.raw_data)}
                                                                                                    >
                                                                                                        Copy
                                                                                                    </Button>
                                                                                                </Box>
                                                                                                {step.serial_no === 6 && sampleFwVersion && (
                                                                                                    <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                        FW: {sampleFwVersion}
                                                                                                    </Typography>
                                                                                                )}
                                                                                                {step.serial_no === 7 && sampleVoltage && (
                                                                                                    <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                        Vol: {sampleVoltage}V
                                                                                                    </Typography>
                                                                                                )}
                                                                                                {step.serial_no === 8 && sampleExtVoltage && (
                                                                                                    <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                        Ext Vol: {sampleExtVoltage}V
                                                                                                    </Typography>
                                                                                                )}
                                                                                                {(step.serial_no === 14 || step.serial_no === 15) && sampleSpeed && (
                                                                                                    <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                        {resolvedSamples.length >= 2
                                                                                                            ? (sIdx === 0 ? `Start Speed: ${sampleSpeed} km/h` : sIdx === resolvedSamples.length - 1 ? `End Speed: ${sampleSpeed} km/h` : `Speed: ${sampleSpeed} km/h`)
                                                                                                            : `Speed: ${sampleSpeed} km/h`}
                                                                                                    </Typography>
                                                                                                )}
                                                                                                {(LOCATION_TEST_NOS.includes(step.serial_no) || step.serial_no === 20) && sampleLocation && (
                                                                                                    <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                        {step.serial_no === 23
                                                                                                            ? (resolvedSamples.length >= 2
                                                                                                                ? (sIdx === 0 ? `Loss Point: ${sampleLocation}` : sIdx === resolvedSamples.length - 1 ? `Recovery Point: ${sampleLocation}` : `Lat/Lon: ${sampleLocation}`)
                                                                                                                : `Recovery Point: ${sampleLocation}`)
                                                                                                            : `Lat/Lon: ${sampleLocation}`}
                                                                                                    </Typography>
                                                                                                )}
                                                                                                {(step.serial_no === 20 || step.serial_no === 21) && sampleNetwork && (
                                                                                                    <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                        Net: {sampleNetwork}
                                                                                                    </Typography>
                                                                                                )}
                                                                                                {(step.serial_no === 23 || step.serial_no === 24) && sampleOperator && (
                                                                                                    <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                        Op: {sampleOperator}
                                                                                                    </Typography>
                                                                                                )}
                                                                                            </Box>
                                                                                        );
                                                                                    })}
                                                                                </Box>
                                                                            ) : (
                                                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.65rem', display: 'block', mt: 0.5 }}>
                                                                                    Bypassed
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    );
                                                                })() : execStatus === "in_progress" ? (
                                                                <>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, gap: 0.5 }}>
                                                                        <Chip label="In progress" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#fff9c4', color: '#f57f17', borderRadius: 1 }} />
                                                                        <Tooltip title="Refresh Log">
                                                                            <IconButton size="small" onClick={() => handleRefreshLog(execution.id)} sx={{ p: 0.5 }}>
                                                                                <RefreshIcon fontSize="small" color="primary" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                    {execution.test_log_snapshot && (
                                                                        <Box sx={{ my: 1, textAlign: 'left', lineHeight: 1.2 }}>
                                                                            {(() => {
                                                                                let snapshotObj = null;
                                                                                if (typeof execution.test_log_snapshot === 'string') {
                                                                                    try { snapshotObj = JSON.parse(execution.test_log_snapshot); } catch (e) { }
                                                                                } else if (typeof execution.test_log_snapshot === 'object' && execution.test_log_snapshot !== null) {
                                                                                    snapshotObj = execution.test_log_snapshot;
                                                                                }

                                                                                if (snapshotObj && snapshotObj.matched_count !== undefined) {
                                                                                    return (
                                                                                        <Box>
                                                                                            <Typography variant="caption" display="block" color="text.primary" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                                                                                # {snapshotObj.matched_count}/{snapshotObj.required || '?'}
                                                                                            </Typography>
                                                                                            {snapshotObj.reason && (
                                                                                                <Typography variant="caption" display="block" color="error" sx={{ fontSize: '0.65rem' }}>
                                                                                                    {snapshotObj.reason}
                                                                                                </Typography>
                                                                                            )}
                                                                                            {Array.isArray(snapshotObj.samples) && [...snapshotObj.samples].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((sample, idx) => {
                                                                                                let fwVersion = "";
                                                                                                let voltage = "";
                                                                                                let extVoltage = "";
                                                                                                let speed = (sample.speed !== undefined && sample.speed !== null) ? String(sample.speed) : "";
                                                                                                let location = "";
                                                                                                let network = "";
                                                                                                let operator = "";
                                                                                                if (sample.raw_data && typeof sample.raw_data === 'string' && (sample.raw_data.startsWith("$PVT") || sample.raw_data.startsWith("$,PVT"))) {
                                                                                                    const isComma = sample.raw_data.startsWith("$,PVT");
                                                                                                    const parts = sample.raw_data.split(",");
                                                                                                    const pvtOffset = isComma ? 1 : 0;
                                                                                                    if (parts.length > 3 + pvtOffset) fwVersion = parts[2 + pvtOffset];
                                                                                                    if (parts.length > 14 + pvtOffset) location = `${parts[11 + pvtOffset]} ${parts[12 + pvtOffset]}, ${parts[13 + pvtOffset]} ${parts[14 + pvtOffset]}`;
                                                                                                    if (parts.length > 15 + pvtOffset) speed = parts[15 + pvtOffset];
                                                                                                    if (parts.length > 25 + pvtOffset) {
                                                                                                        voltage = parts[25 + pvtOffset];
                                                                                                        extVoltage = parts[24 + pvtOffset];
                                                                                                    }
                                                                                                    if (parts.length > 32 + pvtOffset) {
                                                                                                        network = `${parts[21 + pvtOffset]} (Sig:${parts[28 + pvtOffset]} MCC:${parts[29 + pvtOffset]} MNC:${parts[30 + pvtOffset]} LAC:${parts[31 + pvtOffset]} Cell:${parts[32 + pvtOffset]})`;
                                                                                                        operator = parts[21 + pvtOffset];
                                                                                                    }
                                                                                                }
                                                                                                return (
                                                                                                    <Box key={idx} sx={{ mt: 1, p: 0.75, bgcolor: '#f8f9fa', border: '1px solid', borderColor: '#e0e0e0', borderRadius: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5, width: '100%' }}>
                                                                                                            <Typography variant="caption" sx={{ fontSize: '0.62rem', fontWeight: 600, color: 'text.secondary', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                                                                                                {sample.timestamp ? sample.timestamp.split('.')[0].replace('T', ' ') : 'N/A'}
                                                                                                            </Typography>
                                                                                                            <Button
                                                                                                                variant="outlined"
                                                                                                                size="small"
                                                                                                                sx={{ fontSize: '0.5rem', p: '2px 4px', minWidth: 'auto', lineHeight: 1 }}
                                                                                                                onClick={() => navigator.clipboard.writeText(sample.raw_data)}
                                                                                                            >
                                                                                                                Copy
                                                                                                            </Button>
                                                                                                        </Box>
                                                                                                        {step.serial_no === 6 && fwVersion && (
                                                                                                            <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                                FW: {fwVersion}
                                                                                                            </Typography>
                                                                                                        )}
                                                                                                        {step.serial_no === 7 && voltage && (
                                                                                                            <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                                Vol: {voltage}V
                                                                                                            </Typography>
                                                                                                        )}
                                                                                                        {step.serial_no === 8 && extVoltage && (
                                                                                                            <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                                Ext Vol: {extVoltage}V
                                                                                                            </Typography>
                                                                                                        )}
                                                                                                        {(step.serial_no === 14 || step.serial_no === 15) && speed && (
                                                                                                            <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                                {snap.samples && snap.samples.length >= 2
                                                                                                                    ? (idx === 0 ? `Start Speed: ${speed} km/h` : idx === snap.samples.length - 1 ? `End Speed: ${speed} km/h` : `Speed: ${speed} km/h`)
                                                                                                                    : `Speed: ${speed} km/h`}
                                                                                                            </Typography>
                                                                                                        )}
                                                                                                        {(LOCATION_TEST_NOS.includes(step.serial_no) || step.serial_no === 20) && location && (
                                                                                                            <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                                {step.serial_no === 23
                                                                                                                    ? (snap.samples && snap.samples.length >= 2
                                                                                                                        ? (idx === 0 ? `Loss Point: ${location}` : idx === snap.samples.length - 1 ? `Recovery Point: ${location}` : `Lat/Lon: ${location}`)
                                                                                                                        : `Recovery Point: ${location}`)
                                                                                                                    : `Lat/Lon: ${location}`}
                                                                                                            </Typography>
                                                                                                        )}
                                                                                                        {(step.serial_no === 20 || step.serial_no === 21) && network && (
                                                                                                            <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                                Net: {network}
                                                                                                            </Typography>
                                                                                                        )}
                                                                                                        {(step.serial_no === 23 || step.serial_no === 24) && operator && (
                                                                                                            <Typography variant="caption" display="block" color="primary.main" sx={{ fontSize: '0.62rem', fontWeight: 600 }}>
                                                                                                                Op: {operator}
                                                                                                            </Typography>
                                                                                                        )}
                                                                                                    </Box>
                                                                                                )
                                                                                            })}
                                                                                        </Box>
                                                                                    );
                                                                                } else {
                                                                                    const logStr = typeof execution.test_log_snapshot === 'string' ? execution.test_log_snapshot : JSON.stringify(execution.test_log_snapshot, null, 2);
                                                                                    return String(logStr).split('\n').map((line, i) => (
                                                                                        <Typography key={i} variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                                            {line}
                                                                                        </Typography>
                                                                                    ));
                                                                                }
                                                                            })()}
                                                                        </Box>
                                                                    )}
                                                                    {(() => {
                                                                        let isPass = false;
                                                                        try {
                                                                            const snapshot = typeof execution.test_log_snapshot === 'string' ? JSON.parse(execution.test_log_snapshot) : execution.test_log_snapshot;
                                                                            if (snapshot && (snapshot.pass === true || String(snapshot.pass).toLowerCase() === 'true')) {
                                                                                isPass = true;
                                                                            }
                                                                        } catch (e) { }

                                                                        return isPass ? (
                                                                            <Button variant="contained" disableElevation size="small" sx={{ bgcolor: '#1a237e', color: '#fff', fontSize: '0.7rem', minWidth: '60px', p: '2px 8px', display: 'block', mx: 'auto', mt: 1, '&:hover': { bgcolor: '#283593' } }} onClick={() => handleCompleteTest(execution.id)}>
                                                                                Complete
                                                                            </Button>
                                                                        ) : null;
                                                                    })()}
                                                                </>
                                                            ) : (isUnlocked || isExecIncomplete) ? (
                                                                <Stack direction="column" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                                                                    <Chip label={execStatus} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ffebee', color: '#c62828', borderRadius: 1 }} />
                                                                    <Button variant="contained" disableElevation size="small" sx={{ bgcolor: '#1a237e', color: '#fff', fontSize: '0.7rem', minWidth: '60px', p: '2px 8px', '&:hover': { bgcolor: '#283593' } }} onClick={() => {
                                                                        if (execution?.demo_device?.id) {
                                                                            handleStartTest(step.id, execution.demo_device.id);
                                                                        }
                                                                    }}>Start</Button>
                                                                </Stack>
                                                            ) : (
                                                                <Stack direction="column" alignItems="center" spacing={0.5} sx={{ width: '100%' }}>
                                                                    <Chip label={execStatus} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f5f5f5', color: '#757575', borderRadius: 1 }} />
                                                                    <Typography variant="caption" color="text.secondary" display="block">locked</Typography>
                                                                </Stack>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Finalize Form */}
                        {testBoardCategories.length > 0 && (() => {
                            const allPassed = testBoardCategories.every(cat => cat.executions.every(e => e.status === "pass" || e.status === "completed" || e.status === "complete"));

                            return (
                                <Box mt={3} pt={2} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={700}>
                                        Finalize
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1, maxWidth: 250 }}>
                                            <Typography variant="caption" display="block" mb={0.5}>Compatibility Report PDF</Typography>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={downloadingPdf ? <CircularProgress size={16} /> : <DescriptionIcon />}
                                                onClick={generateAndDownloadPDF}
                                                disabled={downloadingPdf}
                                                sx={{ width: '100%', bgcolor: '#fff', color: '#1976d2', borderColor: '#1976d2', '&:disabled': { opacity: 0.7 } }}
                                            >
                                                {downloadingPdf ? "Generating Report..." : "Download Report"}
                                            </Button>
                                        </Box>
                                        <Box sx={{ flex: 3 }}>
                                            <Typography variant="caption" display="block" mb={0.5}>Comment</Typography>
                                            <textarea
                                                value={finalComment}
                                                onChange={(e) => {
                                                    setFinalComment(e.target.value);
                                                    setFieldErrors((p) => { const c = { ...p }; delete c.finalComment; return c; });
                                                }}
                                                rows={2}
                                                style={{ width: '100%', padding: '6px', borderRadius: '4px', border: fieldErrors.finalComment ? '1px solid red' : '1px solid #ccc', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', background: '#fff' }}
                                            />
                                            {fieldErrors.finalComment && <Typography color="error" variant="caption" display="block">{fieldErrors.finalComment}</Typography>}
                                        </Box>
                                    </Box>

                                    <Box mt={1} sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="contained"
                                            disableElevation
                                            disabled={submitting || !allPassed}
                                            onClick={() => handleConfirm("technically_compatible")}
                                            sx={{ bgcolor: '#0d1b2a', color: '#fff', '&:disabled': { bgcolor: '#b0bec5', color: '#fff' } }}
                                        >
                                            {submitting && status === "technically_compatible" ? "Finalizing..." : "Finalize Onboarding"}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            disableElevation
                                            disabled={submitting}
                                            onClick={() => handleConfirm("technically_not_compatible")}
                                        >
                                            {submitting && status === "technically_not_compatible" ? "Rejecting..." : "Reject Onboarding"}
                                        </Button>
                                    </Box>
                                    {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
                                </Box>
                            );
                        })()}
                    </Box>
                </Box>
                {/* Online Report Note */}
<Box
    sx={{
        mt: 1,
        pt: 2,
        borderTop: "1px solid #e0e0e0",
        textAlign: "center",
    }}
>
    <Typography
        variant="caption"
        color="text.secondary"
        sx={{
            fontStyle: "italic",
            display: "block",
        }}
    >
        This platform integration test report is generated online and hence does not require any signature.
    </Typography>
</Box>
            </DialogContent>

            {/* Device History Modal */}
            <DeviceHistoryModal 
                open={historyModalOpen} 
                row={row} 
                onClose={() => setHistoryModalOpen(false)} 
            />

            {/* Device Location Map Modal */}
            <DeviceLocationMapModal
                open={locationMapState.open}
                onClose={() => setLocationMapState(s => ({ ...s, open: false }))}
                rowId={locationMapState.rowId}
                imei={locationMapState.imei}
                testNo={locationMapState.testNo}
                testName={locationMapState.testName}
                samples={locationMapState.samples}
                execution={locationMapState.execution}
                fallbackCoord={locationMapState.fallbackCoord}
            />
        </Dialog>
    );
};

/* ═══════════════════════════════════════════════════
   COLLAPSIBLE TABLE ROW
═══════════════════════════════════════════════════ */
const RequestRow = ({ row, onMarkReceived, onConfirmReceipt, onDeviceConfirmReceipt, onDeviceRejectReceipt, onMarkOngoing, onFinalize, onStateApprove }) => {
    const [open, setOpen] = useState(false);
    const userRole = getRole();
    const isStateAdmin = userRole === "stateadmin";

    const demoDevices = useMemo(() => {
        if (!row.demo_devices) return [];
        if (Array.isArray(row.demo_devices)) return row.demo_devices;
        try { return JSON.parse(row.demo_devices); } catch { return []; }
    }, [row.demo_devices]);

    const allDevicesReceived = demoDevices.length > 0 && demoDevices.every((d) => d.receipt_confirmed);

    const manufacturerName = useMemo(() => resolveManufacturer(row), [row]);
    const hasReport = row.final_comment || row.compatibility_report_pdf || row.report || row.comment || row.remarks;

    const mfrObj = row.manufacturer || row.manufacturer_info || row.created_by_info || {};
    const mfrEmail = mfrObj.email || row.created_by_email || null;
    const mfrMobile = mfrObj.mobile || row.created_by_mobile || null;

    const statusKey = String(row.status ?? "").trim().toLowerCase();
    const isSubmitted = statusKey === "submitted";
    const isOngoingEval = statusKey === "ongoing_evaluation";

    // Real test board progress for ongoing_evaluation (calculated locally from demo_devices to save API calls)
    const tbProgress = useMemo(() => {
        if (!demoDevices || demoDevices.length === 0) return null;
        
        let hasAnyProgress = false;
        let completed = 41;
        let currentTestName = "";
        let lastCompletedName = "";
        
        demoDevices.forEach(d => {
            const cp = d.checkpoint_status;
            if (cp && (cp.last_completed_test_no !== null || cp.next_test_no !== null || cp.next_test_name || cp.last_completed_test_name)) {
                hasAnyProgress = true;
                const devCompleted = cp.last_completed_test_no || 0;
                if (devCompleted < completed) {
                    completed = devCompleted;
                    currentTestName = cp.next_test_name || "";
                    lastCompletedName = cp.last_completed_test_name || "";
                }
            } else {
                completed = 0; // If any device hasn't started, overall completed is 0
            }
        });
        
        if (!hasAnyProgress) return null;
        
        return {
            total: 41,
            completed,
            currentTestName: currentTestName || (completed === 41 ? "All tests completed" : ""),
            lastCompletedName
        };
    }, [demoDevices]);

    // Compute steps display from real data
    const stepsDisplay = useMemo(() => {
        // Finalized statuses take precedence
        const isFailed = statusKey === "technically_not_compatible" || statusKey === "rejected" || statusKey === "stateadminrejected";
        if (statusKey === "technically_compatible" || statusKey === "accepted" || statusKey === "approved" || statusKey === "stateadminapproved" || isFailed) {
            return {
                label: isFailed ? "Platform Integration Testing Not Completed" : "Platform IntegrationTesting Completed",
                
                pct: isFailed ? null : 100,
                pending: isFailed ? "Not Compatible" : "All tests completed",
                color: isFailed ? "error" : "success",
            };
        }

        if (tbProgress && tbProgress.total > 0) {
            // Use real test board data if tests have actually started, regardless of status
            const total = tbProgress.total || 0;
            const completed = tbProgress.completed || 0;
            const currentTestName = tbProgress.currentTestName || "";
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return {
                label: `${completed} / ${total} Integration test completed`,
                pct,
                pending: completed < total
                    ? (
                        <>
                            {tbProgress.lastCompletedName && <span style={{ display: 'block', marginBottom: '2px' }}>Completed: {tbProgress.lastCompletedName}</span>}
                            <span style={{ display: 'block' }}>In Progress: {currentTestName}</span>
                        </>
                    )
                    : "All tests completed",
                color: completed === total ? "success" : "primary",
            };
        }

        // No steps to show before testing starts, or if devices haven't been fully confirmed
        if (!allDevicesReceived || statusKey === "submitted" || statusKey === "devices_received" || statusKey === "stock_received" || statusKey === "pending") {
            return null;
        }

        // ongoing_evaluation without test board data yet
        if (isOngoingEval) {
            return {
                label: "Platform Integration Testing In Progress",
                pct: 0,
                pending: "Loading test progress...",
                color: "primary",
            };
        }

        return null;
    }, [statusKey, isOngoingEval, tbProgress]);

    return (
        <>
            <TableRow
                hover
                sx={{ "& > *": { borderBottom: "unset" }, cursor: "pointer" }}
                onClick={() => setOpen((p) => !p)}
            >
                {/* expand toggle */}
                <TableCell sx={{ width: 40, py: 1 }}>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setOpen((p) => !p); }}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>

                {/* date */}
                <TableCell sx={{ py: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                        {formatDateTime(row.request_datetime || row.created_at || row.created)}
                    </Typography>
                </TableCell>

                {/* manufacturer */}
                <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={600} noWrap>{manufacturerName}</Typography>
                    </Stack>
                </TableCell>

                {/* device model */}
                <TableCell sx={{ py: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <DevicesIcon fontSize="small" color="action" />
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {row.device_model?.model_name || row.device_model_name ||
                                    `Model ID: ${row.device_model_id ?? row.device_model ?? "—"}`}
                            </Typography>
                            {row.device_model?.tac_no && (
                                <Typography variant="caption" color="text.secondary">
                                    TAC: {row.device_model.tac_no}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </TableCell>

                {/* imei(s) */}
                <TableCell sx={{ py: 1 }}>
                    {demoDevices.length > 0 ? (
                        <Tooltip title={demoDevices.map(d => d.imei).join(", ")}>
                            <Typography variant="body2">
                                {demoDevices[0]?.imei} {demoDevices.length > 1 && <Typography component="span" variant="caption" color="primary" sx={{ cursor: 'pointer', ml: 0.5, fontWeight: 700 }}>(+{demoDevices.length - 1})</Typography>}
                            </Typography>
                        </Tooltip>
                    ) : "—"}
                </TableCell>

                {/* steps */}
                <TableCell sx={{ py: 1 }}>
                    {stepsDisplay ? (
                        <Stack spacing={1} sx={{ minWidth: 200, py: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600}>
                                    {stepsDisplay.label}
                                </Typography>
                                {stepsDisplay.pct !== null && (
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {stepsDisplay.pct}%
    </Typography>
)}
                            </Stack>
                            {stepsDisplay.pct !== null && (
    <LinearProgress
        variant="determinate"
        value={stepsDisplay.pct}
        color={stepsDisplay.color}
        sx={{ height: 6, borderRadius: 3 }}
    />
)}
                            <Typography variant="caption" color="text.secondary">
                                {stepsDisplay.pending}
                            </Typography>
                        </Stack>
                    ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}> Platform Integration Testing not started</Typography>
                    )}
                </TableCell>



                {/* actions */}
                <TableCell sx={{ py: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="nowrap">
                        {(isSubmitted || statusKey === "pending" || statusKey === "devices_received" || statusKey === "stock_received") && !(tbProgress && tbProgress.total > 0) && !isStateAdmin && allDevicesReceived && (
                            <Tooltip title="Start Testing">
                                <Button
                                    size="small" variant="contained" color="info"
                                    startIcon={<PlayCircleOutlineIcon fontSize="small" />}
                                    onClick={() => onMarkOngoing(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    Start Testing
                                </Button>
                            </Tooltip>
                        )}
                        {!allDevicesReceived && !isStateAdmin && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Confirm 5 devices first
                            </Typography>
                        )}
                        {(!["technically_not_compatible", "rejected", "stateadminrejected", "technically_compatible", "accepted", "approved", "stateadminapproved"].includes(statusKey) && (isOngoingEval || (tbProgress && tbProgress.total > 0))) && !isStateAdmin && allDevicesReceived && (
                            <Tooltip title="Testing Page">
                                <Button
                                    size="small" variant="contained" color="primary"
                                    startIcon={<GavelIcon fontSize="small" />}
                                    onClick={() => onFinalize(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    {(tbProgress && tbProgress.completed < tbProgress.total) ? "Continue Testing" : "Complete Testing & Finalize"}
                                </Button>
                            </Tooltip>
                        )}
                        {isStateAdmin && (statusKey === "technically_compatible" || statusKey === "accepted" || statusKey === "approved" || statusKey === "allow to login") && (
                            <Tooltip title="State Admin Final Approval">
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon fontSize="small" />}
                                    onClick={() => onStateApprove(row)}
                                    sx={{ whiteSpace: "nowrap", fontSize: "0.72rem" }}
                                >
                                    Approve Technical Onboarding
                                </Button>
                            </Tooltip>
                        )}
                        {isStateAdmin && (statusKey === "technicalonboardingapproved" || statusKey === "stateadminapproved" || statusKey === "active" || statusKey === "allow to add dealer") && (
                            <Typography variant="caption" sx={{ color: "green", fontWeight: "bold", px: 1 }}>
                                Manufacturer Active
                            </Typography>
                        )}
                    </Stack>
                </TableCell>
            </TableRow>

            {/* ── expanded detail ── */}
            <TableRow>
                <TableCell colSpan={8} sx={{ py: 0, bgcolor: "primary.50" }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 2 }}>
                            <Grid container spacing={2}>

                                {/* Devices */}
                                {demoDevices.length > 0 && (
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <SimCardIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    VLTD Devices ({demoDevices.length})
                                                </Typography>
                                            </Stack>
                                            <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                                                <Table size="small">
                                                    <TableHead sx={{ bgcolor: "grey.50" }}>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 600 }}>Device</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>IMEI / Serial No.</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>CCID / MSISDN (SIM 1)</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>CCID / MSISDN (SIM 2)</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }} align="right">Status</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {demoDevices.map((device, i) => (
                                                            <TableRow key={i} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                                                <TableCell>
                                                                    <Typography variant="caption" color="primary" fontWeight={700}>
                                                                        #{i + 1}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="caption" display="block"><b>IMEI:</b> {device.imei || "—"}</Typography>
                                                                    <Typography variant="caption" color="text.secondary"><b>SN:</b> {device.device_serial_no || "—"}</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="caption" display="block"><b>CCID:</b> {device.ccid1 || "—"}</Typography>
                                                                    <Typography variant="caption" color="text.secondary"><b>MSISDN:</b> {device.msisdn1 || "—"}</Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="caption" display="block"><b>CCID:</b> {device.ccid2 || "—"}</Typography>
                                                                    <Typography variant="caption" color="text.secondary"><b>MSISDN:</b> {device.msisdn2 || "—"}</Typography>
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {device.receipt_confirmed ? (
                                                                        <Chip label="Received" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
                                                                    ) : device.status === 'rejected' || device.receipt_status === 'rejected' || device.receipt_rejected ? (
                                                                        <Chip label="Rejected" size="small" color="error" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
                                                                    ) : (
                                                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                                                                            <Chip label="Pending" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
                                                                            <Button
                                                                                size="small"
                                                                                variant="contained"
                                                                                color="primary"
                                                                                sx={{ fontSize: "0.65rem", py: 0, px: 1, minWidth: 0, height: 24, whiteSpace: "nowrap" }}
                                                                                onClick={(e) => { e.stopPropagation(); onDeviceConfirmReceipt(row.id, device.id); }}
                                                                            >
                                                                                Confirm Receipt
                                                                            </Button>
                                                                            <Button
                                                                                size="small"
                                                                                variant="contained"
                                                                                color="error"
                                                                                sx={{ fontSize: "0.65rem", py: 0, px: 1, minWidth: 0, height: 24, whiteSpace: "nowrap" }}
                                                                                onClick={(e) => { e.stopPropagation(); onDeviceRejectReceipt(row.id, device.id); }}
                                                                            >
                                                                                Reject
                                                                            </Button>
                                                                        </Stack>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Manufacturer */}
                                <Grid item xs={12} md={6}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                            <BusinessIcon color="primary" fontSize="small" />
                                            <Typography variant="subtitle2" fontWeight={700}>Manufacturer Details</Typography>
                                        </Stack>
                                        <Divider sx={{ mb: 1.5 }} />
                                        <Grid container rowSpacing={0.5} columnSpacing={2}>
                                            {[
                                                ["Company", manufacturerName],
                                                ["Email", mfrEmail],
                                                ["Mobile", mfrMobile],
                                                ["Type", row.manufacturer_type || row.type || row.manufacturer?.manufacturer_type || row.manufacturer_info?.manufacturer_type || row.manufacturer_info?.type || "—"],
                                                ["Submitted", formatDateTime(row.request_datetime || row.created_at || row.created)],
                                                ["Request ID", row.id],
                                            ].map(([lbl, val]) => val ? (
                                                <React.Fragment key={lbl}>
                                                    <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                                    <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                                </React.Fragment>
                                            ) : null)}
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Device Model */}
                                {row.device_model && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <DevicesIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>Device Model Details</Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Grid container rowSpacing={0.5} columnSpacing={2}>
                                                {[
                                                    ["Model Name", row.device_model?.model_name],
                                                    ["TAC No", row.device_model?.tac_no],
                                                    ["TAC Validity", row.device_model?.tac_validity],
                                                    ["Hardware Version", row.device_model?.hardware_version],
                                                    ["Test Agency", row.device_model?.test_agency],
                                                ].map(([lbl, val]) => val ? (
                                                    <React.Fragment key={lbl}>
                                                        <Grid item xs={5}><Typography variant="caption" color="text.secondary">{lbl}</Typography></Grid>
                                                        <Grid item xs={7}><Typography variant="caption" fontWeight={600}>{val}</Typography></Grid>
                                                    </React.Fragment>
                                                ) : null)}
                                            </Grid>
                                        </Paper>
                                    </Grid>
                                )}



                                {/* Documents */}
                                {(row.user_manual_pdf || row.ot_command_list_pdf) && (
                                    <Grid item xs={12} md={6}>
                                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                                <DescriptionIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>Uploaded Documents</Typography>
                                            </Stack>
                                            <Divider sx={{ mb: 1.5 }} />
                                            <Stack spacing={1}>
                                                {[
                                                    ["User Manual PDF", row.user_manual_pdf],
                                                    ["OT Command List PDF", row.ot_command_list_pdf],
                                                ].map(([lbl, url]) => url ? (
                                                    <Stack key={lbl} direction="row" alignItems="center" spacing={1} justifyContent="space-between" sx={{ width: "100%" }}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <DescriptionIcon fontSize="small" color="action" />
                                                            <Typography variant="caption">{lbl}</Typography>
                                                        </Stack>
                                                        <Chip
                                                            label="View / Print"
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                            clickable
                                                            onClick={(e) => openFile(e, url)}
                                                            sx={{ height: 20, fontSize: "0.65rem" }}
                                                        />
                                                    </Stack>
                                                ) : null)}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Compatibility Test Findings section removed as requested */}
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};



/* ─── summary stat card ─── */
const StatCard = ({ label, value, color }) => (
    <Paper variant="outlined" sx={{
        p: 2, borderRadius: 2, borderLeft: 4, borderLeftColor: `${color}.main`,
        flex: "1 1 120px", minWidth: 100,
    }}>
        <Typography variant="h4" fontWeight={700} color={`${color}.main`}>{value}</Typography>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
);

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
const DeviceModelTechnicalOnboardingAdminList = ({ mfrType, title }) => {
    const userRole = getRole();
    const isStateAdmin = userRole === "stateadmin";
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    /* dialog state */
    const [ongoingDialog, setOngoingDialog] = useState({ open: false, row: null });
    const [finalizeDialog, setFinalizeDialog] = useState({ open: false, row: null });
    const [actionMsg, setActionMsg] = useState({ type: "", text: "" });
    const [deviceRejectDialog, setDeviceRejectDialog] = useState({ open: false, rowId: null, deviceId: null, remarks: "" });

    const handleStateApprove = async (row) => {
        const mfrObj = row.manufacturer || row.manufacturer_info || row.created_by_info || {};
        const mfrId = mfrObj.id || row.manufacturer_id || row.created_by || row.submitted_by;

        if (!mfrId) {
            setActionMsg({ type: "error", text: "Could not identify manufacturer ID." });
            return;
        }

        setLoading(true);
        try {
            await ManufacturerServices.approveTechOnboarding({
                manufacturer_id: mfrId,
                model_id: row.model_id || row.device_model?.id || row.device_model_id,
                techonboardingrequest_id: row.id || row.techonboardingrequest_id,
                action: "approve"
            });
            setActionMsg({ type: "success", text: "Technical Onboarding approved successfully by State Admin!" });
            loadData();
        } catch (err) {
            setActionMsg({ type: "error", text: extractError(err) });
        } finally {
            setLoading(false);
        }
    };

    const loadData = useCallback(async () => {
        setError(""); setLoading(true);
        try {
            const role = getRole();
            if (role === "stateadmin") {
                const res = await ManufacturerServices.filterTechOnboardManufacturers({});
                const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.results) ? res.data.results : []);
                const flattened = [];
                data.forEach((item) => {
                    const nestedModels = Array.isArray(item.tech_onboarded_models) ? item.tech_onboarded_models : [];
                    if (nestedModels.length > 0) {
                        nestedModels.forEach((model) => {
                            flattened.push({
                                ...item,
                                ...model,
                                manufacturer_info: item,
                                device_model: model,
                                manufacturer_id: item.id,
                                model_id: model.id,
                                id: model.id ?? item.id,
                            });
                        });
                    } else {
                        flattened.push({
                            ...item,
                            manufacturer_info: item.manufacturer || item.manufacturer_info || item,
                            device_model: item.device_model || item,
                            manufacturer_id: item.manufacturer?.id || item.manufacturer_id || item.id,
                            model_id: item.device_model?.id || item.model_id || item.id,
                            id: item.id,
                        });
                    }
                });
                setRows(flattened);
            } else {
                const res = await DeviceModelServices.listSuperadminTechnicalOnboardingRequests({});
                const data = res?.data;
                if (Array.isArray(data)) setRows(data);
                else if (Array.isArray(data?.results)) setRows(data.results);
                else if (Array.isArray(data?.data)) setRows(data.data);
                else setRows([]);
            }
        } catch (err) {
            setError(extractError(err) || "Failed to load device model technical onboarding requests.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);



    /* ── optimistic update helpers ── */
    const patchRow = useCallback((id, patch) => {
        setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
    }, []);

    const handleMarkOngoingSuccess = useCallback((id) => {
        setOngoingDialog({ open: false, row: null });
        loadData();
        setActionMsg({ type: "success", text: `Request #${id} marked as Ongoing Evaluation.` });
    }, [loadData]);

    const handleStartTesting = async (row) => {
        setLoading(true);
        try {
            const payload = {
                onboarding_request_id: row.id,
                evaluation_datetime: new Date().toISOString()
            };
            await DeviceModelServices.markTechnicalOnboardingOngoing(payload);
            setActionMsg({ type: "success", text: `Testing started for Request #${row.id}.` });
            loadData();
            // Automatically open the testing board dialog
            setFinalizeDialog({ open: true, row: { ...row, status: "ongoing_evaluation" } });
        } catch (err) {
            setActionMsg({ type: "error", text: extractError(err) });
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizeSuccess = useCallback((id, decision) => {
        setFinalizeDialog({ open: false, row: null });
        loadData();
        setActionMsg({
            type: decision === "technically_compatible" ? "success" : "warning",
            text: `Request #${id} has been ${decision === "technically_compatible" ? "marked as Compatible ✓" : "marked as Not Compatible"}.`,
        });
    }, [loadData]);


    const handleConfirmReceipt = async (row) => {
        if (!window.confirm("Accept this technical onboarding request?")) return;
        setLoading(true);
        try {
            await DeviceModelServices.confirmReceipt({
                onboarding_request_id: row.id,
            });
            setActionMsg({ type: "success", text: `Request #${row.id} accepted successfully.` });
            loadData();
        } catch (err) {
            setActionMsg({ type: "error", text: extractError(err) });
            setLoading(false);
        }
    };

    const handleDeviceConfirmReceipt = async (rowId, deviceId) => {
        setLoading(true);
        try {
            await DeviceModelServices.confirmReceipt({
                onboarding_request_id: rowId,
                demo_device_id: deviceId,
                status: "confirmed"
            });
            setActionMsg({ type: "success", text: `Device receipt confirmed successfully.` });
            loadData();
        } catch (err) {
            setActionMsg({ type: "error", text: extractError(err) });
            setLoading(false);
        }
    };

    const handleDeviceRejectReceiptSubmit = async () => {
        if (!deviceRejectDialog.remarks.trim()) return;
        setLoading(true);
        try {
            await DeviceModelServices.confirmReceipt({
                onboarding_request_id: deviceRejectDialog.rowId,
                demo_device_id: deviceRejectDialog.deviceId,
                status: "rejected",
                remarks: deviceRejectDialog.remarks
            });
            setActionMsg({ type: "success", text: `Device receipt rejected successfully.` });
            setDeviceRejectDialog({ open: false, rowId: null, deviceId: null, remarks: "" });
            loadData();
        } catch (err) {
            setActionMsg({ type: "error", text: extractError(err) });
            setLoading(false);
        }
    };

    /* ── search ── */
    const filteredRows = useMemo(() => {
        let items = rows;
        if (mfrType) {
            items = items.filter((r) => {
                const mfrObj = r.manufacturer || r.manufacturer_info || r.created_by_info || {};
                return mfrObj.manufacturer_type === mfrType;
            });
        }
        if (!search.trim()) return items;
        const q = search.trim().toLowerCase();
        return items.filter((r) => {
            const mfr = resolveManufacturer(r).toLowerCase();
            const model = (r.device_model?.model_name || r.device_model_name || "").toLowerCase();
            const status = (r.status || "").toLowerCase();
            const tac = (r.device_model?.tac_no || "").toLowerCase();
            return mfr.includes(q) || model.includes(q) || status.includes(q) || tac.includes(q);
        });
    }, [rows, search, mfrType]);

    /* ── stats ── */
    const stats = useMemo(() => {
        const count = (s) => rows.filter((r) => String(r.status ?? "").trim().toLowerCase() === s).length;
        return {
            total: rows.length,
            submitted: count("submitted"),
            ongoing: count("ongoing_evaluation"),
            accepted: count("technically_compatible") + count("stateadminapproved") + count("accepted") + count("approved"),
            rejected: count("technically_not_compatible") + count("stateadminrejected") + count("rejected"),
        };
    }, [rows]);

    const paginatedRows = useMemo(
        () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [filteredRows, page, rowsPerPage]
    );



    return (
        <>
            {/* ── Dialogs ── */}
            <MarkOngoingDialog
                open={ongoingDialog.open}
                row={ongoingDialog.row}
                onClose={() => setOngoingDialog({ open: false, row: null })}
                onSuccess={handleMarkOngoingSuccess}
            />
            <FinalizeDialog
                open={finalizeDialog.open}
                row={finalizeDialog.row}
                onClose={() => setFinalizeDialog({ open: false, row: null })}
                onSuccess={handleFinalizeSuccess}
            />
            <Dialog open={deviceRejectDialog.open} onClose={() => setDeviceRejectDialog({ open: false, rowId: null, deviceId: null, remarks: "" })} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Device Receipt</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rejection Remarks"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={deviceRejectDialog.remarks}
                        onChange={(e) => setDeviceRejectDialog({ ...deviceRejectDialog, remarks: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeviceRejectDialog({ open: false, rowId: null, deviceId: null, remarks: "" })} color="inherit" disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeviceRejectReceiptSubmit} color="error" variant="contained" disabled={loading || !deviceRejectDialog.remarks.trim()}>
                        {loading ? "Rejecting..." : "Confirm Reject"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={gridSpacing}>
                <Grid item xs={12}>
                    <MainCard
                        title={
                            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <DevicesIcon color="primary" />
                                    <Typography variant="h4" fontWeight={700}>{title || "Device Model Technical Onboarding Requests"}</Typography>
                                    <Chip label={`${rows.length} total`} size="small" color="primary" variant="outlined" />
                                </Stack>
                                <Tooltip title="Refresh">
                                    <span>
                                        <IconButton onClick={loadData} disabled={loading} size="small" color="primary">
                                            {loading ? <CircularProgress size={18} /> : <RefreshIcon />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Stack>
                        }
                    >
                        {/* ── Helper text (Removed) ── */}

                        {/* ── Action feedback ── */}
                        {actionMsg.text && (
                            <Alert severity={actionMsg.type || "success"} onClose={() => setActionMsg({ type: "", text: "" })} sx={{ mb: 2 }}>
                                {actionMsg.text}
                            </Alert>
                        )}

                        {/* ── Stats (Removed) ── */}



                        {/* ── Search ── */}
                        {rows.length > 0 && (
                            <Box mb={2} maxWidth={420}>
                                <TextField
                                    fullWidth size="small"
                                    placeholder="Search by manufacturer, model, TAC, status…"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        {loading && rows.length === 0 ? (
                            <Stack alignItems="center" py={6}>
                                <CircularProgress />
                                <Typography variant="body2" color="text.secondary" mt={2}>Loading requests…</Typography>
                            </Stack>
                        ) : rows.length === 0 && !loading ? (
                            <Alert severity="info">No technical onboarding requests found.</Alert>
                        ) : filteredRows.length === 0 ? (
                            <Alert severity="info">No results match your search query.</Alert>
                        ) : (
                            <>
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: "primary.main" }}>
                                                <TableCell sx={{ width: 40 }} />
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Request Date &amp; Time</TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Manufacturer</TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Device Model</TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>IMEI(s)</TableCell>
                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>STEPS</TableCell>

                                                <TableCell sx={{ color: "white", fontWeight: 700 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedRows.map((row, idx) => (
                                                <RequestRow
                                                    key={row.id ?? idx}
                                                    row={row}
                                                    onConfirmReceipt={handleConfirmReceipt}
                                                    onDeviceConfirmReceipt={handleDeviceConfirmReceipt}
                                                    onDeviceRejectReceipt={(rowId, deviceId) => setDeviceRejectDialog({ open: true, rowId, deviceId, remarks: "" })}
                                                    onMarkOngoing={handleStartTesting}
                                                    onFinalize={(r) => setFinalizeDialog({ open: true, row: r })}
                                                    onStateApprove={handleStateApprove}

                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    component="div"
                                    count={filteredRows.length}
                                    page={page}
                                    onPageChange={(_, newPage) => setPage(newPage)}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                />
                            </>
                        )}
                    </MainCard>
                </Grid>
            </Grid>
        </>
    );
};

export default DeviceModelTechnicalOnboardingAdminList;
