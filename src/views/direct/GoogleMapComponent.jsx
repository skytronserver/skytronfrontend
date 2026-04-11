import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Circle
} from "@react-google-maps/api";

const GoogleMapComponent = ({
  gpsData = [],
  policeData = [],
  onVehicleClick,
  height = "500px",
  focusEntry,
  nmrArea
}) => {
  console.log("GPS DATA:", gpsData);
  console.log("POLICE DATA:", policeData);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [selected, setSelected] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const markerRefs = useRef({});
  const animationRefs = useRef({});
  const followRef = useRef(true);

  // ==============================
  //   SMOOTH ANIMATION
  // ==============================
  const animateMarker = (id, newPos) => {
    const marker = markerRefs.current[id];
    if (!marker) return;

    const start = marker.getPosition();
    if (!start) return;

    const startLat = start.lat();
    const startLng = start.lng();

    const deltaLat = newPos.lat - startLat;
    const deltaLng = newPos.lng - startLng;

    let step = 0;
    const steps = 30;

    if (animationRefs.current[id]) {
      cancelAnimationFrame(animationRefs.current[id]);
    }

    const animate = () => {
      step++;
      const progress = step / steps;

      const lat = startLat + deltaLat * progress;
      const lng = startLng + deltaLng * progress;

      marker.setPosition({ lat, lng });

      //  FOLLOW MAP
      if (followRef.current && focusEntry?.imei === id && mapRef) {
        mapRef.panTo({ lat, lng });
      }

      if (step < steps) {
        animationRefs.current[id] = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // ==============================
  // UPDATE MARKERS WITH ANIMATION
  // ==============================
  useEffect(() => {
    gpsData.forEach((item) => {
      const id = item.imei;
      const lat = Number(item.latitude);
      const lng = Number(item.longitude);

      if (!lat || !lng) return;

      if (markerRefs.current[id]) {
        animateMarker(id, { lat, lng });
      }
    });
  }, [gpsData]);

  // ==============================
  // USER INTERACTION
  // ==============================
  const handleUserInteraction = () => {
    followRef.current = false;
  };

  const enableFollow = () => {
    followRef.current = true;
  };

  // ==============================
  // ICON WITH ROTATION
  // ==============================
  const getIcon = (item) => {
    return {
      url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20),
      rotation: Number(item.heading || 0)
    };
  };

  // ==============================
  // CENTER
  // ==============================
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
    <>
      {/*  FOLLOW BUTTON */}
      <button
        onClick={enableFollow}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 999,
          padding: "8px 12px",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Follow Vehicle
      </button>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height }}
        center={center}
        zoom={15}
        onLoad={(map) => setMapRef(map)}
        onZoomChanged={handleUserInteraction}
        onDragStart={handleUserInteraction}
      >
        {/*  VEHICLES */}
        {gpsData.map((item) => {
          const lat = Number(item.latitude);
          const lng = Number(item.longitude);
          if (!lat || !lng) return null;

          return (
            <Marker
              key={item.imei}
              position={{ lat, lng }}
              icon={getIcon(item)}
              onLoad={(marker) => {
                markerRefs.current[item.imei] = marker;
              }}
              onClick={() => {
                setSelected(item);
                onVehicleClick && onVehicleClick(item);
              }}
            />
          );
        })}

        {/*  POLICE */}
        {policeData.map((item, i) => (
          <Marker
            key={i}
            position={{
              lat: Number(item.latitude),
              lng: Number(item.longitude)
            }}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            }}
          />
        ))}

        {/* NMR */}
        {nmrArea && (
          <Circle
            center={{
              lat: Number(nmrArea.latitude),
              lng: Number(nmrArea.longitude)
            }}
            radius={nmrArea.radiusKm * 1000}
          />
        )}

        {/*  INFO */}
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
              <p>Status: {selected.packet_type}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  );
};

export default GoogleMapComponent;