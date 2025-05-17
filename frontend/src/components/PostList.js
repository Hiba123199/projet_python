import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../api/blogApi';
import './PostList.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const postsData = await fetchPosts();
        
        // Trouver le post en vedette et le reste des posts
        const featured = postsData.find(post => post.featured);
        const regular = postsData.filter(post => !post.featured);
        
        setFeaturedPost(featured || null);
        setPosts(regular);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des posts:', err);
        setError('Impossible de charger les posts. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des posts...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="post-list-container">
      {featuredPost && (
        <div className="featured-post">
          <h2>Article en vedette</h2>
          <div className="featured-post-content">
            <h3>{featuredPost.title}</h3>
            <p>{featuredPost.content.substring(0, 200)}...</p>
            <div className="post-meta">
              <span>Par {featuredPost.author.username}</span>
              <span>Le {new Date(featuredPost.created).toLocaleDateString()}</span>
              <span>{featuredPost.likes_count} j'aime</span>
            </div>
            <Link to={`/post/${featuredPost.slug}`} className="read-more">
              Lire la suite
            </Link>
          </div>
        </div>
      )}

      <div className="regular-posts">
        <h2>Articles récents</h2>
        {posts.length === 0 ? (
          <p>Aucun article disponible pour le moment.</p>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <h3>{post.title}</h3>
                <p>{post.content.substring(0, 100)}...</p>
                <div className="post-meta">
                  <span>Par {post.author.username}</span>
                  <span>Le {new Date(post.created).toLocaleDateString()}</span>
                  <span>{post.likes_count} j'aime</span>
                </div>
                <Link to={`/post/${post.slug}`} className="read-more">
                  Lire la suite
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
