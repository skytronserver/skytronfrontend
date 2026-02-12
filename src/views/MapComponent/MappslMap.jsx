import { mappls } from "mappls-web-maps";
import { useEffect, useRef, useState } from "react";

const mapplsClassObject = new mappls();

const MappslMap = () => {
  const mapContainer = useRef(null);
  const mapplsMapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Ensure container exists
    if (!mapContainer.current) return;

    // Create the map div
    const mapDiv = document.createElement('div');
    mapDiv.id = 'mappls-map';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapContainer.current.appendChild(mapDiv);

    // Initialize Mappls
    const loadObject = { map: true };

    mapplsClassObject.initialize("frvownqmeoxswhwsleixfajceykhpobbvgeq", loadObject, () => {
      mapplsMapRef.current = mapplsClassObject.Map({
        id: "mappls-map",
        properties: {
          center: [28.544, 77.5454],
          draggable: true,
          zoom: 5,
          minZoom: 4,
          maxZoom: 18,
          backgroundColor: "#fff",
          traffic: false,
          geolocation: true,
          disableDoubleClickZoom: false,
          fullscreenControl: true,
          scrollWheel: true,
          scrollZoom: true,
          rotateControl: true,
          scaleControl: true,
          zoomControl: true,
          clickableIcons: true,
        },
      });

      try {
        const existingStyle = document.getElementById('mappls-controls-hide-mapcomponent');
        if (existingStyle) existingStyle.remove();
        const style = document.createElement('style');
        style.id = 'mappls-controls-hide-mapcomponent';
        style.textContent = `
#mappls-map .mappls-ctrl-attrib,
#mappls-map .mappls-ctrl-logo,
#mappls-map .mappls-attrib,
#mappls-map .mappls-logo,
#mappls-map .mapboxgl-ctrl-attrib,
#mappls-map .mapboxgl-ctrl-logo {
display: none !important;
}
`;
        document.head.appendChild(style);
      } catch (e) {
      }

      mapplsMapRef.current.addListener("load", () => {
        console.log('✓ Mappls map loaded successfully');
        setIsMapLoaded(true);
      });
    });

    return () => {
      if (mapplsMapRef.current) {
        try {
          mapplsMapRef.current.remove();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
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
            Loading Mappls Map...
          </p>
        </div>
      )}
    </div>
  );
};

export default MappslMap;
