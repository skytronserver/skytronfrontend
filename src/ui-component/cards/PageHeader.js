import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, Typography } from '@mui/material';

const PageHeader = forwardRef(
    (
      {
        title,
        ...others
      },
      ref
    ) => { 
      return (
        <Card>
        <CardContent style={{padding:'15px'}} >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Typography variant="h3" style={{ fontWeight: '500' }}>{title}</Typography>
            </div>
            <div>
              <Typography variant="subtitle1"></Typography>
            </div>
          </div>
        </CardContent>
      </Card>
      );
    }
  );
  

PageHeader.propTypes = {
    title: PropTypes.string,
  };
  
  export default PageHeader;