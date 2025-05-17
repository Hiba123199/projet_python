import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { postService } from '../../api/adminApi';
import './AdminStyles.css';

const PostsAdmin = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let data;
        
        // Vérifiez si un filtre est appliqué via les paramètres d'URL
        const queryParams = new URLSearchParams(location.search);
        const statusFilter = queryParams.get('status');
        
        if (statusFilter && (statusFilter === 'published' || statusFilter === 'draft')) {
          data = await postService.filterPosts(statusFilter);
          setActiveFilter(statusFilter);
        } else {
          data = await postService.getAllPosts();
          setActiveFilter('all');
        }
        
        setPosts(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des articles. Assurez-vous d\'être connecté comme administrateur.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location.search]);

  const handleFilterChange = (filter) => {
    if (filter === 'all') {
      navigate('/admin/posts');
    } else {
      navigate(`/admin/posts?status=${filter}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      try {
        await postService.deletePost(id);
        // Mettre à jour la liste des posts après suppression
        setPosts(posts.filter(post => post.id !== id));
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de l\'article.');
      }
    }
  };

  if (loading) return <div className="admin-loading">Chargement des articles...</div>;

  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-posts">
      <header className="admin-header">
        <h1>Gestion des Articles</h1>
        <p>Créez, modifiez et supprimez les articles du blog</p>
      </header>

      <div className="admin-toolbar">
        <div className="filter-options">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Tous
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'published' ? 'active' : ''}`}
            onClick={() => handleFilterChange('published')}
          >
            Publiés
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'draft' ? 'active' : ''}`}
            onClick={() => handleFilterChange('draft')}
          >
            Brouillons
          </button>
        </div>
        <Link to="/admin/posts/new" className="btn btn-primary">
          <i className="fas fa-plus"></i> Nouvel Article
        </Link>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Auteur</th>
              <th>Statut</th>
              <th>Date de création</th>
              <th>J'aime</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>
                  Aucun article trouvé
                </td>
              </tr>
            ) : (
              posts.map(post => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td>{post.author_username}</td>
                  <td>
                    <span className={`status-badge ${post.status}`}>
                      {post.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>{new Date(post.created).toLocaleDateString()}</td>
                  <td>{post.likes_count}</td>
                  <td className="actions">
                    <Link to={`/admin/posts/edit/${post.id}`} className="action-btn edit">
                      <i className="fas fa-edit"></i>
                    </Link>
                    <Link to={`/post/${post.slug}`} className="action-btn view" target="_blank">
                      <i className="fas fa-eye"></i>
                    </Link>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(post.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-footer">
        <Link to="/admin" className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default PostsAdmin;
