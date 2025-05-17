import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Badge, Container, Card } from 'react-bootstrap';
import { FaCalendarAlt, FaUser, FaEye, FaTags, FaShare, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { fetchPostBySlug, addComment, fetchComments } from '../../api/blogApi';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import './PostDetail.css';

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié (à adapter selon votre système d'authentification)
    const checkAuth = () => {
      // Ici, vous pourriez vérifier un token stocké ou une session
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      setIsAuthenticated(!!token);
      if (userId) setCurrentUserId(parseInt(userId, 10));
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await fetchPostBySlug(slug);
        setPost(data);
        
        // Charger les commentaires s'il n'y en a pas déjà dans les données
        if (!data.comments) {
          const commentsData = await fetchComments(slug);
          setComments(commentsData);
        } else {
          setComments(data.comments);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement du post:', err);
        setError('Impossible de charger cet article. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  const handleLikeUpdate = (newCount) => {
    // Mettre à jour le compteur de likes dans le state du post
    setPost(prev => ({
      ...prev,
      likes_count: newCount
    }));
  };

  const handleAddComment = async (commentBody) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const newComment = await addComment(slug, commentBody);
      
      // Ajouter le nouveau commentaire à la liste existante
      setComments(prevComments => [newComment, ...prevComments]);
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
      throw err;
    }
  };
  
  const handleCommentDeleted = (commentId) => {
    // Supprimer le commentaire de la liste des commentaires
    setComments(prevComments => 
      prevComments.filter(comment => comment.id !== commentId)
    );
  };

  if (loading) {
    return <div className="loading-container">Chargement de l'article...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!post) {
    return <div className="error-container">Article non trouvé.</div>;
  }

  return (
    <Container className="post-detail-container py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          {/* Bouton retour */}
          <div className="mb-4">
            <Link to="/" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-left"></i> Retour aux articles
            </Link>
          </div>
          
          {/* Article */}
          <article className="blog-post">
            {/* Header */}
            <header className="blog-post-header mb-4">
              <h1 className="blog-post-title display-4 fw-bold">{post.title}</h1>
              
              {/* Meta information */}
              <div className="blog-post-meta d-flex flex-wrap gap-3 text-muted mb-4">
                <span className="d-flex align-items-center">
                  <FaCalendarAlt className="me-1" />
                  {new Date(post.created).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                
                <span className="d-flex align-items-center">
                  <FaUser className="me-1" /> {post.author.username}
                </span>
                
                <span className="d-flex align-items-center">
                  <FaEye className="me-1" /> 123 vues
                </span>
                
                <span>
                  <LikeButton 
                    postSlug={post.slug}
                    likesCount={post.likes_count}
                    isAuthenticated={isAuthenticated}
                    onLikeUpdate={handleLikeUpdate}
                  />
                </span>
              </div>
              
              {/* Tags/Categories */}
              <div className="blog-post-tags mb-4">
                <FaTags className="me-2" />
                <Badge bg="primary" className="me-1">Web Design</Badge>
                <Badge bg="primary" className="me-1">Développement</Badge>
                <Badge bg="primary">React</Badge>
              </div>
            </header>
            
            {/* Featured Image */}
            <figure className="blog-post-image mb-5">
              <img 
                className="img-fluid rounded shadow" 
                src={`https://source.unsplash.com/random/1200x600/?blog,article,${post.title}`} 
                alt={post.title} 
              />
            </figure>
            
            {/* Content */}
            <section className="blog-post-content mb-5">
              <p className="lead">{post.content.substring(0, 150)}...</p>
              
              <p>{post.content.substring(150)}</p>
              
              {/* Assuming we have a post.content_html field for rich content */}
              {post.content_html && (
                <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
              )}
            </section>
            
            {/* Share buttons */}
            <div className="blog-post-share mb-5">
              <h5 className="d-inline-block me-3"><FaShare className="me-2" /> Partager:</h5>
              <button type="button" className="btn btn-sm btn-outline-primary me-2"><FaFacebookF /></button>
              <button type="button" className="btn btn-sm btn-outline-info me-2"><FaTwitter /></button>
              <button type="button" className="btn btn-sm btn-outline-secondary"><FaLinkedinIn /></button>
            </div>
            
            {/* Author bio */}
            <div className="blog-post-author mb-5">
              <Card className="border-0 bg-light">
                <Card.Body className="d-flex">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.username)}&background=random&size=128`} 
                    alt={post.author.username}
                    className="rounded-circle me-4"
                    style={{ width: '80px', height: '80px' }}
                  />
                  <div>
                    <h5>À propos de l'auteur</h5>
                    <p className="text-muted mb-1">{post.author.username}</p>
                    <p className="mb-0">Professionnel passionné par le développement web et les nouvelles technologies. Partage régulièrement son expertise sur ce blog.</p>
                  </div>
                </Card.Body>
              </Card>
            </div>
            
            {/* Recommended posts - Placeholder for future feature */}
            <div className="blog-post-related mb-5">
              <h4 className="mb-4">Articles similaires</h4>
              <Row className="row-cols-1 row-cols-md-3 g-4">
                {/* Placeholder for 3 recommended posts */}
                <Col>
                  <Card className="h-100">
                    <Card.Img variant="top" src="https://source.unsplash.com/random/300x200/?blog,1" />
                    <Card.Body>
                      <Card.Title>Article en relation 1</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Card className="h-100">
                    <Card.Img variant="top" src="https://source.unsplash.com/random/300x200/?blog,2" />
                    <Card.Body>
                      <Card.Title>Article en relation 2</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
                <Col>
                  <Card className="h-100">
                    <Card.Img variant="top" src="https://source.unsplash.com/random/300x200/?blog,3" />
                    <Card.Body>
                      <Card.Title>Article en relation 3</Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
            
            {/* Comments section */}
            <CommentSection 
              comments={comments}
              postSlug={post.slug}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
              onAddComment={handleAddComment}
              onCommentDeleted={handleCommentDeleted}
            />
          </article>
        </Col>
      </Row>
    </Container>
  );
};

export default PostDetail;
