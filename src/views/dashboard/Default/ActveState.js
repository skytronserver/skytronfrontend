
// import React, { useState, useEffect } from 'react';
// import { Grid } from '@mui/material';
// import Widget from './Widget';
// import { gridSpacing } from '../../../store/constant';
 
// const ActiveState = () => {
//   const [isLoading, setLoading] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, []);

//   // State for collapse
//   const [activeStatesCollapse, setActiveStatesCollapse] = useState(false);
//   const [totalStatesCollapse, setTotalStatesCollapse] = useState(true); 
//   const [totalInactiveCollapse, setTotalInactiveCollapse] = useState(true); 
//   const [totalActiveCollapse, setTotalActiveCollapse] = useState(true); 

 
//   const handleWidgetClick = (widgetType) => {
//     if (widgetType === 'Active States') {
//       setActiveStatesCollapse(!activeStatesCollapse);
//       setTotalStatesCollapse(true);
//       setTotalInactiveCollapse(true);
//       setTotalActiveCollapse(true);
//     } else if (widgetType === 'Total States') {
//       setActiveStatesCollapse(true);
//       setTotalStatesCollapse(!totalStatesCollapse);
//       setTotalInactiveCollapse(true);
//       setTotalActiveCollapse(true);
//     } else if (widgetType === 'Total Inactive') {
//       setActiveStatesCollapse(true);
//       setTotalStatesCollapse(true);
//       setTotalInactiveCollapse(!totalInactiveCollapse);
//       setTotalActiveCollapse(true);
//     } else if (widgetType === 'Total Active') {
//       setActiveStatesCollapse(true);
//       setTotalStatesCollapse(true);
//       setTotalInactiveCollapse(true);
//       setTotalActiveCollapse(!totalActiveCollapse);
//     }
//   };

//   return (
//     <Grid container spacing={gridSpacing}>
//       <Grid item xs={10} style={{ marginTop: '20px' }}>
        
//         <Widget
//           isLoading={isLoading}
//           cardColor="#1e88e5"
//           label="Active States"
//           onClick={() => handleWidgetClick('Active States')}
//           isCollapsed={activeStatesCollapse}
//         />
//         <Widget
//           isLoading={isLoading}
//           cardColor="#5e35b1"
//           label="Total States"
//           onClick={() => handleWidgetClick('Total States')}
//           isCollapsed={totalStatesCollapse}
//         />
//         <Widget
//           isLoading={isLoading}
//           cardColor="#e53935"
//           label="Total Inactive"
//           onClick={() => handleWidgetClick('Total Inactive')}
//           isCollapsed={totalInactiveCollapse}
//         />
//         <Widget
//           isLoading={isLoading}
//           cardColor="#1e88e5"
//           label="Total Active"
//           onClick={() => handleWidgetClick('Total Active')}
//           isCollapsed={totalActiveCollapse}
//         />
//       </Grid>
//     </Grid>
//   );
// };

// export default ActiveState;










import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import Widget from './Widget';
import { gridSpacing } from '../../../store/constant';

const ActiveState = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // State for collapse
  const [activeStatesCollapse, setActiveStatesCollapse] = useState(false);
  const [totalStatesCollapse, setTotalStatesCollapse] = useState(true); 
  const [totalInactiveCollapse, setTotalInactiveCollapse] = useState(true); 
  const [totalActiveCollapse, setTotalActiveCollapse] = useState(true); 

  const handleWidgetClick = (widgetType) => {
    setActiveStatesCollapse(widgetType === 'Active States' ? !activeStatesCollapse : true);
    setTotalStatesCollapse(widgetType === 'Total States');
    setTotalInactiveCollapse(widgetType === 'Total Inactive');
    setTotalActiveCollapse(widgetType === 'Total Active');
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12} sm={6} md={4} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Active States"
          onClick={() => handleWidgetClick('Active States')}
          isCollapsed={activeStatesCollapse}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#5e35b1"
          label="Total States"
          onClick={() => handleWidgetClick('Total States')}
          isCollapsed={totalStatesCollapse}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#e53935"
          label="Total Inactive"
          onClick={() => handleWidgetClick('Total Inactive')}
          isCollapsed={totalInactiveCollapse}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} style={{ marginTop: '20px' }}>
        <Widget
          isLoading={isLoading}
          cardColor="#1e88e5"
          label="Total Active"
          onClick={() => handleWidgetClick('Total Active')}
          isCollapsed={totalActiveCollapse}
        />
      </Grid>
    </Grid>
  );
};

export default ActiveState;
