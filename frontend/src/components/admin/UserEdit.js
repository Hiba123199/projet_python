import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../api/adminApi';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAddMode = !id;

  const [user, setUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    password: '',
    password_confirm: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Si en mode édition, charger les données de l'utilisateur
    if (!isAddMode) {
      setLoading(true);
      userService.getUser(id)
        .then(data => {
          // Ne pas inclure les mots de passe dans les données chargées
          const { password, ...userData } = data;
          setUser({
            ...userData,
            password: '',
            password_confirm: ''
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Erreur lors du chargement de l\'utilisateur:', err);
          setError('Impossible de charger les données de l\'utilisateur.');
          setLoading(false);
        });
    }
  }, [id, isAddMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!user.username) {
      setError('Le nom d\'utilisateur est obligatoire.');
      return false;
    }
    
    if (!user.email) {
      setError('L\'email est obligatoire.');
      return false;
    }
    
    if (isAddMode && !user.password) {
      setError('Le mot de passe est obligatoire pour un nouvel utilisateur.');
      return false;
    }
    
    if (user.password && user.password !== user.password_confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      let result;
      // Préparer les données à envoyer (supprimer password_confirm)
      const { password_confirm, ...userData } = user;
      
      if (isAddMode) {
        result = await userService.createUser(userData);
        setMessage('L\'utilisateur a été créé avec succès.');
      } else {
        // Si le mot de passe est vide en mode édition, ne pas l'inclure
        if (!userData.password) {
          const { password, ...userDataWithoutPassword } = userData;
          result = await userService.updateUser(id, userDataWithoutPassword);
        } else {
          result = await userService.updateUser(id, userData);
        }
        setMessage('L\'utilisateur a été mis à jour avec succès.');
      }
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Une erreur est survenue lors de l\'enregistrement de l\'utilisateur.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        setSubmitting(true);
        await userService.deleteUser(id);
        setMessage('L\'utilisateur a été supprimé avec succès.');
        
        setTimeout(() => {
          navigate('/admin/users');
        }, 1500);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Une erreur est survenue lors de la suppression de l\'utilisateur.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div>
      <h1>{isAddMode ? 'Ajouter utilisateur' : 'Modifier utilisateur'}</h1>
      
      {message && (
        <ul className="django-messages">
          <li className="success">{message}</li>
        </ul>
      )}
      
      {error && (
        <ul className="django-messages">
          <li className="error">{error}</li>
        </ul>
      )}
      
      <form className="django-form" onSubmit={handleSubmit}>
        <fieldset className="module aligned">
          <h2>Informations personnelles</h2>
          
          <div className="form-row field-username">
            <label htmlFor="id_username">Nom d'utilisateur:</label>
            <div className="field-box">
              <input 
                type="text" 
                name="username" 
                id="id_username"
                value={user.username} 
                onChange={handleChange}
                required
              />
              <div className="help">
                Obligatoire. 150 caractères maximum. Uniquement des lettres, chiffres et @/./+/-/_.
              </div>
            </div>
          </div>
          
          <div className="form-row field-first-name">
            <label htmlFor="id_first_name">Prénom:</label>
            <div className="field-box">
              <input 
                type="text" 
                name="first_name" 
                id="id_first_name"
                value={user.first_name} 
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row field-last-name">
            <label htmlFor="id_last_name">Nom:</label>
            <div className="field-box">
              <input 
                type="text" 
                name="last_name" 
                id="id_last_name"
                value={user.last_name} 
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row field-email">
            <label htmlFor="id_email">Adresse email:</label>
            <div className="field-box">
              <input 
                type="email" 
                name="email" 
                id="id_email"
                value={user.email} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </fieldset>
        
        <fieldset className="module aligned">
          <h2>Permissions</h2>
          
          <div className="form-row field-is-active">
            <div className="checkbox-row">
              <input 
                type="checkbox" 
                name="is_active" 
                id="id_is_active"
                checked={user.is_active} 
                onChange={handleChange}
              />
              <label htmlFor="id_is_active">Actif</label>
              <div className="help">
                Indique si l'utilisateur doit être traité comme actif. Décochez ceci plutôt que de supprimer le compte.
              </div>
            </div>
          </div>
          
          <div className="form-row field-is-staff">
            <div className="checkbox-row">
              <input 
                type="checkbox" 
                name="is_staff" 
                id="id_is_staff"
                checked={user.is_staff} 
                onChange={handleChange}
              />
              <label htmlFor="id_is_staff">Statut administrateur</label>
              <div className="help">
                Indique si l'utilisateur peut se connecter à ce site d'administration.
              </div>
            </div>
          </div>
          
          <div className="form-row field-is-superuser">
            <div className="checkbox-row">
              <input 
                type="checkbox" 
                name="is_superuser" 
                id="id_is_superuser"
                checked={user.is_superuser} 
                onChange={handleChange}
              />
              <label htmlFor="id_is_superuser">Statut super-utilisateur</label>
              <div className="help">
                Indique que l'utilisateur possède toutes les permissions sans les assigner explicitement.
              </div>
            </div>
          </div>
        </fieldset>
        
        <fieldset className="module aligned">
          <h2>Mot de passe</h2>
          
          <div className="form-row field-password">
            <label htmlFor="id_password">Mot de passe:</label>
            <div className="field-box">
              <input 
                type="password" 
                name="password" 
                id="id_password"
                value={user.password} 
                onChange={handleChange}
                {...(isAddMode ? { required: true } : {})}
              />
              <div className="help">
                {isAddMode
                  ? 'Requis. Entrez un mot de passe sécurisé.'
                  : 'Laissez vide pour conserver le mot de passe actuel.'}
              </div>
            </div>
          </div>
          
          <div className="form-row field-password-confirm">
            <label htmlFor="id_password_confirm">Confirmation du mot de passe:</label>
            <div className="field-box">
              <input 
                type="password" 
                name="password_confirm" 
                id="id_password_confirm"
                value={user.password_confirm} 
                onChange={handleChange}
                {...(isAddMode ? { required: true } : {})}
              />
              <div className="help">
                Entrez le même mot de passe que précédemment, pour vérification.
              </div>
            </div>
          </div>
        </fieldset>
        
        <div className="submit-row">
          <input 
            type="submit" 
            value={submitting ? 'Enregistrement...' : 'Enregistrer'} 
            className="default"
            disabled={submitting}
          />
          
          {!isAddMode && (
            <>
              <input 
                type="submit" 
                value="Enregistrer et continuer l'édition" 
                name="_continue" 
                disabled={submitting}
              />
              <input 
                type="submit" 
                value="Enregistrer et ajouter un autre" 
                name="_addanother" 
                disabled={submitting}
              />
              <a 
                href="#" 
                className="deletelink" 
                onClick={(e) => { e.preventDefault(); handleDelete(); }}
                style={{ visibility: submitting ? 'hidden' : 'visible' }}
              >
                Supprimer
              </a>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserEdit;
