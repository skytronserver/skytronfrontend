import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
const MiniBoard = ({ data}) => {
  return (
    <Grid container spacing={2}> {/* Add spacing between grid items */}
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 0, // Remove border radius
                borderTop: '4px solid rgb(134, 70, 156)', // Add top border color as per theme
                boxShadow: 'none',
              }}
            >
              <CardContent>
                <Typography variant="h4">{item.title}</Typography>
                <Typography variant="h3" color="primary">
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
  );
};

export default MiniBoard;
