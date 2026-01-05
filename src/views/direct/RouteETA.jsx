import React, { useEffect, useState, useRef } from "react";
import MainCard from "../../ui-component/cards/MainCard";
import TaggingService from "../../services/TaggingService";
import { createAxiosInstance } from "../../services/axiosInstance";
import TripService from "../../services/TripService";
import {
  Button,
  Grid,
  TextField,
  Box,
  Paper,
  Typography,
  Divider,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Collapse,
  Card,
  CardContent,
  ListItemIcon,
  Switch,
  FormControlLabel,
  ButtonGroup,
  Tooltip,
  Tabs,
  Tab,
  Stack,
  Chip
} from "@mui/material";
import { ExpandLess, ExpandMore, History, Delete, Route, Navigation, MyLocation, DirectionsCar } from '@mui/icons-material';
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM, TileWMS, XYZ } from "ol/source";
import { fromLonLat, toLonLat, get as getProjection } from "ol/proj";
import { getDistance } from 'ol/sphere';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Overlay from "ol/Overlay";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import Fill from "ol/style/Fill";
import Circle from "ol/style/Circle";
import Text from "ol/style/Text";
import AutoHideAlert from "../../ui-component/AutoHideAlert";
import HomePageService from "../../services/HomePage";

// Register projections
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
register(proj4);

