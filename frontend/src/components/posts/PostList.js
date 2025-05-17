import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchPosts, checkAuthStatus } from '../../api/blogApi';
import Pagination from './Pagination';
import LikeButton from './LikeButton';
import './PostList.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  
  // Extraire la requête de recherche des paramètres d'URL le cas échéant
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');

  // Vérifier l'état d'authentification de l'utilisateur
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await checkAuthStatus();
        setIsAuthenticated(!!userData);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        // Ajouter les paramètres de page et de recherche si nécessaire
        const params = {
          page: currentPage,
          size: 12 // Augmenter le nombre d'articles par page à 12
        };
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        const response = await fetchPosts(params);
        setPosts(response.results);
        setTotalPages(Math.ceil(response.count / 12)); // 12 posts par page pour remplir la page
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des posts:', err);
        setError('Impossible de charger les articles. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage, searchQuery]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div className="loading">Chargement des articles...</div>;
  }

  if (error) {
    return <div className="alert alert-danger" role="alert">{error}</div>;
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="py-5 bg-light border-bottom mb-4">
        <div className="container">
          <div className="text-center my-5">
            {searchQuery ? (
              <>
                <h1 className="fw-bolder">Résultats de recherche pour "{searchQuery}"</h1>
                <p className="lead mb-0">{posts.length} article{posts.length !== 1 ? 's' : ''} trouvé{posts.length !== 1 ? 's' : ''}</p>
              </>
            ) : (
              <>
                <h1 className="fw-bolder">Bienvenue sur Notre Blog</h1>
                <p className="lead mb-0">Découvrez nos derniers articles et partagez vos impressions</p>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Post list */}
      <div className="row">
        <div className="col-12">
          {/* Section d'article mis en avant en haut */}
          {posts.length > 0 && !searchQuery && (
            <div className="mb-5">
              <div className="card mb-3">
                <div className="row g-0">
                  <div className="col-md-8">
                    <div className="card-body d-flex flex-column h-100">
                      <h5 className="card-title display-5 fw-bold">{posts[0].title}</h5>
                      <div className="small text-muted mb-3">
                        {new Date(posts[0].created).toLocaleDateString()} • Par {posts[0].author.username}
                      </div>
                      <p className="card-text flex-grow-1">
                        {posts[0].content.length > 300 
                          ? `${posts[0].content.substring(0, 300)}...` 
                          : posts[0].content
                        }
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <Link className="btn btn-primary" to={`/post/${posts[0].slug}`}>
                          Lire l'article complet
                        </Link>
                        <LikeButton 
                          postSlug={posts[0].slug}
                          likesCount={posts[0].likes_count}
                          isAuthenticated={isAuthenticated}
                          onLikeUpdate={(newCount) => {
                            // Mettre à jour le compteur de likes dans la liste
                            setPosts(currentPosts => 
                              currentPosts.map(p => 
                                p.id === posts[0].id ? {...p, likes_count: newCount} : p
                              )
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <img 
                      src={`https://source.unsplash.com/random/700x600/?blog,article`} 
                      className="img-fluid rounded-end h-100" 
                      alt={posts[0].title}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Liste des autres articles */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {posts.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info">Aucun article trouvé.</div>
              </div>
            ) : (
              posts.slice(searchQuery ? 0 : 1).map(post => (
                <div className="col mb-4" key={post.id}>
                  <div className="card h-100">
                    <div className="position-relative">
                      <Link to={`/post/${post.slug}`}>
                        <img 
                          className="card-img-top" 
                          height="200" 
                          style={{ objectFit: 'cover' }} 
                          src={`https://source.unsplash.com/600x350/?blog,${Math.random()}`} 
                          alt={post.title} 
                        />
                      </Link>
                      <span className="badge bg-primary position-absolute top-0 end-0 m-2">
                        {post.comments_count || 0} <i className="far fa-comment"></i>
                      </span>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="small text-muted mb-2">
                        {new Date(post.created).toLocaleDateString()} • Par {post.author.username}
                      </div>
                      <h2 className="card-title h5">{post.title}</h2>
                      <p className="card-text flex-grow-1">
                        {post.content.length > 150 
                          ? `${post.content.substring(0, 150)}...` 
                          : post.content
                        }
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <Link className="btn btn-sm btn-primary" to={`/post/${post.slug}`}>
                          Lire plus
                        </Link>
                        <div>
                          <LikeButton 
                            postSlug={post.slug}
                            likesCount={post.likes_count}
                            isAuthenticated={isAuthenticated}
                            onLikeUpdate={(newCount) => {
                              // Mettre à jour le compteur de likes dans la liste
                              setPosts(currentPosts => 
                                currentPosts.map(p => 
                                  p.id === post.id ? {...p, likes_count: newCount} : p
                                )
                              );
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PostList;
