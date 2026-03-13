import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from "ol/style";

export default function RoadsMapComponent({ onZoomChange,data }) {

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    debugger
if (!data || data.length === 0) return; // ⭐ WAIT FOR DATA

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

 // Vector source for district markers
    const vectorSource = new VectorSource();

    // Add markers from JSON

const counts = data.map(d => d.total_vehicle_count);
const minVehicles = Math.min(...counts);
const maxVehicles = Math.max(...counts);

    data?.forEach(d => {

      const feature = new Feature({
        geometry: new Point(
          fromLonLat([d.longitude, d.latitude])
        ),
        name: d.district_name,
        vehicles: d.total_vehicle_count
      });

      // bubble size based on vehicles
      const MIN_RADIUS = 20;
const MAX_RADIUS = 40;

const radius =
  MIN_RADIUS +
  ((d.total_vehicle_count - minVehicles) /
    (maxVehicles - minVehicles)) *
    (MAX_RADIUS - MIN_RADIUS);

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: radius,
            fill: new Fill({ color: "rgba(255,0,0,0.6)" }),
            stroke: new Stroke({ color: "#fff", width: 2 })
          }),
         
    text: new Text({
      text: String(d.total_vehicle_count),   // ⭐ show count
      fill: new Fill({ color: "#fff" }),
      stroke: new Stroke({ color: "#000", width: 3 }),
      font: "bold 12px Arial",
      textAlign: "center",
      textBaseline: "middle"   })
        })
      );

      vectorSource.addFeature(feature);

    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 5
    });



    // CREATE VIEW FIRST
    const view = new View({
      center: fromLonLat([91.7362, 26.1445]), // Guwahati
      zoom: 9,
      projection: "EPSG:3857",
       minZoom: 6,   // ⭐ IMPORTANT
  maxZoom: 20
    });

    const map = new Map({
      target: mapRef.current,
      layers: [roadsLayer,vectorLayer],
      view: view,
    });

    mapInstanceRef.current = map;

    // Listen for zoom change
    view.on("change:resolution", () => {

      const zoom = Math.round(view.getZoom());

      if (onZoomChange) {
       onZoomChange(zoom); 
      }

    });

  }, [data]);

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