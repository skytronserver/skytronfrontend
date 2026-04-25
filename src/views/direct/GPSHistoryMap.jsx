import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Polyline,
  useJsApiLoader,
  OverlayView
} from "@react-google-maps/api";
import axios from "axios";

const containerStyle = {
  width: "100%",
  height: "380px",
  borderRadius: "12px",
  overflow: "hidden"
};


/* ── design tokens ── */
const T = {
  accent: "#1e3a5f",
  blue: "#2563eb",
  blueGlow: "rgba(37,99,235,0.25)",
  text: "#1a2236",
  muted: "#64748b",
  bg: "#f0f2f5",
  card: "#ffffff",
  cardBorder: "#e2e5eb",
  radius: 12,
};

const Row = ({ label, value, green, red }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid #edf2f7",
      fontSize: 13
    }}
  >
    <span style={{ color: "#64748b", fontWeight: 600 }}>{label}</span>

    <span
      style={{
        fontWeight: 700,
        color: green ? "#16a34a" : red ? "#ef4444" : "#111827"
      }}
    >
      {value}
    </span>
  </div>
);

/* ── stat pill ── */
const Stat = ({ icon, label, value, color }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    padding: "8px 14px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    minWidth: 90,
    backdropFilter: "blur(4px)"
  }}>
    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
      {icon} {label}
    </span>
    <span style={{ fontSize: 15, fontWeight: 800, color: color || "#fff", marginTop: 2 }}>
      {value}
    </span>
  </div>
);

/* ── speed badge ── */
const SpeedBadge = ({ speed }) => {
  const moving = (+speed || 0) > 0;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px",
      borderRadius: 50,
      background: moving ? "rgba(22,163,74,0.18)" : "rgba(239,68,68,0.18)",
      border: `1px solid ${moving ? "rgba(22,163,74,0.4)" : "rgba(239,68,68,0.4)"}`,
      fontSize: 11, fontWeight: 700,
      color: moving ? "#16a34a" : "#ef4444"
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: moving ? "#16a34a" : "#ef4444",
        boxShadow: moving ? "0 0 6px #16a34a" : "0 0 6px #ef4444",
        display: "inline-block"
      }} />
      {moving ? "Moving" : "Stopped"}
    </div>
  );
};

