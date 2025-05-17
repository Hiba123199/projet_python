import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForms.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Utiliser l'URL complète pour éviter les problèmes de proxy
      const response = await fetch('http://localhost:8000/accounts/direct-login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });
      
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur de parsing JSON:', e);
        throw new Error('Réponse du serveur non valide');
      }
      
      if (response.ok) {
        console.log('Connexion réussie!', data);
        
        // Vérifier si l'utilisateur est un administrateur
        const isAdmin = data.is_staff || data.is_superuser || false;
        
        // Stocker les informations d'authentification
        localStorage.setItem('authToken', 'session-auth'); // Token simplifié
        localStorage.setItem('username', formData.username);
        localStorage.setItem('isAdmin', isAdmin);
        
        console.log('Statut admin:', isAdmin);
        
        // Utiliser la fonction onLoginSuccess si fournie
        if (onLoginSuccess) {
          onLoginSuccess('session-auth', formData.username, isAdmin);
        }
        
        // Rediriger vers la page d'accueil
        navigate('/');
      } else {
        // En cas d'erreur, extraire le message d'erreur
        setError(data.detail || data.error || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card auth-card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Connexion</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p>Vous n'avez pas de compte ? <Link to="/register">Créer un compte</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
