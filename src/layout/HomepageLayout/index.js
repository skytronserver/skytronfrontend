import { Outlet, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import "./homePageStyle.css";
// import backgroundImage from "../../assets/images/GPSImagee.jpg";
import HomeHeader from './HomeHeader';
//import HomeFooter from './HomeFooter';
import Footer from '../../views/landingpage/Footer'
import image2 from "../../assets/images/image2.jpg";
import image7 from "../../assets/images/image7.png";
import image1 from "../../assets/images/image1.jpg";
//import image3 from "../../assets/images/image3.png";
import image5 from "../../assets/images/Image5.png";
//import image4 from "../../assets/images/image4.jpg";
import image6 from "../../assets/images/image6.png";
import login1 from "../../assets/images/login1.jpg"
import login2 from "../../assets/images/login2.jpg"
import login3 from "../../assets/images/login3.jpg"
import login4 from "../../assets/images/login5.jpg"

const images = [login1, login2, login3, login4];
const delay = 6000; // Time delay for slide transition

// ==============================|| HOME PAGE LAYOUT ||============================== //

const HomepageLayout = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();

  // Check if current route is a dashboard page
  //const isDashboardPage = location.pathname.includes('/superadmin-dashboard/');
const isHomePage = location.pathname === "/";
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
    // <div className={`layout-container ${isDashboardPage ? 'dashboard-mode' : ''}`}>
    //   {!isDashboardPage && (
    //     <div className="slider">
    //       {images.map((image, index) => (
    //         <div
    //           key={index}
    //           className={`slide ${index === currentSlide ? 'active' : ''}`}
    //           style={{ backgroundImage: `url(${image})` }}
    //         />
    //       ))}
    //     </div>
    //   )}
    //   <div className="header">
    //     <HomeHeader isDrawerOpen={isDrawerOpen} setDrawerOpen={setDrawerOpen} toggleDrawer={toggleDrawer} />
    //   </div>
    //   <div className="content">
    //     <Outlet />
    //   </div>
    //   {!isDashboardPage && (
    //     <div className="footer">
    //       <HomeFooter />
    //     </div>
    //   )}
    // </div>
    <div className={`layout-container ${isHomePage ? '' : 'dashboard-mode'}`}>
  
  {isHomePage && (
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

  <div className="header">
    <HomeHeader
      isDrawerOpen={isDrawerOpen}
      setDrawerOpen={setDrawerOpen}
      toggleDrawer={toggleDrawer}
    />
  </div>

  <div className="content">
    <Outlet />
  </div>

  {isHomePage && (
    <div className="footer">
      <Footer />
    </div>
  )}
</div>
  );
}
export default HomepageLayout;
