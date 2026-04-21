import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Circle,
  OverlayView,
  Polyline
} from "@react-google-maps/api";

const GoogleMapComponent = ({
  gpsData = [],
  policeData = [],
  onVehicleClick,
  height = "500px",
  focusEntry,
  nmrArea
}) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [selected, setSelected] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const markerRefs = useRef({});
  const animationRefs = useRef({});
  const followRef = useRef(true);
  const rotationRefs = useRef({});
  const pathQueue = useRef({});
  const routeHistory = useRef({}); // 🛣 route line

  // ==============================
  // SPEED BASED ANIMATION
  // ==============================
  const getStepsFromSpeed = (speed) => {
    if (speed > 60) return 15;
    if (speed > 30) return 25;
    if (speed > 10) return 35;
    return 45;
  };

  // ==============================
  // PLAY PATH (QUEUE)
  // ==============================
  const playPath = (id) => {
    const queue = pathQueue.current[id];
    const marker = markerRefs.current[id];

    if (!queue || queue.length < 2 || !marker) return;

    const start = queue.shift();
    const end = queue[0];

    if (!end) return;

    const speed = end.speed || 0;
    const steps = getStepsFromSpeed(speed);
    let step = 0;

    const deltaLat = end.lat - start.lat;
    const deltaLng = end.lng - start.lng;

    const animate = () => {
      step++;
      const progress = step / steps;

      const lat = start.lat + deltaLat * progress;
      const lng = start.lng + deltaLng * progress;

      marker.setPosition({ lat, lng });

      // add to route history
      if (!routeHistory.current[id]) {
        routeHistory.current[id] = [];
      }
      routeHistory.current[id].push({ lat, lng });

      if (routeHistory.current[id].length > 100) {
        routeHistory.current[id].shift();
      }

      // follow logic
      if (followRef.current && focusEntry?.imei === id && mapRef) {
        mapRef.panTo({ lat, lng });
      }

      if (step < steps) {
        animationRefs.current[id] = requestAnimationFrame(animate);
      } else {
        animationRefs.current[id] = null;

        if (queue.length > 1) {
          playPath(id);
        }
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
        speed: Number(item.speed || 0)
      });

      if (pathQueue.current[id].length > 5) {
        pathQueue.current[id].shift();
      }

      if (!animationRefs.current[id]) {
        playPath(id);
      }
    });
  }, [gpsData]);

  // ==============================
  // SMOOTH ROTATION
  // ==============================
  const getSmoothRotation = (id, newHeading) => {
    const prev = rotationRefs.current[id] || 0;
    let diff = newHeading - prev;

    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const smooth = prev + diff * 0.2;
    rotationRefs.current[id] = smooth;
    return smooth;
  };

  const center = useMemo(() => {
    if (focusEntry?.latitude && focusEntry?.longitude) {
      return {
        lat: Number(focusEntry.latitude),
        lng: Number(focusEntry.longitude)
      };
    }
    return { lat: 26.1445, lng: 91.7362 };
  }, [focusEntry]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height }}
      center={center}
      zoom={15}
      onLoad={(map) => setMapRef(map)}
      onZoomChanged={() => (followRef.current = false)}
      onDragStart={() => (followRef.current = false)}
    >
      {gpsData.map((item) => {
        const id = item.imei;
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);

        if (!lat || !lng) return null;

        const speed = Number(item.speed || 0);

        let color = "#9e9e9e";
        if (item.packet_type === "EA") color = "#ff0000";
        else if (speed > 5) color = "#00c853";
        else if (speed === 0) color = "#2962ff";

        return (
          <React.Fragment key={id}>

            {/*  Glow */}
            {speed > 5 && (
              <Circle
                center={{ lat, lng }}
                radius={40}
                options={{
                  fillColor: color,
                  fillOpacity: 0.12,
                  strokeColor: color,
                  strokeOpacity: 0.5
                }}
              />
            )}

            {/*  Hidden Marker */}
            <Marker
              position={{ lat, lng }}
              opacity={0}
              onLoad={(marker) => {
                markerRefs.current[id] = marker;
              }}
            />

            {/* Route Line */}
            {routeHistory.current[id] && (
              <Polyline
                path={routeHistory.current[id]}
                options={{
                  strokeColor: color,
                  strokeOpacity: 0.8,
                  strokeWeight: 3
                }}
              />
            )}

            {/*  Vehicle */}
            <OverlayView
              position={{ lat, lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                onClick={() => {
                  setSelected(item);
                  onVehicleClick && onVehicleClick(item);
                }}
                style={{
                  transform: `rotate(${getSmoothRotation(
                    id,
                    Number(item.heading || 0)
                  )}deg)`,
                  transformOrigin: "center",
                  width: "50px",
                  height: "50px"
                }}
              >
                <svg viewBox="0 0 64 64" width="42" height="42">
                  <ellipse cx="32" cy="56" rx="12" ry="4" fill="rgba(0,0,0,0.25)" />
                  <rect x="18" y="8" width="28" height="48" rx="8" fill={color} />
                  <circle cx="16" cy="18" r="3" fill="#111" />
                  <circle cx="48" cy="18" r="3" fill="#111" />
                  <circle cx="16" cy="46" r="3" fill="#111" />
                  <circle cx="48" cy="46" r="3" fill="#111" />
                </svg>
              </div>
            </OverlayView>
          </React.Fragment>
        );
      })}

      {/* INFO WINDOW */}
      {selected && (
        <InfoWindow
          position={{
            lat: Number(selected.latitude),
            lng: Number(selected.longitude)
          }}
          onCloseClick={() => setSelected(null)}
        >
          <div>
            <h4>{selected.vehicle_registration_number}</h4>
            <p>Speed: {selected.speed}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default GoogleMapComponent;