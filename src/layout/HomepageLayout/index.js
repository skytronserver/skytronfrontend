import { Outlet, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import "./homePageStyle.css";
// import backgroundImage from "../../assets/images/GPSImagee.jpg";
import HomeHeader from './HomeHeader';
import HomeFooter from './HomeFooter';
import image2 from "../../assets/images/image2.jpg";
import image1 from "../../assets/images/image1.jpg";
import image3 from "../../assets/images/image3.png";
import image4 from "../../assets/images/image4.jpg";

const images = [image1, image2, image3, image4];
const delay = 6000; // Time delay for slide transition

// ==============================|| HOME PAGE LAYOUT ||============================== //

const HomepageLayout = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();

  // Check if current route is a dashboard page
  const isDashboardPage = location.pathname.includes('/superadmin-dashboard/');

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
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }
    if (typeof caches !== 'undefined') {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    localStorage.clear();
    sessionStorage.clear();
  }, [])
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, delay);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={`layout-container ${isDashboardPage ? 'dashboard-mode' : ''}`}>
      {!isDashboardPage && (
        <div className="slider">
          {images.map((image, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
      )}
      {!isDashboardPage && (
        <div className="header">
          <HomeHeader isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} toggleDrawer={toggleDrawer} />
        </div>
      )}
      <div className="content">
        <Outlet />
      </div>
      {!isDashboardPage && (
        <div className="footer">
          <HomeFooter />
        </div>
      )}
    </div>
  );
}
export default HomepageLayout;
