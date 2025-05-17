import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Form, Alert } from 'react-bootstrap';
import { FaTrash, FaReply } from 'react-icons/fa';
import { deleteComment } from '../../api/blogApi';
import './CommentSection.css';

const CommentSection = ({ 
  comments = [], 
  postSlug, 
  isAuthenticated, 
  currentUserId, 
  onAddComment, 
  onCommentDeleted 
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onAddComment(commentText);
      setCommentText('');
      setSuccess(true);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Impossible d\'ajouter le commentaire. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      try {
        await deleteComment(commentId);
        if (onCommentDeleted) {
          onCommentDeleted(commentId);
        }
      } catch (err) {
        console.error('Erreur lors de la suppression du commentaire:', err);
        alert('Erreur lors de la suppression du commentaire.');
      }
    }
  };
  
  return (
    <div className="comment-section">
      <h3 className="mb-4">Commentaires ({comments.length})</h3>
      
      {/* Formulaire d'ajout de commentaire */}
      {isAuthenticated ? (
        <>
          <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Laisser un commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Partagez votre avis..."
                required
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting || !commentText.trim()}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Publier le commentaire'}
            </Button>
          </Form>
          
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mt-3">
              Votre commentaire a été publié avec succès!
            </Alert>
          )}
        </>
      ) : (
        <Alert variant="info" className="mb-4">
          <Link to="/login">Connectez-vous</Link> pour laisser un commentaire.
        </Alert>
      )}
      
      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <div className="no-comments">
          <p className="text-muted">Aucun commentaire pour le moment. Soyez le premier à commenter!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.username)}&background=random`} 
                    alt={comment.author.username}
                    className="avatar"
                  />
                  <div>
                    <h5 className="mb-0">{comment.author.username}</h5>
                    <small className="text-muted">
                      {new Date(comment.created).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                </div>
                
                {/* Actions sur le commentaire */}
                {isAuthenticated && currentUserId === comment.author.id && (
                  <div className="comment-actions">
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <FaTrash /> Supprimer
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="comment-body">
                <p>{comment.body}</p>
              </div>
              
              {isAuthenticated && (
                <div className="comment-footer">
                  <Button variant="link" size="sm" className="reply-button">
                    <FaReply /> Répondre
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
