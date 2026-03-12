import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";

export default function RoadsMapComponent({ onZoomChange }) {

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {

    if (mapInstanceRef.current) return;

    const roadsLayer = new TileLayer({
      source: new XYZ({
        url: "https://map2.gromed.in/tile/{z}/{x}/{y}.png",
        attributions: "© OpenStreetMap contributors",
        maxZoom: 20,
        projection: "EPSG:3857",
      }),
      zIndex: 3,
      minZoom: 5,
    });

    // CREATE VIEW FIRST
    const view = new View({
      center: fromLonLat([91.7362, 26.1445]), // Guwahati
      zoom: 12,
      projection: "EPSG:3857",
       minZoom: 11,   // ⭐ IMPORTANT
  maxZoom: 20
    });

    const map = new Map({
      target: mapRef.current,
      layers: [roadsLayer],
      view: view,
    });

    mapInstanceRef.current = map;

    // Listen for zoom change
    view.on("change:resolution", () => {

      const zoom = Math.round(view.getZoom());

      if (onZoomChange) {
       onZoomChange?.(10); 
      }

    });

  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "500px",
      }}
    />
  );
}