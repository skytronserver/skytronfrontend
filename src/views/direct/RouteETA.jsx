import React, { useEffect, useState, useRef } from "react";
import MainCard from "../../ui-component/cards/MainCard";
import TaggingService from "../../services/TaggingService";
import { createAxiosInstance } from "../../services/axiosInstance";
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
} from "@mui/material";
import { ExpandLess, ExpandMore, History, Delete, Route } from '@mui/icons-material';
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM, TileWMS } from "ol/source";
import { fromLonLat, toLonLat, get as getProjection } from "ol/proj";
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
  const [inputValue, setInputValue] = useState("");
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [pointLabels, setPointLabels] = useState(["Start Point", "End Point"]);
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const map = useRef(null);
  const AVG_SPEED_KMH = 40; // Average speed in km/h
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success"
  });
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [expandHistory, setExpandHistory] = useState(true);

  // Create stable function references for event handlers
  const addPointRef = useRef((coord) => {
    console.log("Adding point via ref:", coord);
    
    setPoints(prevPoints => {
      console.log("Previous points:", prevPoints);
      const updatedPoints = [...prevPoints, coord];
      console.log("Updated points:", updatedPoints);
      
      // Calculate route if we have 2 points
      if (updatedPoints.length === 2) {
        console.log("We have 2 points, calculating route");
        calculateRoute(updatedPoints);
      }
      
      return updatedPoints;
    });
  });

  const clearPointsRef = useRef(() => {
    console.log("Clearing points");
    setPoints([]);
    setDistance(null);
    setEta(null);
  });

  // Update references when functions change
  useEffect(() => {
    addPointRef.current = addPoint;
    clearPointsRef.current = clearPoints;
  }, []);

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

  // Initialize map on first render
  useEffect(() => {
    if (!map.current) {
      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          // India3 layer
          new TileLayer({
            source: new TileWMS({
              url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
              params: {
                'LAYERS': 'india3',
                'TILED': true,
                'VERSION': '1.1.1',
                'FORMAT': 'image/png',
                'TRANSPARENT': 'true',
                'SRS': 'EPSG:4326',
                'WIDTH': 256,
                'HEIGHT': 256,
                'pixelRatio': 1,
              },
              serverType: 'geoserver',
              projection: 'EPSG:4326',
            })
          }),
          // Admin group layer (basemap)
          new TileLayer({
            source: new TileWMS({
              url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
              params: {
                'LAYERS': 'basemap%3Aadmin_group',
                'TILED': true,
                'VERSION': '1.1.1',
                'FORMAT': 'image/png',
                'TRANSPARENT': 'true',
                'SRS': 'EPSG:4326',
                'WIDTH': 256,
                'HEIGHT': 256,
                'pixelRatio': 1,
              },
              serverType: 'geoserver',
              projection: 'EPSG:4326',
            })
          }),
          // Roads layer (mmi_india)
          new TileLayer({
            source: new TileWMS({
              url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
              params: {
                'LAYERS': 'mmi:mmi_india',
                'TILED': true,
                'VERSION': '1.1.1',
                'FORMAT': 'image/png',
                'TRANSPARENT': 'true',
                'SRS': 'EPSG:4326',
                'WIDTH': 256,
                'HEIGHT': 256,
                'pixelRatio': 1,
              },
              serverType: 'geoserver',
              projection: 'EPSG:4326',
            })
          }),
        ],
        view: new View({
          center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
          zoom: 7,
          projection: 'EPSG:3857', // WebMercator projection
        }),
        pixelRatio: 1,
      });

      const vectorLayer = new VectorLayer({
        source: vectorSourceRef.current,
      });

      initialMap.addLayer(vectorLayer);
      map.current = initialMap;
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
      map.current.on('click', function(evt) {
        try {
          console.log("Map clicked at:", evt.coordinate);
          
          // Convert to EPSG:4326 (lon/lat)
          const lonLatCoord = toLonLat(evt.coordinate);
          console.log("Converted to lon/lat:", lonLatCoord);
          
          // Limit to 2 points for start and end
          if (points.length < 2) {
            addPointRef.current(lonLatCoord);
          } else {
            // If we already have 2 points, reset and add the new point
            clearPointsRef.current();
            // Need setTimeout to ensure state updates before adding new point
            setTimeout(() => {
              addPointRef.current(lonLatCoord);
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
    };
  }, []); // Empty dependency array, only run on mount

  // Update map when points change
  useEffect(() => {
    console.log("Points changed, updating map:", points);
    updateMapPoints(points);
  }, [points]);

  // Load saved routes from localStorage on component mount
  useEffect(() => {
    try {
      const storedRoutes = localStorage.getItem(`routeETA_${deviceId}`);
      if (storedRoutes) {
        setSavedRoutes(JSON.parse(storedRoutes));
      }
    } catch (error) {
      console.error("Error loading saved routes:", error);
    }
  }, [deviceId]);

  // Save route to history after successful calculation
  const saveRouteToHistory = (route) => {
    try {
      // Create a unique ID for this route
      const routeId = Date.now().toString();
      
      const routeData = {
        id: routeId,
        timestamp: new Date().toISOString(),
        startPoint: points[0],
        endPoint: points[1],
        distance: distance,
        eta: eta,
        deviceId: deviceId
      };
      
      setSavedRoutes(prevRoutes => {
        // Add to beginning, keep max 10 routes
        const updatedRoutes = [routeData, ...prevRoutes].slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem(`routeETA_${deviceId}`, JSON.stringify(updatedRoutes));
        
        return updatedRoutes;
      });
      
      setAlert({
        open: true,
        message: "Route saved to history",
        type: "success"
      });
    } catch (error) {
      console.error("Error saving route to history:", error);
    }
  };

  // Delete a saved route
  const deleteRoute = (routeId) => {
    setSavedRoutes(prevRoutes => {
      const updatedRoutes = prevRoutes.filter(route => route.id !== routeId);
      
      // Update localStorage
      localStorage.setItem(`routeETA_${deviceId}`, JSON.stringify(updatedRoutes));
      
      return updatedRoutes;
    });
  };

  // Load a saved route
  const loadRoute = (route) => {
    try {
      setPoints([route.startPoint, route.endPoint]);
      setDistance(route.distance);
      setEta(route.eta);
      
      // This will trigger a map update via the useEffect that watches points
      
      setAlert({
        open: true,
        message: "Previous route loaded",
        type: "info"
      });
    } catch (error) {
      console.error("Error loading saved route:", error);
      setAlert({
        open: true,
        message: "Error loading route. Please try again.",
        type: "error"
      });
    }
  };

  const handleAutocompleteChange = (event, newValue) => {
    if (newValue) {
      setDeviceId(newValue.device.id);
    }
  };

  // Add a point on the map and update state
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
    
    // Ensure vector source is cleared
    if (vectorSourceRef.current) {
      console.log("Clearing vector source");
      vectorSourceRef.current.clear();
    } else {
      console.warn("Vector source ref is undefined");
    }
  };

  // Update map with points and route line
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

  // Calculate route using the API or direct line distance
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
      const routeData = await HomePageService.getRoute({ points: routePoints });
      console.log("Route data from API:", routeData);
      
      // Check if we have valid paths data
      if (!routeData?.data?.data?.paths?.[0]?.points?.coordinates) {
        throw new Error('Invalid route data received');
      }

      const path = routeData.data.data.paths[0];
      const coordinates = path.points.coordinates;
      
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
      
      // Save the route to history if device is selected
      if (deviceId) {
        saveRouteToHistory({
          ...path,
          hash: routeData.data.hash
        });
      }
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

  // Fallback method to calculate straight line distance
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
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
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

  return (
    <MainCard>
      <AutoHideAlert 
        open={alert.open}
        onClose={() => setAlert({...alert, open: false})}
        message={alert.message}
        type={alert.type}
      />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h3" component="h2" gutterBottom>
            Route ETA Calculator
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Click on the map to set a start point and end point to calculate distance and ETA based on an average speed of 40 km/h.
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Autocomplete
            value={deviceList.find((item) => item.device.id === deviceId) || null}
            onChange={handleAutocompleteChange}
            options={inputValue ? deviceList : []}
            getOptionLabel={(option) => option.vehicle_reg_no || ""}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Vehicle Registration No"
                variant="outlined"
                fullWidth
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}
            noOptionsText="Enter Vehicle Registration No."
            isOptionEqualToValue={(option, value) =>
              option.device.id === value.device.id
            }
            disableClearable
          />
        </Grid>
        
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              if (points.length === 2) {
                calculateRoute(points);
              } else {
                setAlert({
                  open: true,
                  message: "Please select start and end points first",
                  type: "warning"
                });
              }
            }}
            sx={{ mr: 2 }}
            disabled={points.length !== 2}
            startIcon={<Route />}
          >
            Calculate Route
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={clearPoints}
            startIcon={<Delete />}
          >
            Clear Points
          </Button>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Map container */}
        <Box sx={{ position: 'relative', flex: 3 }}>
          <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
            <Box ref={mapRef} id="map" sx={{ width: "100%", height: "550px", position: 'relative' }}>
              <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
              <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
              <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />
            </Box>
          </Paper>
          
          {/* Map Legend */}
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'absolute', 
              bottom: 15, 
              left: 15, 
              p: 1.5, 
              zIndex: 1000,
              backgroundColor: 'rgba(255,255,255,0.9)',
              width: 'auto',
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
              Map Legend
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#007bff', mr: 1 }} />
              <Typography variant="body2">Start Point</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#dc3545', mr: 1 }} />
              <Typography variant="body2">End Point</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ width: 20, height: 3, bgcolor: '#0066ff', mr: 1 }} />
              <Typography variant="body2">Actual Route</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: 20, height: 3, bgcolor: '#ff6b6b', mr: 1, borderStyle: 'dashed', borderWidth: 1 }} />
              <Typography variant="body2">Direct Line (Fallback)</Typography>
            </Box>
          </Paper>
        </Box>
        
        {/* Right side panel with route details and history */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Current route details */}
          <Paper elevation={3} sx={{ p: 3, minWidth: { xs: '100%', md: '300px' }, height: 'fit-content' }}>
            <Typography variant="h4" gutterBottom>
              Route Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {points.length > 0 ? (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Start Point:</strong> 
                  {points.length > 0 ? ` ${points[0][0].toFixed(6)}, ${points[0][1].toFixed(6)}` : ' Not set'}
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  <strong>End Point:</strong>
                  {points.length > 1 ? ` ${points[1][0].toFixed(6)}, ${points[1][1].toFixed(6)}` : ' Not set'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {distance && (
                  <Typography variant="h6" gutterBottom color="primary">
                    Distance: {distance} km
                  </Typography>
                )}
                
                {eta && (
                  <Typography variant="h6" gutterBottom color="secondary">
                    Estimated Time: {eta.hours > 0 ? `${eta.hours} hour${eta.hours !== 1 ? 's' : ''} ` : ''}
                    {eta.minutes} minute{eta.minutes !== 1 ? 's' : ''}
                  </Typography>
                )}
                
                {distance && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    * Based on an average speed of {AVG_SPEED_KMH} km/h
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body1" color="textSecondary">
                Click on the map to set start and end points.
              </Typography>
            )}
          </Paper>
          
          {/* Route history panel */}
          <Paper elevation={3} sx={{ p: 3, minWidth: { xs: '100%', md: '300px' }, height: 'fit-content' }}>
            {/* History header with toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h4">
                  Route History
                </Typography>
              </Box>
              <IconButton 
                onClick={() => setExpandHistory(!expandHistory)}
                size="small"
              >
                {expandHistory ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Collapse in={expandHistory} timeout="auto" unmountOnExit>
              {deviceId ? (
                savedRoutes.length > 0 ? (
                  <List sx={{ p: 0 }}>
                    {savedRoutes.map((route) => (
                      <ListItem 
                        key={route.id}
                        disablePadding
                        secondaryAction={
                          <IconButton 
                            edge="end" 
                            aria-label="delete" 
                            onClick={() => deleteRoute(route.id)}
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        }
                        sx={{ mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                      >
                        <ListItemButton onClick={() => loadRoute(route)} dense>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Route sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                                <Typography variant="subtitle2">
                                  {route.distance} km ({route.eta.hours > 0 ? `${route.eta.hours}h ` : ''}{route.eta.minutes}m)
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {new Date(route.timestamp).toLocaleString()}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="textSecondary" align="center">
                    No previous routes yet. Calculate a route to save it here.
                  </Typography>
                )
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  Select a vehicle to view saved routes.
                </Typography>
              )}
            </Collapse>
          </Paper>
        </Box>
      </Box>
    </MainCard>
  );
};

export default RouteETA; 