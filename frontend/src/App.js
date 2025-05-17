import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// Import des composants d'authentification
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Import des composants d'administration Django
import { DjangoAdmin } from './components/admin';

// Import des composants de posts
import PostList from './components/posts/PostList';
import PostDetail from './components/posts/PostDetail';

// Import Bootstrap CSS et FontAwesome
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  
  // Vérifier si l'utilisateur est déjà connecté (token stocké)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (token && storedUsername) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setIsAdmin(storedIsAdmin);
    }
  }, []);
  
  // Fonction pour gérer la connexion réussie
  const handleLogin = (token, user, admin = false) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', user);
    localStorage.setItem('isAdmin', admin);
    setIsAuthenticated(true);
    setUsername(user);
    setIsAdmin(admin);
  };
  
  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    setIsAuthenticated(false);
    setUsername('');
    setIsAdmin(false);
  };
  
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">Blog Django-React</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Accueil</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/posts">Articles</Link>
                </li>
                {isAuthenticated ? (
                  <>
                    <li className="nav-item">
                      <span className="nav-link">Bonjour, {username}</span>
                    </li>
                    {isAdmin && (
                      <li className="nav-item">
                        <Link className="nav-link" to="/admin">Administration</Link>
                      </li>
                    )}
                    <li className="nav-item">
                      <button className="nav-link btn btn-link" onClick={handleLogout}>Déconnexion</button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">Connexion</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/register">Inscription</Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
        
        <main className="flex-shrink-0">
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<PostList />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/posts" element={<PostList />} />
              <Route path="/post/:slug" element={<PostDetail />} />
              
              {/* Routes d'administration avec protection */}
              <Route path="/admin/*" element={
                isAuthenticated && isAdmin ? <DjangoAdmin /> : <Navigate to="/login" replace />
              } />
              
              <Route path="*" element={<div>Page non trouvée</div>} />
            </Routes>
          </div>
        </main>
        
        <footer className="footer mt-auto py-3 bg-dark">
          <div className="container text-center text-white">
            <p>&copy; {new Date().getFullYear()} Blog Django-React</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
