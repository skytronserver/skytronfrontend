import OLMap from "./OLMap";

const MapComponent = () => {
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, width: "100%", overflow: "hidden" }}>
        <OLMap />
      </div>
    </div>
  );
};

export default MapComponent;
