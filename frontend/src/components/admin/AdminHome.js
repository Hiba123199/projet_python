import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { statsService } from '../../api/adminApi';

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await statsService.getAdminStats();
        setStats(data);
      } catch (err) {
        setError('Erreur lors du chargement des statistiques.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Site d'administration</h1>
      
      <div className="module">
        <table>
          <caption>
            <Link to="/admin/posts/" className="section">Base</Link>
          </caption>
          <tbody>
            <tr className="model-post">
              <th scope="row">
                <Link to="/admin/posts/">Posts</Link>
              </th>
              <td>
                <Link to="/admin/posts/add" className="addlink">Ajouter</Link>
              </td>
              <td>
                <Link to="/admin/posts/" className="changelink">Modifier</Link>
              </td>
            </tr>
            <tr className="model-comment">
              <th scope="row">
                <Link to="/admin/comments/">Commentaires</Link>
              </th>
              <td>
                <Link to="/admin/comments/add" className="addlink">Ajouter</Link>
              </td>
              <td>
                <Link to="/admin/comments/" className="changelink">Modifier</Link>
              </td>
            </tr>
            <tr className="model-like">
              <th scope="row">
                <Link to="/admin/likes/">J'aime</Link>
              </th>
              <td>
                <Link to="/admin/likes/add" className="addlink">Ajouter</Link>
              </td>
              <td>
                <Link to="/admin/likes/" className="changelink">Modifier</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="module">
        <table>
          <caption>
            <Link to="/admin/users/" className="section">Authentification et autorisation</Link>
          </caption>
          <tbody>
            <tr className="model-user">
              <th scope="row">
                <Link to="/admin/users/">Utilisateurs</Link>
              </th>
              <td>
                <Link to="/admin/users/add" className="addlink">Ajouter</Link>
              </td>
              <td>
                <Link to="/admin/users/" className="changelink">Modifier</Link>
              </td>
            </tr>
            <tr className="model-group">
              <th scope="row">
                <Link to="/admin/groups/">Groupes</Link>
              </th>
              <td>
                <Link to="/admin/groups/add" className="addlink">Ajouter</Link>
              </td>
              <td>
                <Link to="/admin/groups/" className="changelink">Modifier</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {stats && (
        <div className="admin-stats">
          <h2>Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Articles publiés</h3>
              <div className="stat-number">{stats.published_posts}</div>
              <Link to="/admin/posts/?status=published" className="stat-link">Voir les articles publiés</Link>
            </div>
            <div className="stat-card">
              <h3>Articles en brouillon</h3>
              <div className="stat-number">{stats.draft_posts}</div>
              <Link to="/admin/posts/?status=draft" className="stat-link">Voir les brouillons</Link>
            </div>
            <div className="stat-card">
              <h3>Utilisateurs</h3>
              <div className="stat-number">{stats.users_count}</div>
              <Link to="/admin/users/" className="stat-link">Gérer les utilisateurs</Link>
            </div>
            <div className="stat-card">
              <h3>Commentaires</h3>
              <div className="stat-number">{stats.comments_count}</div>
              <Link to="/admin/comments/" className="stat-link">Gérer les commentaires</Link>
            </div>
            <div className="stat-card">
              <h3>J'aime</h3>
              <div className="stat-number">{stats.likes_count}</div>
              <Link to="/admin/likes/" className="stat-link">Gérer les likes</Link>
            </div>
          </div>
        </div>
      )}

      <div className="django-app-list">
        <p>Vous avez effectué les tâches d'administration suivantes:</p>
        <ul className="django-app-list-history">
          <li>Aucune action récente.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminHome;
