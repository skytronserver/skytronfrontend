import { useState } from "react";
import MappslMap from "./MappslMap";
import OLMap from "./OLMap";

const MapComponent = () => {
  const [selectedMap, setSelectedMap] = useState("mappls");

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Map Selector Header */}
      <div
        style={{
          backgroundColor: "white",
          padding: "12px 20px",
          borderBottom: "2px solid #667eea",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        <label
          style={{
            fontWeight: "600",
            fontSize: "15px",
            color: "#333",
            margin: 0,
          }}
        >
          Select Map:
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setSelectedMap("mappls")}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: selectedMap === "mappls" ? "2px solid #667eea" : "1px solid #ddd",
              backgroundColor: selectedMap === "mappls" ? "#667eea" : "white",
              color: selectedMap === "mappls" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              transition: "all 0.3s ease",
            }}
          >
            Mappls Map
          </button>
          <button
            onClick={() => setSelectedMap("openlayers")}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: selectedMap === "openlayers" ? "2px solid #667eea" : "1px solid #ddd",
              backgroundColor: selectedMap === "openlayers" ? "#667eea" : "white",
              color: selectedMap === "openlayers" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              transition: "all 0.3s ease",
            }}
          >
            OpenLayers Map
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, width: "100%", overflow: "hidden" }}>
        {selectedMap === "mappls" ? <MappslMap /> : <OLMap />}
      </div>
    </div>
  );
};

export default MapComponent;
