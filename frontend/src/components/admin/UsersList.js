import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../api/adminApi';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState([
    {
      title: 'Statut',
      options: [
        { label: 'Tous', link: '/admin/users/', selected: true },
        { label: 'Actif', link: '/admin/users/?is_active=1', selected: false },
        { label: 'Inactif', link: '/admin/users/?is_active=0', selected: false },
      ]
    },
    {
      title: 'Statut administrateur',
      options: [
        { label: 'Tous', link: '/admin/users/', selected: true },
        { label: 'Oui', link: '/admin/users/?is_staff=1', selected: false },
        { label: 'Non', link: '/admin/users/?is_staff=0', selected: false },
      ]
    }
  ]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError("Impossible de charger les utilisateurs. Assurez-vous d'être connecté en tant qu'administrateur.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(users.map(user => user.id));
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
            <a href="/admin/users/add/" className="addlink">Ajouter utilisateur</a>
          </li>
        </ul>
      </div>
      
      <h1>Sélection d'utilisateur</h1>
      
      <div className="django-search">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Rechercher par nom d'utilisateur ou email..." 
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
                    checked={selectedItems.length === users.length && users.length > 0}
                  />
                </th>
                <th>
                  <a href="/admin/users/?o=1">Nom d'utilisateur</a>
                </th>
                <th>
                  <a href="/admin/users/?o=2">Nom</a>
                </th>
                <th>
                  <a href="/admin/users/?o=3">Prénom</a>
                </th>
                <th>
                  <a href="/admin/users/?o=4">Email</a>
                </th>
                <th>
                  <a href="/admin/users/?o=5">Statut administrateur</a>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(user.id)}
                        onChange={() => handleSelectItem(user.id)}
                      />
                    </td>
                    <td>
                      <a href={`/admin/users/edit/${user.id}/`}>
                        {user.username}
                      </a>
                    </td>
                    <td>{user.last_name || '—'}</td>
                    <td>{user.first_name || '—'}</td>
                    <td>{user.email}</td>
                    <td>
                      <img 
                        src={user.is_staff ? "/static/admin/img/icon-yes.svg" : "/static/admin/img/icon-no.svg"} 
                        alt={user.is_staff ? "Oui" : "Non"} 
                      />
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
            <option value="delete">Supprimer les utilisateurs sélectionnés</option>
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

export default UsersList;
