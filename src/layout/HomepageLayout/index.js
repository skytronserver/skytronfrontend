import { Outlet } from 'react-router-dom';
import React, { useState,useEffect } from 'react';
import "./homePageStyle.css";
// import backgroundImage from "../../assets/images/GPSImagee.jpg";
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';
import image2 from "../../assets/images/image2.jpg";
import image1 from "../../assets/images/image1.jpg";
import image3 from "../../assets/images/image3.png";
import image4 from "../../assets/images/image4.jpg";

const images = [image1, image2, image3,image4];
const delay = 6000; // Time delay for slide transition

// ==============================|| HOME PAGE LAYOUT ||============================== //

const HomepageLayout = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }

    setDrawerOpen(open);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, delay);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="layout-container">
    <div className="slider">
      {images.map((image, index) => (
        <div
          key={index}
          className={`slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
    </div>
    <div className="header">
      <HomeHeader isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} toggleDrawer={toggleDrawer} />
    </div>
    <div className="content">
      <Outlet />
    </div>
    <div className="footer">
      <HomeFooter />
    </div>
  </div>
);
}
export default HomepageLayout;
