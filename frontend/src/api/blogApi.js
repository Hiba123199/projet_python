import axios from 'axios';

// Configuration de l'instance axios avec les paramètres de base
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'session-auth') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message || error);
    return Promise.reject(error);
  }
);

// ==================
// FONCTIONS POUR LES POSTS
// ==================

// Fonction pour récupérer tous les posts avec pagination et recherche
export const fetchPosts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    // Ajouter les paramètres de pagination
    if (params.page) {
      queryParams.append('page', params.page);
    }
    // Ajouter les paramètres de recherche
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    const url = `/api/posts/?${queryParams.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    throw error;
  }
};

// Fonction pour récupérer un post spécifique par son slug
export const fetchPostBySlug = async (slug) => {
  try {
    const response = await api.get(`/api/posts/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du post ${slug}:`, error);
    throw error;
  }
};

// Fonction pour ajouter un like à un post
export const addLike = async (slug) => {
  try {
    const response = await api.post(`/api/posts/${slug}/toggle-like/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'un like au post ${slug}:`, error);
    throw error;
  }
};

// Fonction pour supprimer un like d'un post
export const removeLike = async (slug) => {
  try {
    const response = await api.delete(`/api/posts/${slug}/toggle-like/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du like du post ${slug}:`, error);
    throw error;
  }
};

// Fonction pour vérifier si l'utilisateur a liké un post
export const checkLikeStatus = async (slug) => {
  try {
    const response = await api.get(`/api/posts/${slug}/like-status/`);
    return response.data.liked;
  } catch (error) {
    console.error(`Erreur lors de la vérification du statut de like pour le post ${slug}:`, error);
    throw error;
  }
};

// Fonction pour récupérer tous les posts likés par l'utilisateur
export const fetchUserLikedPosts = async () => {
  try {
    const response = await api.get('/api/user/liked-posts/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des posts likés:', error);
    throw error;
  }
};

// Fonction pour récupérer les commentaires d'un post
export const fetchComments = async (slug) => {
  try {
    const response = await api.get(`/api/posts/${slug}/comments/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des commentaires du post ${slug}:`, error);
    throw error;
  }
};

// Fonction pour ajouter un commentaire à un post
export const addComment = async (slug, body) => {
  try {
    const response = await api.post(`/api/posts/${slug}/add-comment/`, { body });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'ajout du commentaire au post ${slug}:`, error);
    throw error;
  }
};

// Fonction pour supprimer un commentaire
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/api/comments/${commentId}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du commentaire ${commentId}:`, error);
    throw error;
  }
};

// ==================
// FONCTIONS POUR LES UTILISATEURS
// ==================

// Fonction pour récupérer la liste des utilisateurs
export const fetchUsers = async () => {
  try {
    const response = await api.get('/api/users/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Fonction pour récupérer un utilisateur spécifique par son ID
export const fetchUserById = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}/`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
    throw error;
  }
};

// ==================
// FONCTIONS D'AUTHENTIFICATION
// ==================

// Fonction pour connecter un utilisateur
export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/accounts/api/login/', { username, password });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

// Fonction pour inscrire un utilisateur
export const registerUser = async (userData) => {
  try {
    console.log('Données envoyées pour inscription:', JSON.stringify(userData));
    
    // S'assurer que tous les champs nécessaires sont présents
    const dataToSend = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password2: userData.password2
    };
    
    const response = await api.post('/accounts/api/register/', dataToSend, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    console.error('Détails de l\'erreur:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour déconnecter un utilisateur
export const logoutUser = async () => {
  try {
    const response = await api.post('/accounts/api/logout/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};

// Fonction pour vérifier si un utilisateur est authentifié
export const checkAuthStatus = async () => {
  try {
    const response = await api.get('/accounts/api/user/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'authentification:', error);
    throw error;
  }
};

// ==================
// FONCTIONS DE RECHERCHE
// ==================

// Fonction pour rechercher des posts
export const searchPosts = async (query) => {
  try {
    const response = await api.get(`/api/posts/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la recherche de posts avec la requête "${query}":`, error);
    throw error;
  }
};
