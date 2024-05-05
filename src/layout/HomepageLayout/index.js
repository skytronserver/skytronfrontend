import { Outlet } from 'react-router-dom';
import React, { useState } from 'react';
import backgroundImage from "../../assets/images/GPSImagee.jpg";
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';

const myStyle = {
  backgroundImage: `url(${backgroundImage})`,
  minHeight: '100vh',
  backgroundSize: "cover, contain",
  backgroundRepeat: "no-repeat",
};
// ==============================|| HOME PAGE LAYOUT ||============================== //

const HomepageLayout = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  return (
    <div style={myStyle}>
      <HomeHeader isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} toggleDrawer={toggleDrawer} />
      <Outlet/>
      <HomeFooter />
    </div>
);
}
export default HomepageLayout;
