import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { fromLonLat, getCenter } from "ol/proj";
import { Icon, Style } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Overlay from "ol/Overlay";
import "ol/ol.css";
import { boundingExtent } from "ol/extent";

const MapComponent = ({ gpsData, width = "100%", height = "400px" }) => {
  const mapElement = useRef();
  const overlayElement = useRef();
  const [map, setMap] = useState(null);
  const [vectorLayer, setVectorLayer] = useState(null);
  const [dynamicOverlay, setDynamicOverlay] = useState(null);

  // Icon styles based on the packet type and conditions
  const iconStyles = {
    red: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "https://skytrack.tech:2000/static/logo/red-skytron-transparent.png",
        scale: 0.06,
      }),
    }),
    orange: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "https://skytrack.tech:2000/static/logo/orange-skytron-transparent.png",
        scale: 0.06,
      }),
    }),
    blue: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "https://skytrack.tech:2000/static/logo/blue-skytron-transparent.png",
        scale: 0.06,
      }),
    }),
    green: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "https://skytrack.tech:2000/static/logo/green-skytron-transparent.png",
        scale: 0.06,
      }),
    }),
    grey: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "https://skytrack.tech:2000/static/logo/grey-skytron-transparent.png",
        scale: 0.06,
      }),
    }),
    default: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: "https://skytrack.tech:2000/static/track.png",
        scale: 0.06,
      }),
    }),
  };

  useEffect(() => {
    // Initialize the map on first render
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
        zoom: 7,
      }),
    });

    // Initialize vector layer for markers
    const initialVectorLayer = new VectorLayer({
      source: new VectorSource(),
    });

    // Add vector layer to map
    initialMap.addLayer(initialVectorLayer);

    // Create dynamic overlay
    const initialOverlay = new Overlay({
      element: overlayElement.current,
    });
    initialMap.addOverlay(initialOverlay);

    setMap(initialMap);
    setVectorLayer(initialVectorLayer);
    setDynamicOverlay(initialOverlay);
  }, []);

  // Helper to calculate time difference in minutes
  const calculateTimeDifference = (startTime, endTime) => {
    const timeDifferenceMillis = endTime - startTime;
    return timeDifferenceMillis / (1000 * 60); // Convert milliseconds to minutes
  };

  // Set the correct icon style based on data conditions
  const getIconStyle = (data) => {
    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDifference = calculateTimeDifference(entryTime, currentTime);

    if (data.packet_type === "EA") {
      return iconStyles.red; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      return iconStyles.orange; // Any Alert Packet except EA - Orange Icon
    } else if (data.ignition_status === 0 && data.speed === 0) {
      return iconStyles.blue; // Ignition ON but stationary - Blue Icon
    } else if (data.ignition_status === 1 && data.speed > 0) {
      return iconStyles.green; // Ignition ON and moving - Green Icon
    } else if (timeDifference > 5) {
      return iconStyles.grey; // Offline device (no packets from device for 5+ minutes) - Grey Icon
    } else {
      return iconStyles.default; // Default icon for all other conditions
    }
  };

  useEffect(() => {
    if (map && vectorLayer && gpsData.length > 0) {
      // Clear the previous markers
      vectorLayer.getSource().clear();

      const features = gpsData.map((entry) => {
        const coordinates = fromLonLat([entry.longitude, entry.latitude]);

        // Create the marker feature
        const markerFeature = new Feature({
          geometry: new Point(coordinates),
          entryData: entry, // Store entry data for overlay
        });

        // Set the appropriate style for the marker
        markerFeature.setStyle(getIconStyle(entry));

        return markerFeature;
      });

      // Add all features (markers) to the vector layer
      vectorLayer.getSource().addFeatures(features);

      // Automatically center the map based on the locations of the markers
      const extent = vectorLayer.getSource().getExtent();
      map.getView().fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });

      // Handle map click to display the overlay and zoom to street level
      map.on("click", function (event) {
        dynamicOverlay.getElement().style.display = "none";

        // Check if a feature is clicked
        map.forEachFeatureAtPixel(event.pixel, function (feature) {
          const coordinates = feature.getGeometry().getCoordinates();
          const entryData = feature.get("entryData");

          // Set overlay content
          document.getElementById("overlay-content").innerHTML =
            "<strong>Vehicle Registration:</strong> " +
            entryData.vehicle_registration_number;

          dynamicOverlay.setPosition(coordinates);
          dynamicOverlay.getElement().style.display = "block";

          // Zoom to street level when clicked (zoom level 18)
          map.getView().animate({
            center: coordinates,
            zoom: 18,
            duration: 500, // Animate the zoom for 500ms
          });
        });
      });
    }
  }, [gpsData, map, vectorLayer, dynamicOverlay]);

  return (
    <div>
      {/* Map container */}
      <div ref={mapElement} style={{
        width: width,
        height: height,
      }}></div>

      {/* Overlay for displaying marker details */}
      <div ref={overlayElement} className="dynamic-overlay">
        <p id="overlay-content"> </p>
      </div>

      <style jsx>{`
        .dynamic-overlay {
          position: absolute;
          background-color: white;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          display: none;
          max-height: 200px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default MapComponent;
