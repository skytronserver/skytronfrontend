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

export default function RoadsMapComponent({onBack, onZoomChange,data,onDistrictClick,level,onCityClick,onLocalityClick }) {

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
const levelRef = useRef(level);
const lastSelectedRef = useRef(null);
 useEffect(() => {
 levelRef.current = level;
  if (!data || data.length === 0) return;

  // ✅ ALWAYS clear old features
  vectorSourceRef.current.clear();

  // =============================
  // 1️⃣ CREATE MAP ONLY ONCE
  // =============================
  if (!mapInstanceRef.current) {

    const roadsLayer = new TileLayer({
      source: new XYZ({
        url: "https://map2.gromed.in/tile/{z}/{x}/{y}.png",
        maxZoom: 20,
      }),
      zIndex: 3,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
      zIndex: 5
    });

    const view = new View({
      center: fromLonLat([91.7362, 26.1445]),
      zoom: 9,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [roadsLayer, vectorLayer],
      view: view,
    });

    mapInstanceRef.current = map;

// =============================
      // ✅ ADD BACK BUTTON INSIDE MAP
      // =============================
      const backBtn = document.createElement("button");
      backBtn.innerHTML = "⬅ Back";

      backBtn.style.position = "absolute";
      backBtn.style.top = "10px";
      backBtn.style.right = "10px";
      backBtn.style.zIndex = "1000";
      backBtn.style.padding = "8px 12px";
      backBtn.style.background = "#0ea5e9";
      backBtn.style.color = "#fff";
      backBtn.style.border = "none";
      backBtn.style.borderRadius = "6px";
      backBtn.style.cursor = "pointer";

      backBtn.onclick = () => {
        
        onBack?.({
  level: levelRef.current,
  data: lastSelectedRef.current
});
      };

      map.getTargetElement().appendChild(backBtn);


    // ✅ CLICK EVENT
    map.on("singleclick", function (evt) {
      map.forEachFeatureAtPixel(evt.pixel, function (feature) {

        const props = feature.get("raw");
        lastSelectedRef.current = props; // ⭐ STORE LAST CLICKED
 const currentLevel = levelRef.current; 
    if (currentLevel === "district") {
      onDistrictClick?.(props);
    }

    else if (currentLevel === "city") {
      onCityClick?.(props);
    }

    else if (currentLevel === "locality") {
      onLocalityClick?.(props);
    }

        view.animate({
          center: feature.getGeometry().getCoordinates(),
          zoom: view.getZoom() + 2,
          duration: 500
        });

      });
    });

    // zoom listener
    view.on("change:resolution", () => {
      debugger
      onZoomChange?.(Math.round(view.getZoom()));
    });
  }

  // =============================
  // 2️⃣ ALWAYS UPDATE FEATURES
  // =============================

const counts = data.map(d => d.total_vehicle_count ?? d.total_devices ?? 1);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  data.forEach(d => {
const lon = d.lon ?? d.longitude;
const lat = d.lat ?? d.latitude;
if (!lon || !lat) return;  
    const feature = new Feature({
      geometry: new Point(
        fromLonLat([lon, lat])
      ),
     name:
  d.city_village_name ||
  d.district_name ||
  d.locality_name ||   // ⭐ ADD THIS
  d.vehicle_reg_no   ,
  raw: d   // ⭐ FOR DEVICE LEVEL
    });

    const radius =
  20 + ((d.total_vehicle_count ?? d.total_devices ?? 1) - min) / (max - min || 1) * 20;
const label =
  level === "device"
    ? d.vehicle_reg_no
    : (d.total_vehicle_count ?? d.total_devices ?? "");
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: radius,
          fill: new Fill({ color: "rgba(14,165,233,0.6)" }),
          stroke: new Stroke({ color: "#fff", width: 2 })
        }),
        text: new Text({
          text: String(label),
          fill: new Fill({ color: "#fff" }),
          stroke: new Stroke({ color: "#000", width: 3 }),
          font: "bold 12px Arial",
          textAlign: "center",
          textBaseline: "middle"
        })
      })
    );

    vectorSourceRef.current.addFeature(feature);

  });

}, [data,level]);

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