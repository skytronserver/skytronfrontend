import { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Zoom, FullScreen, ScaleLine, Attribution } from "ol/control";
import "ol/ol.css";

const OLMap = () => {
  const mapContainer = useRef(null);
  const olMap = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Create Bhuvan layer
    const bhuvanLayer = new TileLayer({
      source: new XYZ({
        url: 'https://bhuvan-ras2.nrsc.gov.in/tilecache/tilecache.py/1.0.0/assam_carto1s/{z}/{x}/{y}.png',
        attributions: '&copy; <a href="https://bhuvan.nrsc.gov.in/">NRSC Bhuvan</a>',
        crossOrigin: 'anonymous',
      }),
    });

    // Create map with Bhuvan layer only
    olMap.current = new Map({
      target: mapContainer.current,
      layers: [bhuvanLayer],
      view: new View({
        center: fromLonLat([77.5454, 28.544]),
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
      }),
      controls: [
        new Zoom(),
        new Attribution(),
        new FullScreen(),
        new ScaleLine(),
      ],
    });

    setIsMapLoaded(true);

    return () => {
      if (olMap.current) {
        olMap.current.setTarget(null);
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        backgroundColor: "#f0f0f0",
      }}
    >
      {!isMapLoaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px 40px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 999,
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "16px", color: "#333" }}>
            Loading OpenLayers Map...
          </p>
        </div>
      )}
    </div>
  );
};

export default OLMap;
