import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthForms.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Valider le nom d'utilisateur
    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    }
    
    // Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    // Valider le mot de passe
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    
    // Valider la confirmation du mot de passe
    if (formData.password !== formData.password2) {
      newErrors.password2 = "Les mots de passe ne correspondent pas";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      console.log('Tentative d\'inscription avec:', formData);
      
      // Utilisation de la route API standard
      const response = await fetch('/accounts/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2
        })
      });
      
      const responseText = await response.text();
      console.log('Réponse brute du serveur:', responseText);
      
      let responseData;
      try {
        // Tenter de parser le JSON
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError);
        throw new Error('Réponse serveur non valide');
      }
      
      // Vérifier si la requête a réussi
      if (response.ok) {
        console.log('Inscription réussie!', responseData);
        
        // Rediriger vers la page de connexion
        navigate('/login', { 
          state: { 
            message: "Inscription réussie ! Vous pouvez maintenant vous connecter." 
          } 
        });
      } else {
        // En cas d'erreur, afficher les messages d'erreur retournés par le serveur
        console.error('Erreurs du serveur:', responseData);
        
        if (responseData.error) {
          // Erreur générale
          setErrors({ general: responseData.error });
        } else {
          // Erreurs de validation (username, email, password, etc.)
          setErrors(prev => ({
            ...prev,
            ...responseData,
            general: responseData.detail || null
          }));
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      setErrors({ general: err.message || 'Une erreur s\'est produite lors de l\'inscription' });
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
              <h2 className="card-title text-center mb-4">Créer un compte</h2>
              
              {errors.general && (
                <div className="alert alert-danger" role="alert">
                  {errors.general}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                  {errors.username && (
                    <div className="invalid-feedback">{errors.username}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="password2" className="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password2 ? 'is-invalid' : ''}`}
                    id="password2"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    required
                  />
                  {errors.password2 && (
                    <div className="invalid-feedback">{errors.password2}</div>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p>Vous avez déjà un compte ? <Link to="/login">Se connecter</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
