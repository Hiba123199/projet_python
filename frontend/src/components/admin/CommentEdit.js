import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { commentService, postService } from '../../api/adminApi';

const CommentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAddMode = !id;

  const [comment, setComment] = useState({
    post: '',
    username: '',
    email: '',
    author: '',
    body: '',
  });
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger la liste des posts pour le menu déroulant
        const postsData = await postService.getAllPosts();
        setPosts(postsData);
        
        // Si en mode édition, charger les données du commentaire
        if (!isAddMode) {
          const commentData = await commentService.getComment(id);
          setComment(commentData);
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
    setComment(prev => ({
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
        result = await commentService.createComment(comment);
        setMessage('Le commentaire a été créé avec succès.');
      } else {
        result = await commentService.updateComment(id, comment);
        setMessage('Le commentaire a été mis à jour avec succès.');
      }
      
      setTimeout(() => {
        navigate('/admin/comments');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Une erreur est survenue lors de l\'enregistrement du commentaire.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      try {
        setSubmitting(true);
        await commentService.deleteComment(id);
        setMessage('Le commentaire a été supprimé avec succès.');
        
        setTimeout(() => {
          navigate('/admin/comments');
        }, 1500);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Une erreur est survenue lors de la suppression du commentaire.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div>
      <h1>{isAddMode ? 'Ajouter commentaire' : 'Modifier commentaire'}</h1>
      
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
          <div className="form-row field-post">
            <label htmlFor="id_post">Article:</label>
            <div className="field-box">
              <select 
                name="post" 
                id="id_post"
                value={comment.post} 
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
            </div>
          </div>
          
          <div className="form-row field-username">
            <label htmlFor="id_username">Nom d'utilisateur:</label>
            <div className="field-box">
              <input 
                type="text" 
                name="username" 
                id="id_username"
                value={comment.username} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row field-email">
            <label htmlFor="id_email">Email:</label>
            <div className="field-box">
              <input 
                type="email" 
                name="email" 
                id="id_email"
                value={comment.email} 
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-row field-body">
            <label htmlFor="id_body">Commentaire:</label>
            <div className="field-box">
              <textarea 
                name="body" 
                id="id_body"
                value={comment.body} 
                onChange={handleChange}
                required
                rows="10"
                cols="40"
              ></textarea>
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

export default CommentEdit;
