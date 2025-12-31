import React, { useEffect, useState, useRef } from "react";
import { Box, Button, Slider, Typography, Paper, Grid } from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { TileWMS } from "ol/source";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Icon, Style, Stroke, Circle as CircleStyle, Fill, Text } from "ol/style";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import { getCenter } from "ol/extent"; // For centering the map
import axios from "axios";
import Select from "ol/interaction/Select";
import { formatDateTime } from "../../helper";

const ALERT_CODE_LABELS = {
  NR1: "Normal ",
  NR: "Normal ",
  NR2: "Normal History",
  BD3: "Battery Disconnected",
  BL4: "Low Battery",
  BH5: "Battery Charged",
  BR6: "Mains Reconnected",
  IN7: "Ignition On",
  IF8: "Ignition Off",
  TA9: "Tamper Alert",
  EA10: "Emergency Alert (Panic)",
  EA11: "Emergency Alert Cleared",
  OT12: "Configuration Updated",
  HB13: "Harsh Braking",
  HA14: "Harsh Acceleration",
  RT15: "Rash Turning",
};

const escapeHtml = (value) => {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const resolveAlertCode = (entry) => {
  if (!entry) return "-";
  const alertPrefix = entry.packet_type || entry.packetType || entry.ps;
  const alertId = entry.alert_id;
  if (
    alertPrefix &&
    alertId !== null &&
    alertId !== undefined &&
    alertId !== "" &&
    /^[A-Za-z]{1,3}$/.test(String(alertPrefix)) &&
    /^\d{1,3}$/.test(String(alertId))
  ) {
    const combined = `${String(alertPrefix).toUpperCase()}${String(alertId)}`;
    if (ALERT_CODE_LABELS[combined]) return combined;
  }

  const candidates = [
    entry.alert_type,
    entry.alert_code,
    entry.packet_type,
    entry.packetType,
    entry.ps,
    entry.alert_id,
  ];

  const raw = candidates.find((value) => value !== null && value !== undefined && value !== "");
  if (!raw) return "-";

  const normalized = String(raw).toUpperCase().replace(/\s+/g, "");
  if (ALERT_CODE_LABELS[normalized]) return normalized;

  const match = normalized.match(/[A-Z]{1,3}\d{1,3}/);
  return match?.[0] || normalized;
};

const resolveAlertLabel = (entry) => {
  const code = resolveAlertCode(entry);
  if (!code || code === "-") return "-";
  return ALERT_CODE_LABELS[code] ? `${ALERT_CODE_LABELS[code]} (${code})` : code;
};

const resolvePacketTypeLabel = (entry) => {
  if (!entry) return "-";
  const raw =
    entry.packet_status ||
    entry.packetStatus ||
    entry.packet_type_code ||
    entry.packet_type_flag ||
    entry.packetTypeFlag ||
    entry.packet_category ||
    entry.packetCategory ||
    entry.packet_source ||
    entry.packetSource;

  if (!raw) return "-";
  const normalized = String(raw).toUpperCase();
  if (normalized === "L" || normalized === "LIVE") return "Live";
  if (normalized === "H" || normalized === "HISTORY") return "History";
  return String(raw);
};

const resolveDeviceStatusLabel = (entry) => {
  if (!entry) return "Offline";
  const raw = entry.device_status || entry.deviceStatus || entry.status;

  if (raw === undefined || raw === null) return "-";
  if (raw === "") return "-";

  const normalized = String(raw).toLowerCase();
  if (["online", "on", "1", "true", "connected"].includes(normalized)) return "Online";
  if (["offline", "off", "0", "false", "disconnected"].includes(normalized)) return "Offline";
  return String(raw);
};

const resolveNearestPoiLabel = (entry) => {
  if (!entry) return "-";
  const poiName =
    entry?.nearest_poi?.data?.name ||
    entry?.nearestPoi?.name ||
    entry?.nearest_poi_name ||
    entry?.nearestPoiName;
  const poiAddress =
    entry?.nearest_poi?.data?.address ||
    entry?.nearestPoi?.address ||
    entry?.nearest_poi_address ||
    entry?.nearestPoiAddress;

  const best = poiName || poiAddress;
  if (!best) return "-";

  const details = poiName && poiAddress ? `${poiName} - ${poiAddress}` : best;
  return `Near to ${details}`;
};

const resolveNearestPoliceDetails = (entry) => {
  if (!entry) return { name: "-", address: "-", lat: "-", lng: "-" };

  const name =
    entry?.nearestPoliceStation ||
    entry?.nearest_police?.data?.name ||
    entry?.nearest_police_station?.data?.name ||
    entry?.nearest_police_station?.name ||
    entry?.nearestPolice?.name ||
    "-";

  const address =
    entry?.nearestPoliceAddress ||
    entry?.nearest_police?.data?.address ||
    entry?.nearest_police_station?.data?.address ||
    entry?.nearest_police_station?.address ||
    entry?.nearestPolice?.address ||
    "-";

  const lat =
    entry?.nearestPoliceLat ||
    entry?.nearest_police?.data?.lat ||
    entry?.nearest_police?.data?.latitude ||
    entry?.nearest_police_station?.data?.latitude ||
    entry?.nearest_police_station?.latitude ||
    entry?.nearestPolice?.latitude ||
    "-";

  const lng =
    entry?.nearestPoliceLng ||
    entry?.nearest_police?.data?.lon ||
    entry?.nearest_police?.data?.lng ||
    entry?.nearest_police?.data?.longitude ||
    entry?.nearest_police_station?.data?.longitude ||
    entry?.nearest_police_station?.longitude ||
    entry?.nearestPolice?.longitude ||
    "-";

  return {
    name: name ? String(name) : "-",
    address: address ? String(address) : "-",
    lat: lat === null || lat === undefined || lat === "" ? "-" : String(lat),
    lng: lng === null || lng === undefined || lng === "" ? "-" : String(lng),
  };
};

const GPSHistoryMap = ({
  startDateTime,
  endDateTime,
  vehicleRegistrationNumber,
  downloadStatus,
  setDownloadStatus,
  poi,
  owner,
  roads,
  polygon,
}) => {
  const [map, setMap] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxSliderValue, setMaxSliderValue] = useState(0);
  const [streetLevelZoom, setStreetLevelZoom] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(200);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const markerRef = useRef(null);
  const animationMarkerRef = useRef(null); // Separate ref for the animation marker
  const animationIntervalId = useRef(null);

  const featureOverlayRef = useRef(null);
  const infoOverlayRef = useRef(null); // Ref for live info box overlay
  const infoBoxElementRef = useRef(null); // Ref for the DOM element of info box
  const allFeaturesRef = useRef([]); // To store all features and avoid clearing markers

  const isRecordingRef = useRef(false); // Ref to track recording state for render loop
  const sliderValueRef = useRef(0); // Ref to track slider value for animation loop

  const STREET_ZOOM_LEVEL = 18;

  const redM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/red/bus.png"),
      scale: 0.07,
    }),
  });
  const orangeM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/orange/bus.png"),
      scale: 0.07,
    }),
  });

  const blueM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/blue/bus.png"),
      scale: 0.07,
    }),
  });

  const greenM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/green/bus.png"),
      scale: 0.07,
    }),
  });

  const greyM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/grey/bus.png"),
      scale: 0.07,
    }),
  });

  // Fetch map data from the API
  const fetchMapData = async () => {
    setIsPlaying(false);
    setDownloadStatus("Idle");
    try {
      if (vehicleRegistrationNumber !== "") {
        // Stop any existing animation
        clearInterval(animationIntervalId.current);
        setIsPlaying(false);
        setDownloadStatus("Downloading");
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}api/gps_history_map_data/`,
          {
            params: {
              start_datetime: startDateTime,
              end_datetime: endDateTime,
              vehicle_registration_number: vehicleRegistrationNumber,
              poi: poi,
              vehicle_owner: owner,
              roads: roads,
              polygon: polygon,
            },
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Token ${sessionStorage.getItem("oAuthToken")}`,
            },
          }
        );

        const data = response.data.data;
        setDownloadStatus("Processing");
        setMapData(data);
        setMaxSliderValue(data.length - 1);
      }
    } catch (error) {
      console.error("Error fetching map data:", error);
    }
  };

  useEffect(() => {
    fetchMapData(); // Fetch data on prop changes
  }, [startDateTime, endDateTime, vehicleRegistrationNumber, poi, owner, roads, polygon]);

  useEffect(() => {
    if (!map) {
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

      const createBhuvanSource = (layerName) => {
        const bhuvanUrl = resolveBhuvanWmsUrl();
        const opts = {
          url: bhuvanUrl,
          params: {
            'LAYERS': layerName,
            'STYLES': "",
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
          transition: 0,
        };

        // Note: Bhuvan servers often reject CORS requests, so we default to no crossOrigin.
        // This restores map visibility but may prevent direct video recording of the map tiles.
        if (process.env.REACT_APP_BHUVAN_ENABLE_CORS === "true") {
          opts.crossOrigin = "anonymous";
        }

        console.log(`[Bhuvan] Creating layer: ${layerName} with URL: ${opts.url}`);

        const source = new TileWMS(opts);

        source.on('tileloadstart', () => {
          // console.log(`[Bhuvan] Tile load start for ${layerName}`);
        });

        source.on('tileloadend', () => {
          // console.log(`[Bhuvan] Tile load success for ${layerName}`);
        });

        source.on('tileloaderror', (event) => {
          console.error(`[Bhuvan] Tile load ERROR for ${layerName}`, event);
        });

        return source;
      };

      // Debug container
      if (mapRef.current) {
        console.log(`[Map] Container Size: ${mapRef.current.clientWidth}x${mapRef.current.clientHeight}`);
      }

      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: createBhuvanSource("india3"),
          }),
          new TileLayer({
            source: createBhuvanSource("basemap:admin_group"),
          }),
          new TileLayer({
            source: createBhuvanSource("mmi:mmi_india"),
          }),
        ],
        view: new View({
          center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
          zoom: 7,
        }),
        pixelRatio: 1,
      });

      const overlay = new Overlay({
        element: overlayRef.current,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });
      initialMap.addOverlay(overlay);

      // Create overlay for moving info box
      const infoOverlay = new Overlay({
        element: infoBoxElementRef.current,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -85], // Position above the icon (increased offset for new anchor)
      });
      initialMap.addOverlay(infoOverlay);
      infoOverlayRef.current = infoOverlay;

      const markerSource = new VectorSource();
      const markerLayer = new VectorLayer({
        source: markerSource,
      });

      initialMap.addLayer(markerLayer);

      setMap(initialMap);
      markerRef.current = markerSource;
      featureOverlayRef.current = overlay;
    }
  }, [map]);

  const zoomIn = () => {
    map.getView().setZoom(map.getView().getZoom() + 1);
  };

  const zoomOut = () => {
    map.getView().setZoom(map.getView().getZoom() - 1);
  };

  const panTo = (lon, lat) => {
    map.getView().setCenter(fromLonLat([lon, lat]));
  };

  const getStatusInfo = (data) => {
    if (!data) return { colorKey: 'grey', colorHex: '#757575', statusText: 'N/A' };

    const isIgnitionOn = String(data.igs) === "1";
    const speed = Number(data.s || 0);
    const packetStatus = data.ps;

    if (packetStatus === "EA") {
      return { colorKey: 'red', colorHex: '#d32f2f', statusText: 'Emergency' };
    } else if (packetStatus !== "NR" && packetStatus) {
      return { colorKey: 'orange', colorHex: '#ed6c02', statusText: 'Alert' };
    } else if (isIgnitionOn && speed <= 1) {
      return { colorKey: 'blue', colorHex: '#0288d1', statusText: 'Stopped' };
    } else if (isIgnitionOn && speed > 1) {
      return { colorKey: 'green', colorHex: '#2e7d32', statusText: 'Moving' };
    } else {
      return { colorKey: 'grey', colorHex: '#757575', statusText: 'Offline/Ignition Off' };
    }
  };

  const updateEmergencyPointer = (entry) => {
    if (!entry) return;
    setCurrentData(entry);
    const { lon, lat } = entry;
    const currentCoordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);
    const statusInfo = getStatusInfo(entry);

    const categoryData = entry?.device_tag_info?.category_info?.category;
    const categoryName = typeof categoryData === 'object' ? categoryData?.category : categoryData;
    const normalizedType = categoryName ? categoryName.toLowerCase().replace(/\s+/g, '_') : 'bus';
    const availableTypes = ['ambulance', 'bus', 'dumper', 'police', 'school_bus', 'tanker', 'taxi', 'truck'];
    const iconType = availableTypes.includes(normalizedType) ? normalizedType : 'bus';

    let iconSrc;
    try {
      iconSrc = require(`../../assets/images/${statusInfo.colorKey}/${iconType}.png`);
    } catch (e) {
      try {
        iconSrc = require(`../../assets/images/${statusInfo.colorKey}/bus.png`);
      } catch (e2) {
        iconSrc = require("../../assets/images/grey/bus.png");
      }
    }

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.8],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        crossOrigin: 'anonymous',
        src: iconSrc,
        scale: 0.07,
        rotation: 0,
      }),
    });

    if (animationMarkerRef.current) {
      animationMarkerRef.current.getGeometry().setCoordinates(currentCoordinates);
      animationMarkerRef.current.setStyle(iconStyle);
      animationMarkerRef.current.set("data", entry);
    } else {
      const marker = new Feature({
        geometry: new Point(currentCoordinates),
        data: entry,
      });
      marker.setStyle(iconStyle);
      markerRef.current.addFeature(marker);
      animationMarkerRef.current = marker;
    }

    setCurrentCoordinates(currentCoordinates);
    if (infoOverlayRef.current) {
      infoOverlayRef.current.setPosition(currentCoordinates);
      infoOverlayRef.current.setOffset([0, -110]);
    }
    map.getView().setCenter(currentCoordinates);
  };

  const handleSliderChange = (event, value) => {
    setSliderValue(value);
    sliderValueRef.current = value;
    const entry = mapData[value];
    if (entry) {
      updateEmergencyPointer(entry);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    if (overlayRef.current) overlayRef.current.style.display = "none";

    animationIntervalId.current = setInterval(() => {
      if (sliderValueRef.current < maxSliderValue) {
        sliderValueRef.current += 1;
        setSliderValue(sliderValueRef.current);
        const entry = mapData[sliderValueRef.current];
        if (entry) updateEmergencyPointer(entry);
      } else {
        clearInterval(animationIntervalId.current);
        setIsPlaying(false);
      }
    }, (510 - animationSpeed));
  };

  const pauseAnimation = () => {
    clearInterval(animationIntervalId.current);
    setIsPlaying(false);
  };

  const restartAnimation = () => {
    setSliderValue(0);
    sliderValueRef.current = 0;
    if (mapData[0]) updateEmergencyPointer(mapData[0]);
  };

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264',
      'video/mp4;codecs=avc1',
      'video/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const getFileExtension = (mimeType) => {
    if (mimeType && mimeType.includes('mp4')) return 'mp4';
    return 'webm';
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Screen recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        audio: false,
        preferCurrentTab: true,
      });

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (chunks.length === 0) {
          setRecordedChunks([]);
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const extension = getFileExtension(mimeType);
        a.style.display = 'none';
        a.href = url;
        a.download = `history-playback-${vehicleRegistrationNumber}-${new Date().getTime()}.${extension}`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        setRecordedChunks([]);
      };

      recorder.onerror = (event) => {
        console.error('Recording error:', event);
        alert('An error occurred during recording.');
        setIsRecording(false);
        setMediaRecorder(null);
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);

      if (!isPlaying) {
        playAnimation();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error.name !== 'NotAllowedError') {
        alert(`Failed to start recording: ${error.message}`);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);

      if (isPlaying) {
        pauseAnimation();
      }
    }
  };

  const exportToPdf = async () => {
    if (!mapRef.current || mapData.length === 0) {
      alert('No data available to export.');
      return;
    }

    setIsExportingPdf(true);
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('GPS History Playback Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 12;

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Vehicle: ${vehicleRegistrationNumber}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`From: ${startDateTime}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`To: ${endDateTime}`, 20, yPosition);
      yPosition += 12;

      const canvas = await html2canvas(mapRef.current);
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);

      pdf.save(`history-playback-${vehicleRegistrationNumber}-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    if (isRecording && !isPlaying && sliderValue === maxSliderValue) {
      stopRecording();
    }
  }, [isPlaying, isRecording, sliderValue, maxSliderValue]);

  useEffect(() => {
    if (isPlaying) {
      clearInterval(animationIntervalId.current);
      playAnimation();
    }
  }, [animationSpeed]);

  useEffect(() => {
    if (mapData.length > 0 && markerRef.current) {
      loadMarkersAndLines(mapData);
    }
  }, [mapData]);

  // Function to add markers and lines when data is loaded
  const loadMarkersAndLines = (data) => {
    const coordinates = data.map((entry) => fromLonLat([parseFloat(entry.lon), parseFloat(entry.lat)]));
    const lineFeature = new Feature({
      geometry: new LineString(coordinates),
    });

    // Styling the line between points
    lineFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: "blue",
          width: 2,
        }),
      })
    );

    markerRef.current.addFeature(lineFeature);
    allFeaturesRef.current.push(lineFeature); // Store for later

    const extent = markerRef.current.getExtent(); // Get the extent of all markers

    data.forEach((entry, index) => {
      const point = new Feature({
        geometry: new Point(fromLonLat([parseFloat(entry.lon), parseFloat(entry.lat)])),
        data: entry,
      });
      const statusInfo = getStatusInfo(entry);

      // Adding circular marker for each point
      point.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 2,
            fill: new Fill({ color: statusInfo.colorHex }),
          }),
          text: new Text({
            text: (index + 1).toString(),
            scale: 0.2,
            fill: new Fill({ color: statusInfo.colorHex }),
          }),
        })
      );

      markerRef.current.addFeature(point);
      allFeaturesRef.current.push(point); // Store for later
    });

    // Adjust the map to fit all markers after adding them
    map.getView().fit(markerRef.current.getExtent(), {
      padding: [50, 50, 50, 50],
      duration: 1000,
    });

    attachClickToPoints();
    setIsPlaying(false);
    setDownloadStatus("Play");

    // Set initial data for info box and vehicle marker
    if (data.length > 0) {
      setSliderValue(0);
      sliderValueRef.current = 0;
      setCurrentData(data[0]);
      // Initialize the car marker at start position
      updateEmergencyPointer(data[0]);
    }
  };

  // Attach click event to point + vehicle features (vehicle marker carries `data` too)
  const attachClickToPoints = () => {
    const select = new Select(); // Create a select interaction
    map.addInteraction(select);

    select.on("select", function (event) {
      const selectedFeatures = event.selected;
      selectedFeatures.forEach((feature) => {
        const data = feature.get("data");
        if (!data) return;

        const geometry = feature.getGeometry?.();
        const coordinates = geometry?.getCoordinates?.();
        displayLocationData(data, coordinates || fromLonLat([data.lon, data.lat]));
      });
    });
  };

  // Tab switching in overlay (same behavior as Live Tracking)
  useEffect(() => {
    const container = overlayRef.current;
    if (!container) return;

    const handleClick = (event) => {
      const tabButton = event.target?.closest?.("[data-overlay-tab]");
      if (!tabButton) return;

      const tabName = tabButton.getAttribute("data-overlay-tab");
      if (!tabName) return;

      const tabsRoot = tabButton.closest("[data-overlay-tabs]");
      if (!tabsRoot) return;

      const allTabs = tabsRoot.querySelectorAll("[data-overlay-tab]");
      allTabs.forEach((btn) => {
        btn.classList.toggle("overlay-tab--active", btn === tabButton);
      });

      const panels = tabsRoot.querySelectorAll("[data-overlay-panel]");
      panels.forEach((panel) => {
        panel.classList.toggle(
          "overlay-panel--active",
          panel.getAttribute("data-overlay-panel") === tabName
        );
      });
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, []);

  const displayLocationData = (data, coordinates) => {
    if (data) {
      const packetTypeLabelRaw = resolvePacketTypeLabel(data);
      const packetTypeLabel = packetTypeLabelRaw && packetTypeLabelRaw !== "-" ? packetTypeLabelRaw : "History";
      const alertLabel = resolveAlertLabel(data);
      const deviceStatusLabelRaw = resolveDeviceStatusLabel(data);
      const derivedStatus = getStatusInfo(data)?.statusText || "-";
      const deviceStatusLabel = deviceStatusLabelRaw && deviceStatusLabelRaw !== "-" ? deviceStatusLabelRaw : derivedStatus;
      const ignitionLabel = String(data?.igs) === "1" ? "ON" : "OFF";
      const addressValue = data?.address || data?.addr || "-";
      const nearestPoiLabel = resolveNearestPoiLabel(data);
      const nearestPolice = resolveNearestPoliceDetails(data);
      const policeValue =
        nearestPolice?.name && nearestPolice.name !== "-" ? nearestPolice.name : "-";
      const policeAddressValue =
        nearestPolice?.address && nearestPolice.address !== "-" ? nearestPolice.address : "-";
      const policeLatLngValue =
        nearestPolice?.lat &&
        nearestPolice?.lng &&
        nearestPolice.lat !== "-" &&
        nearestPolice.lng !== "-"
          ? `${nearestPolice.lat}, ${nearestPolice.lng}`
          : "-";

      const speedValue = Number(data?.s || 0);
      const alertCode = resolveAlertCode(data);
      const pillText = alertLabel && alertLabel !== "-" ? String(alertLabel).split(" (")[0] : "-";
      const pillClass = /^NR/i.test(String(alertCode)) ? "overlay-pill--normal" : "overlay-pill--alert";

      const vehicleTitle =
        data.vehicle_registration_number ||
        data.vehicle_reg_no ||
        vehicleRegistrationNumber ||
        "-";

      const dateTimeValue = data.et ? formatDateTime(data.et) : "-";
      const latValue = data.lat ?? data.latitude ?? "-";
      const lonValue = data.lon ?? data.longitude ?? "-";

      const routeId = data?.route_id || data?.route_ref?.id || data?.device_tag_info?.route?.id || "-";
      const routeData = data?.route_ref || data?.device_tag_info?.route || {};
      const routeName = data?.route_name || data?.route || routeData?.name || (routeId && routeId !== "-" ? `Route ${routeId}` : "-");

      const content = `
        <div class="overlay-card">
          <div class="overlay-header">
            <div class="overlay-header-content">
              <div class="overlay-title">${escapeHtml(vehicleTitle)}</div>
            </div>
            <div class="overlay-pill ${pillClass}">${escapeHtml(pillText)}</div>
          </div>
          <div class="overlay-tabs" data-overlay-tabs>
            <div class="overlay-tab-list" role="tablist">
              <button class="overlay-tab overlay-tab--active" type="button" data-overlay-tab="vehicle" role="tab">Vehicle</button>
              <button class="overlay-tab" type="button" data-overlay-tab="geographic" role="tab">Geographic</button>
              <button class="overlay-tab" type="button" data-overlay-tab="route" role="tab">Route</button>
              <button class="overlay-tab" type="button" data-overlay-tab="police-support" role="tab">Police Support</button>
            </div>

            <div class="overlay-panel overlay-panel--active" data-overlay-panel="vehicle" role="tabpanel">
              <div class="overlay-section">
                <div class="overlay-section-title">Vehicle Information</div>
                <div class="overlay-section-body">
                  <div class="overlay-row"><span class="overlay-label">Packet Type</span><span class="overlay-value">${escapeHtml(packetTypeLabel)}</span></div>
                  <div class="overlay-row"><span class="overlay-label">Alert Type</span><span class="overlay-value">${escapeHtml(alertLabel)}</span></div>
                  <div class="overlay-row"><span class="overlay-label">Device Status</span><span class="overlay-value">${escapeHtml(deviceStatusLabel)}</span></div>
                  <div class="overlay-row"><span class="overlay-label">Ignition</span><span class="overlay-value">${escapeHtml(ignitionLabel)}</span></div>
                  <div class="overlay-row"><span class="overlay-label">DateTime</span><span class="overlay-value">${escapeHtml(dateTimeValue)}</span></div>
                  <div class="overlay-row"><span class="overlay-label">Speed</span><span class="overlay-value">${escapeHtml(speedValue)} km/h</span></div>
                  <div class="overlay-row"><span class="overlay-label">Latitude</span><span class="overlay-value">${escapeHtml(latValue)}</span></div>
                  <div class="overlay-row"><span class="overlay-label">Longitude</span><span class="overlay-value">${escapeHtml(lonValue)}</span></div>
                </div>
              </div>
            </div>

            <div class="overlay-panel" data-overlay-panel="geographic" role="tabpanel">
              <div class="overlay-section">
                <div class="overlay-section-body">
                  <div class="overlay-row overlay-row--multiline"><span class="overlay-label">Address</span><span class="overlay-value overlay-value--multiline">${escapeHtml(addressValue)}</span></div>
                  <div class="overlay-row overlay-row--multiline"><span class="overlay-label">Nearest Poi</span><span class="overlay-value overlay-value--multiline">${escapeHtml(nearestPoiLabel)}</span></div>
                </div>
              </div>
            </div>

            <div class="overlay-panel" data-overlay-panel="route" role="tabpanel">
              <div class="overlay-section">
                <div class="overlay-section-title">Route Information</div>
                <div class="overlay-section-body">
                  <div class="overlay-row"><span class="overlay-label">Route Name</span><span class="overlay-value">${escapeHtml(routeName)}</span></div>
                  <div class="overlay-row"><span class="overlay-label">Route ID</span><span class="overlay-value">${escapeHtml(routeId)}</span></div>
                </div>
              </div>
            </div>

            <div class="overlay-panel" data-overlay-panel="police-support" role="tabpanel">
              <div class="overlay-section">
                <div class="overlay-section-title">Police Support</div>
                <div class="overlay-section-body">
                  <div class="overlay-row overlay-row--multiline"><span class="overlay-label">Police</span><span class="overlay-value overlay-value--multiline">${escapeHtml(policeValue)}</span></div>
                  <div class="overlay-row overlay-row--multiline"><span class="overlay-label">Police Addr</span><span class="overlay-value overlay-value--multiline">${escapeHtml(policeAddressValue)}</span></div>
                  <div class="overlay-row"><span class="overlay-label">Police Lat/Lng</span><span class="overlay-value">${escapeHtml(policeLatLngValue)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      console.log(data);
      document.getElementById("overlay-content").innerHTML = content;

      // Set overlay position and make it visible
      featureOverlayRef.current.setPosition(coordinates);
      overlayRef.current.style.display = "block";
    }
  };

  return (
    <Box>
      <style>{`
        .overlay-card {
          min-width: 260px;
          font-family: 'Roboto', sans-serif;
        }

        .overlay-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 6px;
        }

        .overlay-header-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .overlay-title {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
        }

        .overlay-pill {
          border: 1px solid;
          border-radius: 999px;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .overlay-pill--normal {
          background-color: #ecfdf3;
          color: #15803d;
          border-color: #bbf7d0;
        }

        .overlay-pill--alert {
          background-color: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }

        .overlay-tabs {
          border-top: 1px solid #f1f5f9;
          padding-top: 8px;
          margin-top: 4px;
        }

        .overlay-tab-list {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .overlay-tab {
          appearance: none;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #374151;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 999px;
          cursor: pointer;
        }

        .overlay-tab--active {
          background: #eef2ff;
          border-color: #c7d2fe;
          color: #1e3a8a;
        }

        .overlay-panel {
          display: none;
          max-height: 220px;
          overflow: auto;
          padding-right: 2px;
          overflow-x: hidden;
        }

        .overlay-panel--active {
          display: block;
        }

        .overlay-section {
          border: 1px solid #eef2f7;
          border-radius: 8px;
          padding: 8px 10px;
          background: #ffffff;
        }

        .overlay-section-title {
          font-size: 12px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 6px;
        }

        .overlay-section-body {
          display: grid;
          row-gap: 4px;
        }

        .overlay-row {
          display: grid;
          grid-template-columns: 84px 1fr;
          gap: 10px;
          align-items: baseline;
        }

        .overlay-row--multiline {
          align-items: start;
        }

        .overlay-label {
          font-size: 11px;
          color: #6b7280;
          white-space: nowrap;
        }

        .overlay-value {
          font-size: 11px;
          font-weight: 500;
          color: #111827;
          text-align: left;
        }

        .overlay-value--multiline {
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
          text-align: left;
          max-width: none;
          line-height: 1.2;
          overflow: visible;
        }
      `}</style>
      <Typography
        variant="caption"
        style={{ textAlign: "left", verticalAlign: "top", fontSize: "10px" }}
      >
        {downloadStatus}
      </Typography>

      <Box
        id="controls-container"
        sx={{
          mt: 2,
          visibility: mapData.length ? "visible" : "hidden",
          display: "flex",
          alignItems: "left",
          width: "100%",
        }}
      >
        <Slider
          id="time-slider"
          min={0}
          max={maxSliderValue}
          value={sliderValue}
          onChange={handleSliderChange}
          sx={{
            width: "70%", mr: 2,
            alignItems: "left",
          }}
        />
        <Button onClick={isPlaying ? pauseAnimation : playAnimation} sx={{ ml: 2, alignItems: "left", }}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={restartAnimation} sx={{ ml: 2, alignItems: "left", }}>
          Restart
        </Button>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "contained" : "outlined"}
          color={isRecording ? "error" : "primary"}
          startIcon={isRecording ? <StopIcon /> : <FiberManualRecordIcon />}
          sx={{ ml: 2, alignItems: "left", }}
          disabled={isExportingPdf}
        >
          {isRecording ? "Stop Recording" : "Export as Video"}
        </Button>
        <Button
          onClick={exportToPdf}
          variant="outlined"
          color="success"
          startIcon={<PictureAsPdfIcon />}
          sx={{ ml: 2, alignItems: "left", }}
          disabled={isRecording || isExportingPdf}
        >
          {isExportingPdf ? "Generating PDF..." : "Export as PDF"}
        </Button>
        <Typography variant="body2" sx={{ ml: 2, alignItems: "right", }}>Slower</Typography>
        <Slider
          value={animationSpeed}
          onChange={(e, value) => setAnimationSpeed(value)}
          min={10}
          max={500}
          step={10}
          sx={{ width: "10%", ml: 2, alignItems: "right", }}
        />
        <Typography sx={{ ml: 2, alignItems: "right", }} variant="body2">Faster</Typography>

      </Box>



      <Box ref={mapRef} sx={{ width: "100%", height: "600px", position: 'relative' }}>
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />

        {/* Hidden Container for Overlay Content - React Renders Here, OL uses DOM element */}
        {/* Floating info box (Offline/Ignition Off) intentionally not rendered. Code is preserved for future use. */}
      </Box>
      <Box
        ref={overlayRef}
        className="dynamic-overlay"
        style={{
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          display: "none", // Initially hidden
        }}
      >
        <div id="overlay-content"></div>
      </Box>
    </Box>
  );
};

export default GPSHistoryMap;