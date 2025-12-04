import React, { useEffect, useState, useRef } from "react";
import { Box, Button, Slider, Typography } from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { OSM, TileWMS } from "ol/source";
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
  const allFeaturesRef = useRef([]); // To store all features and avoid clearing markers
  const isRecordingRef = useRef(false); // Ref to track recording state for render loop

  const STREET_ZOOM_LEVEL = 18;

  const redM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/red/bus.png"),
      scale: 0.20,
    }),
  });
  const orangeM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/orange/bus.png"),
      scale: 0.20,
    }),
  });

  const blueM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/blue/bus.png"),
      scale: 0.20,
    }),
  });

  const greenM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/green/bus.png"),
      scale: 0.20,
    }),
  });

  const greyM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/grey/bus.png"),
      scale: 0.20,
    }),
  });

  // Fetch map data from the API
  const fetchMapData = async () => {
    setIsPlaying(false);
    setDownloadStatus("Idle");
    try {
      if (vehicleRegistrationNumber !== "") {
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
                'WIDTH': 256,   // Set the tile width to 256 pixels
                'HEIGHT': 256,   // Set the tile height to 256 pixels
                'pixelRatio': 1,

              },
              serverType: 'geoserver',
              projection: 'EPSG:4326', // Ensure the projection is set:' 



            })
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
          duration: 2,
        },
      });

      initialMap.addOverlay(overlay);

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

  // Function to add markers and lines when data is loaded
  const loadMarkersAndLines = (data) => {
    const coordinates = data.map((entry) => fromLonLat([entry.lon, entry.lat]));
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
        geometry: new Point(fromLonLat([entry.lon, entry.lat])),
        data: entry,
      });
      var col = "gray";
      console.log(entry.ps);
      if (entry.ps == "EM") { col = "red" }


      else if (entry.s < 1) { col = "blue" }
      else if (entry.ps == "NR") { col = "green" }
      else { col = "gray" }

      // Adding circular marker for each point
      point.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 2,
            fill: new Fill({ color: col }),
          }),
          text: new Text({
            text: (index + 1).toString(),
            scale: 0.2,
            fill: new Fill({ color: col }),
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
  };

  // Attach click event to each point feature
  const attachClickToPoints = () => {
    const select = new Select(); // Create a select interaction
    map.addInteraction(select);

    select.on("select", function (event) {
      const selectedFeatures = event.selected;
      selectedFeatures.forEach((feature) => {
        const data = feature.get("data");
        if (data) {
          displayLocationData(feature.get("data"), fromLonLat([data.lon, data.lat]));
        }
      });
    });
  };

  const displayLocationData = (data, coordinates) => {
    if (data) {
      const content = `
        <h4>Location Info</h4>
        <p><strong>Latitude:</strong> ${data.lat}</p>
        <p><strong>Longitude:</strong> ${data.lon}</p>
        <p><strong>Speed:</strong> ${data.s} km/h</p>
        <p><strong>Heading:</strong> ${data.h}</p>
        <p><strong>DateTime:</strong> ${data.et}</p>
      `;
      console.log(data);
      document.getElementById("overlay-content").innerHTML = content;

      // Set overlay position and make it visible
      featureOverlayRef.current.setPosition(coordinates);
      overlayRef.current.style.display = "block";
    }
  };

  const updateEmergencyPointer = (lon, lat) => {
    const currentCoordinates = fromLonLat([lon, lat]);

    // Remove the previous animation marker if it exists
    if (animationMarkerRef.current) {
      markerRef.current.removeFeature(animationMarkerRef.current);
    }

    // Add the new animation marker
    const marker = new Feature({
      geometry: new Point(currentCoordinates),
    });

    marker.setStyle(
      greenM
    );

    markerRef.current.addFeature(marker);
    animationMarkerRef.current = marker; // Store the reference to the animation marker

    setCurrentCoordinates(currentCoordinates);
    map.getView().setCenter(currentCoordinates);
  };

  const handleSliderChange = (event, value) => {
    setSliderValue(value);
    const entry = mapData[value];
    if (entry) {
      updateEmergencyPointer(entry.lon, entry.lat);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    let currentIndex = sliderValue;
    overlayRef.current.style.display = "none";

    animationIntervalId.current = setInterval(() => {
      if (currentIndex < maxSliderValue) {
        currentIndex += 1;
        setSliderValue(currentIndex);
        const entry = mapData[currentIndex];
        if (entry) {
          updateEmergencyPointer(entry.lon, entry.lat);
        }
      } else {
        clearInterval(animationIntervalId.current);
        setIsPlaying(false);
      }
    }, animationSpeed);
  };

  const pauseAnimation = () => {
    clearInterval(animationIntervalId.current);
    setIsPlaying(false);
  };

  const restartAnimation = () => {
    setSliderValue(0);
    updateEmergencyPointer(mapData[0]?.lon, mapData[0]?.lat);
  };

  // Video recording functions
  const getSupportedMimeType = () => {
    // Prioritize MP4 (H.264) for better compatibility with media players
    const types = [
      'video/mp4;codecs=h264', // Chrome/Edge/Safari
      'video/mp4;codecs=avc1', // Alternative H.264 identifier
      'video/mp4',             // Generic MP4
      'video/webm;codecs=vp9', // High quality WebM fallback
      'video/webm;codecs=vp8', // Standard WebM fallback
      'video/webm',            // Generic WebM
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

  const startRecording = () => {
    if (!mapRef.current) return;

    // Find all canvases (layers) in the map
    const canvases = mapRef.current.querySelectorAll('canvas');
    if (canvases.length === 0) {
      alert('Unable to find map canvas for recording');
      return;
    }

    try {
      // Get supported mime type
      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        alert('Your browser does not support video recording. Please use Chrome, Firefox, or Edge.');
        return;
      }

      console.log('Starting recording with format:', mimeType);

      // Create a compositor canvas to combine all layers
      const width = canvases[0].width;
      const height = canvases[0].height;
      const compositor = document.createElement('canvas');
      compositor.width = width;
      compositor.height = height;
      const ctx = compositor.getContext('2d');

      // Function to render all layers to the compositor
      const renderFrame = () => {
        if (!isRecordingRef.current) return; // Stop if recording stopped

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#FFFFFF'; // Set white background
        ctx.fillRect(0, 0, width, height);

        // Draw each canvas layer onto the compositor
        canvases.forEach(canvas => {
          if (canvas.width > 0 && canvas.height > 0) {
            const style = window.getComputedStyle(canvas);
            const transform = style.transform;
            const opacity = style.opacity;

            if (opacity === '0') return; // Skip invisible layers

            ctx.save();

            // Apply CSS transform if it exists (e.g. "matrix(1, 0, 0, 1, -50, -50)")
            if (transform && transform !== 'none') {
              const matrix = transform.match(/^matrix\((.+)\)$/);
              if (matrix) {
                const values = matrix[1].split(',').map(parseFloat);
                // Canvas setTransform takes (a, b, c, d, e, f)
                // matrix is (a, b, c, d, tx, ty)
                ctx.setTransform(values[0], values[1], values[2], values[3], values[4], values[5]);
              }
            }

            // Also handle left/top if used instead of transform
            const left = parseFloat(style.left) || 0;
            const top = parseFloat(style.top) || 0;
            if (left || top) {
              ctx.translate(left, top);
            }

            ctx.drawImage(canvas, 0, 0);
            ctx.restore();
          }
        });

        requestAnimationFrame(renderFrame);
      };

      // Create a stream from the COMPOSITOR canvas
      const stream = compositor.captureStream(30);

      // Create media recorder
      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 5000000 // 5 Mbps
      });

      const chunks = [];
      const recordedMimeType = mimeType;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        isRecordingRef.current = false; // Ensure loop stops

        if (chunks.length === 0) {
          console.warn("No video data recorded.");
          alert("Recording failed: No video data was captured. Please try again.");
          setRecordedChunks([]);
          return;
        }

        const blob = new Blob(chunks, { type: recordedMimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const extension = getFileExtension(recordedMimeType);
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
        // alert(`Video exported successfully! Check your downloads folder for the ${extension.toUpperCase()} file.`);
      };

      recorder.onerror = (event) => {
        console.error('Recording error:', event);
        alert('An error occurred during recording. Please try again.');
        setIsRecording(false);
        setMediaRecorder(null);
        isRecordingRef.current = false;
      };

      // Use a ref to control the render loop since state updates might be slow
      isRecordingRef.current = true;

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Start the composition loop
      requestAnimationFrame(renderFrame);

      // Auto-start playback
      if (!isPlaying) {
        playAnimation();
      }

      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert(`Failed to start recording: ${error.message}\n\nPlease ensure you're using a modern browser (Chrome, Firefox, or Edge).`);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);

      // Stop playback when recording stops
      if (isPlaying) {
        pauseAnimation();
      }
    }
  };

  // PDF Export Function
  const exportToPdf = async () => {
    if (!mapRef.current || mapData.length === 0) {
      alert('No data available to export. Please load GPS data first.');
      return;
    }

    setIsExportingPdf(true);

    try {
      // Create PDF with landscape orientation for better map view
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add Title
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('GPS History Playback Report', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 10;

      // Add Vehicle Information
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Vehicle: ${vehicleRegistrationNumber}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`From: ${startDateTime}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`To: ${endDateTime}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Total Points: ${mapData.length}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Report Generated: ${new Date().toLocaleString()}`, 20, yPosition);
      yPosition += 12;

      // Capture the map canvas
      const canvas = mapRef.current.querySelector('canvas');
      if (canvas) {
        try {
          const mapImage = await html2canvas(mapRef.current, {
            useCORS: true,
            backgroundColor: '#ffffff',
            scale: 2
          });

          const imgData = mapImage.toDataURL('image/jpeg', 0.8);
          const imgWidth = pageWidth - 40;
          const imgHeight = (mapImage.height * imgWidth) / mapImage.width;

          // Check if we need a new page for the map
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error('Error capturing map:', error);
          pdf.text('Map image could not be captured', 20, yPosition);
          yPosition += 10;
        }
      }

      // Add new page for route data table
      pdf.addPage();
      yPosition = 20;

      // Route Data Table
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Route Details', 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      const headers = ['#', 'Date/Time', 'Latitude', 'Longitude', 'Speed (km/h)', 'Status'];
      const colWidths = [15, 60, 35, 35, 30, 30];
      let xPosition = 20;

      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });

      yPosition += 7;
      pdf.setFont(undefined, 'normal');

      // Table data (limited to prevent overflow)
      const maxRows = 30; // Limit rows per page
      const dataToShow = mapData.slice(0, 100); // Limit total rows to 100

      dataToShow.forEach((entry, index) => {
        if (index > 0 && index % maxRows === 0) {
          pdf.addPage();
          yPosition = 20;

          // Reprint headers on new page
          pdf.setFont(undefined, 'bold');
          xPosition = 20;
          headers.forEach((header, idx) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += colWidths[idx];
          });
          yPosition += 7;
          pdf.setFont(undefined, 'normal');
        }

        xPosition = 20;
        const lat = parseFloat(entry.lat);
        const lon = parseFloat(entry.lon);

        const rowData = [
          String(index + 1),
          entry.et || 'N/A',
          !isNaN(lat) ? lat.toFixed(6) : 'N/A',
          !isNaN(lon) ? lon.toFixed(6) : 'N/A',
          String(entry.s || 0),
          entry.ps || 'N/A'
        ];

        rowData.forEach((data, idx) => {
          const text = data.length > 20 ? data.substring(0, 17) + '...' : data;
          pdf.text(text, xPosition, yPosition);
          xPosition += colWidths[idx];
        });

        yPosition += 6;

        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;

          // Reprint headers
          pdf.setFont(undefined, 'bold');
          xPosition = 20;
          headers.forEach((header, idx) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += colWidths[idx];
          });
          yPosition += 7;
          pdf.setFont(undefined, 'normal');
        }
      });

      // Add note if data was truncated
      if (mapData.length > 100) {
        yPosition += 10;
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Note: Showing first 100 of ${mapData.length} total data points`, 20, yPosition);
      }

      // Save the PDF
      pdf.save(`history-playback-${vehicleRegistrationNumber}-${new Date().getTime()}.pdf`);

      alert('PDF exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Auto-stop recording when playback completes
  useEffect(() => {
    if (isRecording && !isPlaying && sliderValue === maxSliderValue) {
      stopRecording();
    }
  }, [isPlaying, isRecording, sliderValue, maxSliderValue]);


  useEffect(() => {
    if (mapData.length > 0 && markerRef.current) {
      loadMarkersAndLines(mapData);
    }
  }, [mapData]);

  return (
    <Box>
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
        <Typography variant="body2" sx={{ ml: 2, alignItems: "right", }}>Faster</Typography>
        <Slider
          value={animationSpeed}
          onChange={(e, value) => setAnimationSpeed(value)}
          min={10}
          max={500}
          step={10}
          sx={{ width: "10%", ml: 2, alignItems: "right", }}
        />
        <Typography sx={{ ml: 2, alignItems: "right", }} variant="body2">Slower</Typography>

      </Box>



      <Box ref={mapRef} sx={{ width: "100%", height: "600px", position: 'relative' }}>
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />
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
        <p id="overlay-content"></p>
      </Box>
    </Box>
  );
};

export default GPSHistoryMap;