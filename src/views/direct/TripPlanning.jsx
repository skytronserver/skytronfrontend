import React, { useEffect, useState, useRef } from "react";
import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import TaggingService from "../../services/TaggingService";
import TripService from "../../services/TripService";
import {
  MenuItem,
  Button,
  Grid,
  TextField,
  Select,
  Box,
  Autocomplete,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  FormGroup,
  InputAdornment,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RouteIcon from '@mui/icons-material/Route';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM, TileWMS } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Overlay from "ol/Overlay";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import AutoHideAlert from "../../ui-component/AutoHideAlert";
import TripPlanningMap from './TripPlanningMap';

// Days of the week for recurring trips
const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// Trip status options
const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Tab panel component for the trip list/calendar view
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Helper function to format date for input
const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format time for input
const formatTimeForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper function to combine date and time
const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

// Helper function to format date for display
const formatDateForDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString(undefined, options);
};

// Helper function to format time for display
const formatTimeForDisplay = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const options = { hour: '2-digit', minute: '2-digit' };
  return d.toLocaleTimeString(undefined, options);
};

// Helper function to add days to a date
const addDaysToDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const TripPlanning = () => {
  // State variables
  const [load, setLoad] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [routeData, setRouteData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newPoints, setNewPoints] = useState([]);
  const [trips, setTrips] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [openTripDialog, setOpenTripDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripForm, setTripForm] = useState({
    title: "",
    device_id: "",
    routeId: "",
    startDate: formatDateForInput(new Date()),
    startTime: formatTimeForInput(new Date()),
    endTime: formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1))),
    isRecurring: false,
    recurringPattern: {
      startDate: formatDateForInput(new Date()),
      endDate: formatDateForInput(new Date(new Date().setDate(new Date().getDate() + 30))),
      daysOfWeek: [],
      customTimes: {}
    }
  });
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success"
  });
  const [activeTrip, setActiveTrip] = useState(null);
  const [eta, setEta] = useState(null);
  const [tripTimer, setTripTimer] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedTripForMap, setSelectedTripForMap] = useState(null);
  const [mapEta, setMapEta] = useState(null);

  // Refs
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const map = useRef(null);
  const overlayRef = useRef(null);
  const selectedId = useRef("");
  const timerIntervalRef = useRef(null);

  // Fetch device list on component mount
  useEffect(() => {
    const fetchDeviceList = async () => {
      const retriveData = await TaggingService.getOwnerList();
      setDeviceList(retriveData.data);
    };
    fetchDeviceList();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!map.current) {
      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new TileLayer({
            source: new TileWMS({
              url: process.env.REACT_APP_BHUVAN_URL,
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
        ],
        view: new View({
          center: fromLonLat([91.829437, 26.131644]),
          zoom: 7,
        }),
        pixelRatio: 1,
      });

      const vectorLayer = new VectorLayer({
        source: vectorSourceRef.current,
      });

      initialMap.addLayer(vectorLayer);
      map.current = initialMap;

      // Initialize overlay for popup
      const overlay = new Overlay({
        element: overlayRef.current,
        positioning: "bottom-center",
        stopEvent: false,
        offset: [0, -15],
      });
      initialMap.addOverlay(overlay);
    }
    
    // Add click event for adding new route points only if vehicle is selected
    if (deviceId !== "") {
      map.current.on("click", (e) => {
        const coord = e.coordinate;
        addPoint(coord);
      });
    }
  }, [deviceId]);

  // Fetch trips when device is selected
  useEffect(() => {
    if (deviceId) {
      fetchTrips();
    }
  }, [deviceId]);

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Handle device selection
  const handleDeviceChange = (e) => {
    setDeviceId(e.target.value);
    setSelectedRoute(null);
    setNewPoints([]);
    vectorSourceRef.current.clear();
  };

  // Handle route selection
  const handleRouteSelect = (event) => {
    try {
      const [routeId, routeRout] = event.target.value.split("|");
      
      const coordinates = routeRout
        .split("],")
        .map(coord => {
          try {
            return coord
              .replace(/[\[\]']/g, '')
              .split(',')
              .map(num => {
                const parsed = parseFloat(num.trim());
                if (isNaN(parsed)) throw new Error('Invalid coordinate value');
                return parsed;
              });
          } catch (e) {
            console.error('Error parsing coordinate:', coord);
            return null;
          }
        })
        .filter(coord => coord && coord.length >= 2)
        .map(coord => [coord[0], coord[1]]);

      if (coordinates.length < 2) {
        throw new Error('Not enough valid coordinates to create a route');
      }

      setSelectedRoute({ 
        routeId, 
        coordinates,
        routeRout 
      });
      loadRoute(coordinates, routeId);
    } catch (error) {
      console.error('Error selecting route:', error);
      setAlert({
        open: true,
        message: 'There was an error selecting the route. Please try again.',
        type: 'error'
      });
    }
  };

  // Load route on the map
  const loadRoute = (route, routeId) => {
    try {
      if (!route || route.length < 2) {
        console.warn('Invalid route data: Need at least 2 points to display a route');
        return;
      }

      selectedId.current = routeId;
      vectorSourceRef.current.clear();

      // Create point features only for start and end points
      const startPoint = new Feature({
        geometry: new Point(fromLonLat(route[0])),
      });
      const endPoint = new Feature({
        geometry: new Point(fromLonLat(route[route.length - 1])),
      });

      // Set style for start and end points
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

      vectorSourceRef.current.addFeatures([startPoint, endPoint]);

      // Create and add the route line
      const coordinates = route.map(coords => fromLonLat(coords));
      
      if (coordinates.some(coord => !coord || coord.length < 2)) {
        throw new Error('Invalid coordinates in route');
      }

      const line = new Feature({
        geometry: new LineString(coordinates),
      });
      
      line.setStyle(new Style({
        stroke: new Stroke({
          color: '#0066ff',
          width: 3
        })
      }));
      
      vectorSourceRef.current.addFeature(line);

      // Get the extent and verify it's valid before fitting
      const extent = line.getGeometry().getExtent();
      if (extent && extent.every(coord => typeof coord === 'number' && !isNaN(coord))) {
        map.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          maxZoom: 18
        });
      } else {
        console.warn('Invalid extent calculated for route');
      }
    } catch (error) {
      console.error('Error loading route:', error);
      setAlert({
        open: true,
        message: 'There was an error loading the route. Please try again.',
        type: 'error'
      });
    }
  };

  // Add a point on the map and update state
  const addPoint = (coord) => {
    const pointCoordinates = toLonLat(coord);
    setNewPoints((prevPoints) => {
      const updatedPoints = [...prevPoints, pointCoordinates];
      updateRouteLine(updatedPoints);
      return updatedPoints;
    });
  };

  // Update route line based on new points
  const updateRouteLine = (points) => {
    vectorSourceRef.current.clear();

    // Create features from the stored coordinates
    const pointFeatures = points.map((coords) => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat(coords)),
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
      return pointFeature;
    });

    // Add the new point features to the map
    vectorSourceRef.current.addFeatures(pointFeatures);

    // Create and add the route line if we have more than one point
    if (points.length > 1) {
      const lineCoordinates = points.map((coords) => fromLonLat(coords));
      const lineFeature = new Feature({
        geometry: new LineString(lineCoordinates),
      });
      vectorSourceRef.current.addFeature(lineFeature);
    }
  };

  // Fetch routes for the selected device
  const retriveRouteData = async (id) => {
    try {
      const retriveData = await HomePageService.getRouteFixing(id);
      setRouteData(retriveData.data.route || []);
      setLoad(true);
    } catch (error) {
      console.error("Error retrieving route data:", error);
      setAlert({
        open: true,
        message: "Error retrieving route data. Please try again.",
        type: "error"
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    retriveRouteData(deviceId);
  };

  // Handle autocomplete change
  const handleAutocompleteChange = (event, newValue) => {
    if (newValue) {
      handleDeviceChange({ target: { value: newValue.device.id } });
    }
  };

  // Fetch trips for the selected device
  const fetchTrips = async () => {
    try {
      const response = await TripService.getTrips(deviceId);
      setTrips(response.data || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setAlert({
        open: true,
        message: "Error fetching trips. Please try again.",
        type: "error"
      });
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Open trip dialog for creating/editing a trip
  const openTripForm = (trip = null) => {
    if (trip) {
      // Editing an existing trip
      setEditingTrip(trip);
      setTripForm({
        title: trip.title,
        device_id: trip.device_id,
        routeId: trip.routeId,
        startDate: formatDateForInput(new Date(trip.startDate)),
        startTime: formatTimeForInput(new Date(trip.startDate)),
        endTime: formatTimeForInput(new Date(trip.endDate)),
        isRecurring: trip.isRecurring,
        recurringPattern: trip.recurringPattern ? {
          ...trip.recurringPattern,
          startDate: formatDateForInput(new Date(trip.recurringPattern.startDate)),
          endDate: formatDateForInput(new Date(trip.recurringPattern.endDate)),
          daysOfWeek: trip.recurringPattern.daysOfWeek || [],
          customTimes: trip.recurringPattern.customTimes || {}
        } : {
          startDate: formatDateForInput(new Date()),
          endDate: formatDateForInput(new Date(new Date().setDate(new Date().getDate() + 30))),
          daysOfWeek: [],
          customTimes: {}
        }
      });
    } else {
      // Creating a new trip
      setEditingTrip(null);
      setTripForm({
        title: "",
        device_id: deviceId,
        routeId: selectedRoute?.routeId || "",
        startDate: formatDateForInput(new Date()),
        startTime: formatTimeForInput(new Date()),
        endTime: formatTimeForInput(new Date(new Date().setHours(new Date().getHours() + 1))),
        isRecurring: false,
        recurringPattern: {
          startDate: formatDateForInput(new Date()),
          endDate: formatDateForInput(new Date(new Date().setDate(new Date().getDate() + 30))),
          daysOfWeek: [],
          customTimes: {}
        }
      });
    }
    setOpenTripDialog(true);
  };

  // Close trip dialog
  const closeTripDialog = () => {
    setOpenTripDialog(false);
    setEditingTrip(null);
  };

  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    setTripForm(prev => ({
      ...prev,
      [name]: name === 'isRecurring' ? checked : value
    }));
  };

  // Handle recurring pattern changes
  const handleRecurringPatternChange = (field, value) => {
    setTripForm(prev => ({
      ...prev,
      recurringPattern: {
        ...prev.recurringPattern,
        [field]: value
      }
    }));
  };

  // Handle day selection for recurring trips
  const handleDaySelection = (dayValue) => {
    setTripForm(prev => {
      const daysOfWeek = [...prev.recurringPattern.daysOfWeek];
      const index = daysOfWeek.indexOf(dayValue);
      
      if (index === -1) {
        daysOfWeek.push(dayValue);
      } else {
        daysOfWeek.splice(index, 1);
      }
      
      return {
        ...prev,
        recurringPattern: {
          ...prev.recurringPattern,
          daysOfWeek
        }
      };
    });
  };

  // Save trip
  const saveTrip = async () => {
    try {
      // Validate form
      if (!tripForm.title) {
        setAlert({
          open: true,
          message: "Please enter a trip title",
          type: "error"
        });
        return;
      }
      
      if (!tripForm.routeId) {
        setAlert({
          open: true,
          message: "Please select a route",
          type: "error"
        });
        return;
      }
      
      if (tripForm.isRecurring && tripForm.recurringPattern.daysOfWeek.length === 0) {
        setAlert({
          open: true,
          message: "Please select at least one day for recurring trips",
          type: "error"
        });
        return;
      }
      
      // Combine date and time
      const startDateTime = combineDateAndTime(tripForm.startDate, tripForm.startTime);
      const endDateTime = combineDateAndTime(tripForm.startDate, tripForm.endTime);
      
      if (!startDateTime || !endDateTime) {
        setAlert({
          open: true,
          message: "Invalid date or time format",
          type: "error"
        });
        return;
      }
      
      // Check if end time is after start time
      if (endDateTime <= startDateTime) {
        setAlert({
          open: true,
          message: "End time must be after start time",
          type: "error"
        });
        return;
      }
      
      // Calculate duration in minutes
      const duration = Math.round((endDateTime - startDateTime) / (1000 * 60));
      
      // Prepare trip data
      const tripData = {
        title: tripForm.title,
        device_id: tripForm.device_id,
        routeId: tripForm.routeId,
        routeCoordinates: selectedRoute?.coordinates || [],
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        duration: duration,
        status: TRIP_STATUS.SCHEDULED,
        isRecurring: tripForm.isRecurring,
        recurringPattern: tripForm.isRecurring ? {
          startDate: combineDateAndTime(tripForm.recurringPattern.startDate, "00:00").toISOString(),
          endDate: combineDateAndTime(tripForm.recurringPattern.endDate, "23:59").toISOString(),
          daysOfWeek: tripForm.recurringPattern.daysOfWeek,
          customTimes: tripForm.recurringPattern.customTimes
        } : null
      };
      
      // Save trip
      if (editingTrip) {
        await TripService.updateTrip(editingTrip.id, tripData);
        setAlert({
          open: true,
          message: "Trip updated successfully",
          type: "success"
        });
      } else {
        await TripService.createTrip(tripData);
        setAlert({
          open: true,
          message: "Trip created successfully",
          type: "success"
        });
      }
      
      // Refresh trips
      fetchTrips();
      closeTripDialog();
    } catch (error) {
      console.error("Error saving trip:", error);
      setAlert({
        open: true,
        message: "Error saving trip. Please try again.",
        type: "error"
      });
    }
  };

  // Delete trip
  const deleteTrip = async (tripId) => {
    try {
      await TripService.deleteTrip(tripId, deviceId);
      setAlert({
        open: true,
        message: "Trip deleted successfully",
        type: "success"
      });
      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
      setAlert({
        open: true,
        message: "Error deleting trip. Please try again.",
        type: "error"
      });
    }
  };

  // Start a trip
  const startTrip = async (trip) => {
    try {
      await TripService.updateTripStatus(trip.id, TRIP_STATUS.IN_PROGRESS);
      setActiveTrip(trip);
      
      // Calculate ETA based on remaining time
      const now = new Date();
      const endTime = new Date(trip.endDate);
      const remainingTime = Math.max(0, endTime - now);
      const remainingMinutes = Math.round(remainingTime / (1000 * 60));
      
      if (remainingMinutes > 0) {
        setEta(remainingMinutes);
        
        // Start timer to update ETA
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        
        // Set up notification for when trip is complete
        const timeUntilEnd = endTime - now;
        
        if (timeUntilEnd > 0) {
          setTimeout(() => {
            // Show notification when trip time is up
            setAlert({
              open: true,
              message: `Trip "${trip.title}" time has elapsed.`,
              type: "warning"
            });
            
            // Auto-complete the trip
            completeTrip(trip.id);
          }, timeUntilEnd);
        }
        
        // Update ETA every minute
        timerIntervalRef.current = setInterval(() => {
          const currentTime = new Date();
          const newRemainingTime = Math.max(0, endTime - currentTime);
          const newRemainingMinutes = Math.round(newRemainingTime / (1000 * 60));
          
          setEta(newRemainingMinutes);
          
          // If time is up, clear the interval
          if (newRemainingTime <= 0) {
            clearInterval(timerIntervalRef.current);
          }
        }, 60000); // Update every minute
      } else {
        // If no time remaining, complete the trip immediately
        completeTrip(trip.id);
      }
      
      setAlert({
        open: true,
        message: "Trip started",
        type: "success"
      });
      
      fetchTrips();
    } catch (error) {
      console.error("Error starting trip:", error);
      setAlert({
        open: true,
        message: "Error starting trip. Please try again.",
        type: "error"
      });
    }
  };

  // Complete a trip
  const completeTrip = async (tripId) => {
    try {
      await TripService.updateTripStatus(tripId, TRIP_STATUS.COMPLETED);
      setActiveTrip(null);
      setEta(null);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      setAlert({
        open: true,
        message: "Trip completed",
        type: "success"
      });
      
      fetchTrips();
    } catch (error) {
      console.error("Error completing trip:", error);
      setAlert({
        open: true,
        message: "Error completing trip. Please try again.",
        type: "error"
      });
    }
  };

  // Cancel a trip
  const cancelTrip = async (tripId) => {
    try {
      await TripService.updateTripStatus(tripId, TRIP_STATUS.CANCELLED);
      setActiveTrip(null);
      setEta(null);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      setAlert({
        open: true,
        message: "Trip cancelled",
        type: "success"
      });
      
      fetchTrips();
    } catch (error) {
      console.error("Error cancelling trip:", error);
      setAlert({
        open: true,
        message: "Error cancelling trip. Please try again.",
        type: "error"
      });
    }
  };

  // Format ETA
  const formatEta = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case TRIP_STATUS.SCHEDULED:
        return 'primary';
      case TRIP_STATUS.IN_PROGRESS:
        return 'warning';
      case TRIP_STATUS.COMPLETED:
        return 'success';
      case TRIP_STATUS.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle trip selection for map view
  const handleTripSelect = (trip) => {
    setSelectedTripForMap(trip);
    setShowMap(true);
    
    // Zoom in on the route after a short delay to ensure the map is rendered
    setTimeout(() => {
      if (map.current && trip.routeCoordinates && trip.routeCoordinates.length > 0) {
        // Convert coordinates to the map projection
        const coordinates = trip.routeCoordinates.map(coord => fromLonLat(coord));
        
        // Create a line feature to calculate the extent
        const line = new Feature({
          geometry: new LineString(coordinates)
        });
        
        // Get the extent of the line
        const extent = line.getGeometry().getExtent();
        
        // Fit the view to the extent with padding
        map.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          maxZoom: 18
        });
      }
    }, 100);
  };

  // Handle ETA update from map
  const handleEtaUpdate = (remainingTime) => {
    setMapEta(remainingTime);
    setEta(Math.round(remainingTime / (1000 * 60))); // Convert to minutes for display
  };

  // Handle trip completion from map
  const handleTripComplete = (tripId) => {
    completeTrip(tripId);
    setShowMap(false);
  };

  // Handle trip cancellation from map
  const handleTripCancelled = (tripId) => {
    cancelTrip(tripId);
    setShowMap(false);
  };

  // Toggle map view
  const toggleMapView = (trip = null) => {
    if (trip) {
      setSelectedTripForMap(trip);
      setShowMap(true);
      
      // Zoom in on the route after a short delay to ensure the map is rendered
      setTimeout(() => {
        if (map.current && trip.routeCoordinates && trip.routeCoordinates.length > 0) {
          // Convert coordinates to the map projection
          const coordinates = trip.routeCoordinates.map(coord => fromLonLat(coord));
          
          // Create a line feature to calculate the extent
          const line = new Feature({
            geometry: new LineString(coordinates)
          });
          
          // Get the extent of the line
          const extent = line.getGeometry().getExtent();
          
          // Fit the view to the extent with padding
          map.current.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            duration: 1000,
            maxZoom: 18
          });
        }
      }, 100);
    } else {
      setShowMap(false);
      setSelectedTripForMap(null);
    }
  };

  // Add route function
  const addRoute = async () => {
    if (newPoints.length < 2) {
      setAlert({
        open: true,
        message: "Please add at least two points to create a route.",
        type: "error"
      });
      return;
    }
    const data = {
      device_id: deviceId,
      route: JSON.stringify(newPoints), // Serializing newPoints as JSON
    };

    try {
      const response = await HomePageService.addRoute(data);
      console.log("New Route Added:", response);
      setRouteData(response.data.route); // Update route data with the new route
      setNewPoints([]); // Clear new points after adding route
      setAlert({
        open: true,
        message: "Route added successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Error adding new route:", error);
      setAlert({
        open: true,
        message: "Error adding route. Please try again.",
        type: "error"
      });
    }
  };

  // Delete route function
  const delRoute = async () => {
    if (!selectedRoute) {
      setAlert({
        open: true,
        message: "Please select a route to delete.",
        type: "error"
      });
      return;
    }

    const data = {
      id: selectedRoute.routeId,
      device_id: deviceId,
    };
    try {
      await HomePageService.delRoute(data);
      setRouteData(
        routeData.filter((route) => route.id != selectedRoute.routeId)
      ); // Remove the deleted route from list
      setSelectedRoute(null); // Clear selected route
      setAlert({
        open: true,
        message: "Route deleted successfully",
        type: "success"
      });
    } catch (error) {
      console.error("Error deleting route:", error);
      setAlert({
        open: true,
        message: "Error deleting route. Please try again.",
        type: "error"
      });
    }
  };

  // Render trip list
  const renderTripList = () => {
    return (
      <Box sx={{ mt: 2 }}>
        {trips.length === 0 ? (
          <Typography variant="body1" align="center">
            No trips found. Create a new trip to get started.
          </Typography>
        ) : (
          trips.map((trip) => (
            <Paper
              key={trip.id}
              elevation={2}
              sx={{
                p: 2,
                mb: 2,
                borderLeft: `4px solid ${
                  trip.id === activeTrip?.id ? '#ff9800' : '#0066ff'
                }`,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h6">{trip.title}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {formatDateForDisplay(trip.startDate)} {formatTimeForDisplay(trip.startDate)} - 
                      {formatTimeForDisplay(trip.endDate)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Route #{trip.routeId}
                    </Typography>
                  </Box>
                  {trip.isRecurring && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Recurring: {formatDateForDisplay(trip.recurringPattern.startDate)} - 
                        {formatDateForDisplay(trip.recurringPattern.endDate)}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Chip
                    label={trip.status}
                    color={getStatusColor(trip.status)}
                    sx={{ mb: 1 }}
                  />
                  {trip.status === TRIP_STATUS.IN_PROGRESS && eta !== null && (
                    <Typography variant="body2" color="text.secondary">
                      ETA: {formatEta(eta)}
                    </Typography>
                  )}
                  <Box sx={{ mt: 'auto' }}>
                    {trip.status === TRIP_STATUS.SCHEDULED && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => startTrip(trip)}
                        sx={{ mr: 1 }}
                      >
                        Start
                      </Button>
                    )}
                    {trip.status === TRIP_STATUS.IN_PROGRESS && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => completeTrip(trip.id)}
                        sx={{ mr: 1 }}
                      >
                        Complete
                      </Button>
                    )}
                    {(trip.status === TRIP_STATUS.SCHEDULED || trip.status === TRIP_STATUS.IN_PROGRESS) && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => cancelTrip(trip.id)}
                        sx={{ mr: 1 }}
                      >
                        Cancel
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => openTripForm(trip)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteTrip(trip.id)}
                      sx={{ mr: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => toggleMapView(trip)}
                    >
                      <LocationOnIcon />
                    </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          ))
        )}
      </Box>
    );
  };

  // Render trip calendar
  const renderTripCalendar = () => {
    // This is a simplified calendar view
    // In a real implementation, you would use a calendar library like FullCalendar
    const today = new Date();
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      return date;
    });
    
    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {next7Days.map((day) => {
            const dayTrips = trips.filter(trip => {
              const tripDate = new Date(trip.startDate);
              return isSameDay(tripDate, day) && 
                     (trip.status === TRIP_STATUS.SCHEDULED || trip.status === TRIP_STATUS.IN_PROGRESS);
            });
            
            return (
              <Grid item xs={12} sm={6} md={3} key={day.toISOString()}>
                <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" align="center">
                    {day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  {dayTrips.length === 0 ? (
                    <Typography variant="body2" align="center" color="text.secondary">
                      No trips scheduled
                    </Typography>
                  ) : (
                    dayTrips.map(trip => (
                      <Box
                        key={trip.id}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: trip.status === TRIP_STATUS.IN_PROGRESS ? 'warning.light' : 'primary.light',
                          color: trip.status === TRIP_STATUS.IN_PROGRESS ? 'warning.dark' : 'primary.dark',
                        }}
                      >
                        <Typography variant="body2" noWrap>
                          {trip.title}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {formatTimeForDisplay(new Date(trip.startDate))} - 
                          {formatTimeForDisplay(new Date(trip.endDate))}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Render trip dialog
  const renderTripDialog = () => (
    <Dialog open={openTripDialog} onClose={closeTripDialog} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingTrip ? 'Edit Trip' : 'Create New Trip'}
        <IconButton
          aria-label="close"
          onClick={closeTripDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Trip Title"
              name="title"
              value={tripForm.title}
              onChange={handleFormChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={tripForm.startDate}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              name="startTime"
              value={tripForm.startTime}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="End Time"
              type="time"
              name="endTime"
              value={tripForm.endTime}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Route</InputLabel>
              <Select
                name="routeId"
                value={tripForm.routeId}
                onChange={handleFormChange}
                label="Route"
              >
                {routeData.map((route) => (
                  <MenuItem key={route.id} value={route.id}>
                    {`Route #${route.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={tripForm.isRecurring}
                  onChange={handleFormChange}
                  name="isRecurring"
                />
              }
              label="Recurring Trip"
            />
          </Grid>
          {tripForm.isRecurring && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  name="recurringPattern.endDate"
                  value={tripForm.recurringPattern.endDate}
                  onChange={(e) => handleRecurringPatternChange('endDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Repeat on:
                </Typography>
                <FormGroup row>
                  {DAYS_OF_WEEK.map((day) => (
                    <FormControlLabel
                      key={day.value}
                      control={
                        <Checkbox
                          checked={tripForm.recurringPattern.daysOfWeek.includes(day.value)}
                          onChange={(e) => handleDaySelection(day.value)}
                        />
                      }
                      label={day.label}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeTripDialog}>Cancel</Button>
        <Button onClick={saveTrip} variant="contained" color="primary">
          {editingTrip ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <MainCard>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          Trip Planning
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage trips for your vehicles
        </Typography>
      </Box>

      <AutoHideAlert 
        open={alert.open}
        onClose={() => setAlert({...alert, open: false})}
        message={alert.message}
        type={alert.type}
      />
      
      <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'background.default' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3} alignItems="center">
            <Grid item md={4} sm={12} xs={12}>
              <Autocomplete
                value={deviceList.find((item) => item.device.id === deviceId) || null}
                onChange={handleAutocompleteChange}
                options={deviceList}
                getOptionLabel={(option) => option.vehicle_reg_no || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Vehicle"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <Box sx={{ mr: 1 }}>
                          <DirectionsCarIcon color="primary" />
                        </Box>
                      )
                    }}
                  />
                )}
                noOptionsText="No vehicles found"
                isOptionEqualToValue={(option, value) => option.device.id === value.device.id}
                disableClearable
              />
            </Grid>

            <Grid item md={2} sm={12} xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: '56px' }}
                startIcon={<SearchIcon />}
              >
                Load Routes
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {load && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'background.default' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Select
                id="routeDropdown"
                value={selectedRoute ? `${selectedRoute.routeId}|${selectedRoute.routeRout}` : ""}
                onChange={handleRouteSelect}
                displayEmpty
                fullWidth
                sx={{ mb: 2 }}
                startAdornment={
                  <InputAdornment position="start">
                    <RouteIcon color="primary" />
                  </InputAdornment>
                }
              >
                <MenuItem value="" disabled>
                  Select a route
                </MenuItem>
                {routeData.map((route) => (
                  <MenuItem 
                    value={`${route.id}|${route.route}`} 
                    key={route.id}
                  >
                    Route #{route.id}
                  </MenuItem>
                ))}
              </Select>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Button 
                    onClick={addRoute} 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ mr: 1 }}
                  >
                    Add Route
                  </Button>
                  <Button
                    onClick={delRoute}
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    disabled={!selectedRoute}
                  >
                    Delete Route
                  </Button>
                </Box>
                
                <Button 
                  onClick={() => openTripForm()} 
                  variant="contained" 
                  color="primary"
                  disabled={!selectedRoute}
                  startIcon={<AddIcon />}
                >
                  Create Trip
                </Button>
              </Box>
              
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 120,
                    textTransform: 'none',
                    fontWeight: 500
                  }
                }}
              >
                <Tab 
                  icon={<ListAltIcon />} 
                  label="List View" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<CalendarMonthIcon />} 
                  label="Calendar View" 
                  iconPosition="start"
                />
              </Tabs>
            </Grid>
          </Grid>
        </Paper>
      )}

      {showMap && selectedTripForMap ? (
        <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ color: 'primary.main' }}>
                {selectedTripForMap.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Route #{selectedTripForMap.routeId}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              onClick={() => toggleMapView()}
              startIcon={<CloseIcon />}
            >
              Close Map
            </Button>
          </Box>
          <TripPlanningMap
            routeCoordinates={selectedTripForMap.routeCoordinates}
            startTime={selectedTripForMap.startDate}
            endTime={selectedTripForMap.endDate}
            onEtaUpdate={handleEtaUpdate}
            onTripComplete={handleTripComplete}
            onTripCancelled={handleTripCancelled}
            isActive={selectedTripForMap.status === TRIP_STATUS.IN_PROGRESS}
            tripId={selectedTripForMap.id}
          />
        </Paper>
      ) : (
        <Box ref={mapRef} id="map" sx={{ 
          width: "100%", 
          height: "500px", 
          mb: 3,
          position: 'relative',
          borderRadius: 1,
          overflow: 'hidden',
          boxShadow: 1
        }}>
          <img 
            src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} 
            style={{ 
              position: 'absolute', 
              bottom: 16, 
              left: 16, 
              width: '120px', 
              zIndex: 1000,
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
          <img 
            src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} 
            style={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              width: '70px', 
              zIndex: 1000,
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
          <img 
            src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} 
            style={{ 
              position: 'absolute', 
              bottom: 16, 
              right: 16, 
              width: '200px', 
              zIndex: 1000,
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
            }} 
          />
        </Box>
      )}

      <TabPanel value={activeTab} index={0}>
        <Paper elevation={0} sx={{ p: 3, backgroundColor: 'background.default' }}>
          {renderTripList()}
        </Paper>
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <Paper elevation={0} sx={{ p: 3, backgroundColor: 'background.default' }}>
          {renderTripCalendar()}
        </Paper>
      </TabPanel>

      {renderTripDialog()}

      <div
        ref={overlayRef}
        className="popup-container"
        style={{ display: "none", position: "absolute", zIndex: 1000 }}
      >
        <div
          className="popup-menu"
          style={{
            backgroundColor: "white",
            border: "1px solid black",
            padding: "5px",
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <div id="delete">Delete</div>
          <div id="cancel">Cancel</div>
        </div>
      </div>
    </MainCard>
  );
};

export default TripPlanning; 