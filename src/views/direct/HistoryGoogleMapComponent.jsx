import React, { useMemo, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px"
};

const HistoryGoogleMapComponent = ({
  gpsData = [],
  onMarkerClick,
  autoFit = true,
  markerLabelMode = "vehicle"
}) => {

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [selected, setSelected] = useState(null);

  const center = useMemo(() => {
    if (gpsData.length > 0) {
      return {
        lat: Number(gpsData[0].latitude),
        lng: Number(gpsData[0].longitude)
      };
    }
    return { lat: 20.5937, lng: 78.9629 }; // India center
  }, [gpsData]);

  const getVehicleNo = (entry) =>
    entry.vehicle_registration_number ||
    entry.vehicle_reg_no ||
    entry?.device_tag_info?.device?.vehicle_reg_no ||
    entry?.device_tag_info?.vehicle?.vehicle_reg_no;

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={6}>
      {gpsData.map((entry, index) => {
        const lat = Number(entry.latitude);
        const lng = Number(entry.longitude);

        if (!lat || !lng) return null;

        return (
          <Marker
            key={index}
            position={{ lat, lng }}
            label={markerLabelMode === "vehicle" ? getVehicleNo(entry) : ""}
            onClick={() => {
              setSelected(entry);
              onMarkerClick && onMarkerClick(entry);
            }}
          />
        );
      })}

      {selected && (
        <InfoWindow
          position={{
            lat: Number(selected.latitude),
            lng: Number(selected.longitude)
          }}
          onCloseClick={() => setSelected(null)}
        >
          <div>
            <strong>{getVehicleNo(selected)}</strong>
            <br />
            Speed: {selected.speed || 0}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default React.memo(HistoryGoogleMapComponent);