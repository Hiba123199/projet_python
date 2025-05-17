import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './MainNavbar.css';

const MainNavbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Gestion de la soumission du formulaire de recherche
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Vérifier si un chemin est actif pour le style du menu
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/post_list';
    }
    return location.pathname.includes(path);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">Start Bootstrap</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" 
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Barre de recherche */}
          <form className="d-flex me-auto" onSubmit={handleSearch}>
            <div className="input-group">
              <input 
                className="form-control" 
                type="search" 
                placeholder="Rechercher des articles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search" 
              />
              <button className="btn btn-outline-light" type="submit">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>
          
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/') ? 'active fw-bold text-white' : ''}`}
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/login') ? 'active fw-bold text-white' : ''}`}
                to="/login"
              >
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/register') ? 'active fw-bold text-white' : ''}`}
                to="/register"
              >
                Register
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/logout') ? 'active fw-bold text-white' : ''}`}
                to="/logout"
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
