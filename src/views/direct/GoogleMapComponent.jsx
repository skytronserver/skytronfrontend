import React, { useMemo, useState, useEffect } from "react";
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

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [selected, setSelected] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  //  Center logic
  const center = useMemo(() => {
    if (focusEntry?.latitude && focusEntry?.longitude) {
      return {
        lat: Number(focusEntry.latitude),
        lng: Number(focusEntry.longitude)
      };
    }

    if (gpsData.length > 0) {
      const first = gpsData.find(
        (i) => Number(i.latitude) && Number(i.longitude)
      );
      if (first) {
        return {
          lat: Number(first.latitude),
          lng: Number(first.longitude)
        };
      }
    }

    return { lat: 26.1445, lng: 91.7362 };
  }, [gpsData, focusEntry]);

  //  Auto follow selected vehicle
  useEffect(() => {
    if (mapRef && focusEntry?.latitude && focusEntry?.longitude) {
      mapRef.panTo({
        lat: Number(focusEntry.latitude),
        lng: Number(focusEntry.longitude)
      });
      mapRef.setZoom(15);
    }
  }, [focusEntry, mapRef]);

  if (!isLoaded) return <div>Loading Google Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height }}
      center={center}
      zoom={12}
      onLoad={(map) => setMapRef(map)}
    >
      {/*  VEHICLES */}
      {gpsData.map((item, index) => {
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);
        if (!lat || !lng) return null;

        return (
          <Marker
            key={`${item.imei}-${index}`}
            position={{ lat, lng }}
            onClick={() => {
              setSelected(item);
              onVehicleClick && onVehicleClick(item);
            }}
          />
        );
      })}

      {/*  POLICE */}
      {policeData.map((item, index) => {
        const lat = Number(item.latitude);
        const lng = Number(item.longitude);
        if (!lat || !lng) return null;

        return (
          <Marker
            key={`police-${index}`}
            position={{ lat, lng }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            }}
          />
        );
      })}

      {/*  NMR CIRCLE */}
      {nmrArea && (
        <Circle
          center={{
            lat: Number(nmrArea.latitude),
            lng: Number(nmrArea.longitude)
          }}
          radius={nmrArea.radiusKm * 1000}
        />
      )}

      {/*  INFO WINDOW */}
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
  );
};

export default GoogleMapComponent;