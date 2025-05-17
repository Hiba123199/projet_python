import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../api/blogApi';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Appel à l'API de déconnexion
        await logoutUser();
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } finally {
        // Dans tous les cas, supprimer les données d'authentification locales
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        
        // Rediriger vers la page d'accueil
        navigate('/', { 
          state: { 
            message: 'Vous avez été déconnecté avec succès.' 
          }
        });
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Déconnexion en cours...</span>
      </div>
      <p className="mt-3">Déconnexion en cours...</p>
    </div>
  );
};

export default Logout;
