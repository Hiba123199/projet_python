import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { postService } from '../../api/adminApi';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAction, setCurrentAction] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState([
    {
      title: 'Par auteur',
      options: [
        { label: 'Tous', link: '/admin/posts/', selected: true },
      ]
    },
    {
      title: 'Par statut',
      options: [
        { label: 'Tous', link: '/admin/posts/', selected: true },
        { label: 'Publié', link: '/admin/posts/?status=published', selected: false },
        { label: 'Brouillon', link: '/admin/posts/?status=draft', selected: false },
      ]
    }
  ]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Récupérer les filtres des paramètres d'URL
        const params = new URLSearchParams(location.search);
        const authorFilter = params.get('author');
        const statusFilter = params.get('status');
        
        // Récupérer les posts (filtrés si nécessaire)
        let data;
        if (statusFilter) {
          data = await postService.filterPosts(statusFilter);
        } else {
          data = await postService.getAllPosts();
        }
        
        // Filtrer les posts par auteur côté client si nécessaire
        if (authorFilter) {
          data = data.filter(post => post.author_username === authorFilter);
        }
        
        setPosts(data);
        
        // Mettre à jour les options de filtre par auteur
        const authors = [...new Set(data.map(post => post.author_username))];
        const authorOptions = [
          { label: 'Tous', link: '/admin/posts/', selected: !authorFilter },
          ...authors.map(author => ({
            label: author,
            link: `/admin/posts/?author=${author}`,
            selected: authorFilter === author
          }))
        ];
        
        // Mettre à jour les options de filtre par statut
        const statusOptions = [
          { label: 'Tous', link: '/admin/posts/', selected: !statusFilter },
          { label: 'Publié', link: '/admin/posts/?status=published', selected: statusFilter === 'published' },
          { label: 'Brouillon', link: '/admin/posts/?status=draft', selected: statusFilter === 'draft' },
        ];
        
        setFilters([
          {
            title: 'Par auteur',
            options: authorOptions
          },
          {
            title: 'Par statut',
            options: statusOptions
          }
        ]);
      } catch (err) {
        setError("Impossible de charger les posts. Assurez-vous d'être connecté en tant qu'administrateur.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [location.search]);  // Rechargement quand les paramètres d'URL changent

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(posts.map(post => post.id));
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
    
    if (!searchQuery.trim()) return;
    
    // Filtrer les posts par recherche de texte côté client
    const filteredPosts = posts.filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.body?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setPosts(filteredPosts);
  };
  
  const resetSearch = () => {
    // Réinitialiser la recherche et recharger tous les posts
    setSearchQuery('');
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await postService.getAllPosts();
        setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  };

  const handleAction = async (e) => {
    e.preventDefault();
    const action = e.target.elements.action.value;
    
    if (!action || selectedItems.length === 0) return;
    
    setCurrentAction(action);
    
    if (action === "delete" && window.confirm("Êtes-vous sûr de vouloir supprimer les éléments sélectionnés ?")) {
      try {
        setLoading(true);
        // Supprimer tous les éléments sélectionnés
        await Promise.all(
          selectedItems.map(id => postService.deletePost(id))
        );
        
        // Mettre à jour la liste des posts
        const updatedPosts = posts.filter(post => !selectedItems.includes(post.id));
        setPosts(updatedPosts);
        setSelectedItems([]);
      } catch (err) {
        setError("Erreur lors de la suppression des posts.");
        console.error(err);
      } finally {
        setLoading(false);
        setCurrentAction('');
      }
    } else if (action === "publish") {
      try {
        setLoading(true);
        // Publier tous les éléments sélectionnés
        await Promise.all(
          selectedItems.map(id => {
            const post = posts.find(p => p.id === id);
            return postService.updatePost(id, { ...post, status: 'published' });
          })
        );
        
        // Mettre à jour la liste des posts
        const updatedPosts = posts.map(post => {
          if (selectedItems.includes(post.id)) {
            return { ...post, status: 'published' };
          }
          return post;
        });
        setPosts(updatedPosts);
        setSelectedItems([]);
      } catch (err) {
        setError("Erreur lors de la publication des posts.");
        console.error(err);
      } finally {
        setLoading(false);
        setCurrentAction('');
      }
    } else if (action === "draft") {
      try {
        setLoading(true);
        // Mettre en brouillon tous les éléments sélectionnés
        await Promise.all(
          selectedItems.map(id => {
            const post = posts.find(p => p.id === id);
            return postService.updatePost(id, { ...post, status: 'draft' });
          })
        );
        
        // Mettre à jour la liste des posts
        const updatedPosts = posts.map(post => {
          if (selectedItems.includes(post.id)) {
            return { ...post, status: 'draft' };
          }
          return post;
        });
        setPosts(updatedPosts);
        setSelectedItems([]);
      } catch (err) {
        setError("Erreur lors de la mise en brouillon des posts.");
        console.error(err);
      } finally {
        setLoading(false);
        setCurrentAction('');
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="django-object-tools">
        <ul>
          <li>
            <Link to="/admin/posts/add" className="addlink">Ajouter post</Link>
          </li>
        </ul>
      </div>
      
      <h1>Sélection de post</h1>
      
      <div className="django-search">
        <form onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Rechercher par titre..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <input type="submit" value="Rechercher" />
          {searchQuery && (
            <button 
              type="button" 
              className="btn btn-link"
              onClick={resetSearch}
              style={{ marginLeft: '10px' }}
            >
              Réinitialiser
            </button>
          )}
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
                    checked={selectedItems.length === posts.length && posts.length > 0}
                  />
                </th>
                <th>
                  <a href="/admin/posts/?o=1">Titre</a>
                </th>
                <th>
                  <a href="/admin/posts/?o=2">Auteur</a>
                </th>
                <th>
                  <a href="/admin/posts/?o=3">Statut</a>
                </th>
                <th>
                  <a href="/admin/posts/?o=4">Date de création</a>
                </th>
                <th>
                  <a href="/admin/posts/?o=5">Date de publication</a>
                </th>
                <th>J'aime</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    Aucun post trouvé
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <tr key={post.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(post.id)}
                        onChange={() => handleSelectItem(post.id)}
                      />
                    </td>
                    <td>
                      <Link to={`/admin/posts/edit/${post.id}`}>
                        {post.title}
                      </Link>
                    </td>
                    <td>{post.author_username}</td>
                    <td>{post.status === 'published' ? 'Publié' : 'Brouillon'}</td>
                    <td>{new Date(post.created).toLocaleDateString()}</td>
                    <td>{new Date(post.publish).toLocaleDateString()}</td>
                    <td>{post.likes_count}</td>
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
            <option value="publish">Publier les éléments sélectionnés</option>
            <option value="draft">Mettre en brouillon les éléments sélectionnés</option>
          </select>
          <button type="submit" disabled={loading || selectedItems.length === 0}>
            {currentAction ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                En cours...
              </>
            ) : (
              'Exécuter'
            )}
          </button>
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

export default PostsList;
