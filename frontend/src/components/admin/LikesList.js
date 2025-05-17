import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { likeService } from '../../api/adminApi';

const LikesList = () => {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState([
    {
      title: 'Par date',
      options: [
        { label: 'Tout', link: '/admin/likes/', selected: true },
        { label: 'Aujourd\'hui', link: '/admin/likes/?created_at__day=today', selected: false },
        { label: '7 derniers jours', link: '/admin/likes/?created_at__day=7days', selected: false },
        { label: 'Ce mois', link: '/admin/likes/?created_at__day=this_month', selected: false },
      ]
    },
    {
      title: 'Par article',
      options: [
        { label: 'Tout', link: '/admin/likes/', selected: true },
      ]
    }
  ]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        setLoading(true);
        const data = await likeService.getAllLikes();
        setLikes(data);
        
        // Mettre à jour les options de filtre par article
        const posts = [...new Set(data.map(like => like.post_title || 'Sans titre'))];
        const postOptions = [
          { label: 'Tout', link: '/admin/likes/', selected: true },
          ...posts.map(post => ({
            label: post,
            link: `/admin/likes/?post=${post}`,
            selected: false
          }))
        ];
        
        setFilters(prev => [
          prev[0], // Conserver le filtre par date
          {
            title: 'Par article',
            options: postOptions
          }
        ]);
      } catch (err) {
        setError("Impossible de charger les likes. Assurez-vous d'être connecté en tant qu'administrateur.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(likes.map(like => like.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implémenter la recherche ici
    console.log("Recherche:", searchQuery);
  };

  const handleAction = (e) => {
    e.preventDefault();
    const action = e.target.elements.action.value;
    
    if (!action || selectedItems.length === 0) return;
    
    if (action === "delete" && window.confirm("Êtes-vous sûr de vouloir supprimer les éléments sélectionnés ?")) {
      // Implémenter la suppression ici
      console.log("Suppression des éléments:", selectedItems);
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="django-object-tools">
        <ul>
          <li>
            <a href="/admin/likes/add/" className="addlink">Ajouter j'aime</a>
          </li>
        </ul>
      </div>
      
      <h1>Sélection de j'aime</h1>
      
      <div className="django-search">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Rechercher par utilisateur ou article..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input type="submit" value="Rechercher" />
        </form>
      </div>
      
      <form onSubmit={handleAction}>
        <div className="django-results">
          <table>
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedItems.length === likes.length && likes.length > 0}
                  />
                </th>
                <th>
                  <a href="/admin/likes/?o=1">Utilisateur</a>
                </th>
                <th>
                  <a href="/admin/likes/?o=2">Article</a>
                </th>
                <th>
                  <a href="/admin/likes/?o=3">Date de création</a>
                </th>
                <th>Titre de l'article</th>
              </tr>
            </thead>
            <tbody>
              {likes.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    Aucun j'aime trouvé
                  </td>
                </tr>
              ) : (
                likes.map(like => (
                  <tr key={like.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(like.id)}
                        onChange={() => handleSelectItem(like.id)}
                      />
                    </td>
                    <td>
                      <a href={`/admin/likes/edit/${like.id}/`}>
                        {like.username}
                      </a>
                    </td>
                    <td>{like.post}</td>
                    <td>{new Date(like.created_at).toLocaleString()}</td>
                    <td>
                      <a href={`/admin/posts/edit/${like.post}/`}>
                        {like.post_title}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="django-actions">
          <label>Action: </label>
          <select name="action">
            <option value="">---------</option>
            <option value="delete">Supprimer les éléments sélectionnés</option>
          </select>
          <button type="submit">Exécuter</button>
        </div>
        
        <div className="django-pagination">
          <span className="step-links">
            {/* Pagination ici */}
            <span className="current">
              Page 1 sur 1
            </span>
          </span>
        </div>
      </form>
      
      <DjangoFilter filters={filters} />
    </div>
  );
};

// Composant pour les filtres de l'admin Django
const DjangoFilter = ({ filters }) => {
  if (!filters || filters.length === 0) return null;
  
  return (
    <div className="django-filter">
      <h2>Filtre</h2>
      {filters.map((filter, index) => (
        <div key={index}>
          <h3>{filter.title}</h3>
          <ul>
            {filter.options.map((option, optIndex) => (
              <li key={optIndex} className={option.selected ? 'selected' : ''}>
                <a href={option.link}>{option.label}</a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default LikesList;