const GoogleHistoryMap = ({
  startDateTime,
  endDateTime,
  vehicleRegistrationNumber,
  poi,
  owner,
  roads,
  polygon,
  onStatsUpdate
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [mapData, setMapData] = useState([]);
  const [currentPos, setCurrentPos] = useState(null);
  const [slider, setSlider] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const mapRef = useRef(null);
  const animationRef = useRef(null);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);
  const mapDataRef = useRef([]);
  const isValidPoint = (p) => {
    const lat = parseFloat(p?.lat);
    const lon = parseFloat(p?.lon);

    return (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat !== 0 &&
      lon !== 0
    );
  };

  const getTimeGapSec = (a, b) => {
    if (!a?.et || !b?.et) return 0;

    return Math.abs(
      (new Date(b.et).getTime() -
        new Date(a.et).getTime()) /
        1000
    );
  };


  /* ───────── VEHICLE COLOR ───────── */
  const getVehicleColor = (p) => {
    if (!p) return "#9ca3af";

    if (p.status === "offline" || p.is_offline) return "#9ca3af";
    if (p.alert === true) return "#ef4444";
    if ((p.s || 0) > 0) return "#22c55e";

    return "#ef4444";
  };

  const fillMissingWithGoogleRoute = async (rawData) => {
    if (!window.google || !rawData?.length) return rawData;

    const directionsService =
      new window.google.maps.DirectionsService();

    let final = [];

    for (let i = 0; i < rawData.length; i++) {
      const curr = rawData[i];

      if (i === 0) {
        if (isValidPoint(curr)) final.push(curr);
        continue;
      }

      const prevRaw = rawData[i - 1];

      const prev = final[final.length - 1];

      const currValid = isValidPoint(curr);
      const prevValid = isValidPoint(prevRaw);

      const timeGap = getTimeGapSec(prevRaw, curr);

      const needRouteFill =
        (!currValid && prev) ||
        (!prevValid && currValid && prev) ||
        (prev && currValid && timeGap > 15);

      /* ===============================================
         CASE:
         Need route API fill
      =============================================== */
      if (needRouteFill && prev && currValid) {
        try {
          const res = await directionsService.route({
            origin: {
              lat: parseFloat(prev.lat),
              lng: parseFloat(prev.lon)
            },
            destination: {
              lat: parseFloat(curr.lat),
              lng: parseFloat(curr.lon)
            },
            travelMode:
              window.google.maps.TravelMode.DRIVING
          });

          const route =
            res.routes?.[0]?.overview_path || [];

          if (route.length) {
            route.forEach((p, idx) => {
              if (idx === 0) return;

              final.push({
                ...curr,
                lat: p.lat(),
                lon: p.lng(),
                isFilled: true
              });
            });
          } else {
            final.push(curr);
          }
        } catch (err) {
          console.error("Route Fill Error:", err);
          final.push(curr);
        }
      } else {
        if (currValid) {
          final.push(curr);
        }
      }
    }

    return final;
  };


  /* ─── fetch ─── */
  const fetchData = async () => {
    try {
      const toUTC = (d) => new Date(d).toISOString().slice(0, 19);
      const res = await axios.get(
        `${process.env.REACT_APP_BASE_URL}api/gps_history_map_data/`,
        {
          params: {
            start_datetime: toUTC(startDateTime),
            end_datetime: toUTC(endDateTime),
            vehicle_registration_number: vehicleRegistrationNumber,
            poi, vehicle_owner: owner, roads, polygon
          },
          headers: { Authorization: `Token ${sessionStorage.getItem("oAuthToken")}` }
        }
      );
      // const data = res.data?.data || [];
      // setMapData(data);
      // mapDataRef.current = data;
      const raw = res.data?.data || [];

      const processed = await fillMissingWithGoogleRoute(raw);

      setMapData(processed);
      mapDataRef.current = processed;
      // if (processed.length) setCurrentPos({ lat: +processed[0].lat, lng: +processed[0].lon });
      if (processed.length) {
        const firstValid = processed.find(
          (p) =>
            parseFloat(p.lat) !== 0 &&
            parseFloat(p.lon) !== 0
        );

        if (firstValid) {
          setCurrentPos({
            lat: parseFloat(firstValid.lat),
            lng: parseFloat(firstValid.lon)
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (vehicleRegistrationNumber) fetchData();
  }, [vehicleRegistrationNumber, startDateTime, endDateTime]);

  /* ─── angle ─── */
  const getAngle = (p1, p2) => {
    if (!p1 || !p2) return 0;
    const dy = (p2.lat || 0) - (p1.lat || 0);
    const dx = (p2.lng || p2.lon || 0) - (p1.lng || p1.lon || 0);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  /* ─── animation ─── */
  const animate = () => {
    if (!isPlayingRef.current) return;
    const data = mapDataRef.current;
    if (!data.length) return;
    progressRef.current += 0.05 * speedRef.current;
    const i = Math.floor(progressRef.current);
    const next = i + 1;
    if (i >= data.length - 1) return handlePause();
    const c = data[i];
    const n = data[next];
    const t = progressRef.current - i;
    const lat = +c.lat + (+n.lat - +c.lat) * t;
    const lng = +c.lon + (+n.lon - +c.lon) * t;
    const pos = { lat, lng };
    setCurrentPos(pos);
    setSlider(progressRef.current);
    if (mapRef.current) mapRef.current.panTo(pos);
    animationRef.current = requestAnimationFrame(animate);
  };

  const handlePlay = () => {
    isPlayingRef.current = true;
    setIsPlaying(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  const handlePause = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    cancelAnimationFrame(animationRef.current);
  };

  const handleRestart = () => {
    progressRef.current = 0;
    setSlider(0);
    handlePlay();
  };

  const handleSlider = (e) => {
    const val = +e.target.value;
    progressRef.current = val;
    setSlider(val);
    const p = mapData[val];
    if (p) setCurrentPos({ lat: +p.lat, lng: +p.lon });
  };



  const currentIndex = Math.floor(slider);
  const currentData = mapData[currentIndex] || {};
  const totalPoints = mapData.length;
  const progressPct = totalPoints > 1 ? Math.round((currentIndex / (totalPoints - 1)) * 100) : 0;
  const vehicleColor = getVehicleColor(currentData);
  useEffect(() => {
    if (onStatsUpdate && currentData) {
      onStatsUpdate({
        speed: currentData.s || 0,
        progress: progressPct,
        time: currentData.et || null,
        sat: currentData.sat || 0,
        gps: currentData.gpsS || 0,
        network: currentData.no || "",
        ignition: currentData.igs || 0,
        battery: currentData.miv || "",
        internalBattery: currentData.ibv || "",
        owner:
          currentData?.device_tag_info?.vehicle_owner?.users?.[0]?.name || "",
        deviceId:
          currentData?.device_tag_info?.device || ""
      });
    }
  }, [currentIndex, progressPct]);

  const ignitionOn =
    Number(currentData?.s || 0) > 0 ||
    String(currentData?.igs) === "1";


  if (!isLoaded) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: 380, background: T.bg, borderRadius: T.radius,
      color: T.muted, fontWeight: 600, fontSize: 14, gap: 10
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill={T.blue}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      </svg>
      Loading Map…
    </div>
  );


  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 16,
          zIndex: 20,
          width: 250,
          background: "rgba(255,255,255,0.96)",
          borderRadius: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          border: "1px solid rgba(0,0,0,0.08)",
          overflow: "hidden",
          backdropFilter: "blur(10px)"
        }}
      >
        <div
          style={{
            background: "#1e3a5f",
            color: "#fff",
            padding: "10px 14px",
            fontWeight: 700,
            fontSize: 14
          }}
        >
          Device Info
        </div>

        <div style={{ padding: 12 }}>
          <Row label="🛰 Satellites" value={currentData?.sat || 0} />

          <Row
            label="📍 GPS"
            value={
              currentData?.gpsS === "1" ? "Connected" : "Offline"
            }
            green={currentData?.gpsS === "1"}
            red={currentData?.gpsS !== "1"}
          />

          <Row
            label="🔑 Ignition"
            value={ignitionOn ? "ON" : "OFF"}
            green={ignitionOn}
            red={!ignitionOn}
          />

          <Row
            label="🔋 Main Battery"
            value={`${currentData?.miv || "--"} V`}
          />

          <Row
            label="🔋 Internal"
            value={`${currentData?.ibv || "--"} V`}
          />

          <Row
            label="👤 Owner"
            value={
              currentData?.device_tag_info?.vehicle_owner?.users?.[0]
                ?.name || "--"
            }
          />
        </div>
      </div>

      

      {/* ── MAP ── */}

      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={(m) => (mapRef.current = m)}
        center={currentPos}
        zoom={14}
      >
        {/* Route polylines */}
        {mapData.map((p, i) => {
          if (i === 0) return null;
          const prev = mapData[i - 1];
          const spd = +p.s || 0;
          return (
            <Polyline
              key={i}
              path={[
                { lat: +prev.lat, lng: +prev.lon },
                { lat: +p.lat, lng: +p.lon }
              ]}
              options={{
                strokeColor: spd > 0 ? "#16a34a" : "#ef4444",
                strokeWeight: 4,
                strokeOpacity: 0.85
              }}
            />
          );
        })}

        {/* Vehicle marker */}
        {currentPos && (
          <OverlayView
            position={currentPos}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                width: 50,
                height: 50,
                position: "absolute",
                left: "-25px",
                top: "-25px",
                transform: `rotate(${getAngle(
                  mapData[currentIndex],
                  mapData[currentIndex + 1]
                )}deg)`,
                transformOrigin: "center center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <svg viewBox="0 0 64 64" width="44" height="44">
                <ellipse cx="32" cy="57" rx="13" ry="4" fill="rgba(0,0,0,0.22)" />
                {/* glow ring */}
                <circle cx="32" cy="30" r="22" fill="rgba(37,99,235,0.15)" />
                {/* body */}

                <rect x="18" y="8" width="28" height="48" rx="8" fill={vehicleColor} />                  {/* windows */}
                <rect x="21" y="12" width="22" height="14" rx="4" fill="rgba(147,197,253,0.7)" />
                {/* wheels */}
                <circle cx="16" cy="20" r="3.5" fill="#0f172a" />
                <circle cx="48" cy="20" r="3.5" fill="#0f172a" />
                <circle cx="16" cy="46" r="3.5" fill="#0f172a" />
                <circle cx="48" cy="46" r="3.5" fill="#0f172a" />
                {/* headlights */}
                <rect x="21" y="8" width="8" height="3" rx="1.5" fill="#fde68a" />
                <rect x="35" y="8" width="8" height="3" rx="1.5" fill="#fde68a" />
              </svg>
            </div>
          </OverlayView>
        )}
      </GoogleMap>


      {/* ── TIMELINE SLIDER ── */}
      <div style={{
        background: T.accent,
        padding: "14px 20px 12px",
        display: "flex",
        alignItems: "center",
        gap: 14
      }}>

        {/* start label */}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", minWidth: 55 }}>
          {mapData[0]?.et
            ? new Date(mapData[0].et).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "Start"}
        </span>
        <div
    style={{
      flex: 1,
      position: "relative",
      paddingTop: 26   // space for buttons above bar
    }}
  >

        {/* slider */}
        <div style={{position: "absolute",
        top: -8,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        zIndex: 10 }}>
                    {/* PLAY / PAUSE */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          style={{
            background: "#2563eb",
            border: "none",
            borderRadius: "50%",
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          {isPlaying ? (
            <svg width="14" height="14" fill="#fff">
              <rect x="2" y="2" width="4" height="10" />
              <rect x="8" y="2" width="4" height="10" />
            </svg>
          ) : (
            <svg width="14" height="14" fill="#fff">
              <polygon points="2,2 12,7 2,12" />
            </svg>
          )}
        </button>

        {/*  RESET */}
        <button
          onClick={handleRestart}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          <svg width="14" height="14" fill="#fff">
            <path d="M7 2v2a3 3 0 1 1-3 3H2a5 5 0 1 0 5-5z" />
          </svg>
        </button>
        </div>
          {/* progress fill bar */}
           <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute",
            left: 0, top: "50%",
            width: `${progressPct}%`,
            height: 4,
            background: T.blue,
            borderRadius: 4,
            transform: "translateY(-50%)",
            pointerEvents: "none",
            zIndex: 1,
            boxShadow: `0 0 8px ${T.blueGlow}`
          }} />
          <input
            type="range"
            min="0"
            max={mapData.length - 1 || 1}
            value={slider}
            onChange={handleSlider}
            style={{
              width: "100%",
              cursor: "pointer",
              accentColor: T.blue,
              background: "transparent",
              position: "relative",
              zIndex: 2
            }}
          />
        </div>
        </div>

        {/* end label */}
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap", minWidth: 34, textAlign: "right" }}>
          {mapData[mapData.length - 1]?.et
            ? new Date(mapData[mapData.length - 1].et).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "End"}
        </span>

        {/* progress % */}
        <span style={{
          fontSize: 11, fontWeight: 800, color: "#fff",
          minWidth: 36, textAlign: "right"
        }}>
          {progressPct}%
        </span>
        {/*  SPEED */}
        <select
          value={speed}
          onChange={(e) => {
            const v = +e.target.value;
            setSpeed(v);
            speedRef.current = v;
          }}
          style={{
            height: 26,
            borderRadius: 6,
            border: "none",
            padding: "0 6px",
            fontSize: 11
          }}
        >
          {[1, 5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default React.memo(GoogleHistoryMap);
