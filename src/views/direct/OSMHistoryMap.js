import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap
} from "react-leaflet";
import L from "leaflet";

/* ── TOKENS (EXACT MATCH) ── */
const T = {
  accent: "#1e3a5f",
  blue: "#2563eb",
  blueGlow: "rgba(37,99,235,0.35)"
};

const containerStyle = {
  width: "100%",
  height: "380px",
  borderRadius: "12px",
  overflow: "hidden"
};

/* ── AUTO FOLLOW ── */
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true });
  }, [position]);
  return null;
};

/* ===================== INFO ROW ===================== */
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
    <span style={{ color: "#64748b", fontWeight: 600 }}>
      {label}
    </span>

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

const OSMHistoryMap = ({ mapData = [], onStatsUpdate }) => {
  const [currentPos, setCurrentPos] = useState(() => {
    if (mapData && mapData.length > 0) {
      return [+mapData[0].lat, +mapData[0].lon];
    }
    return null;
  });
  const [slider, setSlider] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [angle, setAngle] = useState(0);

  const animationRef = useRef(null);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);
  const mapDataRef = useRef(mapData);

  const getStatus = (point) => {
    if (!point) return "offline";
    const speedVal = parseFloat(point.s || point.speed || 0); // Check both common keys
    if (speedVal > 0) return "moving";
    if (point.alert) return "alert";
    return "offline";
  };

  const toNum = (v) => Number(v);

  const isValidPoint = (p) => {
    const lat = toNum(p?.lat);
    const lon = toNum(p?.lon);

    return (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat !== 0 &&
      lon !== 0 &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  };

  const getOSRMRoute = async (curr, next) => {
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${curr.lon},${curr.lat};${next.lon},${next.lat}` +
        `?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const json = await res.json();

      return (
        json.routes?.[0]?.geometry?.coordinates?.map(
          ([lon, lat]) => ({
            lat,
            lon
          })
        ) || []
      );
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const repairMissingGps = async (mapData) => {
    if (!mapData.length) return [];

    let final = [];

    for (let i = 0; i < mapData.length; i++) {
      const curr = {
        ...mapData[i],
        lat: +mapData[i].lat,
        lon: +mapData[i].lon
      };

      /* valid point */
      if (isValidPoint(curr)) {
        final.push(curr);
        continue;
      }

      /* previous valid */
      const prev = [...final].reverse().find((p) =>
        isValidPoint(p)
      );

      /* next valid */
      let j = i + 1;

      while (
        j < mapData.length &&
        !isValidPoint({
          ...mapData[j],
          lat: +mapData[j].lat,
          lon: +mapData[j].lon
        })
      ) {
        j++;
      }

      const next =
        j < mapData.length
          ? {
              ...mapData[j],
              lat: +mapData[j].lat,
              lon: +mapData[j].lon
            }
          : null;

      if (prev && next) {
        let route = await getOSRMRoute(prev, next);

        if (!route.length) {
          route = [
            { lat: prev.lat, lon: prev.lon },
            { lat: next.lat, lon: next.lon }
          ];
        }

        const trimmed = route.slice(1, route.length - 1);
        const missingCount = j - i;

        for (let k = 0; k < missingCount; k++) {
          const rp =
            trimmed[
              Math.floor(
                (k / missingCount) * trimmed.length
              )
            ] || trimmed[trimmed.length - 1];

          final.push({
            ...curr,
            lat: rp.lat,
            lon: rp.lon,
            interpolated: true
          });
        }

        i = j - 1;
      } else if (prev) {
        final.push({
          ...curr,
          lat: prev.lat,
          lon: prev.lon,
          interpolated: true
        });
      }
    }

    return final;
  };


  // useEffect(() => {
  //   mapDataRef.current = mapData;
  //   if (mapData.length) {
  //     progressRef.current = 0;
  //     setSlider(0);
  //     setCurrentPos([+mapData[0].lat, +mapData[0].lon]);
  //   }
  // }, [mapData]);

  // useEffect(() => {
  //   mapDataRef.current = mapData;
  //   if (mapData.length > 0) {
  //     const firstPoint = mapData[0];
  //     const initialLatLon = [+firstPoint.lat, +firstPoint.lon];

  //     setCurrentPos(initialLatLon);
  //     setSlider(0);
  //     progressRef.current = 0;

  //     // Update parent stats so "0 km/h" and "0%" show immediately
  //     if (onStatsUpdate) {
  //       onStatsUpdate({
  //         speed: Math.round(firstPoint.s || firstPoint.speed || 0),
  //         progress: 0
  //       });
  //     }
  //   }
  // }, [mapData]); 

  useEffect(() => {
    const load = async () => {
      const mapDataFixed = await repairMissingGps(mapData);

      mapDataRef.current = mapDataFixed;

      if (mapDataFixed.length) {
        setCurrentPos([
          +mapDataFixed[0].lat,
          +mapDataFixed[0].lon
        ]);

        setSlider(0);
        progressRef.current = 0;

        if (onStatsUpdate) {
          onStatsUpdate({
            speed:
              Math.round(
                mapDataFixed[0].s ||
                  mapDataFixed[0].speed ||
                  0
              ),
            progress: 0
          });
        }
      }
    };

    load();
  }, [mapData]);


  useEffect(() => () => cancelAnimationFrame(animationRef.current), []);

  const getAngle = (p1, p2) => {
    const dy = p2.lat - p1.lat;
    const dx = p2.lon - p1.lon;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  // const createVehicleIcon = (angle = 0, status = "moving") => {
  //   // Determine color based on status
  //   let color = "#16a34a"; // Default Green (Moving)
  //   if (status === "alert") color = "#ef4444";  // Red
  //   if (status === "offline") color = "#64748b"; // Grey

  //   return new L.DivIcon({
  //     className: "",
  //     html: `
  //       <div style="transform: rotate(${angle}deg); transform-origin:center; transition: transform 0.2s linear;">
  //         <svg viewBox="0 0 64 64" width="44" height="44">
  //           <ellipse cx="32" cy="57" rx="13" ry="4" fill="rgba(0,0,0,0.22)" />
  //           <circle cx="32" cy="30" r="22" fill="${color}25" /> 
  //           <rect x="18" y="8" width="28" height="48" rx="8" fill="${color}" />
  //           <rect x="21" y="12" width="22" height="14" rx="4" fill="rgba(255,255,255,0.4)" />
  //           <circle cx="16" cy="20" r="3.5" fill="#0f172a" />
  //           <circle cx="48" cy="20" r="3.5" fill="#0f172a" />
  //         </svg>
  //       </div>
  //     `,
  //     iconSize: [44, 44]
  //   });
  // };
  const createVehicleIcon = (
    angle = 0,
    currentData
  ) => {
    let color = "#64748b";

    if (currentData?.interpolated)
      color = "#f59e0b";
    else if (+currentData?.s > 0)
      color = "#16a34a";
    else if (
      String(currentData?.igs) === "1"
    )
      color = "#2563eb";
    else color = "#ef4444";

    return new L.DivIcon({
      className: "",
      html: `
        <div style="transform:rotate(${angle}deg);transform-origin:center;">
          <svg viewBox="0 0 64 64" width="44" height="44">
            <ellipse cx="32" cy="57" rx="13" ry="4" fill="rgba(0,0,0,0.22)" />
            <circle cx="32" cy="30" r="22" fill="${color}25" />
            <rect x="18" y="8" width="28" height="48" rx="8" fill="${color}" />
            <rect x="21" y="12" width="22" height="14" rx="4" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>
      `,
      iconSize: [44, 44]
    });
  };


  /* ── ANIMATION ── */
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
    const lon = +c.lon + (+n.lon - +c.lon) * t;

    setAngle(getAngle(c, n));
    setCurrentPos([lat, lon]);
    setSlider(progressRef.current);

    if (onStatsUpdate) {
      onStatsUpdate({
        speed: Math.round(c.s || 0),
        progress: Math.round((i / (data.length - 1)) * 100)
      });
    }

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
    if (p) {
      setCurrentPos([+p.lat, +p.lon]);
      // 4. Update Parent Stats on slider drag
      if (onStatsUpdate) {
        onStatsUpdate({
          speed: Math.round(p.s || 0),
          progress: Math.round((val / (mapData.length - 1)) * 100)
        });
      }
    }
  };

  const currentIndex = Math.floor(slider);
  const currentData = mapData[currentIndex] || {};
  const total = mapData.length;
  const progressPct =
    total > 1 ? Math.round((currentIndex / (total - 1)) * 100) : 0;
  const ignitionOn =
    Number(currentData?.s || 0) > 0 ||
    String(currentData?.igs) === "1";

  return (
    <div style={{ position: "relative" }}>
      {/* LEFT PANEL SAME AS GOOGLE */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 16,
          zIndex: 1000,
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
              currentData?.gpsS === "1"
                ? "Connected"
                : "Offline"
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
              currentData?.device_tag_info?.vehicle_owner
                ?.users?.[0]?.name || "--"
            }
          />
        </div>
      </div>

      {/*  TOP CONTROLS */}
      <div style={topControls}>
        <button onClick={isPlaying ? handlePause : handlePlay} style={playBtn}>
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

        <button onClick={handleRestart} style={resetBtn}>
          <svg width="14" height="14" fill="#fff">
            <path d="M7 2v2a3 3 0 1 1-3 3H2a5 5 0 1 0 5-5z" />
          </svg>
        </button>
      </div>

      {/* MAP */}
      <MapContainer center={currentPos || [20.5937, 78.9629]} zoom={20} style={containerStyle}>
        <RecenterMap position={currentPos} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {mapData.map((p, i) => {
          if (i === 0) return null;
          const prev = mapData[i - 1];
          return (
            <Polyline
              key={i}
              positions={[
                [+prev.lat, +prev.lon],
                [+p.lat, +p.lon]
              ]}
              pathOptions={{
                color: +p.s > 0 ? "#16a34a" : "#ef4444",
                weight: 4,
                opacity: 0.85
              }}
            />
          );
        })}

        {currentPos && (
          <Marker position={currentPos} icon={createVehicleIcon(angle, getStatus(mapData[Math.floor(slider)]))} />
        )}
      </MapContainer>

      {/*  TIMELINE */}
      <div style={timeline}>
        <span style={timeLabel}>
          {mapData[0]?.et ? new Date(mapData[0].et).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Start"}
        </span>

        <div style={{ flex: 1, position: "relative" }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: "50%",
            width: `${progressPct}%`,
            height: 4,
            background: T.blue,
            transform: "translateY(-50%)",
            borderRadius: 4,
            boxShadow: `0 0 8px ${T.blueGlow}`
          }} />

          <input
            type="range"
            min="0"
            max={mapData.length - 1 || 1}
            value={slider}
            onChange={handleSlider}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        <span style={timeLabel}>
          {mapData[mapData.length - 1]?.et
            ? new Date(mapData[mapData.length - 1].et).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "End"}
        </span>

        <span style={percent}>{progressPct}%</span>

        <select
          value={speed}
          onChange={(e) => {
            const v = +e.target.value;
            setSpeed(v);
            speedRef.current = v;
          }}
          style={speedStyle}
        >
          {[1, 5, 10, 20, 50].map((s) => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </div>
    </div>
  );
};

/* ── STYLES ── */
const topControls = {
  position: "absolute",
  top: 16,
  right: 20,
  zIndex: 1000,
  display: "flex",
  gap: 8,
  background: "rgba(30,58,95,0.95)",
  padding: "6px 10px",
  borderRadius: 12
};

const playBtn = {
  background: "#2563eb",
  border: "none",
  borderRadius: "50%",
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};

const resetBtn = {
  background: "rgba(255,255,255,0.2)",
  border: "none",
  borderRadius: "50%",
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer"
};

const timeline = {
  background: "#1e3a5f",
  padding: "12px 20px",
  display: "flex",
  alignItems: "center",
  gap: 12
};

const timeLabel = {
  fontSize: 10,
  color: "rgba(255,255,255,0.6)",
  minWidth: 34
};

const percent = {
  fontSize: 11,
  fontWeight: 800,
  color: "#fff",
  minWidth: 36
};

const speedStyle = {
  height: 26,
  borderRadius: 6,
  border: "none",
  padding: "0 6px",
  fontSize: 11
};

export default OSMHistoryMap;