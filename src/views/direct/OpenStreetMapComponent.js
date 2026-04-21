import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline
} from "react-leaflet";
import L from "leaflet";

// ==============================
// FIX DEFAULT MARKER
// ==============================
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const OpenStreetMapComponent = ({
  gpsData = [],
  policeData = [],
  height = "500px",
  focusEntry,
  nmrArea,
  onVehicleClick
}) => {
  console.log("GPS:", gpsData);
  console.log("POLICE:", policeData);
  console.log("FOCUS:", focusEntry);
  const markerRefs = useRef({});
  const pathQueue = useRef({});
  const animationRefs = useRef({});
  const routeHistory = useRef({});
  const rotationRefs = useRef({});

  const center = focusEntry?.latitude
    ? [Number(focusEntry.latitude), Number(focusEntry.longitude)]
    : [26.1445, 91.7362];

  // ==============================
  // SPEED BASED STEPS
  // ==============================
  const getStepsFromSpeed = (speed) => {
    if (speed > 60) return 15;
    if (speed > 30) return 25;
    if (speed > 10) return 35;
    return 45;
  };

  // ==============================
  // SMOOTH ROTATION
  // ==============================
  const getSmoothRotation = (id, heading) => {
    const prev = rotationRefs.current[id] || 0;
    let diff = heading - prev;

    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const smooth = prev + diff * 0.2;
    rotationRefs.current[id] = smooth;
    return smooth;
  };

  // ==============================
  // CREATE VEHICLE ICON
  // ==============================
  const getVehicleIcon = (item) => {
    const speed = Number(item.speed || 0);

    let color = "#9e9e9e";
    if (item.packet_type === "EA") color = "#ff0000";
    else if (speed > 5) color = "#00c853";
    else if (speed === 0) color = "#2962ff";

    const rotation = getSmoothRotation(
      item.imei,
      Number(item.heading || 0)
    );

    return L.divIcon({
      className: "",
      html: `
        <div style="transform: rotate(${rotation}deg); width:40px;height:40px;">
          <svg viewBox="0 0 64 64" width="40" height="40">
            <ellipse cx="32" cy="56" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
            <rect x="18" y="8" width="28" height="48" rx="8" fill="${color}" />
            <circle cx="16" cy="18" r="3" fill="#111"/>
            <circle cx="48" cy="18" r="3" fill="#111"/>
            <circle cx="16" cy="46" r="3" fill="#111"/>
            <circle cx="48" cy="46" r="3" fill="#111"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // ==============================
  // PLAY PATH (SMOOTH MOVEMENT)
  // ==============================
  const playPath = (id) => {
    const queue = pathQueue.current[id];
    const marker = markerRefs.current[id];

    if (!queue || queue.length < 2 || !marker) return;

    const start = queue.shift();
    const end = queue[0];

    if (!end) return;

    const steps = getStepsFromSpeed(end.speed || 0);
    let step = 0;

    const deltaLat = end.lat - start.lat;
    const deltaLng = end.lng - start.lng;

    const animate = () => {
      step++;
      const progress = step / steps;

      const lat = start.lat + deltaLat * progress;
      const lng = start.lng + deltaLng * progress;

      marker.setLatLng([lat, lng]);

      // route history
      if (!routeHistory.current[id]) {
        routeHistory.current[id] = [];
      }
      routeHistory.current[id].push([lat, lng]);

      if (routeHistory.current[id].length > 100) {
        routeHistory.current[id].shift();
      }

      if (step < steps) {
        animationRefs.current[id] = requestAnimationFrame(animate);
      } else {
        animationRefs.current[id] = null;
        if (queue.length > 1) playPath(id);
      }
    };

    animate();
  };

  // ==============================
  // DATA HANDLING
  // ==============================
  useEffect(() => {
    gpsData.forEach((item) => {
      const id = item.imei;
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);

      if (!lat || !lng) return;

      if (!pathQueue.current[id]) {
        pathQueue.current[id] = [];
      }

      pathQueue.current[id].push({
        lat,
        lng,
        speed: Number(item.speed || 0),
      });

      if (pathQueue.current[id].length > 5) {
        pathQueue.current[id].shift();
      }

      if (!animationRefs.current[id]) {
        playPath(id);
      }
    });
  }, [gpsData]);

  return (
    <MapContainer center={center} zoom={13} style={{ height, width: "100%" }}>

      {/* TILE */}
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* VEHICLES */}
      {gpsData.map((item) => {
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);
        if (!lat || !lng) return null;

        const speed = Number(item.speed || 0);

        let color = "#9e9e9e";
        if (item.packet_type === "EA") color = "#ff0000";
        else if (speed > 5) color = "#00c853";
        else if (speed === 0) color = "#2962ff";

        return (
          <React.Fragment key={item.imei}>

            {/* GLOW */}
            {speed > 5 && (
              <Circle
                center={[lat, lng]}
                radius={40}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.1,
                }}
              />
            )}

            {/* ROUTE */}
            {routeHistory.current[item.imei] && (
              <Polyline
                positions={routeHistory.current[item.imei]}
                pathOptions={{ color }}
              />
            )}

            {/* MARKER */}
            <Marker
              position={[lat, lng]}
              icon={getVehicleIcon(item)}
              ref={(ref) => {
                if (ref) markerRefs.current[item.imei] = ref;
              }}
              eventHandlers={{
                click: () => onVehicleClick && onVehicleClick(item),
              }}
            >
              <Popup>
                <b>{item.vehicle_registration_number}</b>
                <br />
                Speed: {item.speed}
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}

      {/* POLICE */}
      {policeData.map((item, i) => (
        <Marker
          key={i}
          position={[
            Number(item.latitude),
            Number(item.longitude),
          ]}
        />
      ))}

      {/* NMR */}
      {nmrArea && (
        <Circle
          center={[
            Number(nmrArea.latitude),
            Number(nmrArea.longitude),
          ]}
          radius={nmrArea.radiusKm * 1000}
        />
      )}
    </MapContainer>
  );
};

export default OpenStreetMapComponent;