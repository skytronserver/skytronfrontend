import React, { useEffect } from 'react';
import { Box, Slider, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

const VideoPlayer = ({
  videoUrl,
  videoRef,
  isVideoLoading,
  isVideoReady,
  isPlaying,
  isFullscreen,
  showControls,
  currentTime,
  seekTime,
  isSeeking,
  volume,
  isMuted,
  onPlayPause,
  onNext,
  onPrevious,
  onTimeChange,
  onTimeChangeCommitted,
  onVolumeChange,
  onMuteToggle,
  onFullscreenToggle,
  onMouseMove,
  onMouseLeave,
  onLoadStart,
  onLoadedData,
  onError,
  onCanPlay,
  onWaiting,
  onTimeUpdate,
  onSeeking,
  onSeeked,
  onEnded,
  minTime,
  maxTime,
  formatTime,
  disabled
}) => {
  // Ensure the video element's volume and mute state are synced with props
  useEffect(() => {
    if (videoRef && videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        bgcolor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {isVideoLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1,
          }}
        >
          <Typography color="white">Loading video...</Typography>
        </Box>
      )}
      <video
        ref={videoRef}
        src={videoUrl}
        onLoadStart={onLoadStart}
        onLoadedData={onLoadedData}
        onError={onError}
        onCanPlay={onCanPlay}
        onWaiting={onWaiting}
        onTimeUpdate={onTimeUpdate}
        onSeeking={onSeeking}
        onSeeked={onSeeked}
        onEnded={onEnded}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          p: 1.5,
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Progress Bar */}
        <Box sx={{ mb: 1.5 }}>
          <Slider
            value={isSeeking ? seekTime : currentTime}
            min={minTime}
            max={maxTime}
            onChange={onTimeChange}
            onChangeCommitted={onTimeChangeCommitted}
            valueLabelDisplay="auto"
            valueLabelFormat={formatTime}
            disabled={disabled}
            sx={{
              color: 'primary.main',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                transition: 'none',
              },
              '& .MuiSlider-track': {
                transition: 'none',
              },
              '& .MuiSlider-rail': {
                transition: 'none',
              },
            }}
          />
        </Box>
        {/* Controls */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Playback Controls */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              onClick={onPrevious}
              disabled={disabled}
              color="primary"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <SkipPreviousIcon />
            </IconButton>
            <IconButton
              onClick={onPlayPause}
              disabled={disabled}
              color="primary"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton
              onClick={onNext}
              disabled={disabled}
              color="primary"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <SkipNextIcon />
            </IconButton>
          </Box>
          {/* Time Display */}
          <Typography variant="body2" color="white" sx={{ 
            minWidth: '100px',
            fontFamily: 'monospace',
            letterSpacing: '0.5px'
          }}>
            {formatTime(currentTime)} / {formatTime(maxTime)}
          </Typography>
          {/* Volume Controls */}
          <Box display="flex" alignItems="center" gap={1} sx={{ ml: 'auto' }}>
            <IconButton
              onClick={onMuteToggle}
              color="primary"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              value={volume * 100}
              onChange={onVolumeChange}
              min={0}
              max={100}
              sx={{
                width: '100px',
                color: 'primary.main',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
          </Box>
          {/* Fullscreen Toggle */}
          <IconButton
            onClick={onFullscreenToggle}
            color="primary"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer; 