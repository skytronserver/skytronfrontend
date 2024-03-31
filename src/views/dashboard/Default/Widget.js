
//new
// Widget.js
// import React from 'react';

// const Widget = ({ isLoading, cardColor, onClick, label }) => {
//   return (
//     <div
//       style={{
//         backgroundColor: cardColor,
//         padding: '20px',
//         borderRadius: '8px',
//         marginBottom: '20px',
//         textAlign: 'center',
//         color: '#fff', // Text color
//       }}
//       onClick={onClick}
//     >
//       {label} {/* Display the label */}
//     </div>
//   );
// };

// export default Widget;


// Widget.js


//new
import PropTypes from 'prop-types';
import { useTheme, styled } from '@mui/material/styles';
import { Avatar, Box, Grid, Typography } from '@mui/material';
import MainCard from '../../../ui-component/cards/MainCard';
import SkeletonTotalOrderCard from '../../../ui-component/cards/Skeleton/Widget';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';

const CardWrapper = styled(MainCard)(({ theme, data }) => ({
  backgroundColor: data,
  color: '#fff',
  overflow: 'hidden',
  position: 'relative',
  '& > div': {
    position: 'relative',
    zIndex: 5
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: 210,
    height: 210,
    background: theme.palette.primary[800],
    borderRadius: '50%',
    zIndex: 1,
    top: -85,
    right: -95,
    [theme.breakpoints.down('sm')]: {
      top: -105,
      right: -140
    }
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    zIndex: 1,
    width: 210,
    height: 210,
    background: theme.palette.primary[800],
    borderRadius: '50%',
    top: -125,
    right: -15,
    opacity: 0.5,
    [theme.breakpoints.down('sm')]: {
      top: -155,
      right: -70
    }
  }
}));

const Widget = ({ isLoading, cardColor, label, onClick }) => {
  const theme = useTheme();
  return (
    <>
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <CardWrapper border={false} content={false} data={cardColor} onClick={onClick}>
          <Box sx={{ p: 2.25 }}>
            <Grid container direction="column">
              <Grid item>
                <Grid container justifyContent="space-between">
                  <Grid item>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        backgroundColor: theme.palette.primary[800],
                        color: '#fff',
                        mt: 1
                      }}
                    >
                      <LocalMallOutlinedIcon fontSize="inherit" />
                    </Avatar>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container alignItems="center">
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>{label}</Typography>
                  </Grid>
                  <Grid item xs={6} style={{ float: 'right' }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: theme.palette.primary[200] }}>{label}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </CardWrapper>
      )}
    </>
  );
};

Widget.propTypes = {
  isLoading: PropTypes.bool,
  cardColor: PropTypes.string,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired // New onClick prop
};

export default Widget;

