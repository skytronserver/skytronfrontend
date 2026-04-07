import React, { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Polyline,
  Marker,
  useJsApiLoader
} from "@react-google-maps/api";
import axios from "axios";

const containerStyle = {
  width: "100%",
  height: "600px",
  position: "relative"
};

const GoogleHistoryMap = ({
  startDateTime,
  endDateTime,
  vehicleRegistrationNumber,
  poi,
  owner,
  roads,
  polygon
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
  const hasFittedRef = useRef(false);

  // ================= FETCH =================
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
            poi,
            vehicle_owner: owner,
            roads,
            polygon
          },
          headers: {
            Authorization: `Token ${sessionStorage.getItem("oAuthToken")}`
          }
        }
      );

      const data = res.data?.data || [];
      setMapData(data);
      mapDataRef.current = data;
      hasFittedRef.current = false;

      if (data.length) {
        setCurrentPos({
          lat: +data[0].lat,
          lng: +data[0].lon
        });
      }

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (vehicleRegistrationNumber) fetchData();
  }, [vehicleRegistrationNumber, startDateTime, endDateTime]);

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // ================= FIT =================
  useEffect(() => {
    if (!mapRef.current || !window.google || hasFittedRef.current) return;

    const bounds = new window.google.maps.LatLngBounds();
    mapData.forEach(d =>
      bounds.extend({ lat: +d.lat, lng: +d.lon })
    );

    if (mapData.length) {
      mapRef.current.fitBounds(bounds);
      hasFittedRef.current = true;
    }
  }, [mapData]);

  // ================= ROTATION =================
  const getAngle = (p1, p2) => {
    const dy = p2.lat - p1.lat;
    const dx = p2.lng - p1.lng;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  // ================= ANIMATION =================
  const animate = () => {
    if (!isPlayingRef.current) return;

    const data = mapDataRef.current;
    if (!data.length) return;

    // ⭐ SPEED (avg 5 feel)
    progressRef.current += 0.05 * speedRef.current;

    const i = Math.floor(progressRef.current);
    const next = i + 1;

    if (i >= data.length - 1) return handlePause();

    const c = data[i];
    const n = data[next];

    // 🚀 offline jump
    const t1 = new Date(c.et).getTime();
    const t2 = new Date(n.et).getTime();
    if ((t2 - t1) / 60000 > 5) {
      progressRef.current = next;
      return requestAnimationFrame(animate);
    }

    const t = progressRef.current - i;

    const lat = +c.lat + (+n.lat - +c.lat) * t;
    const lng = +c.lon + (+n.lon - +c.lon) * t;

    const pos = { lat, lng };

    setCurrentPos(pos);
    setSlider(progressRef.current);

    if (mapRef.current) mapRef.current.panTo(pos);

    animationRef.current = requestAnimationFrame(animate);
  };

  // ================= CONTROLS =================
  const handlePlay = () => {
    if (!mapDataRef.current.length) return;
    cancelAnimationFrame(animationRef.current);
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

    const p = mapDataRef.current[val];
    if (p) setCurrentPos({ lat: +p.lat, lng: +p.lon });
  };

  if (!isLoaded) return <div>Loading...</div>;

  const currentIndex = Math.floor(slider);
  const currentData = mapData[currentIndex] || {};

  const angle =
    mapData[currentIndex + 1]
      ? getAngle(currentPos || {}, {
          lat: +mapData[currentIndex + 1]?.lat,
          lng: +mapData[currentIndex + 1]?.lon
        })
      : 0;

  return (
    <div style={{ position: "relative" }}>

      {/* CONTROLS */}
      <div style={{ marginBottom: 10 }}>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleRestart}>Restart</button>

        <input
          type="range"
          min="0"
          max={mapData.length - 1}
          value={slider}
          onChange={handleSlider}
        />

        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={speed}
          onChange={(e) => {
            const v = +e.target.value;
            setSpeed(v);
            speedRef.current = v;
          }}
        />
      </div>

      {/* MAP */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={(m) => (mapRef.current = m)}
        center={currentPos}
        zoom={14}
        options={{
          gestureHandling: "greedy",
          zoomControl: true
        }}
      >

        {/* ROUTE (color based) */}
        {mapData.map((p, i) => {
          if (i === 0) return null;
          const prev = mapData[i - 1];
          const speed = +p.s || 0;

          return (
            <Polyline
              key={i}
              path={[
                { lat: +prev.lat, lng: +prev.lon },
                { lat: +p.lat, lng: +p.lon }
              ]}
              options={{
                strokeColor: speed > 0 ? "#2e7d32" : "#d32f2f",
                strokeWeight: 4
              }}
            />
          );
        })}

        {/* ROTATING VEHICLE */}
        {currentPos && (
          <Marker
            position={currentPos}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 5,
              rotation: angle,
              fillColor: "#1976d2",
              fillOpacity: 1,
              strokeWeight: 1
            }}
          />
        )}
      </GoogleMap>

      {/* OVERLAY UI */}
      {currentData && (
        <div style={{
          position: "absolute",
          top: 80,
          left: 20,
          background: "#fff",
          padding: 12,
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
        }}>
          <b>{vehicleRegistrationNumber}</b>

          <div style={{
            marginTop: 5,
            color: (+currentData.s || 0) > 0 ? "green" : "blue"
          }}>
            {(+currentData.s || 0) > 0 ? "Moving" : "Stopped"}
          </div>

          <div>{currentData.s} km/h</div>
          <div>{currentData.et}</div>
        </div>
      )}
    </div>
  );
};

export default GoogleHistoryMap;