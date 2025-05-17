import React, { useState, useEffect } from 'react';
import { statsService } from '../../api/adminApi';
import { Link } from 'react-router-dom';
import './AdminStyles.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users_count: 0,
    posts_count: 0,
    comments_count: 0,
    likes_count: 0,
    published_posts: 0,
    draft_posts: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statsService.getAdminStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques. Assurez-vous d\'être connecté comme administrateur.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="admin-loading">Chargement des statistiques...</div>;

  if (error) return <div className="admin-error">{error}</div>;

  const adminModules = [
    { title: 'Articles', count: stats.posts_count, path: '/admin/posts', icon: 'fa-newspaper' },
    { title: 'Utilisateurs', count: stats.users_count, path: '/admin/users', icon: 'fa-users' },
    { title: 'Commentaires', count: stats.comments_count, path: '/admin/comments', icon: 'fa-comments' },
    { title: 'J\'aime', count: stats.likes_count, path: '/admin/likes', icon: 'fa-heart' }
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Administration du Blog</h1>
        <p>Bienvenue dans l'interface d'administration de votre blog</p>
      </header>

      <div className="admin-stats-summary">
        <div className="admin-card">
          <h3>Résumé</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{stats.published_posts}</span>
              <span className="stat-label">Articles publiés</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.draft_posts}</span>
              <span className="stat-label">Brouillons</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.users_count}</span>
              <span className="stat-label">Utilisateurs</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.comments_count}</span>
              <span className="stat-label">Commentaires</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-modules">
        {adminModules.map((module, index) => (
          <Link to={module.path} key={index} className="admin-module-card">
            <div className="module-icon">
              <i className={`fas ${module.icon}`}></i>
            </div>
            <div className="module-info">
              <h3>{module.title}</h3>
              <p>{module.count} éléments</p>
            </div>
            <div className="module-action">
              <span>Gérer <i className="fas fa-arrow-right"></i></span>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-actions">
        <h3>Actions rapides</h3>
        <div className="actions-grid">
          <Link to="/admin/posts/new" className="action-button">
            <i className="fas fa-plus"></i> Nouvel article
          </Link>
          <Link to="/admin/users/new" className="action-button">
            <i className="fas fa-user-plus"></i> Nouvel utilisateur
          </Link>
          <Link to="/admin/posts?status=draft" className="action-button">
            <i className="fas fa-edit"></i> Voir les brouillons
          </Link>
          <Link to="/admin/comments" className="action-button">
            <i className="fas fa-comment-dots"></i> Gérer les commentaires
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
