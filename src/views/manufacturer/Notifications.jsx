import React from 'react';
import { 
  Box, Typography, Card, List, ListItem, ListItemIcon, ListItemText, 
  Divider, IconButton, Chip 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';

const notificationsData = [
  { 
    id: 1, 
    type: 'success', 
    title: 'Model Approved', 
    message: 'Your model "SkyTrack X1" has been successfully approved by the testing agency.', 
    time: '2 hours ago',
    unread: true
  },
  { 
    id: 2, 
    type: 'error', 
    title: 'Action Required: Correction', 
    message: 'Correction required for "SkyTrack Pro" firmware documentation.', 
    time: '1 day ago',
    unread: true
  },
  { 
    id: 3, 
    type: 'info', 
    title: 'Devices Received', 
    message: 'Test agency has received 5/5 devices for Request REQ-2026-001.', 
    time: '3 days ago',
    unread: false
  },
  { 
    id: 4, 
    type: 'success', 
    title: 'Testing Completed', 
    message: 'Technical onboarding testing completed for Tracker Basic. Final report is available for download.', 
    time: '1 week ago',
    unread: false
  }
];

const getIcon = (type) => {
  switch(type) {
    case 'success': return <CheckCircleIcon color="success" />;
    case 'error': return <ErrorIcon color="error" />;
    case 'info': default: return <InfoIcon color="primary" />;
  }
};

const Notifications = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3">Notifications</Typography>
        <IconButton color="primary" title="Mark all as read">
          <DoneAllIcon />
        </IconButton>
      </Box>

      <Card sx={{ boxShadow: 2 }}>
        <List disablePadding>
          {notificationsData.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem 
                alignItems="flex-start" 
                sx={{ 
                  py: 2, 
                  backgroundColor: notification.unread ? 'rgba(25, 118, 210, 0.04)' : 'transparent' 
                }}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" size="small" color="secondary">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ mt: 1 }}>
                  {getIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={notification.unread ? 600 : 400}>
                        {notification.title}
                      </Typography>
                      {notification.unread && <Chip label="New" color="primary" size="small" sx={{ height: 20 }} />}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="textPrimary" sx={{ display: 'block', mb: 0.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {notification.time}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < notificationsData.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Card>
    </Box>
  );
};

export default Notifications;
