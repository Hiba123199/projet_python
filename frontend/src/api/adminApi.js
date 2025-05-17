import axios from 'axios';

// Configuration de base pour les requêtes API admin
const API_URL = 'http://localhost:8000/api/admin/';

// Configurer axios pour inclure le token d'authentification si disponible
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Service pour l'administration des posts
export const postService = {
  // Récupérer tous les posts
  getAllPosts: async () => {
    try {
      const response = await axios.get(`${API_URL}posts/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },
  
  // Récupérer un post par ID
  getPost: async (id) => {
    try {
      const response = await axios.get(`${API_URL}posts/${id}/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      throw error;
    }
  },
  
  // Créer un nouveau post
  createPost: async (postData) => {
    try {
      const response = await axios.post(`${API_URL}posts/`, postData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
  
  // Mettre à jour un post
  updatePost: async (id, postData) => {
    try {
      const response = await axios.put(`${API_URL}posts/${id}/`, postData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw error;
    }
  },
  
  // Supprimer un post
  deletePost: async (id) => {
    try {
      await axios.delete(`${API_URL}posts/${id}/`, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      throw error;
    }
  },
  
  // Filtrer les posts par statut
  filterPosts: async (status) => {
    try {
      const response = await axios.get(`${API_URL}filter-posts/?status=${status}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error filtering posts by status ${status}:`, error);
      throw error;
    }
  }
};

// Service pour l'administration des commentaires
export const commentService = {
  getAllComments: async () => {
    try {
      const response = await axios.get(`${API_URL}comments/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },
  
  getComment: async (id) => {
    try {
      const response = await axios.get(`${API_URL}comments/${id}/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching comment ${id}:`, error);
      throw error;
    }
  },
  
  createComment: async (commentData) => {
    try {
      const response = await axios.post(`${API_URL}comments/`, commentData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },
  
  updateComment: async (id, commentData) => {
    try {
      const response = await axios.put(`${API_URL}comments/${id}/`, commentData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating comment ${id}:`, error);
      throw error;
    }
  },
  
  deleteComment: async (id) => {
    try {
      await axios.delete(`${API_URL}comments/${id}/`, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error(`Error deleting comment ${id}:`, error);
      throw error;
    }
  }
};

// Service pour l'administration des likes
export const likeService = {
  getAllLikes: async () => {
    try {
      const response = await axios.get(`${API_URL}likes/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching likes:', error);
      throw error;
    }
  },
  
  getLike: async (id) => {
    try {
      const response = await axios.get(`${API_URL}likes/${id}/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching like ${id}:`, error);
      throw error;
    }
  },
  
  createLike: async (likeData) => {
    try {
      const response = await axios.post(`${API_URL}likes/`, likeData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating like:', error);
      throw error;
    }
  },
  
  deleteLike: async (id) => {
    try {
      await axios.delete(`${API_URL}likes/${id}/`, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error(`Error deleting like ${id}:`, error);
      throw error;
    }
  }
};

// Service pour l'administration des utilisateurs
export const userService = {
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}users/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  getUser: async (id) => {
    try {
      const response = await axios.get(`${API_URL}users/${id}/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },
  
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}users/`, userData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`${API_URL}users/${id}/`, userData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },
  
  deleteUser: async (id) => {
    try {
      await axios.delete(`${API_URL}users/${id}/`, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
};

// Service pour les statistiques d'administration
export const statsService = {
  getAdminStats: async () => {
    try {
      const response = await axios.get(`${API_URL}stats/`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }
};
