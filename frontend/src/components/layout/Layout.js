import React from 'react';
import MainNavbar from './MainNavbar';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <MainNavbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
