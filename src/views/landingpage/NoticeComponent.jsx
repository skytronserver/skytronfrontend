import { Container, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, CircularProgress, Divider, Box } from "@mui/material";
import DetailSection from "./DetailSection";
import AboutUs from "./AboutUs";
import ContactUs from "./ContactUs";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import { BASE_URL,CUSTOM_BASE_URL } from "../../store/constant";

const NoticeComponent = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch(`${BASE_URL}api/notice/list/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch notices");
        }
        
        const data = await response.json();
        setNotices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotices();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container style={{paddingTop:"24px"}}>
      <Typography variant="h3" gutterBottom style={{textAlign:'center'}}>
        NOTICE
      </Typography>
      <List style={{paddingTop:"24px"}}>
        {notices.map((notice) => (
          <Box key={notice.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={(notice.title).toUpperCase()}
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
                      {notice.detail}
                    </Typography>
                  </>
                }
              />
              {notice.file && (
               
                <ListItemSecondaryAction>
                  <Button
                    variant="contained"
                    color="primary"
                    href={`${BASE_URL}${notice.file}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </Button>
                </ListItemSecondaryAction>
              )}
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>
    </Container>
  );
};



export default NoticeComponent;
