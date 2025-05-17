import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { likeService, postService, userService } from '../../api/adminApi';

const LikesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAddMode = !id;

  const [like, setLike] = useState({
    user: '',
    post: '',
  });
  
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger la liste des posts et utilisateurs pour les menus déroulants
        const [postsData, usersData] = await Promise.all([
          postService.getAllPosts(),
          userService.getAllUsers()
        ]);
        
        setPosts(postsData);
        setUsers(usersData);
        
        // Si en mode édition, charger les données du like
        if (!isAddMode) {
          const likeData = await likeService.getLike(id);
          setLike(likeData);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données. Assurez-vous d\'être connecté en tant qu\'administrateur.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAddMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLike(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      let result;
      if (isAddMode) {
        result = await likeService.createLike(like);
        setMessage('Le j\'aime a été créé avec succès.');
      } else {
        result = await likeService.updateLike(id, like);
        setMessage('Le j\'aime a été mis à jour avec succès.');
      }
      
      setTimeout(() => {
        navigate('/admin/likes');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Une erreur est survenue lors de l\'enregistrement du j\'aime.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce j\'aime ?')) {
      try {
        setSubmitting(true);
        await likeService.deleteLike(id);
        setMessage('Le j\'aime a été supprimé avec succès.');
        
        setTimeout(() => {
          navigate('/admin/likes');
        }, 1500);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Une erreur est survenue lors de la suppression du j\'aime.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div>
      <h1>{isAddMode ? 'Ajouter j\'aime' : 'Modifier j\'aime'}</h1>
      
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
          <div className="form-row field-user">
            <label htmlFor="id_user">Utilisateur:</label>
            <div className="field-box">
              <select 
                name="user" 
                id="id_user"
                value={like.user} 
                onChange={handleChange}
                required
              >
                <option value="">---------</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
              <div className="help">
                <img src="/static/admin/img/search.svg" alt="Loupe" className="help-icon" />
                <a href="/admin/auth/user/?_to_field=id" className="related-lookup" id="lookup_id_user" title="Rechercher utilisateur">
                </a>
              </div>
            </div>
          </div>
          
          <div className="form-row field-post">
            <label htmlFor="id_post">Article:</label>
            <div className="field-box">
              <select 
                name="post" 
                id="id_post"
                value={like.post} 
                onChange={handleChange}
                required
              >
                <option value="">---------</option>
                {posts.map(post => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
              <div className="help">
                <img src="/static/admin/img/search.svg" alt="Loupe" className="help-icon" />
                <a href="/admin/base/post/?_to_field=id" className="related-lookup" id="lookup_id_post" title="Rechercher article">
                </a>
              </div>
            </div>
          </div>
          
          {!isAddMode && (
            <div className="form-row field-created_at">
              <label>Date de création:</label>
              <div className="readonly">
                {new Date(like.created_at).toLocaleString()}
              </div>
            </div>
          )}
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

export default LikesEdit;
