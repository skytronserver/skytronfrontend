/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Paper,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import PendingIcon from '@mui/icons-material/Pending';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Icon, Style } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import "ol/ol.css";
import HomePageService from "../../services/HomePage";
import SettingService from "../../services/SettingService";
import CustomModal from "../../ui-component/CustomModal";
import VideoPlayer from './components/VideoPlayer';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import "./emcall.css";

const EMCall = () => {
  const { state } = useLocation();
  const { call } = state || {};
  const userRole = call?.type || ''; // Get user role from call object
  const mapElement = useRef();
  const [broadcastDisabled, setBroadcastDisabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [vectorLayer, setVectorLayer] = useState(
    new VectorLayer({ source: new VectorSource() })
  );
  const mapRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Video streaming states
  const [mediaData, setMediaData] = useState({});
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [timeRange, setTimeRange] = useState([0, 100]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Add new state for video loading
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Add new state for video section visibility
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  // Add new state for video URLs
  const [mediaUrls, setMediaUrls] = useState({});
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Add new state for volume and mute
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Add new state for seeking
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);

  // Add new state for current video and video time range
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [videoEndTime, setVideoEndTime] = useState(0);

  // Add new state for unified timeline
  const [allVideosTimeline, setAllVideosTimeline] = useState([]);
  const [timelineStartTime, setTimelineStartTime] = useState(0);
  const [timelineEndTime, setTimelineEndTime] = useState(0);

  // Add new state for video initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Add new state for stitched video URL
  const [stitchedVideoUrl, setStitchedVideoUrl] = useState(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);

  // Add filter state
  const [mediaFilter, setMediaFilter] = useState('all'); // 'all', 'video', 'image'

  // Filtered media for current camera
  const filteredMedia = selectedCamera && mediaData[selectedCamera]
    ? mediaData[selectedCamera].filter(item =>
        mediaFilter === 'all' ? true : item.media_type === mediaFilter
      )
    : [];
  const filteredMediaUrls = selectedCamera && mediaUrls[selectedCamera]
    ? mediaUrls[selectedCamera].filter((item, idx) =>
        mediaFilter === 'all' ? true : mediaData[selectedCamera][idx].media_type === mediaFilter
      )
    : [];
  const [filteredMediaIndex, setFilteredMediaIndex] = useState(0);

  // In the Video Grid section, use react-slick Carousel for the cards
  const carouselSettings = {
    dots: true,
    infinite: false,
    speed: 400,
    slidesToShow: Math.min(filteredMedia.length, 6),
    slidesToScroll: 1,
    arrows: true,
    initialSlide: filteredMediaIndex,
    afterChange: (current) => setFilteredMediaIndex(current),
  };

  // Initialize map
  useEffect(() => {
    const map = new Map({
      target: mapElement.current,
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
          }),
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
          }),
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
          }),
        }),
        vectorLayer,
      ],

      view: new View({
        center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
        zoom: 7,
      }),

      pixelRatio: 1,
    });

    mapRef.current = map;
    return () => map.setTarget(null); // Cleanup on unmount
  }, []);

  // Fetch locations and plot them on the map
  const fetchAndPlotLocations = async () => {
    try {
      const response = await HomePageService.getEMCallloc({
        assignment_id: call.id,
      });
      
      // Update assignments state with the latest data
      if (response.data && response.data.assignments) {
        const prevAssignments = assignments;
        const newAssignments = response.data.assignments;
        setAssignments(newAssignments);

        // Check for status changes and show notifications
        newAssignments.forEach(newAssignment => {
          const prevAssignment = prevAssignments.find(a => a.id === newAssignment.id);
          if (prevAssignment && prevAssignment.status !== newAssignment.status) {
            setSnackbarMessage(`Assignment ${newAssignment.id} status changed to ${newAssignment.status}`);
            setSnackbarSeverity(newAssignment.status === 'closed_false_allert' ? 'error' : 'info');
            setSnackbarOpen(true);
          }
        });
      }

      // Filter and plot location data
      const locations = response.data.target || [];
      const source = vectorLayer.getSource();
      source.clear();

      locations.forEach((location) => {
        const { longitude, latitude } = location;
        const coordinates = fromLonLat([longitude, latitude]);
        const feature = new Feature({ geometry: new Point(coordinates) });
        feature.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              // Use same asset pattern as LiveTracking map icons
              src: require("../../assets/images/red/bus.png"),
              scale: 0.06,
            }),
          })
        );

        source.addFeature(feature);
      });
    } catch (error) {
      console.error("Fetch Locations Error:", error);
      setSnackbarMessage("Error fetching location data: " + (error.message || "Unknown error"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    fetchAndPlotLocations();

    // Set interval to update locations every 10 seconds
    const interval = setInterval(fetchAndPlotLocations, 10000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleBroadcast = async (type) => {
    try {
      let broadcastType = type;
      if (type === "both") {
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type: "police_ex",
        });
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type: "ambulance_ex",
        });
        broadcastType = "Police and Ambulance";
      } else {
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type,
        });
        broadcastType = type === "police_ex" ? "Police" : "Ambulance";
      }

      setBroadcastDisabled(true);
      alert(`${broadcastType} broadcast successful!`);
    } catch (error) {
      console.error("Broadcast Error:", error);
    }
  };

  // Add new states for call status and notifications
  const [assignments, setAssignments] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // Add function to check call status
  const fetchCallStatus = async () => {
    try {
      const response = await HomePageService.getEMCallloc({
        assignment_id: call.id,
      });
      if (response.data && response.data.assignments) {
        setAssignments(response.data.assignments);
      }
    } catch (error) {
      console.error("Error fetching call status:", error);
    }
  };

  // Add useEffect to initialize assignments
  useEffect(() => {
    if (call?.id) {
      fetchCallStatus();
    }
  }, [call?.id]);

  // Add useEffect to fetch call status periodically
  useEffect(() => {
    fetchCallStatus();
    const interval = setInterval(fetchCallStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Function to check if call can be closed
  const canCloseCall = () => {
    if (!assignments || assignments.length === 0) {
      return false;
    }
    
    // Only team lead and desk_ex can close calls
    if (userRole !== 'teamlead' && userRole !== 'desk_ex') {
      return false;
    }

    // Find police and ambulance assignments
    const policeAssignment = assignments.find(assignment => 
      assignment.type === "police_ex"
    );
    const ambulanceAssignment = assignments.find(assignment => 
      assignment.type === "ambulance_ex"
    );

    // Helper function to check if status is a closure status
    const isClosureStatus = (status) => {
      const isValid = status === "closed" || 
             status === "closed_false_alert" || 
             status === "closed_false_allert";
      return isValid;
    };

    // For desk_ex, can only close if either police or ambulance has proper status
    if (userRole === 'desk_ex') {
      const hasProperEmergencyService = 
        (policeAssignment && isClosureStatus(policeAssignment.status)) ||
        (ambulanceAssignment && isClosureStatus(ambulanceAssignment.status));

      if (!hasProperEmergencyService) {
        return false;
      }
    }

    // If we have a police or ambulance assignment with closure status, allow closing
    if ((policeAssignment && isClosureStatus(policeAssignment.status)) ||
        (ambulanceAssignment && isClosureStatus(ambulanceAssignment.status))) {   
      return true;
    }
    return false;
  };

  // Modify handleCloseCall to include more specific error messages
  const handleCloseCall = async () => {
    try {
      if (!assignments || assignments.length === 0) {
        setSnackbarMessage("Cannot close call: No assignments found");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      if (userRole !== 'teamlead' && userRole !== 'desk_ex') {
        setSnackbarMessage("You don't have permission to close this call");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      const policeAssignment = assignments.find(assignment => 
        assignment.type === "police_ex"
      );
      const ambulanceAssignment = assignments.find(assignment => 
        assignment.type === "ambulance_ex"
      );

      const canClose = canCloseCall();

      if (!canClose) {
        setSnackbarMessage("Cannot close call: Waiting for police or ambulance to close their assignment");
        setSnackbarSeverity("warning");
        setSnackbarOpen(true);
        return;
      }

      // Cleanup video before closing
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsVideoReady(false);
      }
      
      await HomePageService.closeCase({ assignment_id: call.id });
      
      // Fetch updated status after closing
      await fetchCallStatus();
      
      setModalOpen(true);
      setSnackbarMessage("Call closed successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Close Call Error:", error);
      setSnackbarMessage("Error closing call: " + (error.message || "Unknown error"));
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSendMessage = async () => {
    try {
      await HomePageService.sendEMmessage({
        assignment_id: call.id,
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await HomePageService.getEMmessage({
        assignment_id: call.id,
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Fetch Messages Error:", error);
    }
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleRedirectToDashboard = () => {
    navigate('/dashboard');  // Redirect to dashboard
  };

  // Function to create blob URL from video data
  const createVideoUrl = async (mediaLink) => {
    try {
      const response = await SettingService.file_Download({
        file_path: mediaLink
      });
      const blob = new Blob([response.data], { type: 'video/mp4' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error downloading video:", error);
      return null;
    }
  };

  // Modify fetchMediaData to handle video downloads
  const fetchMediaData = async () => {
    try {
      setIsLoadingVideos(true);
      const response = await HomePageService.getEmMedia({
        assignment_id: call.id,
      });
      const media = response.data.media || {};
      
      // Sort by timestamp for each camera
      const sortedMedia = {};
      for (const [cameraId, items] of Object.entries(media)) {
        sortedMedia[cameraId] = items.sort((a, b) => {
          const timeA = new Date(a.start_time).getTime();
          const timeB = new Date(b.start_time).getTime();
          return timeA - timeB;
        });
      }
      
      setMediaData(sortedMedia);
      
      // Set initial camera if none selected
      if (!selectedCamera && Object.keys(sortedMedia).length > 0) {
        const firstCamera = Object.keys(sortedMedia)[0];
        setSelectedCamera(firstCamera);
      }

      // Download media for each camera
      const newMediaUrls = {};
      for (const [cameraId, items] of Object.entries(sortedMedia)) {
        newMediaUrls[cameraId] = await Promise.all(
          items.map(async (item) => {
            const type = item.media_type === 'image' ? 'image/png' : 'video/mp4';
            const response = await SettingService.file_Download({ file_path: item.media_link });
            const blob = new Blob([response.data], { type });
            return {
              ...item,
              blobUrl: URL.createObjectURL(blob)
            };
          })
        );
      }
      setMediaUrls(newMediaUrls);
      setShowVideoSection(true);
    } catch (error) {
      console.error("Fetch Media Error:", error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(mediaUrls).forEach(items => {
        items.forEach(item => {
          if (item.blobUrl) {
            URL.revokeObjectURL(item.blobUrl);
          }
        });
      });
    };
  }, [mediaUrls]);

  useEffect(() => {
    if (selectedCamera && mediaData[selectedCamera]) {
      const items = mediaData[selectedCamera];
      const total = items.reduce((acc, item) => acc + item.duration_ms, 0);
      setTotalDuration(total);
      
      if (items.length > 0) {
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        const startTime = new Date(firstItem.start_time).getTime();
        const endTime = new Date(lastItem.end_time).getTime();
        setTimeRange([startTime, endTime]);
      }
    }
  }, [selectedCamera, mediaData]);

  useEffect(() => {
    if (selectedCamera && mediaData[selectedCamera]) {
      const items = mediaData[selectedCamera];
      const sortedItems = [...items].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      
      setAllVideosTimeline(sortedItems);
      
      if (sortedItems.length > 0) {
        const firstItem = sortedItems[0];
        const lastItem = sortedItems[sortedItems.length - 1];
        const startTime = new Date(firstItem.start_time).getTime();
        const endTime = new Date(lastItem.end_time).getTime();
        setTimelineStartTime(startTime);
        setTimelineEndTime(endTime);
        setTotalDuration(endTime - startTime);
      }
    }
  }, [selectedCamera, mediaData]);

  const findVideoForTime = (timeMs) => {
    return allVideosTimeline.find((item, index) => {
      const itemStart = new Date(item.start_time).getTime();
      const itemEnd = new Date(item.end_time).getTime();
      return timeMs >= itemStart && timeMs <= itemEnd;
    });
  };

  useEffect(() => {
    if (selectedCamera && mediaData[selectedCamera] && currentVideoIndex >= 0) {
      const item = mediaData[selectedCamera][currentVideoIndex];
      if (item && videoRef.current) {
        const itemStart = new Date(item.start_time).getTime();
        const currentTimeMs = currentTime;
        const timeInItem = (currentTimeMs - itemStart) / 1000;
        
        videoRef.current.src = mediaUrls[selectedCamera]?.[currentVideoIndex]?.blobUrl;
        videoRef.current.load();
        videoRef.current.currentTime = Math.max(0, timeInItem);
        
        if (isPlaying) {
          videoRef.current.play().catch(error => {
            console.error("Error playing video:", error);
          });
        }
      }
    }
  }, [currentVideoIndex, selectedCamera]);

  useEffect(() => {
    if (selectedCamera && mediaData[selectedCamera]) {
      createStitchedVideo(mediaData[selectedCamera]);
    }
  }, [selectedCamera, mediaData]);

  const createStitchedVideo = async (items) => {
    try {
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      const videoUrl = URL.createObjectURL(mediaSource);
      setStitchedVideoUrl(videoUrl);

      await new Promise((resolve) => {
        mediaSource.addEventListener('sourceopen', resolve, { once: true });
      });
      const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
      sourceBufferRef.current = sourceBuffer;

      for (const item of items) {
        const response = await fetch(item.blobUrl);
        const arrayBuffer = await response.arrayBuffer();
        await new Promise((resolve) => {
          sourceBuffer.addEventListener('updateend', resolve, { once: true });
          sourceBuffer.appendBuffer(arrayBuffer);
        });
      }

      mediaSource.endOfStream();
    } catch (error) {
      console.error('Error creating stitched video:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaSourceRef.current) {
        URL.revokeObjectURL(stitchedVideoUrl);
        mediaSourceRef.current = null;
      }
    };
  }, [stitchedVideoUrl]);

  const handleVideoEnded = async () => {
    try {
      setIsPlaying(false);
      
      if (selectedCamera && mediaData[selectedCamera]) {
        const nextIndex = currentVideoIndex + 1;
        if (nextIndex < mediaData[selectedCamera].length) {
          setCurrentVideoIndex(nextIndex);
          const nextItem = mediaData[selectedCamera][nextIndex];
          
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
            
            videoRef.current.src = mediaUrls[selectedCamera]?.[nextIndex]?.blobUrl;
            await videoRef.current.load();
            setIsVideoReady(true);
          }
        } else {
          setCurrentTime(0);
          setIsVideoReady(false);
        }
      }
    } catch (error) {
      console.error("Error handling video end:", error);
    }
  };

  const handleTimeChange = (event, newValue) => {
    if (!videoRef.current || !isVideoReady) return;
    setSeekTime(newValue);
    setIsSeeking(true);
  };

  const handleTimeChangeCommitted = (event, newValue) => {
    if (!videoRef.current || !isVideoReady) return;
    const totalDuration = mediaData[selectedCamera].reduce((acc, item) => acc + item.duration_ms, 0);
    const targetTime = (newValue / totalDuration) * videoRef.current.duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(newValue);
    setIsSeeking(false);
  };

  const handleVideoTimeUpdate = (event) => {
    if (!isSeeking && selectedCamera && mediaData[selectedCamera] && event.target.duration) {
      const currentDuration = event.target.duration || 0;
      const currentTimeInItem = event.target.currentTime || 0;
      const totalDuration = mediaData[selectedCamera].reduce((acc, item) => acc + (item.duration_ms || 0), 0);
      const currentTimeMs = currentDuration > 0 
        ? (currentTimeInItem / currentDuration) * totalDuration 
        : 0;
      setCurrentTime(currentTimeMs);
    }
  };

  const calculateTotalDuration = () => {
    if (selectedCamera && mediaData[selectedCamera]) {
      return mediaData[selectedCamera].reduce((acc, item) => acc + item.duration_ms, 0);
    }
    return 0;
  };

  const handlePlayPause = async () => {
    if (videoRef.current && isVideoReady) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          const currentItem = allVideosTimeline[currentVideoIndex];
          if (currentItem) {
            const itemStart = new Date(currentItem.start_time).getTime();
            const timeInItem = (currentTime - itemStart) / 1000;
            videoRef.current.currentTime = Math.max(0, timeInItem);
          }
          await videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error toggling play state:", error);
      }
    }
  };

  const handleVideoSeeking = () => {
    setIsSeeking(true);
  };

  const handleVideoSeeked = () => {
    setIsSeeking(false);
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setIsVideoReady(true);
    setIsInitialized(true);
    
    if (videoRef.current && currentVideo) {
      const itemStart = new Date(currentVideo.start_time).getTime();
      const timeInItem = (currentTime - itemStart) / 1000;
      videoRef.current.currentTime = Math.max(0, timeInItem);
    }
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setIsVideoReady(false);
    console.error("Error loading video");
  };

  const handleVideoSelect = async (item, index) => {
    try {
      setIsVideoLoading(true);
      setIsVideoReady(false);
      setCurrentMediaIndex(index);
      setIsPlaying(false);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
        videoRef.current.src = mediaUrls[selectedCamera]?.[index]?.blobUrl;

        // Wait for video to be loaded before playing
        await new Promise((resolve, reject) => {
          const loadHandler = () => {
            setIsVideoReady(true);
            setIsVideoLoading(false);
            resolve();
            // Auto-play the video when selected
            videoRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch(error => {
              console.error("Error auto-playing video:", error);
            });
          };

          const errorHandler = (error) => {
            setIsVideoLoading(false);
            reject(error);
          };

          videoRef.current.addEventListener('loadeddata', loadHandler, { once: true });
          videoRef.current.addEventListener('error', errorHandler, { once: true });
          videoRef.current.load();
        });
      }
    } catch (error) {
      console.error("Error selecting video:", error);
      setIsVideoLoading(false);
      setIsVideoReady(false);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
      }
    }
  };

  const handleNextVideo = () => {
    if (selectedCamera && mediaData[selectedCamera]) {
      const nextIndex = (currentVideoIndex + 1) % mediaData[selectedCamera].length;
      const nextItem = mediaData[selectedCamera][nextIndex];
      
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentVideoIndex(nextIndex);
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.src = mediaUrls[selectedCamera]?.[nextIndex]?.blobUrl;
        videoRef.current.load();
      }
    }
  };

  const handlePreviousVideo = () => {
    if (selectedCamera && mediaData[selectedCamera]) {
      const prevIndex = (currentVideoIndex - 1 + mediaData[selectedCamera].length) % mediaData[selectedCamera].length;
      const prevItem = mediaData[selectedCamera][prevIndex];
      
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentVideoIndex(prevIndex);
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.src = mediaUrls[selectedCamera]?.[prevIndex]?.blobUrl;
        videoRef.current.load();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (timeInMs) => {
    if (!timeInMs || isNaN(timeInMs)) {
      return "00:00";
    }
    const totalSeconds = Math.floor(Math.max(0, timeInMs) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCameraSelect = (cameraId) => {
    setSelectedCamera(cameraId);
    setCurrentMediaIndex(0); 
    setCurrentTime(0); 
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const videoContainer = videoRef.current?.parentElement;
      if (videoContainer) {
        videoContainer.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handlePlay = async () => {
        try {
          await videoElement.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing video:", error);
          setIsPlaying(false);
        }
      };

      videoElement.addEventListener('ended', handleVideoEnded);
      videoElement.addEventListener('play', handlePlay);

      return () => {
        videoElement.removeEventListener('ended', handleVideoEnded);
        videoElement.removeEventListener('play', handlePlay);
      };
    }
  }, [selectedCamera, currentVideoIndex]); 

  // Sync filteredMediaIndex with currentMediaIndex when filter changes
  useEffect(() => {
    setFilteredMediaIndex(0);
  }, [mediaFilter, selectedCamera]);

  // Add snackbar close handler
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Add status display in the call details section
  const getStatusColor = (status) => {
    switch (status) {
      case 'closed_false_allert':
        return 'error.main';
      case 'closed':
        return 'warning.main';
      case 'active':
        return 'success.main';
      default:
        return 'text.primary';
    }
  };

  // Update status helper functions
  const getStatusIcon = (status) => {
    switch (status) {
      case 'closed_false_alert':
      case 'closed_false_allert':
        return <ReportProblemIcon sx={{ 
          color: '#f44336',
          fontSize: '1.5rem',
          animation: 'pulse 2s infinite',
          filter: 'drop-shadow(0 2px 4px rgba(244, 67, 54, 0.2))'
        }} />;
      case 'closed':
        return <AssignmentTurnedInIcon sx={{ 
          color: '#4caf50',
          fontSize: '1.5rem',
          filter: 'drop-shadow(0 2px 4px rgba(76, 175, 80, 0.2))'
        }} />;
      case 'accepted':
        return <PhoneInTalkIcon sx={{ 
          color: '#2196f3',
          fontSize: '1.5rem',
          animation: 'bounce 1s infinite',
          filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.2))'
        }} />;
      case 'pending':
        return <AssignmentIcon sx={{ 
          color: '#ff9800',
          fontSize: '1.5rem',
          animation: 'spin 2s linear infinite',
          filter: 'drop-shadow(0 2px 4px rgba(255, 152, 0, 0.2))'
        }} />;
      default:
        return <NotificationsActiveIcon sx={{ 
          color: '#757575',
          fontSize: '1.5rem',
          filter: 'drop-shadow(0 2px 4px rgba(117, 117, 117, 0.2))'
        }} />;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'closed_false_alert':
      case 'closed_false_allert':
        return alpha('#f44336', 0.08);
      case 'closed':
        return alpha('#4caf50', 0.08);
      case 'accepted':
        return alpha('#2196f3', 0.08);
      case 'pending':
        return alpha('#ff9800', 0.08);
      default:
        return alpha('#9e9e9e', 0.08);
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'closed_false_alert':
      case 'closed_false_allert':
        return '#f44336';
      case 'closed':
        return '#4caf50';
      case 'accepted':
        return '#2196f3';
      case 'pending':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'closed_false_alert':
      case 'closed_false_allert':
        return 'False Alert';
      case 'closed':
        return 'Closed';
      case 'accepted':
        return 'Accepted';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  // Update service icon function
  const getServiceIcon = (type) => {
    if (type === "police_ex") {
      return <LocalPoliceIcon sx={{ 
        color: '#1976d2',
        fontSize: '1.8rem',
        filter: 'drop-shadow(0 2px 4px rgba(25, 118, 210, 0.2))'
      }} />;
    }
    // For desk_ex or other non-police assignments
    return <SupportAgentIcon sx={{ 
      color: '#e91e63',
      fontSize: '1.8rem',
      filter: 'drop-shadow(0 2px 4px rgba(233, 30, 99, 0.2))'
    }} />;
  };

  // Add keyframes for animations
  const keyframes = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Add style element for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = keyframes;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <CustomModal
        open={modalOpen}
        onClose={handleModalClose}
        title="Success"
        content="Call closed successfully!"
        actions={
          <>
            <Button onClick={handleRedirectToDashboard} color="secondary" variant="outlined">
              Done
            </Button>
          </>
        }
      />
      {/* Add Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8eb 100%)'
      }}>
        <Grid container spacing={3}>
          {/* Call Details Card */}
          <Grid item xs={12} md={3}>
            <Card elevation={3} sx={{
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ 
                  mb: 3, 
                  color: 'primary.main',
                  fontWeight: 600,
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  pb: 1
                }}>
                  CALL DETAILS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Emergency Call ID</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{call?.id}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">IMEI</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{call?.call?.device?.device?.imei || "N/A"}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Vehicle RegNo</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{call?.call?.device?.vehicle_reg_no || "N/A"}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Owner Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {call?.call?.device?.vehicle_owner?.users?.[0]?.name || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {/* <Typography variant="caption" color="text.secondary">Call Status</Typography>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 500,
                      color: call?.call?.status === 'active' ? 'success.main' : 'error.main'
                    }}>
                      {call?.call?.status || "N/A"}
                    </Typography> */}
                  </Box>
                  {assignments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontWeight: 500,
                          fontSize: '0.9rem'
                        }}
                      >
                        Assignment Statuses
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2 
                      }}>
                        {assignments.map((assignment, index) => (
                          <Box
                            key={assignment.id}
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              p: 2,
                              bgcolor: getStatusBgColor(assignment.status),
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              border: '2px solid',
                              borderColor: getStatusBorderColor(assignment.status),
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(getStatusBorderColor(assignment.status), 0.2)}`,
                              },
                            }}
                          >
                            <Box sx={{ 
                              mr: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 44,
                              height: 44,
                              borderRadius: '12px',
                              bgcolor: 'background.paper',
                              boxShadow: `0 2px 8px ${alpha(getStatusBorderColor(assignment.status), 0.2)}`,
                              border: '2px solid',
                              borderColor: getStatusBorderColor(assignment.status)
                            }}>
                              {getServiceIcon(assignment.type)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600,
                                color: 'text.primary',
                                mb: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                Assignment #{index + 1} ({assignment.type})
                              </Typography>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                gap: 1
                              }}>
                                {getStatusIcon(assignment.status)}
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: getStatusColor(assignment.status),
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  {getStatusText(assignment.status)}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  bgcolor: 'background.paper',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: '8px',
                                  fontSize: '0.7rem',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  fontWeight: 500
                                }}
                              >
                                ID: {assignment.id}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
              <CardContent>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBroadcast("police_ex")}
                    disabled={broadcastDisabled}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Broadcast Police
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBroadcast("ambulance_ex")}
                    disabled={broadcastDisabled}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Broadcast Ambulance
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBroadcast("both")}
                    disabled={broadcastDisabled}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Broadcast Police & Ambulance
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCloseCall}
                    disabled={!canCloseCall()}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600, 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Close Call
                  </Button>
                  {/* <Button
                    variant="contained"
                    color="secondary"
                    onClick={fetchMediaData}
                    disabled={isLoadingVideos}
                    startIcon={<VideocamIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    {isLoadingVideos ? "Loading Media..." : "View Media"}
                  </Button> */}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Map Section */}
          <Grid item xs={12} md={9}>
            <Card elevation={3} sx={{
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div ref={mapElement} className="map-container" style={{ height: '100%', minHeight: '400px' }}>
                <img
                  src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`}
                  className="logo-map inspace-logo"
                  alt="img-logo"
                />
                <img
                  src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`}
                  className="logo-map isro-logo"
                  alt="img-iso"
                />
                <img
                  src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
                  className="logo-map skytron-logo"
                  alt="img-skytrack"
                />
              </div>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EMCall;