const RouteETA = () => {
  const [deviceList, setDeviceList] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [selectedVehicleReg, setSelectedVehicleReg] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [pointLabels, setPointLabels] = useState(["Start Point", "End Point"]);
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const vehicleSourceRef = useRef(new VectorSource());
  const map = useRef(null);
  const routeCoordinatesRef = useRef([]);
  const AVG_SPEED_KMH = 40; // Average speed in km/h
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success"
  });
  const [historyTrips, setHistoryTrips] = useState([]);
  const [expandHistory, setExpandHistory] = useState(false);
  const [expandInstructions, setExpandInstructions] = useState(true);
  const [instructions, setInstructions] = useState([]);

  // Trip Management State
  const [activeTripId, setActiveTripId] = useState(null);
  const [tripName, setTripName] = useState("");
  const [tripLoading, setTripLoading] = useState(false);

  // Live Tracking State
  const [isTracking, setIsTracking] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);

  const trackingIntervalRef = useRef(null);

  // Map Type State
  const [mapType, setMapType] = useState('normal');
  const normalLayersRef = useRef([]);
  const satelliteLayerRef = useRef(null);

  // UI State
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Icon Styles
  const iconStyles = {
    red: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: require("../../assets/images/red/bus.png"),
        scale: 0.07,
      }),
    }),
    orange: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: require("../../assets/images/orange/bus.png"),
        scale: 0.07,
      }),
    }),
    blue: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: require("../../assets/images/blue/bus.png"),
        scale: 0.07,
      }),
    }),
    green: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: require("../../assets/images/green/bus.png"),
        scale: 0.07,
      }),
    }),
    grey: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: require("../../assets/images/grey/bus.png"),
        scale: 0.07,
      }),
    }),
    default: new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: require("../../assets/images/grey/bus.png"),
        scale: 0.07,
      }),
    }),
  };

  // Function Definitions (Ordered by dependency)

  const updateVehicleOnMap = (data) => {
    if (!data || !data.latitude || !data.longitude) return;

    vehicleSourceRef.current.clear();

    const coordinates = fromLonLat([parseFloat(data.longitude), parseFloat(data.latitude)]);

    const vehicleFeature = new Feature({
      geometry: new Point(coordinates),
      name: "Live Vehicle",
      data: data
    });

    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDiffMinutes = (currentTime - entryTime) / (1000 * 60);

    let selectedStyleBase;

    if (data.packet_type === "EA") {
      selectedStyleBase = iconStyles.red;
    } else if (data.packet_type !== "NR") {
      selectedStyleBase = iconStyles.orange;
    } else if (String(data.ignition_status) === "1" && data.speed < 1) {
      selectedStyleBase = iconStyles.blue;
    } else if (String(data.ignition_status) === "1" && data.speed > 1) {
      selectedStyleBase = iconStyles.green;
    } else if (timeDiffMinutes > 5) {
      selectedStyleBase = iconStyles.grey;
    } else {
      selectedStyleBase = iconStyles.default;
    }

    // Create a new style combining the selected icon and the text label
    const finalStyle = new Style({
      image: selectedStyleBase.getImage(),
      text: new Text({
        text: data.vehicle_registration_number,
        offsetY: -25,
        font: 'bold 12px Arial',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({ color: '#fff', width: 3 }),
        backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.7)' }),
        padding: [2, 2, 2, 2]
      })
    });

    vehicleFeature.setStyle(finalStyle);
    vehicleSourceRef.current.addFeature(vehicleFeature);

    // Dynamic Route Reduction & Trip Ended Logic
    if (routeCoordinatesRef.current && routeCoordinatesRef.current.length > 0) {
      const vehicleLoc = coordinates; // Current vehicle location in EPSG:3857
      const routeCoords = routeCoordinatesRef.current;

      // Find the index of the closest point on the route to the vehicle
      let closestIndex = -1;
      let minDistance = Infinity;

      routeCoords.forEach((coord, index) => {
        const dx = coord[0] - vehicleLoc[0];
        const dy = coord[1] - vehicleLoc[1];
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistance) {
          minDistance = distSq;
          closestIndex = index;
        }
      });

      if (closestIndex !== -1) {
        // Slice the route from the closest point onwards
        const remainingRoute = routeCoords.slice(closestIndex);

        // Update the ref
        routeCoordinatesRef.current = remainingRoute;

        // Update the route feature on the map
        const routeFeature = vectorSourceRef.current.getFeatureById('current_route');
        if (routeFeature) {
          if (remainingRoute.length > 1) {
            routeFeature.getGeometry().setCoordinates(remainingRoute);
          } else {
            vectorSourceRef.current.removeFeature(routeFeature);
          }
        }

        // Check for Trip Ended
        const lastPoint = routeCoords[routeCoords.length - 1];
        const vehicleLonLat = toLonLat(vehicleLoc);
        const endLonLat = toLonLat(lastPoint);

        const distanceToEnd = getDistance(vehicleLonLat, endLonLat); // Result in meters

        if (distanceToEnd < 100) {
          setAlert({
            open: true,
            message: "Trip Ended: You have arrived at your destination.",
            type: "success"
          });
        }
      }
    }
  };

  const fetchLiveLocation = async () => {
    try {
      // We need the IMEI, but we only have reg no in state if selected via autocomplete
      // Find the full device object
      const deviceObj = deviceList.find(d => d.vehicle_reg_no === selectedVehicleReg);

      if (!deviceObj) {
        console.warn("Device not found for tracking");
        return;
      }

      const params = {
        imei: deviceObj.device.device_unique_id,
        regno: selectedVehicleReg
      };

      const response = await HomePageService.getLiveTracking_data(params);

      if (response.data && response.data.data && response.data.data.length > 0) {
        const vehicleData = response.data.data[0];
        setLiveLocation(vehicleData);
        updateVehicleOnMap(vehicleData);
      }
    } catch (error) {
      console.error("Error fetching live location:", error);
    }
  };

  const fetchTrips = async () => {
    try {
      setTripLoading(true);
      const data = await TripService.getTrips();
      // Handle response structure (list or paginated results)
      const trips = Array.isArray(data) ? data : (data.results || []);
      // Sort by latest first (assuming id or created_at)
      const sortedTrips = trips.sort((a, b) => b.id - a.id);
      setHistoryTrips(sortedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setTripLoading(false);
    }
  };

  const calculateStraightLineDistance = (points) => {
    try {
      if (!points || !Array.isArray(points) || points.length !== 2) {
        console.error("Invalid points for straight line calculation:", points);
        setDistance(null);
        setEta(null);
        return;
      }

      // Validate each point
      for (const point of points) {
        if (!point || !Array.isArray(point) || point.length < 2) {
          console.error("Invalid coordinate in calculateStraightLineDistance:", point);
          setDistance(null);
          setEta(null);
          return;
        }
      }

      const R = 6371; // Earth's radius in km
      const [lon1, lat1] = points[0];
      const [lon2, lat2] = points[1];

      if (isNaN(lon1) || isNaN(lat1) || isNaN(lon2) || isNaN(lat2)) {
        console.error("Invalid numeric coordinates:", points);
        setDistance(null);
        setEta(null);
        return;
      }

      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const calculatedDistance = R * c;

      if (isNaN(calculatedDistance)) {
        console.error("Error: Distance calculation resulted in NaN");
        setDistance(null);
        setEta(null);
        return;
      }

      // Set the distance with 2 decimal places
      setDistance(calculatedDistance.toFixed(2));

      // Calculate ETA based on average speed
      const timeInHours = calculatedDistance / AVG_SPEED_KMH;
      const hours = Math.floor(timeInHours);
      const minutes = Math.round((timeInHours - hours) * 60);

      setEta({ hours, minutes });
    } catch (error) {
      console.error("Error calculating straight line distance:", error);
      setDistance(null);
      setEta(null);
      setAlert({
        open: true,
        message: "Error calculating distance. Please try again.",
        type: "error"
      });
    }
  };

  const calculateRoute = async (routePoints) => {
    try {
      if (!routePoints || !Array.isArray(routePoints) || routePoints.length !== 2) {
        console.error("Invalid route points:", routePoints);
        setAlert({
          open: true,
          message: "Invalid route points for calculation.",
          type: "error"
        });
        return;
      }

      // Validate each point
      for (const point of routePoints) {
        if (!point || !Array.isArray(point) || point.length < 2) {
          console.error("Invalid coordinate in calculateRoute:", point);
          setAlert({
            open: true,
            message: "Invalid coordinates for route calculation.",
            type: "error"
          });
          return;
        }
      }

      // Clear previous route
      vectorSourceRef.current.clear();
      setInstructions([]);

      // Add start and end points to the map
      routePoints.forEach((coord, index) => {
        const pointFeature = new Feature({
          geometry: new Point(fromLonLat(coord)),
          name: pointLabels[index],
        });

        const pointStyle = new Style({
          image: new Circle({
            radius: 7,
            fill: new Fill({
              color: index === 0 ? '#007bff' : '#dc3545',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2,
            }),
          }),
        });

        pointFeature.setStyle(pointStyle);
        vectorSourceRef.current.addFeature(pointFeature);
      });

      // Try to get route from API
      const routeResponse = await HomePageService.getRoute({ points: routePoints });
      const routeData = routeResponse?.data?.data && routeResponse.data.data.paths ? routeResponse.data.data : routeResponse.data;
      console.log("Route data from API:", routeData);

      // Check if we have valid paths data (API returns data.paths[0].points.coordinates)
      if (!routeData?.paths?.[0]?.points?.coordinates) {
        throw new Error('Invalid route data received');
      }

      const path = routeData.paths[0];
      const coordinates = path.points.coordinates;

      // Set instructions if available
      if (path.instructions) {
        setInstructions(path.instructions);
      }

      // API returned valid distance
      const distanceInKm = path.distance / 1000; // Convert from meters to km
      setDistance(distanceInKm.toFixed(2));

      // Calculate ETA based on average speed (40 km/h)
      const timeInHours = distanceInKm / AVG_SPEED_KMH;
      const hours = Math.floor(timeInHours);
      const minutes = Math.round((timeInHours - hours) * 60);

      setEta({ hours, minutes });

      // Format ETA text for display
      const etaText = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;

      // Draw the actual route
      const routeCoordinates = coordinates.map(coord => fromLonLat(coord));

      const routeFeature = new Feature({
        geometry: new LineString(routeCoordinates),
      });

      routeFeature.setId('current_route');
      routeCoordinatesRef.current = routeCoordinates;

      routeFeature.setStyle(new Style({
        stroke: new Stroke({
          color: '#0066ff',
          width: 4,
        }),
      }));

      vectorSourceRef.current.addFeature(routeFeature);

      // Add ETA text at the middle of the route
      if (routeCoordinates.length > 0) {
        const midPointIndex = Math.floor(routeCoordinates.length / 2);
        const midPoint = routeCoordinates[midPointIndex];

        // Create a point feature for the ETA display
        const etaFeature = new Feature({
          geometry: new Point(midPoint),
        });

        etaFeature.setStyle(new Style({
          text: new Text({
            text: `${distanceInKm.toFixed(2)} km (${etaText})`,
            font: 'bold 14px Arial',
            padding: [5, 5, 5, 5],
            backgroundFill: new Fill({
              color: 'rgba(255, 255, 255, 0.8)',
            }),
            fill: new Fill({
              color: '#0066ff',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 3,
            }),
          }),
        }));

        vectorSourceRef.current.addFeature(etaFeature);
      }

      // Fit the map to show the route
      const extent = routeFeature.getGeometry().getExtent();
      if (extent && extent.every(coord => typeof coord === 'number' && !isNaN(coord))) {
        map.current.getView().fit(extent, {
          padding: [70, 70, 70, 70],
          duration: 1000,
          maxZoom: 17,
        });
      }

      setAlert({
        open: true,
        message: "Route calculated successfully!",
        type: "success"
      });


    } catch (error) {
      console.error("Error calculating route:", error);
      setAlert({
        open: true,
        message: "Error calculating route. Falling back to straight line distance.",
        type: "warning"
      });

      // Fallback to straight line calculation
      calculateStraightLineDistance(routePoints);

      // Draw a simple straight line between points
      const lineCoordinates = routePoints.map(coord => fromLonLat(coord));
      const lineFeature = new Feature({
        geometry: new LineString(lineCoordinates),
      });

      lineFeature.setStyle(new Style({
        stroke: new Stroke({
          color: '#ff6b6b',
          width: 3,
          lineDash: [5, 5], // Dashed line to indicate it's an approximate route
        }),
      }));

      vectorSourceRef.current.addFeature(lineFeature);

      // Only add the distance/time label if we have valid values
      if (distance !== null && eta !== null) {
        // Calculate midpoint for showing the distance/time
        const midPoint = [
          (lineCoordinates[0][0] + lineCoordinates[1][0]) / 2,
          (lineCoordinates[0][1] + lineCoordinates[1][1]) / 2
        ];

        // Create a point feature for the display
        const etaFeature = new Feature({
          geometry: new Point(midPoint),
        });

        // Format ETA text
        const etaText = eta ?
          `${eta.hours > 0 ? `${eta.hours}h ` : ''}${eta.minutes}m` :
          'N/A';

        etaFeature.setStyle(new Style({
          text: new Text({
            text: `${parseFloat(distance).toFixed(2)} km (${etaText}) - Direct`,
            font: 'bold 14px Arial',
            padding: [5, 5, 5, 5],
            backgroundFill: new Fill({
              color: 'rgba(255, 255, 255, 0.8)',
            }),
            fill: new Fill({
              color: '#ff6b6b',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 3,
            }),
          }),
        }));

        vectorSourceRef.current.addFeature(etaFeature);
      }
    }
  };

  const updateMapPoints = (points) => {
    try {
      console.log("Updating map with points:", points);

      if (!points || !Array.isArray(points) || points.length === 0) {
        console.log("No points to display, clearing vector source");
        vectorSourceRef.current.clear();
        return;
      }

      vectorSourceRef.current.clear();

      // Add points to the map
      points.forEach((coord, index) => {
        if (!coord || !Array.isArray(coord) || coord.length < 2) {
          console.error("Invalid coordinate in updateMapPoints:", coord);
          return;
        }

        let mapCoord;
        try {
          mapCoord = fromLonLat(coord);
          console.log(`Transformed point ${index}:`, coord, "to", mapCoord);
        } catch (error) {
          console.error("Error transforming coordinate:", coord, error);
          return;
        }

        const pointFeature = new Feature({
          geometry: new Point(mapCoord),
          name: pointLabels[index],
        });

        // Different styles for start and end points
        const pointStyle = new Style({
          image: new Circle({
            radius: index === 0 ? 7 : 8,  // End point slightly larger
            fill: new Fill({
              color: index === 0 ? '#007bff' : '#dc3545',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2,
            }),
          }),
          text: new Text({
            text: pointLabels[index],
            offsetY: -15,
            font: '12px Arial',
            fill: new Fill({
              color: index === 0 ? '#007bff' : '#dc3545',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 3,
            }),
          }),
        });

        pointFeature.setStyle(pointStyle);
        vectorSourceRef.current.addFeature(pointFeature);
        console.log(`Added point ${index} to map`);
      });

      // If we have exactly 2 points, trigger route calculation
      if (points.length === 2) {
        // Only draw a temporary line if we don't yet have 2 complete points
        // (the actual route will be drawn by calculateRoute)
        const lineCoordinates = points.map(coord => fromLonLat(coord));
        const lineFeature = new Feature({
          geometry: new LineString(lineCoordinates),
        });

        lineFeature.setStyle(new Style({
          stroke: new Stroke({
            color: '#cccccc',
            width: 2,
            lineDash: [5, 5], // Dashed line for temporary route
          }),
        }));

        vectorSourceRef.current.addFeature(lineFeature);

        // Fit view to the points
        const extent = lineFeature.getGeometry().getExtent();
        if (extent && extent.every(coord => typeof coord === 'number' && !isNaN(coord))) {
          map.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000,
            maxZoom: 18,
          });
        }
      }
    } catch (error) {
      console.error("Error updating map points:", error);
    }
  };

  const addPoint = (coord) => {
    try {
      console.log("Adding point:", coord);

      setPoints(prevPoints => {
        console.log("Previous points:", prevPoints);
        const updatedPoints = [...prevPoints, coord];
        console.log("Updated points:", updatedPoints);

        // Update the map visualization
        updateMapPoints(updatedPoints);

        // Calculate route if we have 2 points
        if (updatedPoints.length === 2) {
          console.log("We have 2 points, calculating route");
          calculateRoute(updatedPoints);
        }

        return updatedPoints;
      });
    } catch (error) {
      console.error("Error adding point:", error);
      setAlert({
        open: true,
        message: "Error adding point. Please try again.",
        type: "error"
      });
    }
  };

  const clearPoints = () => {
    console.log("Clearing points from state and map");
    setPoints([]);
    setDistance(null);
    setEta(null);
    setInstructions([]);
    routeCoordinatesRef.current = [];

    // Ensure vector source is cleared
    if (vectorSourceRef.current) {
      console.log("Clearing vector source");
      vectorSourceRef.current.clear();
    } else {
      console.warn("Vector source ref is undefined");
    }
  };

  const setStartToVehicleLocation = async () => {
    if (!deviceId) {
      setAlert({
        open: true,
        message: "Please select a vehicle first",
        type: "warning"
      });
      return;
    }

    let location = liveLocation;

    // If we don't have live location yet, try to fetch it
    if (!location) {
      try {
        const deviceObj = deviceList.find(d => d.vehicle_reg_no === selectedVehicleReg);
        if (deviceObj) {
          const params = {
            imei: deviceObj.device.device_unique_id,
            regno: selectedVehicleReg
          };
          const response = await HomePageService.getLiveTracking_data(params);
          if (response.data && response.data.data && response.data.data.length > 0) {
            location = response.data.data[0];
            setLiveLocation(location);
            updateVehicleOnMap(location);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (location) {
      const coord = [parseFloat(location.longitude), parseFloat(location.latitude)];
      // Reset points to just the start point
      setPoints([coord]);
      // Clear previous route/distance/eta
      setDistance(null);
      setEta(null);
      setInstructions([]);
      routeCoordinatesRef.current = [];
      // Update map
      updateMapPoints([coord]);

      setAlert({
        open: true,
        message: "Start point set to vehicle location. Click on map for End point.",
        type: "info"
      });
    } else {
      setAlert({
        open: true,
        message: "Could not get vehicle location. Ensure device is online.",
        type: "error"
      });
    }
  };

  // Create stable function references for event handlers
  // Note: These refs are used in the map click handler which is set up in useEffect
  const addPointRef = useRef(null);
  const clearPointsRef = useRef(null);

  // Update references when functions change
  useEffect(() => {
    addPointRef.current = addPoint;
    clearPointsRef.current = clearPoints;
  }, []); // We can't put addPoint/clearPoints in deps if they are recreated on every render, but here they are defined inside component so they are.
  // Actually, since we moved addPoint and clearPoints to be defined inside the component body, they will be recreated on every render.
  // But the useEffect [addPoint, clearPoints] would cause infinite loop if we are not careful.
  // The previous implementation had them defined as const inside component too.
  // The refs are used to break the closure in the map click listener.

  // To fix the dependency issue, we should update the refs whenever the component renders.
  addPointRef.current = addPoint;
  clearPointsRef.current = clearPoints;

  // Add token verification on component mount
  useEffect(() => {
    const token = sessionStorage.getItem("oAuthToken");
    if (!token) {
      setAlert({
        open: true,
        message: "Please log in to use the route calculator.",
        type: "error"
      });
      return;
    }

    // Ensure axios instance is created with the token
    try {
      createAxiosInstance(token);
    } catch (error) {
      console.error("Error creating axios instance:", error);
      setAlert({
        open: true,
        message: "Error initializing route calculator. Please try logging in again.",
        type: "error"
      });
    }
  }, []);

  useEffect(() => {
    const fetchDeviceList = async () => {
      try {
        const retriveData = await TaggingService.getOwnerList();
        setDeviceList(retriveData.data);
      } catch (error) {
        console.error("Error fetching device list:", error);
        setAlert({
          open: true,
          message: "Failed to fetch vehicle list. Please try again.",
          type: "error"
        });
      }
    };
    fetchDeviceList();
  }, []);

  const resolveBhuvanWmsUrl = () => {
    const envUrl = process.env.REACT_APP_BHUVAN_URL;
    if (!envUrl) {
      return "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms";
    }

    const normalizedUrl = envUrl.replace(/\/$/, "");
    if (normalizedUrl.includes("/bhuvan/gwc/service/wms")) {
      return normalizedUrl;
    }

    return `${normalizedUrl}/bhuvan/gwc/service/wms`;
  };

  // Initialize map on first render
  useEffect(() => {
    if (!map.current) {
      const bhuvanUrl = resolveBhuvanWmsUrl();

      const initialMap = new Map({
        target: mapRef.current,
        layers: [], // Layers will be added below
        view: new View({
          center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
          zoom: 7,
          projection: 'EPSG:3857', // WebMercator projection
        }),
        pixelRatio: 1,
      });

      // --- Normal Layers (Bhuvan) ---
      const india3Layer = new TileLayer({
        source: new TileWMS({
          url: bhuvanUrl,
          params: {
            'LAYERS': 'india3',
            'TILED': true,
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'TRANSPARENT': 'true',
            'SRS': 'EPSG:4326',
            'WIDTH': 256,
            'HEIGHT': 256,
          },
          serverType: 'geoserver',
          projection: 'EPSG:4326',
          crossOrigin: process.env.REACT_APP_BHUVAN_ENABLE_CORS === "true" ? "anonymous" : undefined,
        }),
        visible: true
      });

      const adminGroupLayer = new TileLayer({
        source: new TileWMS({
          url: bhuvanUrl,
          params: {
            'LAYERS': 'basemap:admin_group',
            'TILED': true,
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'TRANSPARENT': 'true',
            'SRS': 'EPSG:4326',
            'WIDTH': 256,
            'HEIGHT': 256,
          },
          serverType: 'geoserver',
          projection: 'EPSG:4326',
          crossOrigin: process.env.REACT_APP_BHUVAN_ENABLE_CORS === "true" ? "anonymous" : undefined,
        }),
        visible: true
      });

      const roadsLayer = new TileLayer({
        source: new TileWMS({
          url: bhuvanUrl,
          params: {
            'LAYERS': 'mmi:mmi_india',
            'TILED': true,
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'TRANSPARENT': 'true',
            'SRS': 'EPSG:4326',
            'WIDTH': 256,
            'HEIGHT': 256,
          },
          serverType: 'geoserver',
          projection: 'EPSG:4326',
          crossOrigin: process.env.REACT_APP_BHUVAN_ENABLE_CORS === "true" ? "anonymous" : undefined,
        }),
        visible: true
      });

      // --- Satellite Layer (ArcGIS) ---
      const satelliteLayer = new TileLayer({
        source: new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attributions: "© Esri",
          maxZoom: 18,
        }),
        visible: false, // Initially hidden
      });

      // Store refs
      normalLayersRef.current = [india3Layer, adminGroupLayer, roadsLayer];
      satelliteLayerRef.current = satelliteLayer;

      // Add layers to map
      initialMap.addLayer(india3Layer);
      initialMap.addLayer(adminGroupLayer);
      initialMap.addLayer(roadsLayer);
      initialMap.addLayer(satelliteLayer);

      // Layer for route and points
      const vectorLayer = new VectorLayer({
        source: vectorSourceRef.current,
        zIndex: 10
      });

      // Layer for live vehicle tracking (on top)
      const vehicleLayer = new VectorLayer({
        source: vehicleSourceRef.current,
        zIndex: 20
      });

      initialMap.addLayer(vectorLayer);
      initialMap.addLayer(vehicleLayer);
      map.current = initialMap;
    }

    // Add ResizeObserver to handle container resizing
    const resizeObserver = new ResizeObserver(() => {
      if (map.current) {
        map.current.updateSize();
      }
    });

    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    // Use OpenLayers' proper click event handling
    // Clean up previous click handlers if any
    if (map.current) {
      const mapClickListeners = map.current.getListeners('click');
      if (mapClickListeners) {
        mapClickListeners.forEach(listener => {
          map.current.un('click', listener);
        });
      }

      // Add new click handler
      map.current.on('click', function (evt) {
        try {
          console.log("Map clicked at:", evt.coordinate);

          // Convert to EPSG:4326 (lon/lat)
          const lonLatCoord = toLonLat(evt.coordinate);
          console.log("Converted to lon/lat:", lonLatCoord);

          // Limit to 2 points for start and end
          if (points.length < 2) {
            if (addPointRef.current) addPointRef.current(lonLatCoord);
          } else {
            // If we already have 2 points, reset and add the new point
            if (clearPointsRef.current) clearPointsRef.current();
            // Need setTimeout to ensure state updates before adding new point
            setTimeout(() => {
              if (addPointRef.current) addPointRef.current(lonLatCoord);
            }, 0);
          }
        } catch (error) {
          console.error("Error handling map click:", error);
          setAlert({
            open: true,
            message: "Error adding point to map. Please try again.",
            type: "error"
          });
        }
      });
    }

    return () => {
      // Clean up click handlers when component unmounts or dependencies change
      if (map.current) {
        const mapClickListeners = map.current.getListeners('click');
        if (mapClickListeners) {
          mapClickListeners.forEach(listener => {
            map.current.un('click', listener);
          });
        }
      }

      if (mapRef.current) {
        resizeObserver.unobserve(mapRef.current);
      }
    };
  }, []); // Empty dependency array, only run on mount

  // Update map when points change
  useEffect(() => {
    console.log("Points changed, updating map:", points);
    updateMapPoints(points);
  }, [points]);

  // Load trips on mount
  useEffect(() => {
    fetchTrips();
  }, []); // Run once on mount

  // Live Tracking Effect
  useEffect(() => {
    if (isTracking && selectedVehicleReg) {
      // Initial fetch
      fetchLiveLocation();

      // Set up polling interval (every 5 seconds)
      trackingIntervalRef.current = setInterval(fetchLiveLocation, 5000);

      setAlert({
        open: true,
        message: `Live tracking started for ${selectedVehicleReg}`,
        type: "success"
      });
    } else {
      // Clear interval if tracking is stopped
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
        trackingIntervalRef.current = null;
      }

      // Clear vehicle marker
      vehicleSourceRef.current.clear();
      setLiveLocation(null);
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [isTracking, selectedVehicleReg]);

  // Delete a saved route - placeholder if delete API exists
  // For now, we only have Cancel which is handled in trip management

  // Load a saved trip from history
  // Load a saved trip from history
  const loadTrip = (trip) => {
    try {
      if (!trip.trip_route) {
        setAlert({ open: true, message: "No route data in this trip", type: "warning" });
        return;
      }

      // Parse route coordinates: stored as [[lat, lon], ...]
      const routePointsLatLon = JSON.parse(trip.trip_route);

      // Convert to [lon, lat] for OpenLayers/State
      const routePointsLonLat = routePointsLatLon.map(p => [p[1], p[0]]);

      if (routePointsLonLat.length < 2) {
        setAlert({ open: true, message: "Invalid route data", type: "error" });
        return;
      }

      const start = routePointsLonLat[0];
      const end = routePointsLonLat[routePointsLonLat.length - 1];

      setPoints([start, end]);
      setDistance(trip.distance_travel);

      let loadedEta = null;
      // Parse ETA (HH:MM:ss)
      if (trip.expected_time_of_travel) {
        const parts = trip.expected_time_of_travel.split(':');
        if (parts.length >= 2) {
          loadedEta = { hours: parseInt(parts[0]), minutes: parseInt(parts[1]) };
          setEta(loadedEta);
        }
      }

      // Set trip name
      setTripName(trip.trip_name || "");
      setActiveTripId(trip.id);

      setAlert({
        open: true,
        message: `Loaded trip: ${trip.trip_name}`,
        type: "info"
      });

      // Draw the saved route on the map
      // Use setTimeout to ensure this runs after the useEffect triggered by setPoints,
      // which would otherwise clear the map.
      setTimeout(() => {
        if (!vectorSourceRef.current || !map.current) return;

        vectorSourceRef.current.clear();

        // 1. Add Start/End Points
        [start, end].forEach((coord, index) => {
          const pointFeature = new Feature({
            geometry: new Point(fromLonLat(coord)),
            name: pointLabels[index],
          });
          const pointStyle = new Style({
            image: new Circle({
              radius: index === 0 ? 7 : 8,
              fill: new Fill({ color: index === 0 ? '#007bff' : '#dc3545' }),
              stroke: new Stroke({ color: '#ffffff', width: 2 }),
            }),
            text: new Text({
              text: pointLabels[index],
              offsetY: -15,
              font: '12px Arial',
              fill: new Fill({ color: index === 0 ? '#007bff' : '#dc3545' }),
              stroke: new Stroke({ color: '#ffffff', width: 3 }),
            })
          });
          pointFeature.setStyle(pointStyle);
          vectorSourceRef.current.addFeature(pointFeature);
        });

        // 2. Add Saved Route Line
        const routeCoordinates = routePointsLatLon.map(p => fromLonLat([p[1], p[0]]));
        const routeFeature = new Feature({
          geometry: new LineString(routeCoordinates),
        });
        routeFeature.setId('current_route');
        routeFeature.setStyle(new Style({
          stroke: new Stroke({
            color: '#0066ff',
            width: 4,
          }),
        }));
        vectorSourceRef.current.addFeature(routeFeature);
        routeCoordinatesRef.current = routeCoordinates;

        // 3. Add Distance/Time Label
        if (routeCoordinates.length > 0 && trip.distance_travel) {
          const midPointIndex = Math.floor(routeCoordinates.length / 2);
          const midPoint = routeCoordinates[midPointIndex];
          const etaText = loadedEta ? `${loadedEta.hours > 0 ? `${loadedEta.hours}h ` : ''}${loadedEta.minutes}m` : '';

          const labelFeature = new Feature({
            geometry: new Point(midPoint),
          });
          labelFeature.setStyle(new Style({
            text: new Text({
              text: `${parseFloat(trip.distance_travel).toFixed(2)} km ${etaText ? `(${etaText})` : ''}`,
              font: 'bold 14px Arial',
              padding: [5, 5, 5, 5],
              backgroundFill: new Fill({ color: 'rgba(255, 255, 255, 0.8)' }),
              fill: new Fill({ color: '#0066ff' }),
              stroke: new Stroke({ color: '#ffffff', width: 3 }),
            }),
          }));
          vectorSourceRef.current.addFeature(labelFeature);
        }

        // 4. Fit View
        const extent = routeFeature.getGeometry().getExtent();
        if (extent && extent.every(coord => typeof coord === 'number' && !isNaN(coord))) {
          map.current.getView().fit(extent, {
            padding: [70, 70, 70, 70],
            duration: 1000,
            maxZoom: 17,
          });
        }
      }, 200);

    } catch (error) {
      console.error("Error loading trip:", error);
      setAlert({
        open: true,
        message: "Error loading trip data",
        type: "error"
      });
    }
  };

  // Trip Management Functions
  const getRouteString = () => {
    if (!routeCoordinatesRef.current || routeCoordinatesRef.current.length === 0) {
      // usage of raw points if route not calculated?
      return JSON.stringify(points.map(p => [p[1], p[0]])); // [lat, lon]
    }
    // Convert current route coordinates to [lat, lon] array
    return JSON.stringify(
      routeCoordinatesRef.current.map(c => {
        const ll = toLonLat(c);
        return [ll[1], ll[0]]; // [lat, lon]
      })
    );
  };

  const handleStartTrip = async () => {
    if (!deviceId) {
      setAlert({ open: true, message: "Please select a vehicle first", type: "warning" });
      return;
    }

    setTripLoading(true);
    try {
      // Calculate travel time string in format HH:MM:ss
      let travelTime = "00:00:00";
      if (eta) {
        // Pad with leading zeros
        const hh = String(eta.hours).padStart(2, '0');
        const mm = String(eta.minutes).padStart(2, '0');
        travelTime = `${hh}:${mm}:00`;
      }

      const payload = {
        trip_name: tripName || `Trip - ${new Date().toLocaleString()}`,
        trip_route: getRouteString(),
        vehicle_id: deviceId,
        // New required fields
        tripvehical_tag: deviceId, // Using device ID as the tag
        expected_time_of_travel: travelTime,
        distance_travel: distance ? distance.toString() : "0"
      };

      console.log("Creating trip with payload:", payload);
      const response = await TripService.createTrip(payload);

      if (response.success) {
        // Assume response.data contains the trip object with an ID
        // Adjust based on actual API response structure
        const newTripId = response.data.id || response.data.trip_id || response.data.pk;
        setActiveTripId(newTripId);
        setAlert({ open: true, message: "Trip started successfully", type: "success" });
        fetchTrips(); // Refresh list
        setTabValue(1); // Swith to Navigation tab
      } else {
        setAlert({ open: true, message: "Failed to start trip: " + (response.error || "Unknown error"), type: "error" });
      }
    } catch (error) {
      console.error("Start trip error:", error);
      setAlert({ open: true, message: "Error starting trip", type: "error" });
    } finally {
      setTripLoading(false);
    }
  };

  const handleUpdateTrip = async () => {
    if (!activeTripId) return;

    setTripLoading(true);
    try {
      const payload = {
        trip_name: tripName,
        trip_route: getRouteString()
      };

      const response = await TripService.updateTrip(activeTripId, payload);
      if (response.success) {
        setAlert({ open: true, message: "Trip updated successfully", type: "success" });
        fetchTrips(); // Refresh list
      } else {
        setAlert({ open: true, message: "Failed to update trip", type: "error" });
      }
    } catch (error) {
      console.error("Update trip error:", error);
      setAlert({ open: true, message: "Error updating trip", type: "error" });
    } finally {
      setTripLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!activeTripId) return;

    setTripLoading(true);
    try {
      const response = await TripService.endTrip(activeTripId);
      if (response.success) {
        setAlert({ open: true, message: "Trip ended successfully", type: "success" });
        setActiveTripId(null);
        setTripName("");
        fetchTrips(); // Refresh list
      } else {
        setAlert({ open: true, message: "Failed to end trip", type: "error" });
      }
    } catch (error) {
      console.error("End trip error:", error);
      setAlert({ open: true, message: "Error ending trip", type: "error" });
    } finally {
      setTripLoading(false);
    }
  };

  const handleCancelTrip = async () => {
    if (!activeTripId) return;

    if (!window.confirm("Are you sure you want to cancel this trip?")) return;

    setTripLoading(true);
    try {
      const response = await TripService.cancelTrip(activeTripId);
      if (response.success) {
        setAlert({ open: true, message: "Trip cancelled", type: "success" });
        setActiveTripId(null);
        setTripName("");
        fetchTrips(); // Refresh list
      } else {
        setAlert({ open: true, message: "Failed to cancel trip", type: "error" });
      }
    } catch (error) {
      console.error("Cancel trip error:", error);
      setAlert({ open: true, message: "Error cancelling trip", type: "error" });
    } finally {
      setTripLoading(false);
    }
  };

  const handleAutocompleteChange = (event, newValue) => {
    if (newValue) {
      setDeviceId(newValue.device.id);
      setSelectedVehicleReg(newValue.vehicle_reg_no);
      // Reset tracking when vehicle changes
      setIsTracking(false);
      setLiveLocation(null);
      vehicleSourceRef.current.clear();
    }
  };

  // Handle Layer Type Toggle
  useEffect(() => {
    if (map.current) {
      const isNormal = mapType === 'normal';

      // Toggle normal layers
      if (normalLayersRef.current) {
        normalLayersRef.current.forEach(layer => layer.setVisible(isNormal));
      }

      // Toggle satellite layer
      if (satelliteLayerRef.current) {
        satelliteLayerRef.current.setVisible(!isNormal);
      }
    }
  }, [mapType]);

  return (
    <MainCard
      content={false}
      sx={{
        height: '85vh',
        display: 'flex',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Map Area - Left Side */}
      <Box sx={{ flex: 1, position: 'relative', height: '100%' }}>
        <AutoHideAlert
          open={alert.open}
          onClose={() => setAlert({ ...alert, open: false })}
          message={alert.message}
          type={alert.type}
        />

        <Box ref={mapRef} id="map" sx={{ width: "100%", height: "100%" }}>
          {/* Map Type Toggle - Absolute Top Left */}
          <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
            <ButtonGroup variant="contained" size="small" sx={{ bgcolor: 'white', boxShadow: 2 }}>
              <Button
                onClick={() => setMapType("normal")}
                color={mapType === "normal" ? "primary" : "inherit"}
              >
                Normal
              </Button>
              <Button
                onClick={() => setMapType("satellite")}
                color={mapType === "satellite" ? "primary" : "inherit"}
              >
                Satellite
              </Button>
            </ButtonGroup>
          </Box>

          {/* Logos */}
          <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, height: '50px', width: 'auto', zIndex: 1, backgroundColor: 'transparent' }} alt="Skytron" />
        </Box>

        {/* Legend - Absolute Bottom Left (above logos) */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 60,
            left: 10,
            p: 1.5,
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 2
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            Map Legend
          </Typography>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#007bff', mr: 1, border: '2px solid white', boxShadow: 1 }} />
              <Typography variant="caption">Start Point</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#dc3545', mr: 1, border: '2px solid white', boxShadow: 1 }} />
              <Typography variant="caption">End Point</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#0066ff', mr: 1 }} />
              <Typography variant="caption">Calculated Route</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 20, height: 4, bgcolor: '#ff6b6b', mr: 1, borderStyle: 'dashed', borderWidth: 1 }} />
              <Typography variant="caption">Direct Line</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DirectionsCar sx={{ fontSize: 16, mr: 1, color: '#e65100' }} />
              <Typography variant="caption">Live Vehicle</Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>

      {/* Control Panel - Right Side */}
      <Box sx={{
        width: 400,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 12
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<DirectionsCar fontSize="small" />} iconPosition="start" label="Monitor" />
            <Tab icon={<Navigation fontSize="small" />} iconPosition="start" label="Nav" />
            <Tab icon={<History fontSize="small" />} iconPosition="start" label="History" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
          {/* --- MONITOR TAB --- */}
          {tabValue === 0 && (
            <Stack spacing={3}>
              {/* 1. Vehicle Selection */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  VEHICLE CONFIGURATION
                </Typography>
                <Stack spacing={2}>
                  <Autocomplete
                    value={deviceList.find((item) => item.device.id === deviceId) || null}
                    onChange={handleAutocompleteChange}
                    options={inputValue ? deviceList : []}
                    getOptionLabel={(option) => option.vehicle_reg_no || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Vehicle"
                        variant="outlined"
                        size="small"
                        fullWidth
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                    )}
                    noOptionsText="Type to search..."
                    isOptionEqualToValue={(option, value) => option.device.id === value.device.id}
                    disableClearable
                  />

                  <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isTracking ? '#e3f2fd' : 'transparent' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MyLocation color={isTracking ? "primary" : "disabled"} sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Live Updates</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {isTracking ? "Tracking Active" : "Tracking Paused"}
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      checked={isTracking}
                      onChange={(e) => setIsTracking(e.target.checked)}
                      disabled={!deviceId}
                      size="small"
                    />
                  </Paper>

                  {/* Live Info Card */}
                  {isTracking && liveLocation && (
                    <Card variant="outlined" sx={{ bgcolor: '#f1f8e9' }}>
                      <CardContent sx={{ p: '12px !important' }}>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">Speed</Typography>
                            <Typography variant="body2" fontWeight="bold">{liveLocation.speed} km/h</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="textSecondary">Last Update</Typography>
                            <Typography variant="body2" fontWeight="bold">{new Date(liveLocation.entry_time).toLocaleTimeString()}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </Box>

              <Divider />

              {/* 2. Route Planning */}
              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  ROUTE PLANNING
                </Typography>

                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label="Start"
                      color={points.length > 0 ? "primary" : "default"}
                      variant={points.length > 0 ? "filled" : "outlined"}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                      {points.length > 0 ? `${points[0][0].toFixed(5)}, ${points[0][1].toFixed(5)}` : "Not set"}
                    </Typography>
                    <Tooltip title="Set Start to Vehicle Location">
                      <IconButton size="small" onClick={setStartToVehicleLocation} disabled={!deviceId}>
                        <DirectionsCar fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      size="small"
                      label="End"
                      color={points.length > 1 ? "error" : "default"}
                      variant={points.length > 1 ? "filled" : "outlined"}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                      {points.length > 1 ? `${points[1][0].toFixed(5)}, ${points[1][1].toFixed(5)}` : "Not set"}
                    </Typography>
                    {/* Placeholder for future "Set End form search" if needed */}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      onClick={clearPoints}
                      startIcon={<Delete />}
                      fullWidth
                    >
                      Clear
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => calculateRoute(points)}
                      disabled={points.length !== 2}
                      startIcon={<Route />}
                      fullWidth
                    >
                      Calculate
                    </Button>
                  </Box>

                  {/* Route Result */}
                  {distance && (
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', textAlign: 'center' }}>
                      <Grid container>
                        <Grid item xs={6} sx={{ borderRight: '1px solid #ddd' }}>
                          <Typography variant="caption" display="block">Total Distance</Typography>
                          <Typography variant="h6" color="primary">{distance} km</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" display="block">Estimated Time</Typography>
                          <Typography variant="h6" color="secondary">
                            {eta ? `${eta.hours}h ${eta.minutes}m` : '--'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}
                </Stack>
              </Box>

              <Divider />

              {/* 3. Trip Actions (Start New Trip only) */}
              {distance && !activeTripId && (
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    TRIP MANAGEMENT
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      label="Trip Name"
                      placeholder="e.g. Morning Delivery"
                      size="small"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleStartTrip}
                      disabled={tripLoading || !deviceId}
                      startIcon={tripLoading ? null : <DirectionsCar />}
                      fullWidth
                    >
                      {tripLoading ? "Starting..." : "Start Trip"}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          )}

          {/* --- NAVIGATION TAB --- */}
          {/* --- NAVIGATION TAB --- */}
          {tabValue === 1 && (
            <Box>
              {/* Trip Active Controls in Navigation */}
              {activeTripId && (
                <Paper variant="outlined" sx={{ p: 2, m: 2, mb: 1, borderColor: 'green', bgcolor: '#f0f9f0' }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                        TRIP ACTIVE
                      </Typography>
                      <Chip label={`ID: ${activeTripId}`} size="small" variant="outlined" color="success" />
                    </Box>

                    <TextField
                      label="Update Name"
                      size="small"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      fullWidth
                      sx={{ bgcolor: 'white' }}
                    />

                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          onClick={handleUpdateTrip}
                          disabled={tripLoading}
                        >
                          Update
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          onClick={handleEndTrip}
                          disabled={tripLoading}
                        >
                          End
                        </Button>
                      </Box>

                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={handleCancelTrip}
                        disabled={tripLoading}
                        startIcon={<Delete />}
                      >
                        Cancel Trip
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              )}

              <List dense>
                {instructions.length > 0 ? (
                  instructions.map((step, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {step.sign === 0 ? <DirectionsCar fontSize="small" /> :
                          step.sign === 2 ? <Navigation sx={{ transform: 'rotate(90deg)' }} fontSize="small" /> :
                            step.sign === -2 ? <Navigation sx={{ transform: 'rotate(-90deg)' }} fontSize="small" /> :
                              <Navigation fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={step.text}
                        secondary={`${(step.distance / 1000).toFixed(2)} km`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No route calculated.
                    </Typography>
                  </Box>
                )}
              </List>
            </Box>
          )}

          {/* --- HISTORY TAB --- */}
          {tabValue === 2 && (
            <Stack spacing={1}>
              {historyTrips.length > 0 ? (
                historyTrips.map((trip) => (
                  <Card key={trip.id} variant="outlined" sx={{ '&:hover': { bgcolor: '#f5f5f5' }, cursor: 'pointer' }} onClick={() => loadTrip(trip)}>
                    <CardContent sx={{ p: '12px !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {trip.trip_name || `Trip #${trip.id}`}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(trip.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" fontSize="small">
                          📍 {parseFloat(trip.distance_travel || 0).toFixed(2)} km
                        </Typography>
                        <Typography variant="body2" fontSize="small">
                          ⏱ {trip.expected_time_of_travel}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    No trip history found.
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </MainCard>
  );
};

export default RouteETA;