import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../../api/adminApi';

const PostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAddMode = !id;

  const [post, setPost] = useState({
    title: '',
    slug: '',
    body: '',
    status: 'draft',
    author: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Si en mode édition, charger les données du post
    if (!isAddMode) {
      setLoading(true);
      postService.getPost(id)
        .then(data => {
          setPost(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Erreur lors du chargement du post:', err);
          setError('Impossible de charger les données du post.');
          setLoading(false);
        });
    }
  }, [id, isAddMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Génération automatique du slug
    if (name === 'title' && (!post.slug || post.slug === '')) {
      setPost(prev => ({
        ...prev,
        slug: value.toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/--+/g, '-')
                  .trim()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      let result;
      if (isAddMode) {
        result = await postService.createPost(post);
        setMessage('Le post a été créé avec succès.');
      } else {
        result = await postService.updatePost(id, post);
        setMessage('Le post a été mis à jour avec succès.');
      }
      
      setTimeout(() => {
        navigate('/admin/posts');
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Une erreur est survenue lors de l\'enregistrement du post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
      try {
        setSubmitting(true);
        await postService.deletePost(id);
        setMessage('Le post a été supprimé avec succès.');
        
        setTimeout(() => {
          navigate('/admin/posts');
        }, 1500);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        setError('Une erreur est survenue lors de la suppression du post.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div>
      <h1>{isAddMode ? 'Ajouter post' : 'Modifier post'}</h1>
      
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
        <div className="form-row field-title">
          <label htmlFor="id_title">Titre:</label>
          <input 
            type="text" 
            name="title" 
            id="id_title"
            value={post.title} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-row field-slug">
          <label htmlFor="id_slug">Slug:</label>
          <input 
            type="text" 
            name="slug" 
            id="id_slug"
            value={post.slug} 
            onChange={handleChange}
            required
          />
          <p className="help">Un identifiant court pour l'URL, contenant uniquement des lettres, des chiffres, des traits d'union et des traits de soulignement.</p>
        </div>
        
        <div className="form-row field-body">
          <label htmlFor="id_body">Corps:</label>
          <textarea 
            name="body" 
            id="id_body"
            value={post.body} 
            onChange={handleChange}
            required
            rows="10"
          ></textarea>
        </div>
        
        <div className="form-row field-status">
          <label htmlFor="id_status">Statut:</label>
          <select 
            name="status" 
            id="id_status"
            value={post.status} 
            onChange={handleChange}
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </div>
        
        <div className="submit-row">
          <input 
            type="submit" 
            value={submitting ? 'Enregistrement...' : 'Enregistrer'} 
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

export default PostEdit;
