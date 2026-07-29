import React, { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import LineString from "ol/geom/LineString";

import { Style, Circle as CircleStyle, Fill, Stroke } from "ol/style";

const OpenLayersMap = ({ value = [], onChange }) => {
  const mapRef = useRef();
  const mapInstance = useRef();
  const vectorSourceRef = useRef(new VectorSource());
  const valueRef = useRef(value);

  // keep latest value
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // DRAW MARKERS + LINE
  useEffect(() => {
    const source = vectorSourceRef.current;
    source.clear();

    // points
    value.forEach((coord) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([coord.lng, coord.lat])),
      });

      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: "red" }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
          }),
        })
      );

      source.addFeature(feature);
    });

    // line
    if (value.length > 1) {
      const lineFeature = new Feature({
        geometry: new LineString(
          value.map((c) => fromLonLat([c.lng, c.lat]))
        ),
      });

      lineFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: "blue",
            width: 3,
          }),
        })
      );

      source.addFeature(lineFeature);
    }
  }, [value]);

  // INIT MAP
  useEffect(() => {
    if (mapInstance.current) return;

    const vectorLayer = new VectorLayer({
      source: vectorSourceRef.current,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://map2.skytron.in/tile/{z}/{x}/{y}.png",
            maxZoom: 20,
          }),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([91.7362, 26.1445]), // Guwahati
        zoom: 12,
      }),
    });

    // CLICK → ADD POINT
    map.on("click", function (evt) {
      const coords = toLonLat(evt.coordinate);

      const newPoint = {
        lat: coords[1],
        lng: coords[0],
      };

      const updated = [...valueRef.current, newPoint];

      onChange(updated);
    });

    mapInstance.current = map;
  }, [onChange]);

  return <div ref={mapRef} style={{ height: "300px", width: "100%" }} />;
};

export default OpenLayersMap;