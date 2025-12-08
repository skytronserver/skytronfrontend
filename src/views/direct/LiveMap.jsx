
import React, { useEffect, useRef, useState } from "react";
import { Button, Box } from "@mui/material";
import POIService from "../../services/POIService";


const MapComponent = ({
  gpsData,
  policeData = [],
  width = "100%",
  height = "400px",
  customBaseLayers = [],
  onPolygonComplete,
  autoFit = false,
  focusEntry = null,
  markerLabelMode = 'vehicle',
}) => {
  const mapplsContainerRef = useRef();
  const mapplsClassRef = useRef();
  const mapplsMapRef = useRef();
  const markersRef = useRef([]);
  const [mapplsLoaded, setMapplsLoaded] = useState(false);
  const [pois, setPois] = useState([]);

  const USE_TYPE_COLORS = {
    school: '#1E88E5',
    hospital: '#E53935',
    dealership: '#8E24AA',
    dealer: '#8E24AA',
    personal: '#43A047',
    prohibited_area: '#D81B60',
    permitroute: '#FB8C00',
    tollgate: '#6D4C41',
    parking: '#00897B',
    no_parking: '#C62828',
    villageboundary: '#5E35B1',
    cityboundary: '#3949AB',
    districtboundary: '#00838F',
    stateboundary: '#00695C',
    fuelstation: '#FDD835',
    busstop: '#7CB342',
    railwaystation: '#5C6BC0',
    airport: '#039BE5',
    other: '#546E7A',
  };

  const hexToRgba = (hex, alpha) => {
    if (!hex) {
      return `rgba(30, 136, 229, ${alpha})`;
    }

    let normalized = hex.replace('#', '');
    if (normalized.length === 3) {
      normalized = normalized.split('').map((char) => char + char).join('');
    }

    const bigint = parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getUseTypeColor = (poi) => {
    const key = poi?.use_type?.toLowerCase();
    return USE_TYPE_COLORS[key] || '#1E88E5';
  };

  const getMarkerIcon = (color, vehicleType) => {
    const normalizedVehicleType = vehicleType ? vehicleType.toLowerCase().replace(/\s+/g, '_') : 'bus';
    const availableTypes = ['ambulance', 'bus', 'dumper', 'police', 'school_bus', 'tanker', 'taxi', 'truck'];
    const iconType = availableTypes.includes(normalizedVehicleType) ? normalizedVehicleType : 'bus';
    
    try {
      return require(`../../assets/images/${color}/${iconType}.png`);
    } catch (e) {
      return require(`../../assets/images/blue/bus.png`);
    }
  };

  const getMarkerLabel = (entry, mode) => {
    if (!entry) return '';

    switch (mode) {
      case 'block': {
        return (
          entry.block_name ||
          entry.block ||
          entry.blockName ||
          entry.area_name ||
          entry.area ||
          entry.device_tag_info?.block?.name ||
          entry.device_tag_info?.block_name ||
          entry.device_tag_info?.device?.block_name ||
          entry.device_tag_info?.device?.district ||
          entry.district ||
          ''
        );
      }
      case 'route': {
        return (
          entry.route_name ||
          entry.route ||
          entry.route_id ||
          entry.route_info ||
          entry.routeInformation ||
          entry.route_ref?.name ||
          (entry.route_ref?.id ? `Route ${entry.route_ref.id}` : '')
        );
      }
      case 'vehicle':
      default: {
        return (
          entry.vehicle_registration_number ||
          entry.vehicle_reg_no ||
          entry.device_tag_info?.device?.vehicle_reg_no ||
          entry.device_tag_info?.vehicle?.vehicle_reg_no ||
          entry.imei ||
          ''
        );
      }
    }
  };


  // Initialize Mappls map
  useEffect(() => {
    if (!mapplsContainerRef.current) return;

    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!mapplsContainerRef.current) return;

      try {
        // Clear any existing content
        mapplsContainerRef.current.innerHTML = '';

        // Create the map div
        const mapDiv = document.createElement('div');
        mapDiv.id = 'mappls-map-container';
        mapDiv.style.width = '100%';
        mapDiv.style.height = '100%';
        mapplsContainerRef.current.appendChild(mapDiv);

        // Check if mappls is available - with retry logic
        if (typeof window.mappls === 'undefined') {
          console.warn('Mappls library not loaded, retrying...');
          // Retry after a delay
          setTimeout(() => {
            if (typeof window.mappls !== 'undefined') {
              console.log('Mappls loaded on retry');
              // Trigger re-initialization
              mapplsContainerRef.current.innerHTML = '';
            } else {
              console.error('Mappls library failed to load after retries');
              setMapplsLoaded(true);
            }
          }, 2000);
          return;
        }

        // Initialize Mappls - check the actual structure
        try {
          console.log('window.mappls type:', typeof window.mappls);
          console.log('window.mappls:', window.mappls);

          // Store the mappls class object for later use with marker()
          mapplsClassRef.current = window.mappls;
          
          // Create an instance for initialization
          let mapplsInstance;
          
          if (typeof window.mappls === 'object' && window.mappls !== null) {
            // If mappls is an object, use it directly
            mapplsInstance = window.mappls;
          } else if (typeof window.mappls === 'function') {
            // If mappls is a function, call it
            mapplsInstance = window.mappls();
          } else {
            throw new Error('Mappls library format not recognized');
          }

          console.log('Mappls instance ready');

          // Check if initialize method exists
          if (typeof mapplsInstance.initialize === 'function') {
            mapplsInstance.initialize("01fe4d61e103cc49905b05a2d9cd440f", { map: true }, () => {
              if (!mapDiv || !document.body.contains(mapDiv)) {
                console.log('Map container no longer in DOM, skipping initialization');
                return;
              }

              try {
                // Create the map
                const mapInstance = mapplsInstance.Map({
                  id: "mappls-map-container",
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

                mapplsMapRef.current = mapInstance;
                console.log('✓ Mappls map initialized successfully');
                setMapplsLoaded(true);
              } catch (mapError) {
                console.error('Error creating Mappls map:', mapError);
                setMapplsLoaded(true);
              }
            });
          } else if (typeof mapplsInstance.Map === 'function') {
            // If Map method exists directly, use it
            const mapInstance = mapplsInstance.Map({
              id: "mappls-map-container",
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

            mapplsMapRef.current = mapInstance;
            console.log('✓ Mappls map initialized successfully');
            setMapplsLoaded(true);
          } else {
            throw new Error('Mappls initialize or Map method not found');
          }
        } catch (initError) {
          console.error('Error initializing Mappls instance:', initError);
          console.log('Available Mappls methods:', Object.keys(window.mappls || {}));
          setMapplsLoaded(true);
        }
      } catch (error) {
        console.error('Error initializing Mappls:', error);
        setMapplsLoaded(true);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapplsMapRef.current) {
        try {
          if (typeof mapplsMapRef.current.remove === 'function') {
            mapplsMapRef.current.remove();
          }
          mapplsMapRef.current = null;
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
      // Clear the container to prevent React DOM mismatch
      if (mapplsContainerRef.current) {
        try {
          mapplsContainerRef.current.innerHTML = '';
        } catch (e) {
          console.log('Container clear error:', e);
        }
      }
    };
  }, []);

  // Fetch POIs on component mount
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const response = await POIService.getAllPOIs();
        if (response && response.data) {
          setPois(response.data);
        }
      } catch (error) {
        console.error('Error fetching POIs:', error);
      }
    };

    fetchPOIs();
  }, []);


  // Helper to calculate time difference in minutes
  const calculateTimeDifference = (startTime, endTime) => {
    const timeDifferenceMillis = endTime - startTime;
    return timeDifferenceMillis / (1000 * 60);
  };

  // Get marker color based on vehicle status
  const getMarkerColor = (data) => {
    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDifference = calculateTimeDifference(entryTime, currentTime);

    const isPoliceMarker = data.markerCategory === 'police';

    if (isPoliceMarker) {
      return 'blue';
    } else if (data.packet_type === "EA") {
      return 'red';
    } else if (data.packet_type !== "NR") {
      return 'orange';
    } else if (String(data.ignition_status) === "1" && data.speed < 1) {
      return 'blue';
    } else if (String(data.ignition_status) === "1" && data.speed > 1) {
      return 'green';
    } else if (timeDifference > 5) {
      return 'grey';
    } else {
      return 'blue';
    }
  };

  // Add markers to Mappls map
  useEffect(() => {
    if (!mapplsMapRef.current || !mapplsLoaded) return;

    const allMarkers = [...gpsData, ...policeData];

    // Remove old markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        try {
          mapplsMapRef.current.removeMarker(marker);
        } catch (e) {
          console.log('Error removing marker:', e);
        }
      });
      markersRef.current = [];
    }

    // Add new markers using Mappls API
    // Use mapplsClassObject.marker() to create markers
    allMarkers.forEach((entry) => {
      const longitude = Number(entry.longitude);
      const latitude = Number(entry.latitude);

      if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return;
      }

      try {
        const color = getMarkerColor(entry);
        const vehicleType = entry?.device_tag_info?.category_info?.category;
        const iconUrl = getMarkerIcon(color, vehicleType);
        
        const markerLabel = getMarkerLabel(entry, markerLabelMode);
        
        // Mappls marker configuration
        const markerConfig = {
          map: mapplsMapRef.current,
          position: {
            lat: latitude,
            lng: longitude,
          },
          icon: iconUrl,
          width: 35,
          height: 45,
          offset: [0, -22], // Center the icon on the position
          popupHtml: `
            <div style="padding: 12px; font-size: 13px; min-width: 160px; font-family: Arial, sans-serif;">
              <div style="font-weight: bold; color: #1a1a1a; margin-bottom: 8px; font-size: 14px;">
                ${entry.vehicle_registration_number || 'N/A'}
              </div>
              <div style="border-top: 1px solid #e0e0e0; padding-top: 8px;">
                <div style="margin-bottom: 4px;">
                  <span style="color: #666;">Speed:</span> <strong>${entry.speed || 0} km/h</strong>
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="color: #666;">Status:</span> <strong>${entry.packet_type || 'NR'}</strong>
                </div>
                <div>
                  <span style="color: #666;">Time:</span> <strong>${entry.time || 'N/A'}</strong>
                </div>
              </div>
            </div>
          `,
          popupOptions: {
            openPopup: false,
            autoClose: true,
            maxWidth: 250,
          },
        };

        // Create marker using the stored mapplsClassRef
        try {
          // Use addMarker method which is available
          if (mapplsClassRef.current && typeof mapplsClassRef.current.addMarker === 'function') {
            const markerObject = mapplsClassRef.current.addMarker(markerConfig);
            if (markerObject) {
              markersRef.current.push(markerObject);
              console.log('✓ Marker added:', markerLabel);
            }
          } else {
            console.error('mapplsClassRef.current.addMarker is not available');
          }
        } catch (markerError) {
          console.error('Error creating marker:', markerError);
        }
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    });

    // Auto-fit if needed
    if (autoFit && allMarkers.length > 0) {
      try {
        const bounds = allMarkers
          .filter(m => Number.isFinite(m.latitude) && Number.isFinite(m.longitude))
          .map(m => [m.latitude, m.longitude]);
        
        if (bounds.length > 0) {
          // Try different fit methods
          if (typeof mapplsMapRef.current.fitBounds === 'function') {
            mapplsMapRef.current.fitBounds(bounds);
          } else if (typeof mapplsMapRef.current.fitBoundingBox === 'function') {
            mapplsMapRef.current.fitBoundingBox(bounds);
          } else if (typeof mapplsMapRef.current.setView === 'function') {
            // Fallback: set center to first marker
            mapplsMapRef.current.setView([bounds[0][0], bounds[0][1]], 10);
          }
        }
      } catch (e) {
        console.log('Error fitting bounds:', e);
      }
    }
  }, [gpsData, policeData, mapplsLoaded, autoFit, markerLabelMode]);

  // Focus on entry
  useEffect(() => {
    if (!mapplsMapRef.current || !focusEntry || !mapplsLoaded) return;

    const longitude = Number(focusEntry.longitude);
    const latitude = Number(focusEntry.latitude);

    if (Number.isFinite(longitude) && Number.isFinite(latitude)) {
      try {
        // Use Mappls setCenter method with {lat, lng} format
        mapplsMapRef.current.setCenter({
          lat: latitude,
          lng: longitude,
        });

        // Set zoom level
        if (typeof mapplsMapRef.current.setZoom === 'function') {
          mapplsMapRef.current.setZoom(16);
        }

        console.log('✓ Focused on entry:', focusEntry.vehicle_registration_number);
      } catch (e) {
        console.log('Error focusing on entry:', e);
      }
    }
  }, [focusEntry, mapplsLoaded]);

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Mappls Map Container */}
      <div
        ref={mapplsContainerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#f0f0f0',
        }}
      />

      {!mapplsLoaded && (
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

      {/* Position logos using absolute positioning within the map container */}
      <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: 'absolute', bottom: 0, left: 0, height: '60px', width: 'auto', zIndex: 1000 }} />
      <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, height: '60px', width: 'auto', zIndex: 1000 }} />
      <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, height: '60px', width: 'auto', zIndex: 1000, backgroundColor: 'transparent' }} />

    </div>
  );
};

export default MapComponent;
