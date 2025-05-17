import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { addLike, removeLike, checkLikeStatus } from '../../api/blogApi';
import './LikeButton.css';

const LikeButton = ({ postSlug, likesCount, isAuthenticated, onLikeUpdate }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likesCount || 0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Vérifier si l'utilisateur a déjà liké ce post
  useEffect(() => {
    const checkLiked = async () => {
      if (isAuthenticated && postSlug) {
        try {
          const hasLiked = await checkLikeStatus(postSlug);
          setLiked(hasLiked);
        } catch (error) {
          console.error('Erreur lors de la vérification du statut de like:', error);
        }
      }
    };
    
    checkLiked();
  }, [postSlug, isAuthenticated]);
  
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      window.location.href = '/login?next=' + window.location.pathname;
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (liked) {
        await removeLike(postSlug);
        setCount((prevCount) => Math.max(0, prevCount - 1));
        setLiked(false);
      } else {
        await addLike(postSlug);
        setCount((prevCount) => prevCount + 1);
        setLiked(true);
      }
      
      // Notifier le composant parent que le statut de like a changé
      if (onLikeUpdate) {
        onLikeUpdate(count);
      }
    } catch (error) {
      console.error('Erreur lors de la modification du like:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="like-button-container">
      <Button 
        variant={liked ? "danger" : "outline-danger"}
        onClick={handleLikeToggle}
        disabled={isLoading}
        className="like-button"
      >
        {liked ? <FaHeart /> : <FaRegHeart />}
        <span className="likes-count">{count}</span>
      </Button>
    </div>
  );
};

export default LikeButton;
