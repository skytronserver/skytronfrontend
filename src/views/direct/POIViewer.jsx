import React, { useEffect, useRef, useState } from 'react';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource, TileWMS } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Icon, Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import Circle from 'ol/geom/Circle';
import LineString from 'ol/geom/LineString';
import Overlay from 'ol/Overlay';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import Zoom from 'ol/control/Zoom';
import 'ol/ol.css';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Tooltip,
  Fade,
  Dialog,
  DialogContent,
  Chip,
  Divider,
  useTheme,
  alpha,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Drawer,
  ListItemButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
  Circle as CircleIcon,
  Timeline as PolylineIcon,
  Route as RouteIcon,
  Close as CloseIcon,
  Menu as MenuIcon,
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  Search as SearchIcon,
  Map as MapIcon,
  LocationCity as CityIcon,
  Terrain as TerrainIcon,
  Satellite as SatelliteIcon,
  People as PeopleIcon,
  List as ListIcon,
} from '@mui/icons-material';
import POIService from '../../services/POIService';
import HomePageService from '../../services/HomePage';

const POIViewer = () => {
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [vectorLayer] = useState(
    new VectorLayer({
      source: vectorSource,
      zIndex: 100, // Ensure POI layer is on top
    })
  );
  const [pois, setPois] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    mark_type: 'Point',
    use_type: 'School',
    location: '',
    radius: '100.5',
    alert_type: '',
    speed_limit: '',
  });
  const [mapInitialized, setMapInitialized] = useState(false);
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawingSource] = useState(new VectorSource());
  const [drawingLayer] = useState(
    new VectorLayer({
      source: drawingSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
      }),
      zIndex: 101, // Ensure drawing layer is above POI layer
    })
  );
  const [drawInteraction, setDrawInteraction] = useState(null);
  const [modifyInteraction, setModifyInteraction] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [layersAnchorEl, setLayersAnchorEl] = useState(null);
  const [layers, setLayers] = useState({
    osm: {
      name: 'Map View',
      visible: true,
      icon: <MapIcon />,
      layer: null,
    },
    hybrid: {
      name: 'Hybrid View',
      visible: false,
      icon: <SatelliteIcon />,
      layer: null,
    },
    india3: {
      name: 'Terrain',
      visible: true,
      icon: <TerrainIcon />,
      layer: null,
    },
    adminGroup: {
      name: 'Administrative',
      visible: true,
      icon: <CityIcon />,
      layer: null,
    },
    roads: {
      name: 'Roads',
      visible: true,
      icon: <RouteIcon />,
      layer: null,
    },
    crowdsourced: {
      name: 'Crowdsourced POI',
      visible: false,
      icon: <PeopleIcon />,
      layer: null,
    },
  });
  const theme = useTheme();
  const [routePoints, setRoutePoints] = useState([]);
  const [routeLine, setRouteLine] = useState(null);
  const vectorSourceRef = useRef(new VectorSource());
  const [poiListOpen, setPoiListOpen] = useState(false);
  const [selectedPoiId, setSelectedPoiId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const markerStyles = {
    Point: new Style({
      image: new Icon({
        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"><path fill="%231976D2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
        anchor: [0.5, 1],
        scale: 1.2,
      }),
      zIndex: 1000,
    }),
    Circle: new Style({
      fill: new Fill({
        color: 'rgba(66, 165, 245, 0.2)',
      }),
      stroke: new Stroke({
        color: '#42A5F5',
        width: 2,
      }),
      zIndex: 900,
    }),
    Polygon: new Style({
      fill: new Fill({
        color: 'rgba(76, 175, 80, 0.2)',
      }),
      stroke: new Stroke({
        color: '#4CAF50',
        width: 2,
      }),
      zIndex: 900,
    }),
    Road: new Style({
      stroke: new Stroke({
        color: '#FF9800',
        width: 3,
      }),
      zIndex: 900,
    }),
  };

  // Initialize the map
  useEffect(() => {
    const osmLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0,
    });

    const hybridLayer = new TileLayer({
      source: new TileWMS({
        url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
        params: {
          LAYERS: 'india3',
          TILED: true,
          VERSION: '1.1.1',
          FORMAT: 'image/png',
          TRANSPARENT: 'true',
          SRS: 'EPSG:4326',
          WIDTH: 256,
          HEIGHT: 256,
          pixelRatio: 1,
        },
        serverType: 'geoserver',
        projection: 'EPSG:4326',
      }),
      zIndex: 1,
    });

    const india3Layer = new TileLayer({
      source: new TileWMS({
        url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
        params: {
          LAYERS: 'india3',
          TILED: true,
          VERSION: '1.1.1',
          FORMAT: 'image/png',
          TRANSPARENT: 'true',
          SRS: 'EPSG:4326',
          WIDTH: 256,
          HEIGHT: 256,
          pixelRatio: 1,
        },
        serverType: 'geoserver',
        projection: 'EPSG:4326',
      }),
      zIndex: 2,
    });

    const adminGroupLayer = new TileLayer({
      source: new TileWMS({
        url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
        params: {
          LAYERS: 'basemap%3Aadmin_group',
          TILED: true,
          VERSION: '1.1.1',
          FORMAT: 'image/png',
          TRANSPARENT: 'true',
          SRS: 'EPSG:4326',
          WIDTH: 256,
          HEIGHT: 256,
          pixelRatio: 1,
        },
        serverType: 'geoserver',
        projection: 'EPSG:4326',
      }),
      zIndex: 3,
    });

    const roadsLayer = new TileLayer({
      source: new TileWMS({
        url: 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
        params: {
          LAYERS: 'mmi:mmi_india',
          TILED: true,
          VERSION: '1.1.1',
          FORMAT: 'image/png',
          TRANSPARENT: 'true',
          SRS: 'EPSG:4326',
          WIDTH: 256,
          HEIGHT: 256,
          pixelRatio: 1,
        },
        serverType: 'geoserver',
        projection: 'EPSG:4326',
      }),
      zIndex: 4,
    });

    const crowdsourcedLayer = new VectorLayer({
      source: new VectorSource(),
      zIndex: 5,
      style: new Style({
        image: new Icon({
          src: `${process.env.REACT_APP_BASE_URL}static/track.png`,
          scale: 0.051,
          anchor: [0.5, 1],
          anchorXUnits: "fraction",
          anchorYUnits: "fraction",
        }),
      }),
    });

    setLayers(prev => ({
      ...prev,
      osm: { ...prev.osm, layer: osmLayer },
      hybrid: { ...prev.hybrid, layer: hybridLayer },
      india3: { ...prev.india3, layer: india3Layer },
      adminGroup: { ...prev.adminGroup, layer: adminGroupLayer },
      roads: { ...prev.roads, layer: roadsLayer },
      crowdsourced: { ...prev.crowdsourced, layer: crowdsourcedLayer },
    }));

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        osmLayer,
        hybridLayer,
        india3Layer,
        adminGroupLayer,
        roadsLayer,
        crowdsourcedLayer,
        vectorLayer,
        drawingLayer,
      ],
      view: new View({
        center: fromLonLat([91.829437, 26.131644]),
        zoom: 13,
        projection: 'EPSG:3857',
      }),
      pixelRatio: 1,
      controls: [
        new Zoom({
          className: 'custom-zoom-control',
          target: document.getElementById('zoom-control-container'),
        }),
      ],
    });

    const overlay = new Overlay({
      element: overlayRef.current,
      positioning: 'bottom-center',
      offset: [0, -10],
      stopEvent: false,
    });
    initialMap.addOverlay(overlay);
    setMap(initialMap);
    setMapInitialized(true);

    // Configure map interactions
    initialMap.on('click', (evt) => {
      const feature = initialMap.forEachFeatureAtPixel(evt.pixel, (feature) => feature, { hitTolerance: 5 });
      
      if (feature) {
        const poi = feature.get('data');
        if (poi) {
          setSelectedPoi(poi);
          setPopoverAnchor(evt.pixel);
          setPopoverOpen(true);
        }
      } else {
        setPopoverOpen(false);
        setSelectedPoi(null);
      }
    });

    // Remove hover effect
    initialMap.on('pointermove', (evt) => {
      if (evt.dragging) return;
      
      const hit = initialMap.hasFeatureAtPixel(evt.pixel, { 
        hitTolerance: 5,
        layerFilter: (layer) => layer === vectorLayer 
      });
      
      initialMap.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    return () => {
      if (initialMap) {
        initialMap.setTarget(null);
      }
    };
  }, [vectorLayer, drawingLayer]);

  // Add effect to handle layer visibility
  useEffect(() => {
    if (!map) return;

    Object.entries(layers).forEach(([key, layerData]) => {
      if (layerData.layer) {
        layerData.layer.setVisible(layerData.visible);
      }
    });
  }, [layers, map]);

  // Fetch POIs once map is initialized
  useEffect(() => {
    if (mapInitialized) {
      fetchPOIs();
    }
  }, [mapInitialized]);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      const response = await POIService.getAllPOIs();
      if (response && response.data) {
        setPois(response.data);
        updateMapMarkers(response.data);
      } else {
        showSnackbar('Invalid response format from server', 'error');
      }
    } catch (error) {
      showSnackbar('Error fetching POIs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateMapMarkers = (poiList) => {
    if (!vectorSource) return;

    vectorSource.clear();

    poiList.forEach((poi) => {
      try {
        const location = JSON.parse(poi.location);
        if (Array.isArray(location) && location.length > 0) {
          let feature;
          let style = markerStyles[poi.mark_type];

          switch (poi.mark_type) {
            case 'Point':
              if (location[0] && location[0].length === 2) {
                const [lat, lon] = location[0];
                const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);
                feature = new Feature({
                  geometry: new Point(coordinates),
                  data: poi,
                });
              }
              break;

            case 'Circle':
              if (location[0] && location[0].length === 2) {
                const [lat, lon] = location[0];
                const center = fromLonLat([parseFloat(lon), parseFloat(lat)]);
                const radius = parseFloat(poi.radius) || 100;
                feature = new Feature({
                  geometry: new Circle(center, radius),
                  data: poi,
                });
              }
              break;

            case 'Polygon':
              if (location.length >= 3) {
                const polygonCoords = location.map(coord => {
                  if (coord && coord.length === 2) {
                    const [lat, lon] = coord;
                    return fromLonLat([parseFloat(lon), parseFloat(lat)]);
                  }
                  return null;
                }).filter(coord => coord !== null);

                if (polygonCoords.length >= 3) {
                  feature = new Feature({
                    geometry: new Polygon([polygonCoords]),
                    data: poi,
                  });
                }
              }
              break;

            case 'Road':
              if (location.length >= 2) {
                const roadCoords = location.map(coord => {
                  if (coord && coord.length === 2) {
                    const [lat, lon] = coord;
                    return fromLonLat([parseFloat(lon), parseFloat(lat)]);
                  }
                  return null;
                }).filter(coord => coord !== null);

                if (roadCoords.length >= 2) {
                  feature = new Feature({
                    geometry: new LineString(roadCoords),
                    data: poi,
                  });
                }
              }
              break;
          }

          if (feature) {
            feature.setStyle(style);
            vectorSource.addFeature(feature);
          }
        }
      } catch (error) {
        console.error('Error processing POI:', poi.id, error);
      }
    });
  };

  const handleEditClick = (poi) => {
    setFormData({
      name: poi.name,
      description: poi.description,
      status: poi.status,
      mark_type: poi.mark_type,
      use_type: poi.use_type,
      location: poi.location,
      radius: poi.radius,
      alert_type: poi.alert_type || '',
      speed_limit: poi.speed_limit || '',
    });
    setSelectedPoi(poi);
    setIsEditMode(true);
    setDialogOpen(true);
    setPopoverOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });

      if (isEditMode && selectedPoi) {
        formDataObj.append('poi_id', selectedPoi.id);
        await POIService.updatePOI(formDataObj);
        showSnackbar('POI updated successfully', 'success');
      } else {
        await POIService.createPOI(formDataObj);
        showSnackbar('POI created successfully', 'success');
      }

      setDialogOpen(false);
      setIsEditMode(false);
      setSelectedPoi(null);
      fetchPOIs();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving POI. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPoi) return;

    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('poi_id', selectedPoi.id);
     const res= await POIService.deletePOI(formDataObj);
      showSnackbar('POI deleted successfully', 'success');

      setSelectedPoi(null);
      setPopoverOpen(false);
      fetchPOIs();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error deleting POI. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const handleResize = () => {
      if (map) {
        map.updateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  const handleDrawingModeChange = (event, newMode) => {
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
      setDrawInteraction(null);
    }
    if (modifyInteraction) {
      map.removeInteraction(modifyInteraction);
      setModifyInteraction(null);
    }

    setDrawingMode(newMode);
    setIsEditMode(false);
    setSelectedPoi(null);
    setRoutePoints([]);
    vectorSourceRef.current.clear();

    if (newMode) {
      let geometryType;
      let minPoints;
      let style;

      switch (newMode) {
        case 'point':
          geometryType = 'Point';
          style = markerStyles.Point;
          break;
        case 'circle':
          geometryType = 'Circle';
          style = markerStyles.Circle;
          break;
        case 'polygon':
          geometryType = 'Polygon';
          minPoints = 3;
          style = markerStyles.Polygon;
          break;
        case 'road':
          geometryType = 'LineString';
          minPoints = 2;
          style = markerStyles.Road;
          break;
      }

      const draw = new Draw({
        source: drawingSource,
        type: geometryType,
        minPoints: minPoints,
        style: style,
      });

      draw.on('drawstart', () => {
        drawingSource.clear();
      });

      draw.on('drawend', (event) => {
        const feature = event.feature;
        const geometry = feature.getGeometry();
        let coordinates;
        let markType;
        let radius = '100.5';

        try {
          if (geometry instanceof Point) {
            const [lon, lat] = toLonLat(geometry.getCoordinates());
            coordinates = [[lat, lon]];
            markType = 'Point';
          } else if (geometry instanceof Circle) {
            const center = toLonLat(geometry.getCenter());
            radius = Math.round(geometry.getRadius());
            coordinates = [[center[1], center[0]]];
            markType = 'Circle';
          } else if (geometry instanceof Polygon) {
            coordinates = geometry.getCoordinates()[0].map(coord => {
              const [lon, lat] = toLonLat(coord);
              return [lat, lon];
            });
            markType = 'Polygon';
          } else if (geometry instanceof LineString) {
            coordinates = geometry.getCoordinates().map(coord => {
              const [lon, lat] = toLonLat(coord);
              return [lat, lon];
            });
            markType = 'Road';
          }

          if (coordinates) {
            setFormData(prev => ({
              ...prev,
              location: JSON.stringify(coordinates),
              mark_type: markType,
              radius: radius,
            }));
            setDialogOpen(true);
          }
        } catch (error) {
          showSnackbar('Error processing drawn geometry. Please try again.', 'error');
        } finally {
          setDrawingMode(null);
          drawingSource.clear();
        }
      });

      const modify = new Modify({
        source: drawingSource,
      });

      map.addInteraction(draw);
      map.addInteraction(modify);
      setDrawInteraction(draw);
      setModifyInteraction(modify);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setIsEditMode(false);
    setSelectedPoi(null);
    if (drawInteraction) {
      map.removeInteraction(drawInteraction);
      setDrawInteraction(null);
    }
    if (modifyInteraction) {
      map.removeInteraction(modifyInteraction);
      setModifyInteraction(null);
    }
    drawingSource.clear();
    setDrawingMode(null);
    setFormData({
      name: '',
      description: '',
      status: 'Active',
      mark_type: 'Point',
      use_type: 'School',
      location: '',
      radius: '100.5',
      alert_type: '',
      speed_limit: '',
    });
  };

  const handleLayerToggle = (layerId) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        visible: !prev[layerId].visible,
      },
    }));
  };

  // Add route vector layer
  useEffect(() => {
    if (map) {
      const vectorLayer = new VectorLayer({
        source: vectorSourceRef.current,
      });
      map.addLayer(vectorLayer);
    }
  }, [map]);

  // Handle map click for route points
  useEffect(() => {
    if (map && drawingMode === 'road') {
      const clickHandler = (e) => {
        const coord = e.coordinate;
        const lonLat = toLonLat(coord);
        
        setRoutePoints(prev => {
          const newPoints = [...prev, lonLat];
          
          // Show visual feedback for selected points
          const pointFeature = new Feature({
            geometry: new Point(coord),
          });
          
          pointFeature.setStyle(
            new Style({
              image: new Icon({
                src: `${process.env.REACT_APP_BASE_URL}static/track.png`,
                scale: 0.051,
                anchor: [0.5, 1],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
              }),
            })
          );
          
          vectorSourceRef.current.addFeature(pointFeature);
          
          // If we have two points, fetch the route
          if (newPoints.length === 2) {
            // Show loading state
            showSnackbar('Fetching route...', 'info');
            fetchRoute(newPoints);
          } else if (newPoints.length === 1) {
            showSnackbar('Click another point to complete the route', 'info');
          }
          
          return newPoints;
        });
      };

      map.on('click', clickHandler);
      return () => {
        map.un('click', clickHandler);
        // Clear any temporary points when switching modes
        vectorSourceRef.current.clear();
        setRoutePoints([]);
      };
    }
  }, [map, drawingMode]);

  const fetchRoute = async (points) => {
    try {
      setLoading(true);
      
      // Validate points are not too close to each other
      const distance = Math.sqrt(
        Math.pow(points[1][0] - points[0][0], 2) + 
        Math.pow(points[1][1] - points[0][1], 2)
      );
      
      if (distance < 0.0001) { // Points are too close
        throw new Error('Selected points are too close to each other. Please select points further apart.');
      }

      const response = await HomePageService.getRoute({ points });
      const routeData = response?.data?.data && response.data.data.paths ? response.data.data : response.data;

      if (!routeData?.paths?.[0]?.points) {
        throw new Error('No route found between the selected points');
      }

      const firstPath = routeData.paths[0];
      let coordinates;
      
      if (firstPath.points.type === "LineString" && Array.isArray(firstPath.points.coordinates)) {
        // Convert coordinates to [lat, lon] format
        coordinates = firstPath.points.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Validate coordinates
        if (coordinates.length < 2) {
          throw new Error('Invalid route: Not enough points in the route');
        }
        
        // Check for invalid coordinates
        if (coordinates.some(coord => !coord || coord.length !== 2 || isNaN(coord[0]) || isNaN(coord[1]))) {
          throw new Error('Invalid coordinates in route');
        }
      } else {
        throw new Error('Invalid route data structure');
      }

      // Display the route
      displayRoute(coordinates);
      
      // Update form data with the route coordinates
      setFormData(prev => ({
        ...prev,
        location: JSON.stringify(coordinates),
        mark_type: 'Road',
        use_type: 'PermitRoute',
        name: `Route ${Date.now()}`,
        description: 'Generated route',
        status: 'Active',
        alert_type: prev.alert_type || '',
        speed_limit: prev.speed_limit || '',
      }));

      // Open the dialog to show the route data
      setDialogOpen(true);
      
      // Reset points
      setRoutePoints([]);
    } catch (error) {
      console.error('Error fetching route:', error);
      showSnackbar(error.message || 'Error fetching route. Please try again.', 'error');
      // Clear any temporary points on error
      vectorSourceRef.current.clear();
      setRoutePoints([]);
    } finally {
      setLoading(false);
    }
  };

  const displayRoute = (coordinates) => {
    try {
      // Clear previous route
      vectorSourceRef.current.clear();

      // Create start and end points
      const startPoint = new Feature({
        geometry: new Point(fromLonLat([coordinates[0][1], coordinates[0][0]])),
      });
      const endPoint = new Feature({
        geometry: new Point(fromLonLat([coordinates[coordinates.length - 1][1], coordinates[coordinates.length - 1][0]])),
      });

      // Style for points
      [startPoint, endPoint].forEach(point => {
        point.setStyle(
          new Style({
            image: new Icon({
              src: `${process.env.REACT_APP_BASE_URL}static/track.png`,
              scale: 0.051,
              anchor: [0.5, 1],
              anchorXUnits: "fraction",
              anchorYUnits: "fraction",
            }),
          })
        );
      });

      // Create route line
      const lineCoordinates = coordinates.map(coord => fromLonLat([coord[1], coord[0]]));
      const line = new Feature({
        geometry: new LineString(lineCoordinates),
      });

      line.setStyle(
        new Style({
          stroke: new Stroke({
            color: '#0066ff',
            width: 3,
          }),
        })
      );

      // Add features to the vector source
      vectorSourceRef.current.addFeatures([startPoint, endPoint, line]);

      // Fit view to the route with animation
      const extent = line.getGeometry().getExtent();
      if (extent) {
        map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          maxZoom: 18,
        });
      }
    } catch (error) {
      console.error('Error displaying route:', error);
      showSnackbar('Error displaying route. Please try again.', 'error');
    }
  };

  const handlePoiClick = (poi) => {
    setSelectedPoiId(poi.id);
    // Center map on selected POI
    if (poi.location) {
      try {
        const location = JSON.parse(poi.location);
        if (Array.isArray(location) && location.length > 0) {
          const [lat, lon] = location[0];
          const coordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);
          map.getView().animate({
            center: coordinates,
            zoom: 15,
            duration: 1000
          });
        }
      } catch (error) {
        console.error('Error parsing POI location:', error);
      }
    }
  };

  const getPoiIcon = (markType) => {
    switch (markType) {
      case 'Point':
        return <LocationOnIcon />;
      case 'Circle':
        return <CircleIcon />;
      case 'Polygon':
        return <PolylineIcon />;
      case 'Road':
        return <RouteIcon />;
      default:
        return <LocationOnIcon />;
    }
  };

  const filteredPois = pois.filter(poi => {
    const searchLower = searchQuery.toLowerCase();
    return (
      poi.name.toLowerCase().includes(searchLower) ||
      (poi.description && poi.description.toLowerCase().includes(searchLower)) ||
      poi.use_type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Main Map Container */}
      <Box ref={mapRef} sx={{ height: '100%', width: '100%' }} />

      {/* Zoom Controls Container */}
      <Box
        id="zoom-control-container"
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
          overflow: 'hidden',
          zIndex: 1000,
          '& .custom-zoom-control': {
            display: 'flex',
            flexDirection: 'column',
            '& button': {
              width: 32,
              height: 32,
              padding: 0,
              backgroundColor: 'background.paper',
              border: 'none',
              borderBottom: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              '&:last-child': {
                borderBottom: 'none',
              },
            },
          },
        }}
      />

      {/* POI List Toggle Button */}
      <IconButton
        onClick={() => setPoiListOpen(!poiListOpen)}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
          zIndex: 1000,
        }}
      >
        <ListIcon />
      </IconButton>

      {/* POI List Drawer */}
      <Drawer
        anchor="left"
        open={poiListOpen}
        onClose={() => setPoiListOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            backgroundColor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">POI List</Typography>
            <IconButton onClick={() => setPoiListOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
          <TextField
            fullWidth
            size="small"
            placeholder="Search POIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              ),
            }}
          />
        </Box>
        <List sx={{ p: 1 }}>
          {filteredPois.map((poi) => (
            <ListItemButton
              key={poi.id}
              selected={selectedPoiId === poi.id}
              onClick={() => handlePoiClick(poi)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                },
              }}
            >
              <ListItemIcon>
                {getPoiIcon(poi.mark_type)}
              </ListItemIcon>
              <ListItemText
                primary={poi.name}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={poi.use_type}
                      size="small"
                      color="primary"
                      sx={{ height: 20 }}
                    />
                    <Chip
                      label={poi.status}
                      size="small"
                      color={poi.status === 'Active' ? 'success' : 'error'}
                      sx={{ height: 20 }}
                    />
                  </Stack>
                }
              />
            </ListItemButton>
          ))}
          {filteredPois.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No POIs found
              </Typography>
            </Box>
          )}
        </List>
      </Drawer>

      {/* Top Right Controls */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'background.paper',
        }}
      >
        <Stack spacing={1} p={1.5}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            fullWidth
            sx={{
              backgroundColor: 'background.paper',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              boxShadow: 'none',
              px: 2,
            }}
          >
            Add POI
          </Button>

          <Divider />
          
          <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 1 }}>
            Drawing Tools
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ pb: 0.5 }}>
            <Tooltip title="Point">
              <IconButton
                color={drawingMode === 'point' ? 'primary' : 'default'}
                onClick={() => handleDrawingModeChange(null, 'point')}
                sx={{
                  backgroundColor: drawingMode === 'point' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <LocationOnIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Circle">
              <IconButton
                color={drawingMode === 'circle' ? 'primary' : 'default'}
                onClick={() => handleDrawingModeChange(null, 'circle')}
                sx={{
                  backgroundColor: drawingMode === 'circle' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <CircleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Polygon">
              <IconButton
                color={drawingMode === 'polygon' ? 'primary' : 'default'}
                onClick={() => handleDrawingModeChange(null, 'polygon')}
                sx={{
                  backgroundColor: drawingMode === 'polygon' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <PolylineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Road">
              <IconButton
                color={drawingMode === 'road' ? 'primary' : 'default'}
                onClick={() => handleDrawingModeChange(null, 'road')}
                sx={{
                  backgroundColor: drawingMode === 'road' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  },
                }}
              >
                <RouteIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Divider />

          <Typography variant="subtitle2" color="text.secondary" sx={{ pl: 1 }}>
            Map Controls
          </Typography>

          <Stack direction="row" spacing={1} sx={{ pb: 0.5 }}>
            <Tooltip title="Search">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Layers">
              <IconButton onClick={(e) => setLayersAnchorEl(e.currentTarget)}>
                <LayersIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="My Location">
              <IconButton>
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* POI Info Tooltip */}
      {selectedPoi && popoverOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            transform: 'translate(-50%, -100%)',
            left: popoverAnchor ? popoverAnchor[0] : '50%',
            top: popoverAnchor ? popoverAnchor[1] - 20 : '50%', // Increased offset for better positioning
            width: 280,
            borderRadius: 1,
            overflow: 'visible',
            zIndex: 1000, // Ensure tooltip is above markers
            '&:before': {
              content: '""',
              position: 'absolute',
              bottom: -6,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 12,
              height: 12,
              backgroundColor: 'background.paper',
              boxShadow: 1,
              zIndex: 0,
            },
          }}
        >
          <Box 
            sx={{ 
              position: 'relative',
              backgroundColor: 'background.paper',
              zIndex: 1,
            }}
          >
            {selectedPoi.image && (
              <Box
                sx={{
                  width: '100%',
                  height: 120,
                  backgroundColor: 'grey.100',
                  backgroundImage: `url(${selectedPoi.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                }}
              />
            )}
            <Box sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="flex-start" mb={1}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      lineHeight: 1.2,
                    }}
                  >
                    {selectedPoi.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3,
                    }}
                  >
                    {selectedPoi.description || 'No description provided'}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setPopoverOpen(false)}
                  sx={{
                    mt: -0.5,
                    mr: -0.5,
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={0.5} mb={1}>
                <Chip
                  label={selectedPoi.use_type}
                  size="small"
                  color="primary"
                  sx={{
                    height: 20,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                    },
                  }}
                />
                <Chip
                  label={selectedPoi.status}
                  size="small"
                  color={selectedPoi.status === 'Active' ? 'success' : 'error'}
                  sx={{
                    height: 20,
                    '& .MuiChip-label': {
                      px: 1,
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                    },
                  }}
                />
                {selectedPoi.radius && (
                  <Chip
                    label={`${selectedPoi.radius}m`}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 20,
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.75rem',
                        lineHeight: 1.2,
                      },
                    }}
                  />
                )}
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    handleEditClick(selectedPoi);
                    setPopoverOpen(false);
                  }}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    py: 0.5,
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={() => {
                    handleDelete();
                    setPopoverOpen(false);
                  }}
                  disabled={loading}
                  fullWidth
                  sx={{
                    textTransform: 'none',
                    py: 0.5,
                  }}
                >
                  Delete
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {selectedPoi ? 'Edit POI' : 'New POI'}
            </Typography>
            <IconButton onClick={handleCancel} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              size="small"
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              size="small"
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="NotActive">Not Active</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Mark Type</InputLabel>
                <Select
                  value={formData.mark_type}
                  label="Mark Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, mark_type: e.target.value }))}
                >
                  <MenuItem value="Point">Point</MenuItem>
                  <MenuItem value="Circle">Circle</MenuItem>
                  <MenuItem value="Polygon">Polygon</MenuItem>
                  <MenuItem value="Road">Road</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <FormControl fullWidth size="small">
              <InputLabel>Use Type</InputLabel>
              <Select
                value={formData.use_type}
                label="Use Type"
                onChange={(e) => setFormData(prev => ({ ...prev, use_type: e.target.value }))}
              >
                <MenuItem value="StateBoundary">State Boundary</MenuItem>
                <MenuItem value="DistrictBoundary">District Boundary</MenuItem>
                <MenuItem value="CityBoundary">City Boundary</MenuItem>
                <MenuItem value="VillageBoundary">Village Boundary</MenuItem>
                <MenuItem value="PermitRoute">Permit Route</MenuItem>
                <MenuItem value="School">School</MenuItem>
                <MenuItem value="Hospital">Hospital</MenuItem>
                <MenuItem value="PoliceStation">Police Station</MenuItem>
                <MenuItem value="BusStop">Bus Stop</MenuItem>
                <MenuItem value="RailwayStation">Railway Station</MenuItem>
                <MenuItem value="Airport">Airport</MenuItem>
                <MenuItem value="FuelStation">Fuel Station</MenuItem>
                <MenuItem value="TollGate">Toll Gate</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
                <MenuItem value="dealer">Dealer</MenuItem>
                <MenuItem value="prohibited_area">Prohibited Area</MenuItem>
                <MenuItem value="no_entry">No Entry</MenuItem>
                <MenuItem value="parking">Parking</MenuItem>
                <MenuItem value="no_parking">No Parking</MenuItem>
              </Select>
            </FormControl>

            {formData.mark_type === 'Road' && (
              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Alert Type"
                  value={formData.alert_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, alert_type: e.target.value }))}
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Speed Limit (km/h)"
                  type="number"
                  value={formData.speed_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, speed_limit: e.target.value }))}
                  size="small"
                />
              </Stack>
            )}

            {formData.mark_type === 'Circle' && (
              <TextField
                fullWidth
                label="Radius (meters)"
                type="number"
                value={formData.radius}
                onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                size="small"
              />
            )}

            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              InputProps={{ readOnly: true }}
              size="small"
              helperText="Click on the map to set location"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.5),
                },
              }}
            />
          </Stack>
        </DialogContent>

        <Box sx={{ 
          p: 2, 
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleCancel}
              size="small"
              sx={{ px: 3 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.location}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              size="small"
              sx={{ px: 3 }}
            >
              {selectedPoi ? 'Update' : 'Create'}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add Layers Popover */}
      <Popover
        open={Boolean(layersAnchorEl)}
        anchorEl={layersAnchorEl}
        onClose={() => setLayersAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 250,
            mt: 1,
            borderRadius: 1,
          },
        }}
      >
        <List sx={{ p: 0 }}>
          {Object.entries(layers).map(([layerId, layerData]) => (
            <ListItem
              key={layerId}
              sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {layerData.icon}
              </ListItemIcon>
              <ListItemText 
                primary={layerData.name}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.9rem',
                  },
                }}
              />
              <Switch
                edge="end"
                size="small"
                checked={layerData.visible}
                onChange={() => handleLayerToggle(layerId)}
              />
            </ListItem>
          ))}
        </List>
      </Popover>
    </Box>
  );
};

export default POIViewer;
