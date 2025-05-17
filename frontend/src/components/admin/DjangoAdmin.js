import React from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import './DjangoAdminStyles.css';
import PostsList from './PostsList';
import PostEdit from './PostEdit';
import UsersList from './UsersList';
import UserEdit from './UserEdit';
import CommentsList from './CommentsList';
import CommentEdit from './CommentEdit';
import LikesList from './LikesList';
import LikesEdit from './LikesEdit';
import AdminHome from './AdminHome';

// Composant pour afficher le fil d'ariane
const Breadcrumbs = ({ items }) => (
  <div className="django-breadcrumbs">
    <Link to="/admin/">Accueil</Link>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        <span>›</span>
        {item.link ? (
          <Link to={item.link}>{item.label}</Link>
        ) : (
          <span>{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

// Composant pour l'en-tête de l'admin Django
const DjangoHeader = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Supprimer les informations d'authentification
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    
    // Rediriger vers la page de connexion
    navigate('/login');
  };
  
  return (
    <header>
      <div className="django-header">
        <h1><Link to="/admin/">Administration Django</Link></h1>
        <div className="django-header-links">
          <Link to="/admin/password_change/">Changer le mot de passe</Link>
          <button 
            className="btn-link" 
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Déconnexion
          </button>
        </div>
      </div>
      <div className="django-subheader">
        <Link to="/admin/">Accueil</Link>
        <Link to="/admin/posts/">Posts</Link>
        <Link to="/admin/users/">Utilisateurs</Link>
        <Link to="/admin/comments/">Commentaires</Link>
        <Link to="/admin/likes/">J'aime</Link>
      </div>
    </header>
  );
};

// Composant pour la barre latérale de l'admin Django
const DjangoSidebar = ({ activeModule }) => {
  return (
    <div className="django-sidebar">
      <h2>Base</h2>
      <ul>
        <li className={activeModule === 'posts' ? 'active' : ''}>
          <Link to="/admin/posts/">Posts</Link>
        </li>
        <li className={activeModule === 'comments' ? 'active' : ''}>
          <Link to="/admin/comments/">Commentaires</Link>
        </li>
        <li className={activeModule === 'likes' ? 'active' : ''}>
          <Link to="/admin/likes/">J'aime</Link>
        </li>
      </ul>
      
      <h2>Authentification et autorisation</h2>
      <ul>
        <li className={activeModule === 'users' ? 'active' : ''}>
          <Link to="/admin/users/">Utilisateurs</Link>
        </li>
        <li className={activeModule === 'groups' ? 'active' : ''}>
          <Link to="/admin/groups/">Groupes</Link>
        </li>
      </ul>
    </div>
  );
};

// Composant pour les filtres de l'admin Django
export const DjangoFilter = ({ filters }) => {
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
                <Link to={option.link}>{option.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Composant principal pour l'admin Django
const DjangoAdmin = () => {
  return (
    <div className="django-admin">
      <DjangoHeader />
      <DjangoAdminRoutes />
    </div>
  );
};

// Composant pour les routes de l'admin Django
const DjangoAdminRoutes = () => {
  const location = useLocation();
  const path = location.pathname;
  let activeModule = '';
  
  if (path.includes('/posts')) activeModule = 'posts';
  else if (path.includes('/users')) activeModule = 'users';
  else if (path.includes('/comments')) activeModule = 'comments';
  else if (path.includes('/likes')) activeModule = 'likes';
  
  let breadcrumbItems = [];
  if (activeModule) {
    breadcrumbItems.push({
      label: activeModule.charAt(0).toUpperCase() + activeModule.slice(1),
      link: `/admin/${activeModule}/`
    });
    
    if (path.includes('/add')) {
      breadcrumbItems.push({ label: 'Ajouter' });
    } else if (path.includes('/edit/')) {
      breadcrumbItems.push({ label: 'Modifier' });
    }
  }
  
  return (
    <div className="django-main">
      <DjangoSidebar activeModule={activeModule} />
      <div className="django-content">
        <Breadcrumbs items={breadcrumbItems} />
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/posts" element={<PostsList />} />
          <Route path="/posts/add" element={<PostEdit />} />
          <Route path="/posts/edit/:id" element={<PostEdit />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/add" element={<UserEdit />} />
          <Route path="/users/edit/:id" element={<UserEdit />} />
          <Route path="/comments" element={<CommentsList />} />
          <Route path="/comments/add" element={<CommentEdit />} />
          <Route path="/comments/edit/:id" element={<CommentEdit />} />
          <Route path="/likes" element={<LikesList />} />
          <Route path="/likes/add" element={<LikesEdit />} />
          <Route path="/likes/edit/:id" element={<LikesEdit />} />
        </Routes>
      </div>
    </div>
  );
};

export default DjangoAdmin;
