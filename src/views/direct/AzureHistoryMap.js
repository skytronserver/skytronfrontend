import React, { useEffect, useRef, useState } from "react";
import * as atlas from "azure-maps-control";
import "azure-maps-control/dist/atlas.min.css";

const containerStyle = {
  width: "100%",
  height: "380px",
  borderRadius: "12px",
  overflow: "hidden"
};

const AzureHistoryMap = ({ mapData = [], onStatsUpdate }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const datasourceRef = useRef(null);
  const markerRef = useRef(null);

  const animationRef = useRef(null);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);

  const [slider, setSlider] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  /* ─── INIT MAP ─── */
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = new atlas.Map(mapRef.current, {
      center: [78.9629, 20.5937],
      zoom: 5,
      authOptions: {
        authType: "subscriptionKey",
        subscriptionKey: process.env.REACT_APP_AZURE_MAP_KEY
      }
    });

    mapInstance.current.events.add("ready", () => {
      datasourceRef.current = new atlas.source.DataSource();
      mapInstance.current.sources.add(datasourceRef.current);

      mapInstance.current.layers.add(
        new atlas.layer.LineLayer(datasourceRef.current, null, {
          strokeWidth: 4,
          strokeColor: ["case", [">", ["get", "speed"], 0], "#16a34a", "#ef4444"]
        })
      );
    });

    return () => mapInstance.current?.dispose();
  }, []);

  /* ─── DRAW ROUTE ─── */
  useEffect(() => {
    if (!mapInstance.current || !mapData.length) return;

    datasourceRef.current.clear();

    const features = mapData.map((p, i) => {
      if (i === 0) return null;
      const prev = mapData[i - 1];

      return new atlas.data.Feature(
        new atlas.data.LineString([
          [prev.lon, prev.lat],
          [p.lon, p.lat]
        ]),
        { speed: p.s || 0 }
      );
    }).filter(Boolean);

    datasourceRef.current.add(features);

    // initial marker
    const first = mapData[0];
    markerRef.current = new atlas.HtmlMarker({
      position: [first.lon, first.lat],
      htmlContent: getVehicleHTML(0, "moving")
    });

    mapInstance.current.markers.add(markerRef.current);
  }, [mapData]);

  /* ─── VEHICLE ICON ─── */
  const getVehicleHTML = (angle = 0, status = "moving") => {
    let color = "#16a34a";
    if (status === "alert") color = "#ef4444";
    if (status === "offline") color = "#64748b";

    return `
      <div style="transform: rotate(${angle}deg);">
        <svg viewBox="0 0 64 64" width="44" height="44">
          <rect x="18" y="8" width="28" height="48" rx="8" fill="${color}" />
        </svg>
      </div>
    `;
  };

  const getAngle = (p1, p2) => {
    const dy = p2.lat - p1.lat;
    const dx = p2.lon - p1.lon;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  /* ─── ANIMATION ─── */
  const animate = () => {
    if (!isPlayingRef.current) return;

    const data = mapData;
    if (!data.length) return;

    progressRef.current += 0.05 * speedRef.current;

    const i = Math.floor(progressRef.current);
    const next = i + 1;

    if (i >= data.length - 1) return handlePause();

    const c = data[i];
    const n = data[next];
    const t = progressRef.current - i;

    const lat = c.lat + (n.lat - c.lat) * t;
    const lon = c.lon + (n.lon - c.lon) * t;

    const angle = getAngle(c, n);

    markerRef.current.setOptions({
      position: [lon, lat],
      htmlContent: getVehicleHTML(angle)
    });

    mapInstance.current.setCamera({
      center: [lon, lat]
    });

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
      markerRef.current.setOptions({
        position: [p.lon, p.lat]
      });
    }
  };

  const progressPct =
    mapData.length > 1
      ? Math.round((Math.floor(slider) / (mapData.length - 1)) * 100)
      : 0;

  return (
    <div style={{ position: "relative" }}>
      <div ref={mapRef} style={containerStyle} />

      {/* CONTROLS */}
      <div style={{ position: "absolute", top: 10, right: 10 }}>
        <button onClick={isPlaying ? handlePause : handlePlay}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={handleRestart}>Reset</button>
      </div>

      {/* SLIDER */}
      <input
        type="range"
        min="0"
        max={mapData.length - 1 || 1}
        value={slider}
        onChange={handleSlider}
        style={{ width: "100%" }}
      />

      <select
        value={speed}
        onChange={(e) => {
          const v = +e.target.value;
          setSpeed(v);
          speedRef.current = v;
        }}
      >
        {[1, 5, 10, 20].map((s) => (
          <option key={s}>{s}x</option>
        ))}
      </select>

      <div>{progressPct}%</div>
    </div>
  );
};

export default React.memo(AzureHistoryMap);